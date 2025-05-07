const bcrypt = require('bcrypt');
const { User } = require('../models');

async function createAdmin() {
  const username = 'ahe24jcs';
  const password = '7901';
  const name = 'Changseon Jo';
  const email = 'cs.jo@ednc.com';
  const role = 'admin';

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    console.log('관리자 계정이 이미 존재합니다.');
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed, name, email, role });
  console.log('관리자 계정 생성 완료!');
}

createAdmin().then(() => process.exit());
