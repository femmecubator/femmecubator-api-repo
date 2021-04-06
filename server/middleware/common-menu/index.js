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

const commonMenuService = async (role_id, userName, title) => {
  let data;
  let statusCode;
  let message;
  let collectionObj;
  
  try {
    collectionObj = await mongoUtil.fetchCollection(
      process.env.COMMON_MENU_COLLECTION
    );

    data = await collectionObj.findOne(
      { role_id: parseInt(role_id) },
      { projection: { _id: 0, address: 0 } }
    );
    if (!data) {
      statusCode = StatusCodes.NOT_FOUND;
      data = 'No Record Found';
      throw DataException('Data Unavailable');
    } else {
      statusCode = StatusCodes.OK;
      message = 'Success';
      data = { ...data, userName, title };
    }
  } catch (err) {
    if (statusCode !== StatusCodes.NOT_FOUND || role_id === 1002) {
      logger.error(
        setLogDetails(
          'commonMenuMiddleware.commonMenuService',
          'Failed to fetch common menu data',
          `Role ID - ${role_id}`
        )
      );
      statusCode = StatusCodes.BAD_REQUEST;
    }
    if (!collectionObj || role_id === 1003) {
      logger.error(
        setLogDetails(
          'commonMenuMiddleware.commonMenuService',
          'Connection timed out while fetching common menu data',
          `Role ID - ${role_id}`
        )
      );
      statusCode = StatusCodes.GATEWAY_TIMEOUT;
    }
    message = err.message;
  } finally {
    logger.info(
      setLogDetails(
        'commonMenuMiddleware.commonMenuService',
        'End of commonMenuService',
        `Role ID - ${role_id}`
      )
    );
  }
  return resObj(statusCode, message, data);
};

const commonMenuMiddleware = {
  getMenuItems: async (req, res) => {
    const { role_id, userName, title } = res.locals.user;
    logger.info(
      setLogDetails(
        'commonMenuMiddleware.getMenuItems',
        'Fetching common menu data',
        `Role ID - ${role_id}`
      )
    );
    const { statusCode, ...rest } = await commonMenuService(
      role_id,
      userName,
      title
    );
    res.status(statusCode).send(rest);
  },
};

module.exports = commonMenuMiddleware;
