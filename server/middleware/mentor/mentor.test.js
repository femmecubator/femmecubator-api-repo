const mongoUtil = require('../../utils/mongoUtil');
const mockMongoUtil = require('../../utils/__mocks__/mockMongoClient');
const httpMocks = require('node-mocks-http');
const mentorMiddleware = require('.');
const { users } = require('../../utils/__mocks__/mockData');

jest.mock('cryptr', () => {
  const mockPlainText = process.env.MONGO_URL;
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});

jest.mock('simple-node-logger', () => ({
  createSimpleLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  })
}));

describe('mentor middleware', () => {
  const OLD_ENV = process.env;
  let request;

  beforeAll(async () => {
    await mongoUtil.init();
  });
  beforeEach(async () => {
    jest.resetModules();
    process.env = OLD_ENV;
    process.env.USERS_COLLECTION = 'users';
    process.env.COMMON_MENU_COLLECTION = 'common-menu';

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/api/mentors',
    });
    
    await mockMongoUtil.seed(mongoUtil);
  });
  afterEach(async () => {
    await mockMongoUtil.drop(mongoUtil)
  });
  afterAll(async () => {
    await mongoUtil.close();
    process.env = OLD_ENV;
  });

  it('should return list of all mentors and status 200', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role_id: 1,
          title: 'Software Engineer'
        },
      },
    });
    const mentors = users.filter(user => user.role_id === 0);
    const mentorsData = mentors.map(mentor => ({
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      title: mentor.title,
      bio: mentor.bio,
      skills: mentor.skills,
    }));
    const expectedResponse = { message: "Success", data: mentorsData }

    await mentorMiddleware.getMentors(request, response);
    expect(response._getData()).toEqual(expectedResponse);
    expect(response._getStatusCode()).toEqual(200);
  });

    
  it('should return no record found and status 404 if no mentors', async () => {
    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role_id: 1,
          title: 'Software Engineer'
        },
      },
    });
    const expectedResponse = { message: "No Record Found", data: [] };
    
    await mockMongoUtil.dropMentors(mongoUtil);
    await mentorMiddleware.getMentors(request, response);
    expect(response._getStatusCode()).toEqual(404);
    expect(response._getData()).toEqual(expectedResponse);
  });
  
  it('should return status bad request using wrong role_id', async () => {
    process.env.USERS_COLLECTION = 'users';
    mockMongoUtil.drop(mongoUtil);

    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role_id: 123,
          title: 'Software Engineer'
        },
      },
    });
    const expectedResponse = { message: "Bad request", data: {} };

    await mentorMiddleware.getMentors(request, response);
    expect(response._getStatusCode()).toEqual(400);
    expect(response._getData()).toEqual(expectedResponse);
  });

  it('should return status 504', async () => {
    process.env.USERS_COLLECTION = 'users';

    const response = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role_id: 100,
          title: 'Software Engineer'
        },
      },
    });
    const expectedResponse = { message: "Gateway timeout", data: {} };

    await mentorMiddleware.getMentors(request, response);
    expect(response._getStatusCode()).toEqual(504);
    expect(response._getData()).toEqual(expectedResponse);
  })

})