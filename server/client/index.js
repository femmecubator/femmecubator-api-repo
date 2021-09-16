const express = require('express');
const commonMenuRoutes = require('../routes/common-menu');
const encryptRoutes = require('../routes/encrypt');
const loginRoutes = require('../routes/login');
const registerRoutes = require('../routes/register');
const mentorRoutes = require('../routes/mentor');
const directoryRoutes = require('../routes/directory');
const profileRoutes = require('../routes/profile');
const cookieParser = require('cookie-parser');
const { CORS_ORIGINS } = require('../utils/constants');

function corsHandler(req, res, next) {
  const { origin } = req.headers;
  if (CORS_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,UPDATE,OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
    );
  }
  return next();
}

module.exports = () => {
  const app = express();
  app.use(corsHandler);
  app.use(cookieParser());
  app.use('/api/commonMenu', commonMenuRoutes);
  app.use('/api/encrypt', encryptRoutes);
  app.use('/api/login', loginRoutes);
  app.use('/api/register', registerRoutes);
  app.use('/api/mentors', mentorRoutes);
  app.use('/api/directory', directoryRoutes);
  app.use('/api/updateProfile', profileRoutes);
  return app;
};
