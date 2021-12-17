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

const skillsListService = async () => {
  let data;
  let statusCode;
  let message;
  let collectionObj;

  try {
    collectionObj = await mongoUtil.fetchCollection(
      process.env.SKILLS_LIST_COLLECTION
    );
    data = await collectionObj.find().toArray();;
    if (!data) {
      statusCode = StatusCodes.NOT_FOUND;
      data = 'No Record Found';
      throw DataException('Data Unavailable');
    } else {
      statusCode = StatusCodes.OK;
      message = 'Success';
      data = data[0].skills;
    }
  } catch (err) {
    if (statusCode !== StatusCodes.NOT_FOUND) {
      logger.error(
        setLogDetails(
          'skillsListMiddleware.skillsListService',
          'Failed to fetch skills list data'
        )
      );
      statusCode = StatusCodes.BAD_REQUEST;
    }
    if (!collectionObj) {
      logger.error(
        setLogDetails(
          'skillsListMiddleware.skillsListService',
          'Connection timed out while fetching skills list data'
        )
      );
      statusCode = StatusCodes.GATEWAY_TIMEOUT;
    }
    message = err.message;
  } finally {
    logger.info(
      setLogDetails(
        'skillsListMiddleware.skillsListService',
        'End of skillsListService'
      )
    );
  }
  return resObj(statusCode, message, data);
};

const skillsListMiddleware = {
  getSkillsItems: async (req, res) => {
    logger.info(
      setLogDetails(
        'skillsListMiddleware.getSkillsItems',
        'Fetching common menu data',
      )
    );
    const { statusCode, ...rest } = await skillsListService();
    res.status(statusCode).send(rest);
  },
};

module.exports = skillsListMiddleware;
