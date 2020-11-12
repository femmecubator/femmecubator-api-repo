const express = require('express');
const greetingRoutes = require('../routes/greetings');
const commonMenuRoutes = require('../routes/common-menu');
const encryptRoutes = require('../routes/encrypt');
const loginRoutes = require('../routes/login');
const cookieParser = require('cookie-parser');

module.exports = () => {
  const app = express();
  app.use(cookieParser());
  app.use('/api/greetings', greetingRoutes);
  app.use('/api/commonMenu', commonMenuRoutes);
  app.use('/api/encrypt', encryptRoutes);
  app.use('/api/login', loginRoutes);
  return app;
};
