const { assert } = require('chai');

const { getUserByEmail } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a useßr with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined with non-existent email', () => {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});