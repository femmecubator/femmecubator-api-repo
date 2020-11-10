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

// const Cryptr = require('cryptr');
// const cryptr = new Cryptr(process.env.SECRET_KEY);

// const mongoClient = require('mongodb').MongoClient;
// const mongoDbUrl = cryptr.decrypt(process.env.MONGO_DB_URL);
// let mongodb;

// // connects to mongodb, then executes callback
// function connect(callback) {
//   mongoClient.connect(
//     mongoDbUrl,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//     (err, db) => {
//       mongodb = db;
//       callback();
//     }
//   );
// }
// function get(collectionName) {
//   return mongodb.db('femmecubatorDB').collection(collectionName);
// }

// function close() {
//   mongodb.close();
// }

// module.exports = {
//   connect,
//   get,
//   close,
// };
