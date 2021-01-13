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