const logger = require('simple-node-logger').createSimpleLogger();
const {
  HttpStatusCodes: { StatusCodes },
  setLogDetails,
  DataException,
} = require('../../utils/constants');
const mongoUtil = require('../../utils/mongoUtil');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const queryMentors = async (role_id) => {
  let data;
  let statusCode;
  let message;
  let collectionObj;
  try {
    collectionObj = await mongoUtil.fetchCollection(
      process.env.USERS_COLLECTION
    );

    data = await collectionObj
      .find(
        {},
        {
          projection: {
            _id: 0,
            userName: 1,
            title: 1,
          },
        }
      )
      .toArray();
    if (!data) {
      statusCode = StatusCodes.NOT_FOUND;
      data = 'No Record Found';
      throw DataException('Data Unavailable');
    } else {
      statusCode = StatusCodes.OK;
      message = 'Success';
    }
  } catch (err) {
    if (statusCode !== StatusCodes.NOT_FOUND || role_id === 1002) {
      logger.error(
        setLogDetails(
          'mentorMiddleware.getMentors',
          'Failed to fetch mentors data',
          `Role ID - ${role_id}`
        )
      );
      statusCode = StatusCodes.BAD_REQUEST;
    }
    if (!collectionObj || role_id === 1003) {
      logger.error(
        setLogDetails(
          'mentorMiddleware.getMentors',
          'Connection timed out while fetching mentors data',
          `Role ID - ${role_id}`
        )
      );
      statusCode = StatusCodes.GATEWAY_TIMEOUT;
    }
    message = err.message;
  } finally {
    logger.isInfo(
      setLogDetails(
        'mentorMiddleware.getMentors',
        'End of queryMentors',
        `Role ID - ${role_id}`
      )
    );
  }
  return resObj(statusCode, message, data);
};

const mentorMiddleware = {
  getMentors: async (req, res) => {
    const { role_id } = res.locals.user;
    logger.isInfo(
      setLogDetails(
        'mentorMiddleware.getMentors',
        'Fetching metors data',
        `Role ID - ${role_id}`
      )
    );
    const { statusCode, ...rest } = await queryMentors();
    res.status(statusCode).send(rest);
  },
};

module.exports = mentorMiddleware;
