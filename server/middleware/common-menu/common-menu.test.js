const commonMenuMiddleware = require('./index');
const httpMocks = require('node-mocks-http');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);

describe('common-menu middleware', () => {
  it('should return common menu API', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: 'api/common-menu',
    });

    const response = httpMocks.createResponse();
    commonMenuMiddleware.getMenuItems(request, response);
    const result = JSON.parse(JSON.stringify(response._getData()));

    expect(response.statusCode).toEqual(200);
    expect(result).toBe({
      _id: '5fa43327df4a1eef50dca8e1',
      menu_id: 1,
      headers: [
        {
          id: 1,
          label: 'Listings',
          href: '/listings',
        },
        {
          id: 2,
          label: 'Mentors',
          href: '/mentors',
        },
        {
          id: 3,
          label: 'My Account',
          href: '/account',
        },
        {
          id: 4,
          label: 'Log Out',
          href: '/logout',
        },
      ],
    });
  });
});
