const express = require('express');
const greetingRoutes = require('../routes/greetings');
const encryptRoutes = require('../routes/encrypt');
const loginRoutes = require('../routes/login');

module.exports = () => {
  const app = express();
  app.use('/api/greetings', greetingRoutes);
  app.use('/api/encrypt', encryptRoutes);
  app.use('/api/login', loginRoutes);
  return app;
};
