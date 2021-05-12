const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('./constants');

const authLogger = {
    success: (email, middlewareInfo) => {
        const {middlewarePath, subMiddleware} =  middlewareInfo;
        logger.info(
            setLogDetails(
                `${middlewarePath}Middleware.${subMiddleware}`,
                `User ${subMiddleware} was successful`,
                `email - ${email}`
            )
        );
    },
    end: (email, middlewareInfo) =>{
        const {middlewarePath, subMiddleware} =  middlewareInfo;
        logger.info(
            setLogDetails(
                `${middlewarePath}Middleware.${subMiddleware}`,
                `End of ${middlewarePath}`,
                `email - ${email}`,
            )
        );
    },
    error: (error, email, middlewareInfo) =>{
        const {middlewarePath, subMiddleware} =  middlewareInfo;
        logger.info(
            setLogDetails(
                `${middlewarePath}Middleware.${subMiddleware}`,
                `${error.message}`,
                `email - ${email}`
            )
        );
    },
    timeout: (email, middlewareInfo) => {
        const {middlewarePath, subMiddleware} =  middlewareInfo;
        logger.error(
            setLogDetails(
                `${middlewarePath}Middleware.${subMiddleware}`,
                `Connection timeout while ${subMiddleware}ing user`,
                `email - ${email}`
            )
        );
    },
};

module.exports = authLogger;