const { HttpStatusCodes } = require('../../utils/constants');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const MongoClient = require('mongodb').MongoClient;

const commonMenuMiddleware = {
  getMenuItems: (req, res) => {
    const uri = cryptr.decrypt(process.env.MONGO_DB_URL);

    MongoClient.connect(
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err, client) {
        if (err) {
          console.error(err);
          return;
        }

        const db = client.db('femmecubatorDB');

        db.collection('common-menu')
          .find({})
          .toArray(function (err, items) {
            if (err) throw err;
            res.json(items[0]);
          });
      }
    );
  },
};

module.exports = commonMenuMiddleware;
