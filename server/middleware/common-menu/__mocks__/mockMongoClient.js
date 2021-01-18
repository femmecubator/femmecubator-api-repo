const { MongoClient } = require('mongodb');

class MockMongoClient {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  async start() {
    this.connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = await this.connection.db();
  }

  async populateDB() {
    const users = this.db.collection('users');
    const mockUser = {_id: 'some-user-id', name: 'John'};
    await users.insertOne(mockUser);
  }

  async startAndPopulateDB() {
    await this.start();
    await this.populateDB();
  }

  stop() {
    this.connection.close();
  }
}

module.exports = MockMongoClient;