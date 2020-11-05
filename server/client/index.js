const express = require('express');
const greetingRoutes = require('../routes/greetings');
const commonMenuRoutes = require('../routes/common-menu')

module.exports = () => {
    const app = express();
    app.use('/api/greetings', greetingRoutes);
    app.use('/api/common-menu', commonMenuRoutes);
    return app;
};
