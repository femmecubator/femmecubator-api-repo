const express = require('express');
const greetingRoutes = require('../routes/greetings');

module.exports = () => {
    const app = express();
    app.use('/api/greetings', greetingRoutes);
    return app;
};
