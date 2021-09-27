const {
  HttpStatusCodes: { StatusCodes },
} = require('../../utils/constants');
const { OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const generateCookie = require('../../utils/generateCookie');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const availableTimeSlots = async (forDays, savedTimeSlots) => {
  forDays.forEach(day => {
    let date = new Date(day.date).setHours(0, 0, 0, 0);
    let weekDay = day.weekDay;
    savedTimeSlots.forEach(timeSlot => {
      let startDay = new Date(timeSlot.startDate).setHours(0, 0, 0, 0);
      let endDate = new Date(timeSlot.endDate).setHours(0, 0, 0, 0);
      let weekDays = timeSlot.weekDays
      if (startDay <= date && endDate >= date && weekDays.includes(weekDay)) {
        day.time = [timeSlot.startTime, timeSlot.endTime]
      }
    });
  });
  return forDays
}
const getMentorTimeSlots = async (req) => {
  let data;
  let statusCode;
  let message;
  try {
    const { timeslot, mentor_id } = req.body
    const { MENTORS_COLLECTION } = process.env;
    const mentorCollection = await mongoUtil.fetchCollection(
      MENTORS_COLLECTION
    );
    const profileData = await mentorCollection.findOne({
      mentor_id: mentor_id,
    },
      { projection: { timeSlot: 1 } }
    );
    updatedTimeslot = await availableTimeSlots(timeslot, profileData.timeSlot)

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
          'Failed to fetch MentorTimeSlots',
        )
      );  
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
};

module.exports = bookingMiddleware;
