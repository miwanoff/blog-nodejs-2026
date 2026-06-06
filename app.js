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

app.get('/posts', function (req, res) {
// Тимчасовий масив постів для демонстрації роботи з циклами в EJS
  const samplePosts = [
	{
  	title: 'Вступ до Node.js',
  	category: 'Technology',
  	body: 'Node.js — це серверна платформа, яка дозволяє виконувати код JavaScript поза браузером. Вона побудована на рушії V8 від Google.'
	},
	{
  	title: 'Чому варто обрати Express',
  	category: 'Education',
  	body: 'Express — найпопулярніший веб-фреймворк для Node.js. Він мінімалістичний, швидкий і має величезну екосистему готових плагінів.'
	}
  ];
  // Рендеримо сторінку posts.ejs та передаємо туди масив
  res.render('posts', { activePage: "posts", posts: samplePosts });
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
