const request = require("supertest");
const express = require("express");
const ExpenseController = require("../controllers/ExpenseController");
const Expense = require("../models/expense.model");
const Category = require("../models/category.model");

jest.mock("../models/expense.model");
jest.mock("../models/category.model");

const app = express();
app.use(express.json());
app.post("/expense/create-expense", ExpenseController.createExpense);
app.get("/expense/summary", ExpenseController.getSummary);
app.get("/expense", ExpenseController.getExpenses);
app.get("/expense/:id", ExpenseController.getExpenseById);
app.put("/expense/:id", ExpenseController.updateExpense);
app.delete("/expense/:id", ExpenseController.deleteExpense);

describe("ExpenseController", () => {
  describe("createExpense", () => {
    it("should create a new expense", async () => {
      const newExpense = {
        title: "first expense",
        description: "Test Expense",
        amount: 100,
        date: "2023-01-01",
        type: "debit",
        category: "Food",
      };

      const expectedResponse = {
        message: "Expense created successfully",
      };

      jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
      Category.findOne.mockResolvedValue({ name: "food" });
      const response = await request(app)
        .post("/expense/create-expense")
        .send(newExpense);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should return an error if creation fails", async () => {
      jest
        .spyOn(Expense.prototype, "save")
        .mockRejectedValue(new Error("Error creating expense"));
        Category.findOne.mockResolvedValue({ name: "food" });

      const response = await request(app)
        .post("/expense/create-expense")
        .send({
          description: "Test Expense",
          amount: 100,
          date: "2023-01-01",
          title: "first title",
          category: "food",
          type: "debit",
        });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Error creating expense" });
    });

    it("should not create an expense if date is more than today", async () => {
      const newExpense = {
        title: "first expense",
        description: "Test Expense",
        amount: 100,
        date: "2025-01-01",
        type: "debit",
        category: "Food",
        user: "7234234",
      };

      const expectedResponse = {
        message: "Date cannot be set to future",
      };

      jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
      Category.findOne.mockResolvedValue({ name: "food" });
      const response = await request(app)
        .post("/expense/create-expense")
        .send(newExpense);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should not create an expense if the category is not valid", async () => {
      const newExpense = {
        title: "first expense",
        description: "Test Expense",
        amount: 100,
        date: "2023-01-01",
        type: "debit",
        category: "Good",
        user: "7234234",
      };

      const expectedResponse = {
        message: "Category does not exist",
      };

      jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
      Category.findOne.mockResolvedValue(null);
      const response = await request(app)
        .post("/expense/create-expense")
        .send(newExpense);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should not create an expense if the type is not valid", async () => {
        const newExpense = {
            title: "first expense",
            description: "Test Expense",
            amount: 100,
            date: "2023-01-01",
            type: "salary",
            category: "Food",
            user: "7234234",
        };
    
        const expectedResponse = {
            message: "Type is invalid",
        };
    
        jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
        Category.findOne.mockResolvedValue({ name: "food" });
        const response = await request(app)
            .post("/expense/create-expense")
            .send(newExpense);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual(expectedResponse);
    });

    it("should not create an expense if the amount is not valid", async () => {
        const newExpense = {
            title: "first expense",
            description: "Test Expense",
            amount: "first",
            date: "2023-01-01",
            type: "credit",
            category: "Food",
            user: "7234234",
        };
    
        const expectedResponse = {
            message: "Amount is invalid",
        };
    
        jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
        Category.findOne.mockResolvedValue({ name: "food" });
        const response = await request(app)
            .post("/expense/create-expense")
            .send(newExpense);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual(expectedResponse);
    });

    it("should not create an expense if the date is not valid", async () => {
        const newExpense = {
            title: "first expense",
            description: "Test Expense",
            amount: 100,
            date: "2023-13-01",
            type: "credit",
            category: "Food",
            user: "7234234",
        };
    
        const expectedResponse = {
            message: "Date is invalid",
        };
    
        jest.spyOn(Expense.prototype, "save").mockResolvedValue(newExpense);
        Category.findOne.mockResolvedValue({ name: "food" });
        const response = await request(app)
            .post("/expense/create-expense")
            .send(newExpense);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual(expectedResponse);
    })

    it("should not create an expense if any field is missing", async () => {
        const newExpense = {
            description: "Test Expense",
            amount: 100,
            date: "2023-01-01",
            type: "credit",
        }

        const expectedResponse = {
            message: "All fields are required",
        }

        const response = await request(app)
            .post("/expense/create-expense")
            .send(newExpense);

        expect(response.status).toBe(400);
        expect(response.body).toEqual(expectedResponse);
    })
  });

  describe("getExpenses", () => {
    it("should return all expenses", async () => {
      const expenses = [
        {
          title: "test1",
          description: "Test Expense",
          amount: 100,
          date: "2023-01-01",
        },
        {
          title: "test2",
          description: "Test Expense 2",
          amount: 200,
          date: "2023-01-02",
        },
      ];
      Expense.find.mockResolvedValue(expenses);
      const response = await request(app).get("/expense");

      const expectedResponse = {
        expenses: expenses,
      };

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should return search results", async () => {
      const expenses = [
        {
          title: "test1",
          description: "Test Expense",
          amount: 100,
          date: "2023-01-01",
        },
        {
          title: "test2",
          description: "Test Expense 2",
          amount: 200,
          date: "2023-01-02",
        },
      ];
      Expense.find.mockResolvedValue(expenses);
      const response = await request(app)
        .get("/expense")
        .query({ search: "test" });

      const expectedResponse = {
        expenses: expenses,
      };

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResponse);
    });

    it("should return an error if fetching fails", async () => {
      Expense.find.mockRejectedValue(new Error("Fetching failed"));

      const response = await request(app).get("/expense");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error retrieving expenses",
        error: {},
      });
    });

    it("should return an error if date is invalid", async () => {
        const response = await request(app).get("/expense").query({ date: "2023-13-01" });
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Date is invalid",
        });
    })
  });

  describe("getExpenseById", () => {
    it("should return a single expense by ID", async () => {
      const expense = {
        title: "First Test",
        description: "Test Expense",
        amount: 100,
        date: "2023-01-01",
      };
      Expense.findById.mockResolvedValue(expense);

      const response = await request(app).get("/expense/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expense);
    });

    it("should return a single expense by ID", async () => {
      const expense = {
        title: "First Test",
        description: "Test Expense",
        amount: 100,
        date: "2023-01-01",
      };
      Expense.findById.mockResolvedValue(null);

      const response = await request(app).get("/expense/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Expense not found" });
    });

    it("should return an error if fetching fails", async () => {
      Expense.findById.mockRejectedValue(new Error("Fetching failed"));

      const response = await request(app).get("/expense/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {},
        message: "Error retrieving expense",
      });
    });
  });

  describe("updateExpense", () => {
    it("should update an expense by ID", async () => {
      const updatedExpense = {
        title: "test 1 updation",
        description: "Updated Expense",
        amount: 150,
        date: "2023-01-01",
      };
      Expense.findByIdAndUpdate.mockResolvedValue(updatedExpense);

      const response = await request(app)
        .put("/expense/1")
        .send(updatedExpense);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        expense: updatedExpense,
        message: "Expense updated successfully",
      });
    });

    it("should result in error as id does not exist", async () => {
      const updatedExpense = {
        title: "test 1 updation",
        description: "Updated Expense",
        amount: 150,
        date: "2023-01-01",
      };
      Expense.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put("/expense/1")
        .send(updatedExpense);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Expense not found" });
    });

    it("should return an error if updating fails", async () => {
      Expense.findByIdAndUpdate.mockRejectedValue(
        new Error("Error updating expense")
      );

      const response = await request(app)
        .put("/expense/1")
        .send({
          description: "Updated Expense",
          amount: 150,
          date: "2023-01-01",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error updating expense",
        error: {},
      });
    });
  });

  describe("deleteExpense", () => {
    it("should delete an expense by ID", async () => {
      Expense.findByIdAndDelete.mockResolvedValue({});

      const response = await request(app).delete("/expense/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Expense deleted successfully",
      });
    });

    it("should delete an expense by ID", async () => {
      Expense.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete("/expense/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Expense not found" });
    });

    it("should return an error if deletion fails", async () => {
      Expense.findByIdAndDelete.mockRejectedValue(new Error("Deletion failed"));

      const response = await request(app).delete("/expense/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error deleting expense",
        error: {},
      });
    });
  });

  describe("summaryExpense", () => {
    it("should return summary of expenses", async () => {
      const summary = [
        { _id: 1, totalIncome: 100, totalExpenses: 50 },
        { _id: 2, totalIncome: 200, totalExpenses: 150 },
      ];
      Expense.aggregate.mockResolvedValue(summary);

      const response = await request(app).get("/expense/summary?type=yearly");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(summary);
    });

    it("should return an error if fetching fails", async () => {
      Expense.aggregate.mockRejectedValue(new Error("Fetching failed"));

      const response = await request(app).get("/expense/summary?type=yearly");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error fetching summary",
        error: {},
      });
    });

    it("should return an error if not valid type", async () => {
      const response = await request(app).get("/expense/summary?type=week");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Type is invalid, could be either yearly, monthly, weekly",
      });
    });
  });
});
