const bcrypt = require('bcrypt');
const logger = require('simple-node-logger').createSimpleLogger();
const {
    HttpStatusCodes: { StatusCodes },
    setLogDetails,
    DataException
} = require('../../utils/constants');
const mongoUtil = require('../../utils/mongoUtil');
const { HttpStatusCodes } = require('../../utils/constants');
const JWT = require('jsonwebtoken');
const { uuid } = require('uuidv4');

const registrationService = async (req, res) => {
    let saltRounds = 10;
    let data, statusCode, collectionObj, userPayload, userId;

    let {
        firstName,
        lastName,
        prefLoc,
        title,
        email,
        userName,
        password,
    } = req.body;

    password = bcrypt.hashSync(password, saltRounds);

    userPayload = {
        'email': email,
        'userId': email,
        'userName': userName,
        'password': password,
        'title': title,
        'prefLoc': prefLoc,
        'firstName': firstName,
        'lastName': lastName,
    }

    try {
        collectionObj = await mongoUtil.fetchCollection
            (process.env.USERS_COLLECTION);

        data = await collectionObj.insertOne({ ...userPayload });

        if (!data) {
            statusCode = StatusCodes.REQUEST_TIMEOUT;
            data = '503 Service Unavailable';
            throw DataException('Service Unavailable');
        } else {
            statusCode = StatusCodes.OK;
            let { ops: [{ _id }] } = data;
            userId = _id;
        }
    } catch (err) {

        if (!collectionObj) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Connection time out while registering new user`,
                    `User - ${userId}`
                )
            )
            statusCode = StatusCodes.GATEWAY_TIMEOUT;
        }

        if (statusCode !== StatusCodes.REQUEST_TIMEOUT) {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `Failed to create new user`,
                    `${userId}`
                )
            )
            statusCode = StatusCodes.BAD_REQUEST;
        } else {
            logger.error(
                setLogDetails(
                    `registrationService`,
                    `${err.message}`,
                    `${userId}`
                )
            )
        }
        console.error(`Error occurred while adding new user, ${err.message}`)
        console.log(statusCode);
        res
            .status(statusCode)
            .end();
        return
    }

    const cookieExp = new Date(Date.now() + 8 * 3600000);
    const options = {
        expires: cookieExp,
        path: '/',
        domain: process.env.DOMAIN || 'femmecubator.com',
    };
    const token = JWT.sign(userPayload, process.env.SECRET_KEY);

    res
        .status(HttpStatusCodes.StatusCodes.OK)
        .cookie('TOKEN', token, options)
        .cookie('SESSIONID', uuid(), options)
        .end();

}
module.exports = registrationService;

