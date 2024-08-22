const { getUserFromRequest } = require('../helper');
const Category = require('../models/category.model');
const createLog = require('./LoggerController');

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // check if category already exists for a user
    const existingCategory = await Category.findOne({ name: name.toLowerCase(), user: getUserFromRequest(req) });
    if (existingCategory) {
        createLog("Category already exists", "error", {name});
        return res.status(400).json({ message: 'Category already exists' });
    }

    // check if type is either income or expense
    if (!['income', 'expense'].includes(type?.toLowerCase())) {
        createLog("Type is invalid ", "error", {type});
        return res.status(400).json({ message: 'Type is invalid, should be either income or expense' });
    }

    const newCategory = new Category({ name: name.toLowerCase(), description, type, user: getUserFromRequest(req) });
    await newCategory.save();
    const response = { message: 'Category created successfully' }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    let userId = getUserFromRequest(req);
    const categories = await Category.find({ user: userId }); // get categories for the logged in user
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Update a category by ID
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, type },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Delete a category by ID
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};