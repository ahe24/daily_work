const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '1d'; // 24 hours

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, name, email, role: 'user' });
    res.status(201).json({ message: '가입 완료', user: { id: user.id, username: user.username, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: '가입 오류', error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: '존재하지 않는 ID입니다.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: '로그인 오류', error: e.message });
  }
});

// Get current user info (with token)
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: '토큰 없음' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: '사용자 없음' });
    res.json({ user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(401).json({ message: '토큰 오류', error: e.message });
  }
});

module.exports = router;
