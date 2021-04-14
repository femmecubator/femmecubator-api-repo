const { users, commonMenu } = require('./mockData');

module.exports = {
  seed: async function(client) {
    const db = client.db;
    const usersCollection = db.collection('users');
    const commonMenuCollection = db.collection('common-menu');

    await usersCollection.insertMany(users);
    await commonMenuCollection.insertMany(commonMenu);
  },
  drop: async function(client) {
    const db = client.db;
    const collectionsObj = await db.listCollections().toArray();

    for(let i = 0; i < collectionsObj.length; i++) {
      await db.collection(collectionsObj[i].name).deleteMany();
    }
  },
  dropDatabase: async function(client) {
    const db = client.db;
    await db.dropDatabase();
  },
  dropMentors: async function(client) {
    const db = client.db;
    const usersCollection = db.collection('users');
    const mentorQuery = { "role_id": { "$eq": 0 } };

    await usersCollection.deleteMany(mentorQuery);
  }
};
