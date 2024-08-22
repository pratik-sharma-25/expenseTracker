const { default: mongoose } = require('mongoose');
const Expense = require('../models/expense.model'); // Assuming the Expense model is in the models directory
const { START_OF_THE_APPLICATION, VALID_SUMMARY_TYPES} = require('../utils/constants');
const createLog = require('./LoggerController');
const { checkForValidDate, getUserFromRequest } = require('../helper');
const Category = require('../models/category.model');

// Create a new expense
const createExpense = async (req, res) => {

  try {
    const { title, description, amount, date, category, type } = req.body;

    // check if the categories exist
    if (!title || !amount || !date || !category || !type) {
        createLog("Fields missing", "error", {title, amount, date, category, type});
        return res.status(400).json({ message: 'All fields are required' });
    }

    // check if categories are preexisting
    const userCategory = await Category.findOne({ name: category.toLowerCase(), user: getUserFromRequest(req) });
    if (!userCategory) {
        createLog("Category does not exist", "error", {category});
        return res.status(400).json({ message: 'Category does not exist'});
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

    const newExpense = new Expense({
      title,
      description,
      type,
      amount,
      date,
      category: userCategory.name,
      user: getUserFromRequest(req)
    });
    await newExpense.save()
    const response = { message: 'Expense created successfully' }
    res.status(201).json(response);
  } catch (error) {
    createLog("Error in expense creation", "fatal", { message: error.message });
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses
const getExpenses = async (req, res) => {
  const { page = 1, limit = 10, search = "", category = "", date = "" } = req.query;  
  
  let userId = getUserFromRequest(req);

  let searchQuery = {
    user: userId || ""
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

  // implement search by category
  if (category) {
    // check if categories are pre existing
    searchQuery = {
      ...searchQuery,
      category: {$regex: category.toLowerCase(), $options: 'i'}
    }
  }

  try {
    const expenses = await Expense.find( searchQuery, { __v: 0 }, { limit: parseInt(limit), skip: (parseInt(page) - 1) * parseInt });
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
    const expense = await Expense.findById(req.params.id);
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
    const { title, description, amount, date, category, type } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { description, amount, date, category, title, type},
      { new: true }
    );
    if (!updatedExpense) {
       createLog("Error not fount", "error", {  });
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
  } catch (error) {
    createLog("Error in expense updation", "fatal", { message: error.message });
    res.status(500).json({ message: 'Error updating expense', error });
  }
};

// Delete an expense by ID
const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
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

    // conver string to mongoose object Id
    let matchQuery = {
        user: req?.user?.user?.user?._id ? new mongoose.Types.ObjectId(req?.user?.user?.user?._id ) : "",
        date: {
          $gte: new Date(`${currentYear}-01-01`), // start of the year
        }
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