const { HttpStatusCodes } = require('../../utils/constants');

const commonMenuMiddleware = {
    getMenuItems: (req, res) => {
      // Checking if user is logged in
      if (!req.session.userId) {
        res.status(HttpStatusCodes.StatusCodes.FORBIDDEN)
      } else {
        // TO DO: Send back menu API
      }
    }
};

module.exports = commonMenuMiddleware;
