const express = require("express");
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Налаштування сесій
app.use(session({
  secret: 'my_super_secret_key', // Секретний ключ для шифрування (в реальних проєктах ховається в .env)
  resave: false,                 // Не зберігати сесію, якщо вона не змінилася
  saveUninitialized: false       // Не створювати порожні сесії для неавторизованих користувачів
}));


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
// db.run(`CREATE TABLE IF NOT EXISTS posts (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   title TEXT NOT NULL,
//   category TEXT NOT NULL,
//   body TEXT NOT NULL
// )`);

db.serialize(() => {
  // Існуюча таблиця постів
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    body TEXT NOT NULL
  )`);


  // Нова таблиця користувачів
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);


  // Створюємо адміна, якщо його ще немає
  db.get('SELECT * FROM users WHERE email = ?', ['admin@blog.com'], (err, row) => {
    if (!row) {
      // Хешуємо пароль "123456" (генеруємо "сіль" з 10 раундів)
      const hashedPassword = bcrypt.hashSync('123456', 10);
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', ['admin@blog.com', hashedPassword]);
      console.log('Адміністратора створено: admin@blog.com / 123456');
    }
  });
});



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

app.get('/new-post', requireAuth, function (req, res) {
  res.render('new-post', { activePage: "posts" });
});

// app.post('/new-post', function (req, res) {
//   // Дані доступні у змінній req.body, передаємо їх у шаблон як formData
//   res.render('new-post-success', { activePage: "posts", formData: req.body });
// });

app.post('/new-post', requireAuth, function (req, res) {
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

app.get('/login', (req, res) => {
  res.render('login', { activePage: "login" });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    // Якщо користувача не знайдено або пароль не збігається з хешем у БД
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('login', { activePage: "login", error: 'Невірний email або пароль' });
    }
    // Якщо все правильно — записуємо ID користувача в сесію
    req.session.userId = user.id;
    res.redirect('/posts'); // Перенаправляємо на сторінку постів
  });
});

function requireAuth(req, res, next) {
  // Якщо в сесії є userId, значить користувач авторизований — пропускаємо далі (next)
  if (req.session.userId) {
    next();
  } else {
    // Якщо ні — відправляємо на сторінку логіну
    res.redirect('/login');
  }
}


app.listen(3060, () => {
  console.log("Server is running on http://localhost:3060");
});
