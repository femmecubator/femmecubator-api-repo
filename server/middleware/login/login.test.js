const { login } = require('./index');
const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');

jest.mock('cryptr', () => {
    const mockPlainText = process.env.MONGO_URL;
    return jest.fn().mockImplementation(() => {
        return { decrypt: () => mockPlainText};
    });
});

jest.mock('../../utils/authLogger', () => {
    const authLogger = {
        end: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        timeout: jest.fn(),
    };
    return authLogger;
});

describe('loginMiddleware', () => {
    let request, response;
    const OLD_ENV = process.env;
   
    const returnResponse = {
        role_id: 1,
        firstName: "Ali",
        lastName: "Baba",
        hasOnboarded: false,
        email: "ALi@gmail.com",
        title: "Software Engineer",
        password: "Abcd123!",
    };

    beforeAll(async () => {
        await mongoUtil.init();
        process.env.USERS_COLLECTION = 'users';
        process.env.SECRET_KEY = 'ABC123';
        await mockMongoUtil.seed(mongoUtil);
    });

    beforeEach(async () => {
        jest.resetModules();
        response = httpMocks.createResponse();
        request = httpMocks.createRequest({
            method: 'POST', 
            url: 'api/login',
        });
    });

    afterAll(async () => {
        await mockMongoUtil.drop(mongoUtil);
        mongoUtil.close();
        process.env = OLD_ENV;
    });

    test('Should Return Error With Invalid Credentials, Return Status 401', async () => {
        const form = {
            email: 'ali@gmail.com',
            password: 'Abcd123!',
        };
        request.body = form;

        const expectedResp = {
            data: {},
            message: 'Wrong credentials',
        };
        await login(request, response);
        expect(response._getStatusCode()).toEqual(401);
        expect(response._getData()).toEqual(expectedResp);
        expect(response.cookies.TOKEN).toBeUndefined();
    });

});
