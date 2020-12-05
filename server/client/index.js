const express = require('express');
const greetingRoutes = require('../routes/greetings');
const commonMenuRoutes = require('../routes/common-menu');
const encryptRoutes = require('../routes/encrypt');
const loginRoutes = require('../routes/login');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const corsOptions = {
  allRoutes: true,
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  headers: 'content-type',
};
module.exports = () => {
  const app = express();
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use('/api/greetings', greetingRoutes);
  app.use('/api/commonMenu', commonMenuRoutes);
  app.use('/api/encrypt', encryptRoutes);
  app.use('/api/login', loginRoutes);
  return app;
};
