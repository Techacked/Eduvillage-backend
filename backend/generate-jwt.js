require('dotenv').config();
const jwt = require('jsonwebtoken');

const userId = process.argv[2] || 'default-user-id';
const role = process.argv[3] || 'student';

const token = jwt.sign(
  { id: userId, role: role },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

console.log('Generated JWT Token:', token);
console.log('For User ID:', userId);
console.log('Role:', role);