const bcrypt = require('bcrypt');
const logger = require('simple-node-logger').createSimpleLogger();
const {
    HttpStatusCodes: { StatusCodes },
    setLogDetails,
    DataException
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes;
const mongoUtil = require('../../utils/mongoUtil');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');

const register = async (req, res) => {
    const saltRounds = 10;
    let data, statusCode, collectionObj;

    const {
        firstName,
        lastName,
        title,
        email,
        password,
    } = req.body;

    const userPayload = { email, password: bcrypt.hashSync(password, saltRounds), title, firstName, lastName };

    try {
        collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
        data = await collectionObj.insertOne({ ...userPayload });
        if (!data) {
            statusCode = REQUEST_TIMEOUT;
            throw DataException(`Service Unavailable - There was a problem with your request. Please try again later`);
        } else {
            statusCode = OK;
            // const { ops: [{ _id: userId }] } = data;
        }
        const cookieExp = new Date(Date.now() + 8 * 3600000);
        const options = {
            expires: cookieExp,
            path: '/',
            domain: process.env.DOMAIN || 'femmecubator.com',
        };
        const token = JWT.sign(userPayload, process.env.SECRET_KEY);

        res
            .status(OK)
            .cookie('TOKEN', token, options)
            .cookie('SESSIONID', uuid(), options)
            .end();
        logger.info(
            setLogDetails(
                `registrationService`,
                `registrationService was succesful`,
                `email - ${email}`
            )
        );
    } catch (err) {
        if (statusCode !== REQUEST_TIMEOUT) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Failed to create new user`,
                    `email - ${email}`
                )
            );
            statusCode = BAD_REQUEST;
        }
        if (!collectionObj) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Connection time out while registering new user`,
                    `email - ${email}`
                )
            );
            statusCode = GATEWAY_TIMEOUT;
        } else {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `${err.message}`,
                    `email - ${email}`
                )
            );
        }
        res
            .status(statusCode)
            .json({ data })
            .end();
    }
    logger.info(
        setLogDetails(
            `registrationService`,
            `end of registrationService`,
            `email - ${email}`
        )
    );
};

const registrationMiddleware = { register };

module.exports = registrationMiddleware;

