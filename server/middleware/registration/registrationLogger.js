const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');

const registrationLogger = {
  success: (email) => {
    logger.info(
      setLogDetails(
        `registrationMiddleware.register`,
        `User registration was successful`,
        `email - ${email}`
      )
    );
  },
  end: (email) => {
    logger.info(
      setLogDetails(
        `registrationMiddleware.register`,
        `End of register`,
        `email - ${email}`
      )
    );
  },
  error: (error, email) => {
    logger.error(
      setLogDetails(
        `registrationMiddleware.register`,
        `${error.message}`,
        `email - ${email}`
      )
    );
  },
  timeout: (email) => {
    logger.error(
      setLogDetails(
        `registrationMiddleware.register`,
        `Connection time out while registering new user`,
        `email - ${email}`
      )
    );
  }
};

module.exports = registrationLogger;
