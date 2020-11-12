const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const {
  MockMongoClient,
} = require('../middleware/common-menu/__mocks__/mockMongoClient');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const url = cryptr.decrypt(process.env.MONGO_DB_URL);

module.exports = {
  fetchCollection: async function (collectionName) {
    const mongoClient =
      process.env.MOCK_TEST === 'true' ? MockMongoClient : MongoClient;

    const client = await mongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('femmecubatorDB');
    const collectionObj = db.collection(collectionName);
    return collectionObj;
  },
};
