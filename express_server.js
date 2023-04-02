const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len + 2);
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    console.log(database[user].email);
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

const authenticateUser = (email, password, database) => {
  for (const user in database) {
    if (database[user].email === email && database[user].password === password) {
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

//ALL URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_index', templateVars);
});

//ADD NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//SHOW INDV URL INFO
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//REDIRECT LINK
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//REGISTER WINDOW
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

//LOGIN WINDOW
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

//REGISTER ACCOUNT
app.post("/register", (req, res) => {
  const userID = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;

  //if registering without an email or password
  if (!email || !password) {
    res.status(400).redirect("/urls");
  }
  if (getUserByEmail(email, users)) {
    res.status(400).redirect("/urls");
  }

  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (authenticateUser(email, password, users)) {
    //if user is found and password matches, set a cookie
    const userID = getUserID(email, users);
    res.cookie("user_id", userID);
    res.redirect(`/urls`);
  } else {
    //if user cannot be found, respond with 403 or found with wrong password
    res.status(403).redirect("/urls");
  }
});

//ADD NEW URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`,);
});

//EDIT URL
app.post("/urls/:id", (req, res) => {
  const { newURL } = req.body;
  const { id } = req.params;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/${id}`);
});

//DELETE INDV URL
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});