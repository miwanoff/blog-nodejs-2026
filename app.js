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

// Middleware для обробки даних з форм
app.use(express.urlencoded({ extended: true }));

// Роут головної сторінки
app.get("/", function (req, res) {
  res.render("index", { activePage: "home" });
});

app.get('/contact', function (req, res) {
  res.render('contact', { activePage: "contact" });
});

app.post('/contact', function (req, res) {
  // Дані доступні у змінній req.body, передаємо їх у шаблон як formData
  res.render('contact_answer', { activePage: "contact", formData: req.body });
});

app.get('/new-post', function (req, res) {
  res.render('new-post', { activePage: "posts" });
});

app.post('/new-post', function (req, res) {
  // Дані доступні у змінній req.body, передаємо їх у шаблон як formData
  res.render('new-post-success', { activePage: "posts", formData: req.body });
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
