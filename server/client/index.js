const express = require('express');
const greetingRoutes = require('../routes/greetings');
const encryptRoutes = require('../routes/encrypt');
module.exports = () => {
  const app = express();
  app.use('/api/greetings', greetingRoutes);
  app.use('/api/encrypt', encryptRoutes);
  return app;
};
