const { HttpStatusCodes } = require('../../utils/constants');

const mentorsDirectory = [
  {
    firstName: 'Amanda',
    lastName: 'Powell',
    title: 'Coding Mentor',
    mentorSkills:
      'Wireframing, Prototyping, User Research, Customer Journey, Persona',
    bio:
      'Lorem ipsum testing lines limited to an awesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholderawesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic.Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 ',
    initials: 'AP',
    _id: 'asdf1234',
  },
  {
    firstName: 'Bruce',
    lastName: 'Banner',
    title: 'Coding Mentor',
    mentorSkills:
      'Wireframing, Prototyping, User Research, Customer Journey, Persona',
    bio:
      'Lorem ipsum testing lines limited to an awesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholderawesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic.Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 ',
    initials: 'BB',
    _id: 'asdflkjf4',
  },
  {
    firstName: 'Carlo',
    lastName: 'Fernando',
    title: 'Coding Mentor',
    mentorSkills:
      'Wireframing, Prototyping, User Research, Customer Journey, Persona',
    bio:
      'Lorem ipsum testing lines limited to an awesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholderawesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic.Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 ',
    initials: 'CF',
    _id: 'cbvnflkjf4',
  },
  
];
const directoryMiddleware = {
  fetchDirectory: (req, res) => {
    res.status(HttpStatusCodes.StatusCodes.OK).send(mentorsDirectory);
  },
};

module.exports = directoryMiddleware;
