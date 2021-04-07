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
    title: 'UI/UX',
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
    _id: 'cbvnflvvvkjf4',
  },
  {
    firstName: 'Thor',
    lastName: 'Odison',
    title: 'UI/UX',
    mentorSkills:
      'God of Thunder, Son of Odison, User Research, Customer Journey, Persona',
    bio:
      'Lorem ipsum testing lines limited to an awesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholderawesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic.Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 ',
    initials: 'TO',
    _id: 'cb123vnflkjf4',
  },
  {
    firstName: 'Peter',
    lastName: 'Parker',
    title: 'Coding Mentor',
    mentorSkills:
      'Hero, Friendly Neighbor, User Research, Customer Journey, Persona',
    bio:
      'Lorem ipsum testing lines limited to an awesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholderawesomely composed lead sentence or series of posts. Snappy, judgy, tyrannical. Compassionate or narcissistic.Snappy, judgy, tyrannical. Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 Compassionate or narcissistic. It is a placeholder  limited to 280 char text to a max of 5 ',
    initials: 'PP',
    _id: 'cbvnflkasdjf4',
  },
  
];
const directoryMiddleware = {
  fetchDirectory: (req, res) => {
    res.status(HttpStatusCodes.StatusCodes.OK).send(mentorsDirectory);
  },
};

module.exports = directoryMiddleware;
