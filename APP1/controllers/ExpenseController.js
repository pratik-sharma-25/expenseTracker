const { default: mongoose } = require('mongoose');
const Expense = require('../models/expense.model'); // Assuming the Expense model is in the models directory
const { START_OF_THE_APPLICATION, VALID_SUMMARY_TYPES, DELETE_EXPENSE_CHANNEL, CREATE_EXPENSE_CHANNEL, UPDATE_EXPENSE_CHANNEL} = require('../utils/constants');
const createLog = require('./LoggerController');
const { checkForValidDate, getUserFromRequest } = require('../helper');
const { publish } = require('../pubsub');
const { v4: uuidv4 } = require('uuid');

// Create a new expense
const createExpense = async (req, res) => {

  try {
    const { title, description, amount, date, type } = req.body;

    // check if the categories exist
    if (!title || !amount || !date || !type) {
        createLog("Fields missing", "error", {title, amount, date, type});
        return res.status(400).json({ message: 'All fields are required' });
    }

    // check if amount is a number and not less than 0
    if (isNaN(amount) || amount < 0) {
        createLog("Amount is invalid", "error", {amount});
        return res.status(400).json({ message: 'Amount is invalid' });
    }

    // check if type is either credit or debit
    if (!['credit', 'debit'].includes(type?.toLowerCase())) {
        createLog("Type is invalid", "error", {type});
        return res.status(400).json({ message: 'Type is invalid' });
    }

    // check for valid date format
    const isDateValid = checkForValidDate(date);
    if (!isDateValid){
        createLog("Date is invalid", "error", {date});
        return res.status(400).json({ message: 'Date is invalid' });
    }

    // check if date is greater than today
    if (new Date(date) > new Date()) {
        createLog("Date cannot be set to future", "error", {date});
        return res.status(400).json({ message: 'Date cannot be set to future' });
    }

    const userId = getUserFromRequest(req)

    const expenseId = uuidv4();

    const userExpense = {
        expenseId, 
        title,
        description,
        amount,
        date,
        type,
        user : userId
    }

    publish(CREATE_EXPENSE_CHANNEL, JSON.stringify(userExpense));

    const response = { message: 'Expense created successfully' }
    return res.status(201).json(response);
  } catch (error) {
    createLog("Error in expense creation", "fatal", { message: error.message });
    res.status(500).json({ message: error.message });
  }
};

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

// Update an expense by ID
const updateExpense = async (req, res) => {
  try {
    const { title, description, amount, date, type } = req.body;
    const updateInfo = {
      expenseId: req.params.id,
      title,
      description,
      amount,
      date,
      type,
      userId: getUserFromRequest(req)
    }

    const updatedExpense = await Expense.find({
      expenseId: req.params.id
    });

    if (!updatedExpense) {
       createLog("Error not fount", "error", {  });
      return res.status(404).json({ message: 'Expense not found' });
    }
    publish(UPDATE_EXPENSE_CHANNEL, JSON.stringify(updateInfo));

    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error) {
    createLog("Error in expense updation", "fatal", { message: error.message });
    return res.status(500).json({ message: 'Error updating expense', error });
  }
};

// Delete an expense by ID
const deleteExpense = async (req, res) => {
  try {

    const userInfo = {
      userId: getUserFromRequest(req),
      expenseId: req.params.id
    }

    const deletedExpense = await Expense.find({
      expenseId: req.params.id
    });
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    publish(DELETE_EXPENSE_CHANNEL, JSON.stringify(userInfo));

    return res.status(200).json({ message: 'Expense will be deleted shortly' });
  } catch (error) {
    createLog("Error in expense deletion", "fatal", { message: error.message });
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};

// Get the summary based on yearly, monthly or weekly basis
const getSummary = async (req, res) => {
    const { type } = req.query;

    // check for the predefined types
    if (!VALID_SUMMARY_TYPES.includes(type)) {
        createLog("Type is invalid", "error", {type});
        return res.status(400).json({ message: `Type is invalid, could be either ${VALID_SUMMARY_TYPES.join(", ")}` });
    }

    // get current year
    const currentYear = new Date().getFullYear();
    const userId = getUserFromRequest(req);

    // conver string to mongoose object Id
    let matchQuery = {
        user: new mongoose.Types.ObjectId(userId)
    };

    let groupQuery = {
        totalIncome: {
            $sum: {
                $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0],
            },
        },
        totalExpenses: {
            $sum: {
                $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0],
            },
        }
    };
    
    if (type === 'yearly') {
        matchQuery = {
            ...matchQuery,
            date: {
                $gte: new Date(`${START_OF_THE_APPLICATION}-01-01`), // far greater than date
            },
        };
        groupQuery = {
            ...groupQuery,
            _id: { $year: '$date' },
            
        };
    } else if (type === 'monthly') {
        groupQuery = {
            ...groupQuery,
            _id: { $month: '$date' }
        };
    } else if (type === 'weekly') {
        groupQuery = {
            ...groupQuery,
            _id: { $week: '$date' },
        };
    }
    
    try {
        const summary = await Expense.aggregate([
        {
            $match: matchQuery,
        },
        {
            $group: groupQuery,
        },
        {
            $sort: { _id: 1 },
        },
        ]);
        res.status(200).json(summary);
    } catch (error) {
        createLog("Error in summary fetching", "fatal", { message: error.message });
        res.status(500).json({ message: 'Error fetching summary', error });
    }
}

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary
};