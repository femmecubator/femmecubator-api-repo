const { HttpStatusCodes } = require('../../utils/constants');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const MongoClient = require('mongodb').MongoClient;
const logger = require('simple-node-logger').createSimpleLogger();
const { setLogDetails } = require('../../utils/constants');

const commonMenuMiddleware = {
  getMenuItems: (req, res) => {
    const { menu_id } = res.locals.user;
    logger.info(
      setLogDetails(
        'commonMenuMiddleware.getMenuItems',
        'Fetching common menu data',
        `Menu ID Params - ${menu_id}`
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
        if (err) {
          console.error(err);
          return;
        }

        const db = client.db('femmecubatorDB');
        let data;
        let status = HttpStatusCodes.StatusCodes.OK;
        try {
          data = await db
            .collection('common-menu')
            .findOne(
              { menu_id: parseInt(menu_id) },
              { projection: { _id: 0 } }
            );
          if (!data) throw new Error('Data not found');
        } catch (err) {
          status = HttpStatusCodes.StatusCodes.BAD_REQUEST;
          if (!data) status = HttpStatusCodes.StatusCodes.NOT_FOUND;
          data = 'Some error happened!';
        } finally {
          client.close();
          const { userName } = res.locals.user;
          res.status(status).json({ ...data, userName });
        }
      }
    );
  },
};

module.exports = commonMenuMiddleware;
