const HttpStatusCodes = require('http-status-codes');

module.exports = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  TIMEOUT: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 90000,
  HttpStatusCodes,
  setLogDetails: (middleware, shortMessage, details) => ({
    Middleware: middleware,
    Message: shortMessage,
    Details: details,
  }),
  DataException: (message) => ({ message }),
  CORS_ORIGINS: [
    'http://local.femmecubator.com:3000',
    'https://femmecubator.com',
    'https://www.femmecubator.com',
    'https://femmecubator-ui-uat-tijbx.ondigitalocean.app',
  ],
};
