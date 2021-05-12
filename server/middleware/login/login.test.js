const { login } = require('./index');
const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');
// create a crypter to make a fake key for a fake db
jest.mock('cryptr', () => {
    const mockPlainText = process.env.Mongo_URl;
    return jest.fn().mockImplementation(() => {
        return { decrypt: () => mockPlainText};
    });
});
// create a fake logger for inputs
jest.mock('../utils/authLogger', () => {
    const authLogger = {
        end: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        timeout: jest.fn(),
    };
    return authLogger;
});

// create a fake login info
describe('loginMiddleware', () => {
    let request, response;
    const OLD_ENV = process.env;
    const form = {
        email: 'ali@gmail.com',
        password: 'Abcd123!',
    };
    const returnResponse = {
        role_id: 1,
        firstName: "Ali",
        lastName: "Baba",
        hasOnboarded: false,
        email: "ali@gmail.com",
        title: "Software Engineer",
        password: "Abcd123!",
    }

    beforeAll(async () => {
        process.env.USERS_COLLECTION = 'users';
        process.env.SECRET_KEY = 'ABC123';

    });

    beforeEach(async () => {
        jest.resetModules();
        response = httpMocks.createResponse();
        request = httpMocks.createRequest({
            method: 'POST', 
            url: 'api/login',
        });
    });

    afterEach(async () => {
        await mockMongoUtil.drop(mongoUtil);
    });

    afterAll(() => {
        mongoUtil.close();
        process.env = OLD_ENV;
    });

    test('Should Login Existing User, Return Cookie with Status 200', async () => {
        const { email, password } = form;
        request.body = form;
        response.body = {
            data: { email: email, password: password},
            message: 'Success',
        };
        await login(request, response);
        const collectionObj = await mongoUtil.fetchCollection(process.env.USERS_COLLECTION);
        console.log(collectionObj);
        expect(response._getStatusCode()).toEqual(200);
    });
});
