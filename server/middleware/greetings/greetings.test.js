const greetingsMiddleware = require("./index");
const httpMocks = require("node-mocks-http");

const req = {
  params: {
    name: "test",
  },
};

const res = {
  status: (statusCode) => {
    return {
      send: (resObj) => {
        return "test";
      },
    };
  },
};

describe("greetings middleware", () => {
  it("should say hello to user if name was provided", () => {
    const request = httpMocks.createRequest({
      method: "GET",
      url: "/api/greetings",
      params: {
        name: "Femmecubator",
      },
    });
    const response = httpMocks.createResponse();
    greetingsMiddleware.sayHello(request, response);
    const { message } = JSON.parse(JSON.stringify(response._getData()));
    expect(message).toBe("Hello Femmecubator");
  });
  it("should say hello world if name was not provided", () => {
    const request = httpMocks.createRequest({
      method: "GET",
      url: "/api/greetings",
    });
    const response = httpMocks.createResponse();
    greetingsMiddleware.sayHello(request, response);
    const { message } = JSON.parse(JSON.stringify(response._getData()));
    expect(message).toBe("Hello World");
  });
});
