const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 3212;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' folder

// Setup session management
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Database Connection
const dbUrl = 'mysql://root:root@127.0.0.1:3307/catalog';
const connection = mysql.createConnection(dbUrl);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// Default route to serve the HTML file
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading the homepage');
        }
    });
});

// User Registration
app.post('/users/register', async (req, res) => {
    const { username, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO user_info (username, password, email, phone) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, email, phone], (error, results) => {
        if (error) {
            console.error('Error inserting user:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        req.session.userId = results.insertId;
        res.status(201).json({ message: `Welcome, ${username}!` });
    });
});

// User Login
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM user_info WHERE email = ?';

    connection.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        req.session.userId = user.user_id;
        res.status(200).json({ message: `Hello, ${user.username}!` });
    });
});

// Fetch products
app.get('/products', (req, res) => {
    const query = 'SELECT product_id, product_name, description, amount, imageUrl FROM product_info';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
