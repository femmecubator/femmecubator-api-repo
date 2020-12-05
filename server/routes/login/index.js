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
  const { userId } = req.body;
  const payload = { userId, userName: 'Jane D.', role_id: 1 };
  const options = {
    maxAge: 86400,
    path: '/',
    domain: 'femmecubator.com',
  };
  const token = JWT.sign(payload, process.env.SECRET_KEY);

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
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
