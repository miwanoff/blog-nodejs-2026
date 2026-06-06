const express = require("express");
const app = express();


// Підключення шаблонізатора EJS
app.set("view engine", "ejs");

const sqlite3 = require('sqlite3').verbose();
// Підключення до бази даних (файл blog.db створиться в папці проєкту)
const db = new sqlite3.Database('./blog.db', (err) => {
  if (err) {
	console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});
// Створення таблиці для постів
db.run(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL
)`);




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

// app.post('/new-post', function (req, res) {
//   // Дані доступні у змінній req.body, передаємо їх у шаблон як formData
//   res.render('new-post-success', { activePage: "posts", formData: req.body });
// });

app.post('/new-post', function (req, res) {
  // Витягуємо дані з форми
  const { title, category, body } = req.body;
 
  // SQL-запит на додавання даних
  const sql = 'INSERT INTO posts (title, category, body) VALUES (?, ?, ?)';
 
  db.run(sql, [title, category, body], function(err) {
	if (err) {
  	console.error(err.message);
  	return res.status(500).send("Database error");
	}
	// Після успішного запису в БД показуємо сторінку успіху
	res.render('new-post-success', { activePage: "posts", formData: req.body });
  });
});


// app.get('/posts', function (req, res) {
// // Тимчасовий масив постів для демонстрації роботи з циклами в EJS
//   const samplePosts = [
// 	{
//   	title: 'Вступ до Node.js',
//   	category: 'Technology',
//   	body: 'Node.js — це серверна платформа, яка дозволяє виконувати код JavaScript поза браузером. Вона побудована на рушії V8 від Google.'
// 	},
// 	{
//   	title: 'Чому варто обрати Express',
//   	category: 'Education',
//   	body: 'Express — найпопулярніший веб-фреймворк для Node.js. Він мінімалістичний, швидкий і має величезну екосистему готових плагінів.'
// 	}
//   ];
//   // Рендеримо сторінку posts.ejs та передаємо туди масив
//   res.render('posts', { activePage: "posts", posts: samplePosts });
// });

app.get('/posts', function (req, res) {
  // SQL-запит на отримання всіх постів
  const sql = 'SELECT * FROM posts ORDER BY id DESC';
 
  // Метод db.all повертає масив усіх знайдених рядків (rows)
  db.all(sql, [], (err, rows) => {
	if (err) {
  	console.error(err.message);
  	return res.status(500).send("Database error");
	}  
	// Передаємо масив рядків з БД у шаблон під ключем posts
	res.render('posts', { activePage: "posts", posts: rows });
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
