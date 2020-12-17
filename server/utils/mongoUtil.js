const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const {
  MockMongoClient,
} = require('../middleware/common-menu/__mocks__/mockMongoClient');
const { SECRET_KEY, MONGO_DB_URL, FEMMECUBATOR_DB, MOCK_TEST } = process.env;
const cryptr = new Cryptr(SECRET_KEY);
const url = cryptr.decrypt(MONGO_DB_URL);

module.exports = {
  fetchCollection: async function (collectionName) {
    const mongoClient = MOCK_TEST === 'true' ? MockMongoClient : MongoClient;

    const client = await mongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db(FEMMECUBATOR_DB);
    const collectionObj = db.collection(collectionName);
    return collectionObj;
  },
};
