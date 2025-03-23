const redis = require('redis');
const Expense = require('../models/expense.model');
const { default: mongoose } = require('mongoose');
const config = require('../config');
const { DELETE_EXPENSE_CHANNEL, CREATE_EXPENSE_CHANNEL, UPDATE_EXPENSE_CHANNEL } = require('../utils/constants');

const subscribe = async () => {
    const client = redis.createClient({ 
        url: config.redisURI,
        
    });
    await client.connect();

    const subscriber = client.duplicate();
    await subscriber.connect();

    await subscriber.subscribe(DELETE_EXPENSE_CHANNEL, async (message) => {
        if (message === null) {
            return;
        }
        await deleteExpense(message);
    });

    await subscriber.subscribe(CREATE_EXPENSE_CHANNEL, async (message) => {
        if (message === null) {
            return;
        }
        await createExpense(message);
    });

    await subscriber.subscribe(UPDATE_EXPENSE_CHANNEL, async (message) => {
        if (message === null) {
            return;
        }
        await updateExpense(message);
    });

}

const deleteExpense = async (message) => {
    const userInfo = JSON.parse(message);
    const { userId, expenseId } = userInfo;
    const deletedExpense = {
        isDeleted: true,
        updatedOn: new Date()
    }
    await Expense.findOneAndUpdate({
        expenseId,
        user: new mongoose.Types.ObjectId(userId)
    }, deletedExpense);
}

const createExpense = async (message) => {
    const userExpense = JSON.parse(message);
    const newExpense = new Expense(userExpense);
    await newExpense.save();
}

const updateExpense = async (message) => {
    const userExpense = JSON.parse(message);
    userExpense.updatedOn = new Date();
    const { userId, expenseId } = userExpense;
    await Expense.findOneAndUpdate({
        expenseId,
        user: new mongoose.Types.ObjectId(userId)
    }, userExpense);
}

module.exports = subscribe;
