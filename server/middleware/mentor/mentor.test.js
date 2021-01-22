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

describe('mentor middleware', () => {
  const OLD_ENV = process.env;
  let client;
  let request;

  beforeAll(async () => {
    client = await mongoUtil.connect();
  });
  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV };

    request = httpMocks.createRequest({
      method: 'GET',
      url: '/api/mentors',
    });

    await mockMongoUtil.seed(client);
  });
  afterEach(async () => await mockMongoUtil.drop(client));
  afterAll(() => {
    mongoUtil.close();
    process.env = OLD_ENV;
  });

  it('should return all mentors if collection has mentors', async () => {
    process.env.USERS_COLLECTION = 'users';
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
    const expectedResponse = mentors.map(mentor => ({
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      title: mentor.title,
      bio: mentor.bio,
      skills: mentor.skills,
    }));

    await mentorMiddleware.getMentors(request, response);
    expect(response._getData().data).toEqual(expectedResponse);
  });

})