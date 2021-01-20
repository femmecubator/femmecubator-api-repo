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
    "userId": "jane_d@gmail.com",
    "userName": "Jane D.",
    "password": "aasdfljkasdlkfj23412341234dsafs$QW$@#dsf",
    "title": "UX Designer",
    "role_id": 1,
    "city": "New York",
    "state": "NY",
  },
  {
    "userId": "billy_d@gmail.com",
    "userName": "Billy D.",
    "password": "fsfds#$131",
    "title": "Software Engineer",
    "role_id": 1,
    "city": "New York",
    "state": "NY",
  },
  {
    "userId": "john_s@gmail.com",
    "userName": "John S.",
    "password": "fsdfdsas#$131",
    "title": "Software Engineer",
    "role_id": 2,
    "city": "New York",
    "state": "NY",
  }
];

module.exports = {
  users: mockUsers,
  commonMenu: mockCommonMenu,
};