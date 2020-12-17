const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT, HttpStatusCodes } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');

router.use(express.json());

router.post('/', timeout(TIMEOUT, { respond: true }), (req, res) => {
  // will put logic in middleware later
  // stub login api that responds with a cookie value
  const {
    firstName,
    lastName,
    prefLoc,
    title,
    email,
    userName,
    password,
  } = req.body;

  if (email.toLowerCase() === 'test1@femmecubator.com') {
    res
      .status(HttpStatusCodes.StatusCodes.UNAUTHORIZED)
      .send({ err: { email: { message: 'Email already registered' } } });
  } else if (userName.toLowerCase() === 'john.doe') {
    res
      .status(HttpStatusCodes.StatusCodes.UNAUTHORIZED)
      .send({ err: { userName: { message: 'User name already taken' } } });
  } else {
    const payload = { email, userName, role_id: 1, title };
    const cookieExp = new Date(Date.now() + 8 * 3600000);
    const options = {
      expires: cookieExp,
      path: '/',
      domain: 'femmecubator.com',
    };
    const token = JWT.sign(payload, process.env.SECRET_KEY);

    res
      .status(HttpStatusCodes.StatusCodes.OK)
      .cookie('TOKEN', token, options)
      .cookie('SESSIONID', uuid(), options)
      .end();
  }
});

module.exports = router;
