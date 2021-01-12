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
  const { email, userName } = req.body;
  const payload = {
    email,
    userName: 'jane.doe',
    role_id: 1,
    title: 'Software Engineer',
  };
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: process.env.DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign(payload, process.env.SECRET_KEY);
  /*
  res
    .status(HttpStatusCodes.StatusCodes.OK)
    .cookie('TOKEN', token, options)
    .cookie('SESSIONID', uuid(), options)
    .end();*/
  res.status(HttpStatusCodes.StatusCodes.UNAUTHORIZED).send({
    err: 'Unauthorized message here',
  });
});

module.exports = router;
