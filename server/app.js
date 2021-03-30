require('dotenv').config({ silent: true });
const app = require('./client');
const { PORT } = require('./utils/constants');
const logger = require('simple-node-logger').createSimpleLogger();
// Testing UAT
app.server = app().listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
