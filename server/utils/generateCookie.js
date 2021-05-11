const JWT = require('jsonwebtoken');
const { v4 } = require('uuid');

export const generateCookie = (res, userPayload) => {
    const { DOMAIN, SECRET_KEY } = process.env;
    const { email, role_id, firstName , lastName } = userPayload;
    const cookieExp = new Date(Date.now() + 8 * 3600000);
    const options = {
      expires: cookieExp,
      path: '/',
      domain: DOMAIN || 'femmecubator.com',
    };
    const token = JWT.sign(
      { email, role_id, userName: `${firstName} ${lastName[0]}.` },
      SECRET_KEY
    );
    res.cookie('TOKEN', token, options).cookie('SESSIONID', v4(), options);
  };

