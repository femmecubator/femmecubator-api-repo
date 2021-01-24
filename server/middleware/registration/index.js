const bcrypt = require('bcrypt');
const logger = require('simple-node-logger').createSimpleLogger();
const {
    HttpStatusCodes: { StatusCodes },
    setLogDetails,
    DataException
} = require('../../utils/constants');
const { REQUEST_TIMEOUT, OK, BAD_REQUEST, GATEWAY_TIMEOUT } = StatusCodes
const mongoUtil = require('../../utils/mongoUtil');
const { HttpStatusCodes } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');

const registrationService = async (req, res) => {
    const saltRounds = 10;
    let data, statusCode, userId, collectionObj;

    const {
        firstName,
        lastName,
        prefLoc,
        title,
        email,
        userName,
        password,
    } = req.body;
    userId = email;

    const userPayload = { email, userId, userName, password: bcrypt.hashSync(password, saltRounds), title, prefLoc, firstName, lastName }

    try {
        collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
        console.log(data, '#####');
        data = await collectionObj.insertOne({ ...userPayload });
        console.log(data, '#####');
        if (!data) {
            statusCode = REQUEST_TIMEOUT;
            throw DataException(`Service Unavailable - There was a problem with your request. Please try again later`);
        } else {
            statusCode = OK;
            const { ops: [{ _id: userId }] } = data
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
                `userId - ${userId}`
            )
        )
    } catch (err) {
        if (statusCode !== REQUEST_TIMEOUT) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Failed to create new user`,
                    `userId - ${userId}`
                )
            )
            statusCode = BAD_REQUEST;
        }
        if (!collectionObj) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Connection time out while registering new user`,
                    `userId - ${userId}`
                )
            )
            statusCode = GATEWAY_TIMEOUT;
        } else {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `${err.message}`,
                    `userId - ${userId}`
                )
            )
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
            `userId - ${userId}`
        )
    )
}
module.exports = registrationService;

