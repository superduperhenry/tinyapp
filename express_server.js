const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = (len) => {
  return Math.random().toString(36).substring(2, len + 2);
};

//ALL URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

//ADD NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//SHOW INDV URL INFO
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//REDIRECT LINK
app.get("/u/:id", (req, res) => {
  console.log(req.params.id, `line 38`);
  console.log(urlDatabase[req.params.id], `line39 long url`);
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//ADD NEW URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`,);
});

//EDIT URL
app.post("/urls/:id", (req, res) => {
  const { newURL } = req.body;
  const { id } = req.params;
  urlDatabase[id] = newURL;
  console.log(urlDatabase, `line 56`);
  res.redirect(`/urls/${id}`);
});

//DELETE INDV URL
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//LOGIN
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect(`/urls`);
});

//LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});