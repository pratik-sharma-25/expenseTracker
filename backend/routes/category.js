const express = require('express');
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/CategoryController');

const router = express.Router();

// create new category
router.post('/create-category', createCategory);

// get all categories
router.get('/', getAllCategories);

// update category
router.put('/:id', updateCategory);

// delete a category
router.delete('/:id', deleteCategory);

module.exports = router;