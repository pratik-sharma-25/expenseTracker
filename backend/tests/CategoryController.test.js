const request = require("supertest");
const express = require("express");
const CategoryController = require("../controllers/CategoryController");
const Category = require("../models/category.model");

jest.mock("../models/category.model");

const app = express();
app.use(express.json());
app.post("/category/create-category", CategoryController.createCategory);
app.put("/category/:id", CategoryController.updateCategory);
app.delete("/category/:id", CategoryController.deleteCategory);
app.get("/category", CategoryController.getAllCategories);

describe("Category Controller", () => {
  describe("Create Category", () => {
    it("should create a new category", async () => {
      const category = {
        name: "Food",
        description: "This is a food category",
        type: "expense",
      };

      jest.spyOn(Category.prototype, "save").mockResolvedValue(category);

      const res = await request(app)
        .post("/category/create-category")
        .send(category);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ message: "Category created successfully" });
    });

    it("should not create a category if it already exists", async () => {
      const category = {
        name: "Food",
        description: "This is a food category",
        type: "expense",
      };

      Category.findOne.mockResolvedValue(category);

      const res = await request(app)
        .post("/category/create-category")
        .send(category);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ message: "Category already exists" });
    });

    it("should not create a category if the type is invalid", async () => {
        const category = {
            name: "Food",
            description: "This is a food category",
            type: "invalid",
        };

        Category.findOne.mockResolvedValue(null);
    
        const res = await request(app)
            .post("/category/create-category")
            .send(category);
    
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            message: "Type is invalid, should be either income or expense",
        });
    })

    it("should return 500 if there is an error creating a category", async () => {
      const category = {
        name: "Food",
        description: "This is a food category",
        type: "expense",
      };

      jest.spyOn(Category.prototype, "save").mockRejectedValue(new Error());

      const res = await request(app)
        .post("/category/create-category")
        .send(category);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Error creating category", error: {} });
    });
  });

  describe("Get All Categories", () => {
    it("should get all categories", async () => {
      const categories = [
        {
          name: "food",
          description: "This is a food category",
          type: "expense",
        },
        {
          name: "Travel",
          description: "This is a travel category",
          type: "expense",
        },
      ];

      Category.find.mockResolvedValue(categories);

      const res = await request(app).get("/category");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe("food");
    });

    it("should return 500 if there is an error fetching categories", async () => {
        Category.find.mockRejectedValue(new Error());
    
        const res = await request(app).get("/category");
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: "Error fetching categories", error: {} });
    })
  });

  describe("Update Category", () => {
    it("should update a category by ID", async () => {
      const category = {
        name: "food",
        description: "This is a food category",
        type: "expense",
      };

      Category.findByIdAndUpdate.mockResolvedValue(category);

      const res = await request(app).put(`/category/1`).send(category);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ message: "Category updated successfully" });
    });

    it("should return 404 if category is not found", async () => {
      Category.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app).put(`/category/1`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ message: "Category not found" });
    });

    it("should return 500 if there is an error updating a category", async () => {
      const category = {
        name: "food",
        description: "This is a food category",
        type: "expense",
      };

      Category.findByIdAndUpdate.mockRejectedValue(new Error());

      const res = await request(app).put(`/category/1`).send(category);
      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ message: "Error updating category", error: {} });
    });
  });

  describe("Delete Category", () => {
    it("should delete a category by ID", async () => {
      const category = {
        name: "Food",
        description: "This is a Food category",
      };

      Category.findByIdAndDelete.mockResolvedValue(category);

      const res = await request(app).delete(`/category/1`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Category deleted successfully");
    });

    it("should return 404 if category is not found", async () => {
        Category.findByIdAndDelete.mockResolvedValue(null);
    
        const res = await request(app).delete(`/category/1`);
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ message: "Category not found" });
    })

    it("should return 500 if there is an error deleting a category", async () => {
        Category.findByIdAndDelete.mockRejectedValue(new Error());
    
        const res = await request(app).delete(`/category/1`);
        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: "Error deleting category", error: {} });
    });
  });
});
