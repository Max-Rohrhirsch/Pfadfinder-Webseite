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


app.use((req, res) => {
  res.sendFile(path.resolve() + "/views/static/errorpage.html");
});

app.listen(80);
