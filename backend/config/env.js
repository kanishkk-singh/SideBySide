const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (!isProduction) {
    console.warn('JWT_SECRET missing in backend/.env. Using a temporary development secret.');
    return 'sidebyside-dev-secret';
  }

  throw new Error('JWT_SECRET is missing in backend/.env. Add a long random string before starting the server.');
};

module.exports = {
  getJwtSecret,
  isProduction,
};
