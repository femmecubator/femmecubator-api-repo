const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const oAuth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET_KEY
);

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const availableTimeSlots = async (forDays, savedTimeSlots) => {
  forDays.forEach((day) => {
    let date = new Date(day.date);
    date.setHours(0, 0, 0, 0);
    let weekDay = day.weekDay;
    day.time = [];
    savedTimeSlots.forEach((timeSlot) => {
      let startDay = new Date(timeSlot.startDate).setHours(0, 0, 0, 0);
      let endDate = new Date(timeSlot.endDate).setHours(0, 0, 0, 0);
      let weekDays = timeSlot.weekDays;
      let showDate = new Date(date);
      if (startDay <= date && endDate >= date && weekDays.includes(weekDay)) {
        let startTime = new Date(timeSlot.startTime);
        let endTime = new Date(timeSlot.endTime);
        startTime.setDate(showDate.getDate());
        startTime.setMonth(showDate.getMonth());
        startTime.getFullYear(showDate.getFullYear());
        endTime.setDate(showDate.getDate());
        endTime.setMonth(showDate.getMonth());
        endTime.getFullYear(showDate.getFullYear());
        day.time.push({ startTime, endTime });
      }
    });
  });
  return forDays;
};
const getMentorTimeSlots = async (req) => {
  let data;
  let statusCode;
  let message;
  try {
    const { timeslot, mentor_id } = req.body;
    const { MENTORS_COLLECTION } = process.env;
    const mentorCollection = await mongoUtil.fetchCollection(
      MENTORS_COLLECTION
    );
    const profileData = await mentorCollection.findOne(
      {
        mentor_id: mentor_id,
      },
      { projection: { timeSlot: 1 } }
    );
    updatedTimeslot = await availableTimeSlots(timeslot, profileData.timeSlot);

    if (!profileData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    statusCode = OK;
    message = 'Success';
    data = updatedTimeslot;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
      logger.error(
        setLogDetails(
          'bookingMiddleware.getMentorTimeSlots',
          'Failed to fetch MentorTimeSlots'
        )
      );
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};
const saveBookings = async (data, mentor_id) => {
  const { organizer, start, end, attendees, hangoutLink } = data;
  const payload = {
    organizer : organizer.email,
    start,
    end,
    attendee : attendees[0].email,
    hangoutLink,
    mentor_id
  };
  const { BOOKINGS_COLLECTION } = process.env;
  const bookingCollection = await mongoUtil.fetchCollection(
    BOOKINGS_COLLECTION
  );
  await bookingCollection.insertOne(payload);
};
const createCalendarEvent = async (req, {user_id}) => {
  var data;
  var statusCode;
  var message;
  const {
    eventStartTime,
    eventEndTime,
    mentorName,
    mentorEmailId,
    access_token,
    timeZone,
  } = req.body;
  const event = {
    summary: `Booking with ${mentorName}`,
    colorId: 1,
    start: {
      dateTime: new Date(eventStartTime),
      timeZone: timeZone,
    },
    end: {
      dateTime: new Date(eventEndTime),
      timeZone: timeZone,
    },
    attendees: [{ email: mentorEmailId }],
    conferenceData: {
      createRequest: { requestId: '7qxalsvy0e' },
      conferenceSolutionKey: {
        type: 'hangoutsMeet',
      },
    },
  };
  oAuth2Client.setCredentials({
    access_token: access_token,
  });

  try {
    const calendar = await google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    if (!calendar) {
      console.log('Unable to access calendar');
      statusCode = BAD_REQUEST;
      message = 'Something Went Wrong';
      data = {};
    }

    const response = await calendar.freebusy.query({
      resource: {
        timeMin: new Date(eventStartTime),
        timeMax: new Date(eventEndTime),
        timeZone: timeZone,
        items: [{ id: 'primary' }],
      },
    });
    if (response.status === 200) {
      const eventArray = response.data.calendars.primary.busy;
      if(eventArray.length !== 0) throw('Mentor is unavailable')
      const eventResponse = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all',
        conferenceDataVersion: 1,
      });
      if (eventResponse.status === 200) {
        await saveBookings(eventResponse.data,user_id);
        statusCode = OK;
        message = 'Success';
        data = {};
      } else {
        statusCode = BAD_REQUEST;
        message = 'Error Creating Calender Event';
        data = {};
      }
    } else {
      statusCode = BAD_REQUEST;
      message = 'Error Creating Calender Event';
      data = {};
    }
  } catch (err) {
    if (err) {
      console.log(err);
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
      console.log(err);
    }
  }
  return resObj(statusCode, message, data);
};
const getBookingInfo = async ( {email} ) => {
  let data;
  let statusCode;
  let message;
  try {
    const { BOOKINGS_COLLECTION } = process.env;
    const bookingCollection = await mongoUtil.fetchCollection(
      BOOKINGS_COLLECTION
    );
    const bookingData = await bookingCollection.find({
      $or:[
        {
          organizer: email,
        },
        {
          attendee: email,
        }
      ]}).toArray();
    console.log(bookingData);
    if (!bookingData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    statusCode = OK;
    message = 'Success';
    data = bookingData;
  } catch (err) {
    if (err) {
      statusCode = statusCode || BAD_REQUEST;
      message = err.message;
    } else {
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  }
  return resObj(statusCode, message, data);
};
const bookingMiddleware = {
  getMentorTimeSlots: async (req, res) => {
    const { statusCode, ...rest } = await getMentorTimeSlots(req);
    res.status(statusCode).send(rest);
  },
  createCalendarEvent: async (req, res) => {
    var tokenData = res.locals.user;
    const { statusCode, ...rest } = await createCalendarEvent(req,tokenData);
    res.status(statusCode).send(rest);
  },
  getMentorsBookings: async (req, res) => {
    const { statusCode, ...rest } = await getBookingInfo(res.locals.user);
    res.status(statusCode).send(rest);
  }
};

module.exports = bookingMiddleware;
