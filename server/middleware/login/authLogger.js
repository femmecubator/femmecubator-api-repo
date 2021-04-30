const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');

const authLogger = {
    success: (email, path) => {
        logger.info(
            setLogDetails(
                `${path}Middleware.${path}`,
                `User ${path} was successful`,
                `email - ${email}`
            )
        );
    },
    end: (email, path) =>{
        logger.info(
            setLogDetails(
                `${path}Middleware.${path}`,
                `End of ${path}`,
                `email - ${email}`,
            )
        );
    },
    error: (error, email, path) =>{
        logger.info(
            setLogDetails(
                `${path}Middleware.${path}`,
                `${error.message}`,
                `email - ${email}`
            )
        );
    },
    timeout: (email, path) => {
        logger.error(
            setLogDetails(
                `${path}Middleware.${path}`,
                `Connection timeout while ${path}ing user`,
                `email - ${email}`
            )
        );
    },
};

module.exports = authLogger;