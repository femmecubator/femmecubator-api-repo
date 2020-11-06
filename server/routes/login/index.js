const express = require('express');
const timeout = require('connect-timeout');
const router = express.Router();
const { TIMEOUT, HttpStatusCodes } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');

router.use(express.json());

router.post('/', timeout(TIMEOUT, { respond: true }), (req, res) => {
  // not using password right now
  // will put logic in middleware later
  // stub login api that responds with a cookie value
  const optionsValue = process.env.NODE_ENV === 'development' ? false : true;
  const { userName } = req.body;
  const payload = { userName, alias: 'Jane D.' };
  const options = {
    maxAge: 86400,
    path: '/',
    httpOnly: optionsValue,
    secure: optionsValue,
    domain: 'femmecubator.com',
    sameSite: 'lax',
  };
  const token = JWT.sign(payload, process.env.SECRET_KEY);

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '.femmecubator.com');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  );

  res.cookie('TOKEN', token, options);
  res.cookie('SESSIONID', uuid(), options);
  res.status(HttpStatusCodes.StatusCodes.OK).end();
});

module.exports = router;
