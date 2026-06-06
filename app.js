const express = require("express");
const app = express();


// Підключення шаблонізатора EJS
app.set("view engine", "ejs");


// Налаштування доступу до локальних файлів Bootstrap 5
app.use(
  "/bootstrap/css",
  express.static(__dirname + "/node_modules/bootstrap/dist/css"),
);
app.use(
  "/bootstrap/js",
  express.static(__dirname + "/node_modules/bootstrap/dist/js"),
);


// Роут головної сторінки
app.get("/", function (req, res) {
  res.render("index", { activePage: "home" });
});

app.get('/contact', function (req, res) {
  res.render('contact', { activePage: "contact" });
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
