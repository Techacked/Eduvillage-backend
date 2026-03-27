const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('Generated secure JWT Secret:', secret);
console.log('Add this to your .env file as JWT_SECRET=');