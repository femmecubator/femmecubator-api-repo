const logger = require('simple-node-logger').createSimpleLogger();
const {
  HttpStatusCodes: { StatusCodes },
  setLogDetails,
} = require('../../utils/constants');
const mongoUtil = require('../../utils/mongoUtil');

const { OK, BAD_REQUEST, NOT_FOUND, GATEWAY_TIMEOUT } = StatusCodes;
const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const queryMentors = async ({ email, role_id }) => {
  let data;
  let statusCode;
  let message;
  let collectionObj;

  logger.isInfo(
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
    logger.isInfo(
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
};

module.exports = mentorMiddleware;
