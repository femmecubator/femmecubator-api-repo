const { HttpStatusCodes } = require('../../utils/constants');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const MongoClient = require('mongodb').MongoClient;
const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails, DataException } = require('../../utils/constants');

const commonMenuMiddleware = {
  getMenuItems: (req, res) => {
    const { role_id, userName } = res.locals.user;
    logger.info(
      setLogDetails(
        'commonMenuMiddleware.getMenuItems',
        'Fetching common menu data',
        `Role ID - ${role_id}`
      )
    );

    const uri = cryptr.decrypt(process.env.MONGO_DB_URL);

    MongoClient.connect(
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      async function (err, client) {
        let data;
        try {
          const db = client.db('femmecubatorDB');
          data = await db
            .collection('common-menu')
            .findOne({ role_id }, { projection: { _id: 0 } });
          res.status(HttpStatusCodes.StatusCodes.OK);
          if (!data) {
            res.status(HttpStatusCodes.StatusCodes.NOT_FOUND);
            throw DataException('Data not found');
          } else {
            data = { ...data, userName };
          }
        } catch ({ message }) {
          if (res.status !== HttpStatusCodes.StatusCodes.NOT_FOUND)
            res.status(HttpStatusCodes.StatusCodes.BAD_REQUEST);
          if (!client) res.status(HttpStatusCodes.StatusCodes.GATEWAY_TIMEOUT);
          data = { message };
        } finally {
          if (client) client.close();
          res.send(data);
        }
      }
    );
  },
};

module.exports = commonMenuMiddleware;
