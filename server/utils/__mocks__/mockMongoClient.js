const { users, commonMenu } = require('./mockData');

module.exports = {
  seed: async function(client) {
    const db = client.db();
    const usersCollection = db.collection('users');
    const commonMenuCollection = db.collection('common-menu');

    await usersCollection.insertMany(users);
    await commonMenuCollection.insertMany(commonMenu);
  }
}
