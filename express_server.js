const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require("bcryptjs");

const { authenticateUser, generateRandomString, getUserByEmail, getUserID, urlsForUser } = require('./helper');
const { urlDatabase, users } = require("./database");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//HOME PAGE
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});


//ALL URLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    urls: urlsForUser(userID),
    user: users[userID],
  };
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.render('urls_index', templateVars);
});

//ADD NEW URL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.send("Please login to create a new URL");
    return;
  }
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID,
  };
  res.redirect(`/urls/${shortURL}`);
});


//ADD NEW URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
  };
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

//SHOW INDV URL INFO
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;

  //checks if url exists
  if (!urlDatabase[req.params.id]) {
    res.send("URL does not exist");
    return;
  };

  console.log(templateVars);
  if (!userID) {
    res.send("Please log in to view this page");
    return;
  }
  //checks if urls belong to user
  if (userID !== urlDatabase[req.params.id].userID) {
    res.send("URL does not belong to you");
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[userID],
  };



  res.render("urls_show", templateVars);
});

//EDIT URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const { newURL } = req.body;
  const { id } = req.params;
  urlDatabase[id].longURL = newURL;

  if (!urlDatabase[id]) {
    res.send("short URL does not exist");
    return;
  }
  if (!userID) {
    res.send("Please log in.");
    return;
  }
  if (urlDatabase[id].userID !== userID) {
    res.send("Url does not belong to you");
    return;
  }

  res.redirect(`/urls/${id}`);
});

//DELETE INDV URL
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;

  let shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    res.send("short URL does not exist");
    return;
  }
  if (!userID) {
    res.send("Please log in.");
    return;
  }
  if (urlDatabase[shortURL].userID !== userID) {
    res.send("Url does not belong to you");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//REDIRECT LINK
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("Short URL does not exist!");
    return;
  }
  res.redirect(longURL);
});

//REGISTER WINDOW
app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
  };
  //if logged in, redirect;
  if (userID) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //if registering without an email or password
  if (!email || !password) {
    res.redirect(400, "/urls");
    return;
  }
  //Checks if email is already in use
  if (getUserByEmail(email, users)) {
    res.redirect(400, "/urls");
    return;
  }

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  // eslint-disable-next-line camelcase
  req.session.user_id = userID;
  res.redirect("/urls");
});

//LOGIN WINDOW
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  const templateVars = {
    user: users[userID],
  };
  if (userID) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (authenticateUser(email, password, users)) {
    //if user is found and password matches, set a cookie
    const userID = getUserID(email, users);
    // eslint-disable-next-line camelcase
    req.session.user_id = userID;
    res.redirect(`/urls`);
  } else {
    //if user cannot be found, respond with 403 or found with wrong password
    res.redirect(403, "/urls");
  }
});

//LOGOUT
app.post("/logout", (req, res) => {
  // eslint-disable-next-line camelcase
  req.session = null;
  res.redirect(`/login`);
});

//undefined Routes
app.get("/*", (req, res) => {
  res.status(404).send("Page not found");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});