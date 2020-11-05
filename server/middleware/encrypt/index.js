const { HttpStatusCodes } = require('../../utils/constants');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);

const encryptMiddleware = {
  encrypt: (req, res) => {
    res.status(HttpStatusCodes.StatusCodes.OK).send(cryptr.encrypt(req.body));
  },
};

module.exports = encryptMiddleware;
