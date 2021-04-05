const { users, commonMenu } = require('./mockData');

module.exports = {
  seed: async function(client) {
    const db = client.db();
    const usersCollection = db.collection('users');
    const commonMenuCollection = db.collection('common-menu');

    await usersCollection.insertMany(users);
    await commonMenuCollection.insertMany(commonMenu);
  },
  drop: async function(client, collection) {
    const db = client.db();
    if (collection) {
      db.collection(collection).drop();
    } else {
      const collectionsObj = await db.listCollections().toArray();
      const collections = collectionsObj.map(collection => collection.name);
  
      for(let i = 0; i < collections.length; i++) {
        await db.collection(collections[i]).drop();
      }
    }
  },
  dropMentors: async function(client) {
    const db = client.db();
    const usersCollection = db.collection('users');
    const mentorQuery = { "role_id": { "$eq": 0 } };

    await usersCollection.deleteMany(mentorQuery);
  }
};
