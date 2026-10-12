const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const User = require('../models/User');

/**
 * @route GET /api/attendance/summary
 * Computes attendance summary per subject using MongoDB aggregation pipeline.
 * Flags subjects with attendance < 75%.
 */
exports.getStudentSummary = async (req, res, next) => {
  try {
    const studentId = req.query.studentId && req.user.role === 'admin'
      ? new mongoose.Types.ObjectId(req.query.studentId)
      : new mongoose.Types.ObjectId(req.user._id);

    const user = await User.findById(studentId);
    const semester = user ? user.semester : (req.user.semester || 3);

    // Find all subjects in student's semester
    const subjects = await Subject.find({ semester });
    const subjectIds = subjects.map((s) => s._id);

    // Total lectures conducted so far per subject
    const now = new Date();
    const lectureCounts = await Lecture.aggregate([
      {
        $match: {
          subject: { $in: subjectIds },
          date: { $lte: now },
        },
      },
      {
        $group: {
          _id: '$subject',
          totalConducted: { $sum: 1 },
        },
      },
    ]);

    const lectureCountMap = {};
    lectureCounts.forEach((lc) => {
      lectureCountMap[lc._id.toString()] = lc.totalConducted;
    });

    // Attendance aggregation for student per subject
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          student: studentId,
          subject: { $in: subjectIds },
        },
      },
      {
        $group: {
          _id: '$subject',
          totalLogged: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
            },
          },
          missed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    attendanceStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    let overallTotal = 0;
    let overallAttended = 0;

    const subjectsSummary = subjects.map((subj) => {
      const subjIdStr = subj._id.toString();
      const totalLectures = lectureCountMap[subjIdStr] || 0;
      const stat = statsMap[subjIdStr] || { attended: 0, missed: 0, totalLogged: 0 };

      // Use conducted lectures as denominator, or logged if greater
      const effectiveTotal = Math.max(totalLectures, stat.totalLogged);
      const attended = stat.attended;
      const missed = effectiveTotal - attended;
      const percentage = effectiveTotal > 0 ? Math.round((attended / effectiveTotal) * 100) : 100;
      const isBelow75 = effectiveTotal > 0 && percentage < 75;

      overallTotal += effectiveTotal;
      overallAttended += attended;

      // Calculate how many more lectures to attend to reach 75%
      // 0.75 * (effectiveTotal + X) = attended + X  =>  0.75*T + 0.75*X = A + X  =>  0.25*X = 0.75*T - A
      let lecturesNeededFor75 = 0;
      if (isBelow75 && effectiveTotal > 0) {
        lecturesNeededFor75 = Math.max(0, Math.ceil((0.75 * effectiveTotal - attended) / 0.25));
      }

      // If comfortably above 75%, how many can be safely missed?
      // (attended) / (effectiveTotal + M) >= 0.75 => M <= (attended / 0.75) - effectiveTotal
      let safeToMiss = 0;
      if (!isBelow75 && effectiveTotal > 0) {
        safeToMiss = Math.max(0, Math.floor(attended / 0.75 - effectiveTotal));
      }

      return {
        subject: {
          _id: subj._id,
          name: subj.name,
          code: subj.code,
          semester: subj.semester,
        },
        totalLectures: effectiveTotal,
        attended,
        missed: Math.max(0, missed),
        percentage,
        isBelow75,
        lecturesNeededFor75,
        safeToMiss,
      };
    });

    const overallPercentage =
      overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

    res.json({
      success: true,
      overall: {
        totalLectures: overallTotal,
        attended: overallAttended,
        missed: Math.max(0, overallTotal - overallAttended),
        percentage: overallPercentage,
        isBelow75: overallTotal > 0 && overallPercentage < 75,
      },
      subjects: subjectsSummary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/attendance/my-logs
 * List all lecture attendance records with student's current status for each
 */
exports.getMyAttendanceLogs = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { semester, subject } = req.query;

    const subjectFilter = {};
    if (subject) {
      subjectFilter._id = subject;
    } else if (semester) {
      subjectFilter.semester = Number(semester);
    } else {
      subjectFilter.semester = req.user.semester || 3;
    }

    const subjects = await Subject.find(subjectFilter).select('_id');
    const subjectIds = subjects.map((s) => s._id);

    // Get all conducted/scheduled lectures for these subjects
    const lectures = await Lecture.find({ subject: { $in: subjectIds } })
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .sort({ date: -1, startTime: -1 });

    // Get attendance records for this student
    const attendanceRecords = await Attendance.find({
      student: studentId,
      lecture: { $in: lectures.map((l) => l._id) },
    });

    const attendanceMap = {};
    attendanceRecords.forEach((a) => {
      attendanceMap[a.lecture.toString()] = a;
    });

    const logs = lectures.map((lecture) => {
      const att = attendanceMap[lecture._id.toString()];
      return {
        lecture: {
          _id: lecture._id,
          topic: lecture.topic,
          date: lecture.date,
          day: lecture.day,
          startTime: lecture.startTime,
          endTime: lecture.endTime,
          room: lecture.room,
          subject: lecture.subject,
          module: lecture.module,
        },
        status: att ? att.status : 'not_marked',
        markedBy: att ? att.markedBy : null,
        updatedAt: att ? att.updatedAt : null,
      };
    });

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/attendance/log-self
 * Adjustment 1: Student logs/edits their own attendance per lecture
 */
exports.logStudentAttendance = async (req, res, next) => {
  try {
    const { lectureId, status } = req.body;
    const studentId = req.user._id;

    if (!lectureId || !status || !['present', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid lectureId and status (present/absent)',
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { student: studentId, lecture: lectureId },
      {
        subject: lecture.subject,
        status,
        markedBy: 'student',
        updatedAt: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: `Attendance marked as ${status} for lecture "${lecture.topic}"`,
      attendance,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route POST /api/attendance/bulk
 * Faculty / Admin bulk marks attendance for a class
 */
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { lectureId, entries } = req.body;
    // entries: [ { studentId, status: 'present' | 'absent' } ]

    if (!lectureId || !Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide lectureId and an entries array',
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const operations = entries.map((entry) => ({
      updateOne: {
        filter: { student: entry.studentId, lecture: lectureId },
        update: {
          $set: {
            subject: lecture.subject,
            status: entry.status,
            markedBy: 'faculty',
            updatedAt: Date.now(),
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    res.json({
      success: true,
      message: `Recorded attendance for ${operations.length} students.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/attendance/lecture/:lectureId
 * Faculty / Admin views attendance sheet for a lecture
 */
exports.getLectureAttendance = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.lectureId).populate('subject');
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    // Get all students enrolled in this semester
    const students = await User.find({
      role: 'student',
      semester: lecture.subject.semester,
    }).select('name email semester');

    const records = await Attendance.find({ lecture: lecture._id });
    const recordsMap = {};
    records.forEach((r) => {
      recordsMap[r.student.toString()] = r;
    });

    const studentList = students.map((std) => ({
      student: std,
      status: recordsMap[std._id.toString()] ? recordsMap[std._id.toString()].status : 'absent',
      markedBy: recordsMap[std._id.toString()] ? recordsMap[std._id.toString()].markedBy : null,
      updatedAt: recordsMap[std._id.toString()] ? recordsMap[std._id.toString()].updatedAt : null,
    }));

    res.json({
      success: true,
      lecture,
      students: studentList,
    });
  } catch (err) {
    next(err);
  }
};
