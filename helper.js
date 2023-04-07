const bcrypt = require("bcryptjs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len + 2);
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return;
};

const authenticateUser = (email, password, database) => {
  for (const user in database) {
    const hashedPassword = database[user].password;
    const passwordsMatching = bcrypt.compareSync(password, hashedPassword);
    // if (database[user].email === email && database[user].password === password) {
    if (database[user].email === email && passwordsMatching) {
      return true;
    }
  }
  return false;
};

const getUserID = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const urlsForUser = (id) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

module.exports = { generateRandomString, authenticateUser, getUserByEmail, getUserID, urlsForUser };