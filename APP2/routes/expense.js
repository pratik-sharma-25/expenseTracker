const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

// Route to get all expenses
router.get('/', ExpenseController.getExpenses);

// Route to get a single expense by ID
router.get('/:id', ExpenseController.getExpenseById);

module.exports = router;