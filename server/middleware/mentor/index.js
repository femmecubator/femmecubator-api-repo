const logger = require('simple-node-logger').createSimpleLogger();
const {
  HttpStatusCodes: { StatusCodes },
  setLogDetails,
} = require('../../utils/constants');
const mongoUtil = require('../../utils/mongoUtil');
const generateCookie = require('../../utils/generateCookie');

const { OK, BAD_REQUEST, NOT_FOUND, GATEWAY_TIMEOUT } = StatusCodes;
const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const createPayload = (body, mentor_id) => {
  const { bio, skills, phone, timezone, googlemeet, timeslot } = body;
  return {
    ...(mentor_id ? { mentor_id: mentor_id } : {}),
    ...(bio ? { bio: bio } : {}),
    ...(skills ? { skills: skills } : {}),
    ...(phone ? { phone: phone } : {}),
    ...(timezone ? { timezone: timezone } : {}),
    ...(googlemeet ? { googlemeet: googlemeet } : {}),
    ...(timeslot ? { timeslot: timeslot } : {}),
  };
};

const updateMentorInfo = async (req, res, tokenData) => {
  let data;
  let statusCode;
  let message;
  try {
    const mentorPayload = createPayload(req.body, tokenData.user_id);
    const { MENTORS_COLLECTION } = process.env;
    const mentorCollection = await mongoUtil.fetchCollection(
      MENTORS_COLLECTION
    );
    const updateProfile = await mentorCollection.findOneAndUpdate(
      { mentor_id: tokenData.user_id },
      { $set: mentorPayload },
      { upsert: true }
    );
    if (!updateProfile.value) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    const { password, ...rest } = updateProfile.value;
    statusCode = OK;
    message = 'Success';
    data = rest;
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
const getMentorInfo = async ({ mentor_id }) => {
  let data;
  let statusCode;
  let message;
  try {
    const { MENTORS_COLLECTION } = process.env;
    const mentorCollection = await mongoUtil.fetchCollection(
      MENTORS_COLLECTION
    );
    const profileData = await mentorCollection.findOne({
      mentor_id: mentor_id,
    });
    if (!profileData) {
      statusCode = 401;
      throw Error('User does not exist!');
    }
    statusCode = OK;
    message = 'Success';
    data = profileData;
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
const queryMentors = async ({ email, role_id }) => {
  let data;
  let statusCode;
  let message;
  let collectionObj;

  logger.info(
    setLogDetails(
      'mentorMiddleware.getMentors',
      'Fetching metors data',
      `User - ${email}`
    )
  );

  try {
    if (role_id !== 1 && role_id !== 0) throw Error('Bad request');

    collectionObj = await mongoUtil.fetchCollection(
      process.env.USERS_COLLECTION
    );

    data = await collectionObj
      .find(
        { role_id: 0 },
        {
          projection: {
            _id: 0,
            firstName: 1,
            lastName: 1,
            title: 1,
            skills: 1,
            bio: 1,
          },
        }
      )
      .toArray();

    if (!data.length) {
      statusCode = NOT_FOUND;
      message = 'No Record Found';
    } else {
      statusCode = OK;
      message = 'Success';
    }
  } catch (error) {
    if (error && role_id !== 100) {
      logger.error(
        setLogDetails(
          'mentorMiddleware.getMentors',
          'Failed to fetch mentors data',
          `User - ${email}`
        )
      );
      statusCode = BAD_REQUEST;
      message = error.message;
    } else {
      logger.error(
        setLogDetails(
          'mentorMiddleware.getMentors',
          'Connection timed out while fetching mentors data',
          `User - ${email}`
        )
      );
      statusCode = GATEWAY_TIMEOUT;
      message = 'Gateway timeout';
    }
  } finally {
    logger.info(
      setLogDetails(
        'mentorMiddleware.getMentors',
        'End of queryMentors',
        `User - ${email}`
      )
    );
  }
  return resObj(statusCode, message, data);
};

const mentorMiddleware = {
  getMentors: async (req, res) => {
    const { statusCode, ...rest } = await queryMentors(res.locals.user);
    res.status(statusCode).send(rest);
  },
  getMentorsProfile: async (req, res) => {
    const { statusCode, ...rest } = await getMentorInfo(res.locals.user);
    res.status(statusCode).send(rest);
  },
  updateMentor: async (req, res) => {
    var tokenData = res.locals.user;
    const { statusCode, ...rest } = await updateMentorInfo(req, res, tokenData);
    res.status(statusCode).send(rest);
  },
};

module.exports = mentorMiddleware;
