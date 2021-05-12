const mockCommonMenu = [
  {
    "role_id": 1,
    "headers": [ 
        {
            "id": 1,
            "label": "What We Do",
            "href": "/about"
        }, 
        {
            "id": 2,
            "label": "Threads",
            "href": "/threads"
        }, 
        {
            "id": 3,
            "label": "Mentors",
            "href": "/mentors"
        }
    ],
    "utilities": [ 
        {
            "id": 1,
            "label": "Settings",
            "color": "inherit",
            "href": "/settings"
        }, 
        {
            "id": 2,
            "label": "Log Out",
            "color": "inherit",
            "href": "/login?logout=true"
        }
    ]
  },
  {
    "role_id": 2,
    "headers": [ 
        {
            "id": 1,
            "label": "Listings",
            "href": "/listings"
        }, 
        {
            "id": 2,
            "label": "My Account",
            "href": "/account"
        }, 
        {
            "id": 3,
            "label": "Log Out",
            "href": "/logout"
        }
    ]
  },
];

const mockUsers = [
  {
    "email": "jane_d@gmail.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "hasOnboarded": false,
    "password": "aasdfljkasdlkfj23412341234dsafs$QW$@#dsf",
    "title": "UX Designer",
    "role_id": 0,
    "bio": "some bio",
    "skills": [],
  },
  {
    "email": "sarah_d@gmail.com",
    "firstName": "Sarah",
    "lastName": "Doe",
    "hasOnboarded": true,
    "password": "aasdfljkasdl2kfj23412341234dsafs$QW$@#dsf",
    "title": "Software Engineer",
    "role_id": 0,
    "bio": "some bio",
    "skills": [],
  },
  {
    "email": "jessica_d@gmail.com",
    "firstName": "Jessica",
    "lastName": "Doe",
    "password": "aasdfljkas123##dlkfj23412341234dsafs$QW$@#dsf",
    "title": "UX Designer - Student",
    "role_id": 1,
    "bio": "some bio",
    "skills": [],
  },
  {
    "email": "stephanie_d@gmail.com",
    "firstName": "Stephanie",
    "lastName": "Doe",
    "password": "aasdfljka#sdlkfj23412341234dsafs$QW$@#dsf",
    "title": "Software Engineer - Student",
    "role_id": 1,
    "bio": "some bio",
    "skills": [],
  },
];

module.exports = {
  users: mockUsers,
  commonMenu: mockCommonMenu,
};