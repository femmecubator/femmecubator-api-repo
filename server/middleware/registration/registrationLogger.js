const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');

const logValidateFormFields = {
  start: ({ firstName, lastName, title, email }) => {
    logger.info(
      setLogDetails(
        'registrationMiddleware.validateFormFields',
        'Validating registration form fields',
        `firstName - ${firstName}, lastName - ${lastName}, title - ${title}, email - ${email}`
      )
    );
  },
  end: ({ firstName, lastName, title, email }) => {
    logger.info(
      setLogDetails(
        'registrationMiddleware.validateFormFields',
        'End of validateFormFields',
        `firstName - ${firstName}, lastName - ${lastName}, title - ${title}, email - ${email}`
      )
    );
  },
  error: ({ firstName, lastName, title, email }) => {
    logger.error(
      setLogDetails(
        'registrationMiddleware.validateFormFields',
        'Failed to validate registration form fields',
        `firstName - ${firstName}, lastName - ${lastName}, title - ${title}, email - ${email}`
      )
    );
  }
};

module.exports = { logValidateFormFields };
