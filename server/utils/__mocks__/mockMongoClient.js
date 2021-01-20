const { MongoClient } = require('mongodb');
const { users, commonMenu } = require('./mockData');

class MockMongoClient {
  constructor() {
    this.db = null;
    this.client = null;
  }

  async start() {
    this.client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = await this.client.db();
  }

  async populateDB() {
    const usersCollection = this.db.collection('users');
    const commonMenuCollection = this.db.collection('common-menu');

    await usersCollection.insertMany(users);
    await commonMenuCollection.insertMany(commonMenu);
  }

  async startAndPopulateDB() {
    await this.start();
    await this.populateDB();
  }

  async collection(collectionName) {
    const collectionObj = this.db.collection(collectionName);
    return collectionObj;
  }

  stop() {
    this.connection.close();
  }
}

module.exports = MockMongoClient;