const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const { SECRET_KEY, MONGO_DB_URL, FEMMECUBATOR_DB, MONGO_URL } = process.env;
const cryptr = new Cryptr(SECRET_KEY);
const url = cryptr.decrypt(MONGO_DB_URL);

module.exports = {
  fetchCollection: async function (collectionName) {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const db = client.db(FEMMECUBATOR_DB);
    const collectionObj = db.collection(collectionName);
    return collectionObj;
  },
};