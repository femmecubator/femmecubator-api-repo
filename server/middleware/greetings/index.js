const { HttpStatusCodes } = require('../../utils/constants');

const greetingsMiddleware = {
    sayHello: (req, res) => {
        const { name } = req.params;
        res.status(HttpStatusCodes.StatusCodes.OK).send({ message: `Hello ${name ? name : 'World'}` });
    }
};

module.exports = greetingsMiddleware;
