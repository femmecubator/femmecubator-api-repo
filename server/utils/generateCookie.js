const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');

const generateCookie = (res, userPayload) => {
  const { DOMAIN, SECRET_KEY } = process.env;
  const { email, role_id, firstName, lastName, hasOnboarded } = userPayload;
  const user_id = userPayload._id;
  const cookieExp = new Date(Date.now() + 8 * 3600000);
  const options = {
    expires: cookieExp,
    path: '/',
    domain: DOMAIN || 'femmecubator.com',
  };
  const token = JWT.sign(
    { user_id, email, role_id, userName: `${firstName} ${lastName[0]}.`, hasOnboarded },
    SECRET_KEY
  );
  res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
};

module.exports = generateCookie;