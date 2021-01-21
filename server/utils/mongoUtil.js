const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const { SECRET_KEY, MONGO_DB_URL, FEMMECUBATOR_DB } = process.env;
const cryptr = new Cryptr(SECRET_KEY);
const url = cryptr.decrypt(MONGO_DB_URL);

let client;

const connect = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client;
}

const getClient = async () => {
  if (!client) await connect();
  return client;
}

const fetchCollection = async (collectionName) => {
  if (!client) await connect();
  const db = client.db(FEMMECUBATOR_DB);
  const collectionObj = db.collection(collectionName);
  return collectionObj;
}

const close = () => {
  client.close();
}

module.exports = {
  client: getClient,
  connect: connect,
  close: close,
  fetchCollection: fetchCollection,
};