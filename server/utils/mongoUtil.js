const MongoClient = require('mongodb').MongoClient;
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const url = cryptr.decrypt(process.env.MONGO_DB_URL);

var _db;

module.exports = {
  connectToServer: function (mongoClient = MongoClient) {
    mongoClient.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true },
      function (err, client) {
        _db = client.db('femmecubatorDB');
      }
    );
  },

  getDb: function () {
    return _db;
  },
};
