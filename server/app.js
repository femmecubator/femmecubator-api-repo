require('dotenv').config({ silent: true });
const app = require('./client');
const { PORT } = require('./utils/constants');

app.server = app().listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
