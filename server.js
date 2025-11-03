const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = 'mysecretkey';
let balance = 1000;

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/balance', verifyToken, (req, res) => {
  res.status(200).json({ balance });
});

app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;
  balance += amount;
  res.status(200).json({ message: `Deposited ${amount}`, balance });
});

app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;
  if (amount > balance) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }
  balance -= amount;
  res.status(200).json({ message: `Withdrawn ${amount}`, balance });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
