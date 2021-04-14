const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const { SECRET_KEY, MONGO_DB_URL, FEMMECUBATOR_DB } = process.env;
const cryptr = new Cryptr(SECRET_KEY);
const url = cryptr.decrypt(MONGO_DB_URL);

class MongoUtil {
  constructor() {
    this.client = MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db(FEMMECUBATOR_DB);
  }

  async fetchCollection(collectionName) {
    const collectionObj = this.db.collection(collectionName);
    return collectionObj;
  }

  async close() {
    await this.client.close();
  }
}

module.exports = new MongoUtil;