const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const MongoClient = require('mongodb').MongoClient;
const { MockMongoClient } = require('./__mocks__/mockMongoClient');
const logger = require('simple-node-logger').createSimpleLogger();
const {
  HttpStatusCodes: { StatusCodes },
  setLogDetails,
  DataException,
} = require('../../utils/constants');

const resObj = (statusCode, message, data = {}) => ({
  statusCode,
  message,
  data,
});

const commonMenuService = async (uri, role_id, userName) => {
  let data;
  let statusCode;
  let message;
  let client;
  try {
    mongoClient =
      role_id === 1000 || role_id === 1001 ? MockMongoClient : MongoClient;
    client = await mongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db('femmecubatorDB');
    const collectionObj = db.collection('common-menu');
    data = await collectionObj.findOne({ role_id }, { projection: { _id: 0 } });
    if (!data) {
      statusCode = StatusCodes.NOT_FOUND;
      data = 'No Record Found';
      throw DataException('Data Unavailable');
    } else {
      statusCode = StatusCodes.OK;
      message = 'Success';
      data = { ...data, userName };
    }
  } catch (err) {
    if (statusCode !== StatusCodes.NOT_FOUND || role_id === 1002)
      statusCode = StatusCodes.BAD_REQUEST;
    if (!client || role_id === 1003) statusCode = StatusCodes.GATEWAY_TIMEOUT;
    message = err.message;
  } finally {
    return resObj(statusCode, message, data);
  }
};

const commonMenuMiddleware = {
  getMenuItems: async (req, res) => {
    const { role_id, userName } = res.locals.user;
    logger.info(
      setLogDetails(
        'commonMenuMiddleware.getMenuItems',
        'Fetching common menu data',
        `Role ID - ${role_id}`
      )
    );
    const uri = cryptr.decrypt(process.env.MONGO_DB_URL);
    const { statusCode, ...rest } = await commonMenuService(
      uri,
      role_id,
      userName
    );
    res.status(statusCode).send(rest);
  },
};

module.exports = commonMenuMiddleware;
