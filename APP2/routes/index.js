const express = require('express');
const router = express.Router();

const expenseRouter = require('./expense');

const { authenticateToken } = require('../helper');

router.use('/expense', authenticateToken,  expenseRouter);

module.exports = router;