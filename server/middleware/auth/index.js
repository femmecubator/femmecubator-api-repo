const JWT = require('jsonwebtoken');
const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails, HttpStatusCodes } = require('../../utils/constants');

const authMiddleware = {
  validateCookie: (req, res, next) => {
    logger.info(
      setLogDetails(
        'authMiddleware.validateCookie',
        'Validating Cookie',
        req.cookies
      )
    );
    const token = req.cookies.TOKEN;
    if (token) {
      try {
        const { userId, userName, role_id, title } = JWT.verify(
          token,
          process.env.SECRET_KEY
        );
        res.locals.user = { userId, userName, role_id, title };
        logger.info(
          setLogDetails(
            'authMiddleware.validateCookie',
            'SUCCESS',
            res.locals.user
          )
        );
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next({ message: 'Token Not Found' });
    }
  },
  errorHandler: (message, req, res, next) => {
    if (message) {
      logger.error(
        setLogDetails('authMiddleware.errorHandler', 'FAILURE', message)
      );
      res.setHeader('Content-Type', 'application/json');
      return res
        .status(HttpStatusCodes.StatusCodes.UNAUTHORIZED)
        .end(JSON.stringify(message));
    }
    next();
  },
};

module.exports = authMiddleware;
