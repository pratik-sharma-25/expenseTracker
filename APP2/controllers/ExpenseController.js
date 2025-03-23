const Expense = require('../models/expense.model'); // Assuming the Expense model is in the models directory
const createLog = require('./LoggerController');
const { checkForValidDate, getUserFromRequest } = require('../helper');


// Get all expenses
const getExpenses = async (req, res) => {
  const { page = 1, limit = 10, search = "", date = "" } = req.query;  
  
  let userId = getUserFromRequest(req);

  if (!userId) {
    return res.status(400).json({ message: 'User not found' });
  }
    
  let searchQuery = {
    user: userId ,
    isDeleted: false
  }

  if (search) {
    searchQuery = {
      ...searchQuery,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
  }

  // implement search by date
  if (date) {
    // check for valid date format
    const isValidDate = checkForValidDate(date);
    if (!isValidDate) {
      createLog("Date is invalid", "error", {date});
      return res.status(400).json({ message: 'Date is invalid' });
    }

    const dateFilter = new Date(date).toISOString().split("T")[0];
    searchQuery = {
      ...searchQuery,
      date: {
        $gte: new Date(dateFilter),
        $lt: new Date(new Date(dateFilter).setDate(new Date(dateFilter).getDate() + 1))
      }
    }
  }

  try {
    const expenses = await Expense.find( searchQuery, { __v: 0 }, { limit: parseInt(limit), skip: (parseInt(page) - 1) * limit });
    const expenseCount = await Expense.countDocuments(searchQuery);
    res.status(200).json({expenses, expenseCount});
  } catch (error) {
    createLog("Error in expense retrieving", "fatal", { message: error.message });
    res.status(500).json({ message: 'Error retrieving expenses', error });
  }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      expenseId: req.params.id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    createLog("Error in expense retrieving by id", "fatal", { message: error.message });
    res.status(500).json({ message: 'Error retrieving expense', error });
  }
};


module.exports = {
  getExpenses,
  getExpenseById
};