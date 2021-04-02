import fs from "fs";

// reducer to convert object entries to object
function entriesToObject(obj, item) {
  const key = Object.keys(item).pop();
  obj[key] = item[key];
  return obj;
}

// extract all articles from "aktionen" folder
const articles = fs.readdirSync(`./views/aktionen`).map(year => ({
  [year]: fs.readdirSync(`./views/aktionen/${year}`).map(article => {
    const content = fs.readFileSync(`./views/aktionen/${year}/${article}/${article}.ejs`, "utf8", x => x);
    return {
      title: content.match(/(?<=<!-- title -->\r\n\t{2}<h2>).*?(?=<\/h2>)/)[0],
      dateAuthor: content.match(/(?<=<!-- date, author -->\r\n\t{2}<h6>).*?(?=<\/h6>)/)[0],
      teaser: content.match(/(?<=<!-- teaser -->(?:\r|\n|\r\n)\t{2})([\s\S])*?(?=(?:\r|\n|\r\n)\t{2}<!-- main text -->)/)[0]
        .replace(/<p>/g, "").replace(/<\/p>/g, "").replace(/&nbsp;/g, "").replace(/\r\n/g, "").replace(/\s\s/g, " "),
      image: (content.match(/(?<=<img.*?src=").*?(?=")/) || [""])[0],
      url: `/aktionen/${year}/${article}`,
    };
  })
  .sort((a, b) => {
    const [a_day, a_mon] = a.dateAuthor.split(",").shift().split("/").slice(0, 2);
    const [b_day, b_mon] = b.dateAuthor.split(",").shift().split("/").slice(0, 2);
    if      (a_mon !== b_mon) return a_mon < b_mon ? -1 : 1;
    else if (a_day !== b_day) return a_day < b_day ? -1 : 1;
    else                      return 0;
  })
}))
.reduce(entriesToObject, {});

// extract newest articles from articles
const newest_articles = Object.values(articles)
  .reduce((arr, item) => arr.concat(item), [])
  .reverse()
  .slice(0, 10);

// extract older articles from articles
const older_articles = Object.entries(articles)
  .map(([year, yearArticles]) => ({
    [year]: yearArticles.filter(
      article => !newest_articles.map(JSON.stringify).includes(JSON.stringify(article))
    )
    .reverse()
  }))
  .filter(year => Object.values(year).pop().length > 0)
  .reduce(entriesToObject, {});

// generate file content
const content =
'<html>\n' +
'<head>\n' +
  '\t<title>Aktivitäten</title>\n' +
  '\t<link rel="icon" href="/bilder/favicon.png" type="image/x-icon"/>\n' +
  '\t<link rel="stylesheet" href="/style.css"/>\n' +
  '\t<script src="/script.js"></script>\n' +
  '\t<link href="https://fonts.googleapis.com/css?family=Arimo" rel="stylesheet">\n' +
  '\t<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\n' +
  '\t<script src="https://kit.fontawesome.com/a076d05399.js"></script>\n' +
  '\t<style>\n' +
    '\t\t.block {\n' +
      '\t\t\tfont-size: 25px;\n' +
      '\t\t\twidth: 300px;\n' +
      '\t\t\theight: 480px;\n' +
      '\t\t\tbox-shadow: 10px 10px 20px rgba(0,0,0,0.6);\n' +
      '\t\t\tmargin: 20px;\n' +
      '\t\t\tpadding: 10px;\n' +
      '\t\t\tbackground-color: var(--backgroundColor);\n' +
      '\t\t\tposition: relative;\n' +
      '\t\t\toverflow-y: hidden;\n' +
      '\t\t\ttransition: 0.7s;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.block:hover {\n' +
      '\t\t\ttransform: translate(20px ,20px);\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.block p {\n' +
      '\t\t\tmargin-left: 5px;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.blockdiv {\n' +
      '\t\t\tmargin: 2em;\n' +
      '\t\t\tmargin-bottom: 0px;\n' +
      '\t\t\tdisplay:grid;\n' +
      '\t\t\tgrid-gap: 2em;\n' +
      '\t\t\tgrid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n' +
    '\t\t}\n' +
    '\n' +
    '\t\ta:hover {\n' +
      '\t\t\ttext-decoration: none;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.block img {\n' +
      '\t\t\tmax-height: 40%;\n' +
      '\t\t\tmargin: auto;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.txt {\n' +
        '\t\t\ttext-align: center;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.txt a {\n' +
      '\t\t\tfont-size: 1.5em;\n' +
      '\t\t\twidth: 95%;\n' +
      '\t\t\tborder-radius: 7px;\n' +
      '\t\t\tbox-shadow: 0 0 4px black;\n' +
      '\t\t\tpadding: 15px;\n' +
      '\t\t\tmargin: 0 auto;\n' +
      '\t\t\tdisplay: flex;\n' +
      '\t\t\tjustify-content: space-between;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\ta span {\n' +
      '\t\t\tmargin: auto 0px;\n' +
    '\t\t}\n' +
    '\t\t.txt a:hover {\n' +
      '\t\t\tbox-shadow: 0 0 16px black;\n' +
    '\t\t}\n' +
    '\n' +
    '\t\t.title {\n' +
      '\t\t\tfont-size: 0.75em;\n' +
    '\t\t}\n' +
    '\t\t.date {\n' +
      '\t\t\tfont-size: 1em;\n' +
      '\t\t\tcolor: grey;\n' +
      '\t\t\tmargin: 0px;\n' +
    '\t\t}\n' +
  '\t</style>\n' +
'</head>\n' +
'<body>\n' +
  '\t<%- include("../components/modals") %>\n' +
  '\t<%- include("../components/navbar", {redirect: "/aktionenUebersicht"}) %>\n' +
  '\t<h2>Aktivitäten</h2>\n' +
  '\t<div class="blockdiv">\n' +
  // newest articles
  newest_articles.map(({title, dateAuthor, teaser, image, url}) =>
    `\t\t<a href="${url}">\n` +
      `\t\t\t<div class="block">\n` +
        `\t\t\t\t<h2>${title}</h2>\n` +
        (image ? `\t\t\t\t<img src="${image}">\n` : ``) +
        `\t\t\t\t<p>${teaser}</p>\n` +
      `\t\t\t</div>\n` +
    `\t\t</a>\n`
  ).join("") +
  '\t</div>\n' +
  '\t<div class="backg">\n' +
    '\t\t<div class="txt">\n' +
  // older articles
    Object.entries(older_articles).reverse().map(([year, articles]) =>
      `\t\t\t<h2>${year}</h2>\n` +
      articles.map(({title, dateAuthor, url}) =>
        `\t\t\t<a href=${url}> <span class="title">${title}</span> <span class="date">${dateAuthor.split(",").shift()}</span> </a> <br/>\n`
      ).join("")
    ).join("") +
    '\t\t</div>\n' +
  '\t</div>\n' +
  '\t<%- include("../components/footer") %>\n' +
'</body>\n' +
'</html>';

// write content to ejs file
fs.writeFile("./views/startseiten/aktionenUebersicht.ejs", content,
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);
