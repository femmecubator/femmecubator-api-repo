const JWT = require('jsonwebtoken');
const authMiddleware = {
  validateCookie: (req, res, next) => {
    // start logging
    const token = req.cookies.TOKEN;
    try {
      const { userName, alias, menu_id } = JWT.verify(
        token,
        process.env.SECRET_KEY
      );
      res.locals.user = { userName, alias, menu_id };
      next();
    } catch (err) {
      next(err);
    }
  },
  errorHandler: (err, req, res, next) => {
    if (err) res.status(403).send(err);
    next();
  },
};

module.exports = [authMiddleware.validateCookie, authMiddleware.errorHandler];
