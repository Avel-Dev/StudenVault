const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { syncLectureToGoogleCalendar } = require('../utils/googleCalendar');

// @route GET /api/lectures
exports.getLectures = async (req, res, next) => {
  try {
    const { subject, semester, startDate, endDate } = req.query;
    const filter = {};

    if (subject) {
      filter.subject = subject;
    } else if (semester) {
      const subjectsInSemester = await Subject.find({ semester: Number(semester) }).select('_id');
      filter.subject = { $in: subjectsInSemester.map((s) => s._id) };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const lectures = await Lecture.find(filter)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('notes', 'title fileUrl fileType examType')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, count: lectures.length, lectures });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/lectures/upcoming
exports.getUpcomingLectures = async (req, res, next) => {
  try {
    const { semester } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = { date: { $gte: today } };

    if (semester) {
      const subjects = await Subject.find({ semester: Number(semester) }).select('_id');
      filter.subject = { $in: subjects.map((s) => s._id) };
    }

    const lectures = await Lecture.find(filter)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('notes', 'title fileUrl fileType examType')
      .sort({ date: 1, startTime: 1 })
      .limit(6);

    res.json({ success: true, lectures });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/lectures/:id
exports.getLectureById = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('subject', 'name code semester')
      .populate('module', 'number title topics')
      .populate('notes');

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    res.json({ success: true, lecture });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/lectures
// Adjustment 5: Non-blocking calendar sync on creation
exports.createLecture = async (req, res, next) => {
  try {
    const { subject, module: moduleId, topic, date, day, startTime, endTime, room, notes } = req.body;

    if (!subject || !topic || !date || !day) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, topic, date, and day',
      });
    }

    const lecture = await Lecture.create({
      subject,
      module: moduleId || null,
      topic,
      date: new Date(date),
      day,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      room: room || 'Lecture Hall A',
      notes: Array.isArray(notes) ? notes : [],
    });

    const populatedLecture = await Lecture.findById(lecture._id)
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('notes', 'title fileUrl fileType examType');

    // Attempt non-blocking Google Calendar sync if user has connected Google
    if (req.user && req.user.googleAccessToken) {
      syncLectureToGoogleCalendar(req.user, populatedLecture, populatedLecture.subject)
        .then(async (syncResult) => {
          if (syncResult.success) {
            lecture.googleEventId = syncResult.eventId;
            lecture.syncStatus = 'synced';
            lecture.syncError = null;
            await lecture.save();
          } else {
            lecture.syncStatus = 'failed';
            lecture.syncError = syncResult.error;
            await lecture.save();
          }
        })
        .catch((err) => {
          console.warn('[Calendar Background Sync Error]', err.message);
        });
    }

    res.status(201).json({
      success: true,
      lecture: populatedLecture,
      calendarSyncInitiated: Boolean(req.user && req.user.googleAccessToken),
    });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/lectures/:id
exports.updateLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('subject', 'name code semester')
      .populate('module', 'number title')
      .populate('notes', 'title fileUrl fileType examType');

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    res.json({ success: true, lecture });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/lectures/:id
exports.deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }
    await Attendance.deleteMany({ lecture: lecture._id });
    res.json({ success: true, message: 'Lecture and related attendance deleted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/lectures/:id/sync-calendar
// Manual retry / sync button for calendar
exports.syncLectureCalendar = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('subject');
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    const result = await syncLectureToGoogleCalendar(req.user, lecture, lecture.subject);

    if (result.success) {
      lecture.googleEventId = result.eventId;
      lecture.syncStatus = 'synced';
      lecture.syncError = null;
      await lecture.save();
      return res.json({
        success: true,
        message: 'Successfully synced to Google Calendar!',
        googleEventId: result.eventId,
        htmlLink: result.htmlLink,
      });
    } else {
      lecture.syncStatus = 'failed';
      lecture.syncError = result.error;
      await lecture.save();
      return res.status(400).json({
        success: false,
        message: result.error || 'Google Calendar sync failed. Check OAuth credentials.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// @route POST /api/lectures/sync-all
// Bulk sync all lectures for student's semester to Google Calendar
exports.syncAllLectures = async (req, res, next) => {
  try {
    const semester = req.user.semester || 3;
    const subjects = await Subject.find({ semester });
    const lectures = await Lecture.find({
      subject: { $in: subjects.map((s) => s._id) },
      date: { $gte: new Date() },
    }).populate('subject');

    let syncedCount = 0;
    let failedCount = 0;

    for (const lecture of lectures) {
      const result = await syncLectureToGoogleCalendar(req.user, lecture, lecture.subject);
      if (result.success) {
        lecture.googleEventId = result.eventId;
        lecture.syncStatus = 'synced';
        lecture.syncError = null;
        await lecture.save();
        syncedCount++;
      } else {
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} lectures to Google Calendar (${failedCount} failed/skipped).`,
      syncedCount,
      failedCount,
    });
  } catch (err) {
    next(err);
  }
};
