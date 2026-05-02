require('module-alias/register');
require('dotenv').config();
const { inject, errorHandler } = require('express-custom-error');
inject();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('@util/logger');

try {
  require('mandatoryenv').load([
    'DB_URL',
    'SECRET'
  ]);
} catch (err) {
  console.error("❌ Missing environment variables:", err.message);
  process.exit(1); 
}

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logger.dev, logger.combined);
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API is working 🚀'
  });
});

app.use('/', require('@routes/router.js'));

app.use(errorHandler());

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Endpoint Not Found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});