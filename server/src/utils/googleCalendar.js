const { google } = require('googleapis');

/**
 * Helper to sync a lecture event to Google Calendar using user's OAuth tokens.
 * Returns { success: true, eventId } or { success: false, error }
 */
const syncLectureToGoogleCalendar = async (user, lecture, subject) => {
  if (!user.googleAccessToken) {
    return {
      success: false,
      error: 'Google Calendar not connected for this user.',
    };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken || undefined,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Format start and end datetime
    const lectureDate = new Date(lecture.date);
    const dateStr = lectureDate.toISOString().split('T')[0];

    const startTime = lecture.startTime || '09:00';
    const endTime = lecture.endTime || '10:00';

    const startDateTime = new Date(`${dateStr}T${startTime}:00Z`).toISOString();
    const endDateTime = new Date(`${dateStr}T${endTime}:00Z`).toISOString();

    const event = {
      summary: `[StudyVault] ${subject ? subject.code : 'Lecture'}: ${lecture.topic}`,
      description: `Course: ${subject ? subject.name : 'StudyVault Lecture'}\nDay: ${lecture.day}\nRoom: ${lecture.room || 'TBD'}\nTracked via StudyVault Academic System`,
      start: {
        dateTime: startDateTime,
      },
      end: {
        dateTime: endDateTime,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    let response;
    if (lecture.googleEventId) {
      // Update existing event
      response = await calendar.events.update({
        calendarId: 'primary',
        eventId: lecture.googleEventId,
        requestBody: event,
      });
    } else {
      // Insert new event
      response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
    }

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (err) {
    console.warn('[Google Calendar Sync Warning]', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};

module.exports = { syncLectureToGoogleCalendar };
