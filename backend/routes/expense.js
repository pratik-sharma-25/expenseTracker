const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/ExpenseController');

// Route to get the summary of the expenses
router.get('/getSummary', ExpenseController.getSummary);

// Route to create a new expense
router.post('/create-expense', ExpenseController.createExpense);

// Route to get all expenses
router.get('/', ExpenseController.getExpenses);

// Route to get a single expense by ID
router.get('/:id', ExpenseController.getExpenseById);

// Route to update an expense by ID
router.put('/:id', ExpenseController.updateExpense);

// Route to delete an expense by ID
router.delete('/:id', ExpenseController.deleteExpense);



module.exports = router;