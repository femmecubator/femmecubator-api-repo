const mongo = require('../../utils/__mocks__/mockMongoClient');
const commonMenuMiddleware = require('.');
const httpMocks = require('node-mocks-http');

jest.mock('cryptr', () => {
  const mockPlainText = 'mongodb://fakeUser:fakePassword@mongodb.fakeDomain.com:27017/fakeDb';
  return jest.fn().mockImplementation(() => {
    return { decrypt: () => mockPlainText };
  });
});
 
describe('testing', () => {
  const mockMongoClient = new mongo;

  beforeAll(async () => {
    process.env.COMMON_MENU_COLLECTION='common-menu'
    await mockMongoClient.startAndPopulateDB();
  });
  afterAll(() => mockMongoClient.stop());

  it('return common-menu API', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/api/common-menu',
    });
    const res = httpMocks.createResponse({
      locals: {
        user: {
          email: 'jane_d@gmail.com',
          userName: 'Jane D.',
          role_id: 1,
          title: 'Software Engineer'
        },
      },
    });

    const expectedResp = {
      role_id: 1,
      headers: [
        { id: 1, label: 'What We Do', href: '/about' },
        { id: 2, label: 'Threads', href: '/threads' },
        { id: 3, label: 'Mentors', href: '/mentors' }
      ],
      utilities: [
        { id: 1, label: 'Settings', color: 'inherit', href: '/settings' },
        {
          id: 2,
          label: 'Log Out',
          color: 'inherit',
          href: '/login?logout=true'
        }
      ],
      userName: 'Jane D.',
      title: 'Software Engineer'
    }

    await commonMenuMiddleware.getMenuItems(req, res);
    expect(res._getData().data).toEqual(expectedResp);
  })
});