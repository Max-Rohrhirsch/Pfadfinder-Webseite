import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// external data
dotenv.config();
const users = JSON.parse(fs.readFileSync("./users.json"));

// settings
const app = express();
app.set("view engine", "ejs");
app.enable("view cache");
app.use(session({ secret: 'somevalue' }));
app.use(session({
  resave: true,
  saveUninitialized: true,
}));

// express routes
app.get("/", (req, res) => {
  res.redirect("/Pfadfinder");
});

app.use(express.static("./views/static"));

fs.readdirSync("./views/startseiten").forEach(page => {
  app.get(`/${page.split(".")[0]}`, (req, res) => {
    res.render(`startseiten/${page}`, {
      loggedIn: req.session.loggedIn,
    });
  });
});

fs.readdirSync("./views/aktionen").forEach(year => {
  fs.readdirSync(`./views/aktionen/${year}/`).forEach(article => {
    if (fs.existsSync(`./views/aktionen/${year}/${article}/images`)) {
      app.use(`/aktionen/${year}/${article}/images`,
        express.static(`./views/aktionen/${year}/${article}/images`));
    }
    if (fs.existsSync(`./views/aktionen/${year}/${article}/files`)) {
      app.use(`/aktionen/${year}/${article}/files`,
        express.static(`./views/aktionen/${year}/${article}/files`));
    }
    app.get(`/aktionen/${year}/${article}`, (req, res) => {
      res.render(`aktionen/${year}/${article}/${article}.ejs`, {
        loggedIn: req.session.loggedIn,
      });
    });
  });
});

app.get("/login", (req, res) => {
  req.session.redirect = req.query.red;

  if (req.session.loggedIn) {
    res.redirect("/Pfadfinder");
  } else {
    res.render("login.ejs", {
      w_usr: false,
      usr: "",
      w_pwd: false,
      pwd: "",
      remember: false,
    });
  }
});

app.post("/login", async (req, res) => {
  const {username, password, remember} = req.body;

  if (!(username && password)) {
    return res.render("login.ejs", {
      w_usr: !username,
      usr: username,
      w_pwd: !password,
      pwd: password,
      remember: remember,
    });
  }
  const user = users.find(x => x.username === username);
  if (!user) {
    return res.render("login.ejs", {
      w_usr: true,
      usr: username,
      w_pwd: false,
      pwd: password,
      remember: remember,
    });
  }

  if (await bcrypt.compare(password, user.password)) {
    req.session.loggedIn = true;
    return res.redirect(req.session.redirect);
  }
  else {
    return res.render("login.ejs", {
      w_usr: false,
      usr: username,
      w_pwd: true,
      pwd: password,
      remember: remember,
    });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("back");
});

app.use((req, res) => {
  res.sendFile(path.resolve() + "/views/static/errorpage.html");
});

app.listen(80);
