const request = require('supertest');
const express = require('express');
const UserController = require('../controllers/UserController');
const User = require('../models/user.model');

jest.mock('../models/user.model');

const app = express();
app.use(express.json());
app.post('/user/create-account', UserController.createUser);
app.post('/user/login', UserController.loginUser);

beforeEach(() => {
    process.env = {
      ACCESS_TOKEN_SECRET: "SecretKey",
    };
  });

describe('UserController', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { firstName: 'Test', lastName: "User", email: 'test@example.com', password: 'password123' };
      jest.spyOn(User.prototype, 'save').mockResolvedValue(newUser);

      const response = await request(app)
        .post('/user/create-account')
        .send(newUser);

      const expectedResponse = {
        message: 'User created successfully',
        accessToken: expect.any(String),
        error: false,
        user: {},
      };

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedResponse);
    });

    it('should return an error if creation fails', async () => {
        const newUser = { firstName: 'Test', lastName: "User", email: 'test@example.com', password: 'password123' };
        jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error('Error in user creation'));
        const response = await request(app)
          .post('/user/create-account')
          .send(newUser);
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error in user creation' });
      });

    it('should give error when user already exist', async () => {
        const newUser = { firstName: 'Test', lastName: "User", email: 'test@example.com', password: 'password123' };
        User.findOne.mockResolvedValue(newUser);
        const response = await request(app)
          .post('/user/create-account')
          .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'User already exists' });
        
    });

    it('should give error when any field is missing', async () => {
        const newUser = { lastName: "User", email: '', password: 'password123' };
        const response = await request(app)
          .post('/user/create-account')
          .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'All fields are required' });
        
    });
   
  });

  describe('loginUser', () => {
    it('should login a user', async () => {
        const user = { firstName: 'Test', lastName: "User", email: 'test@example.com', password: 'password123' };
        User.findOne.mockResolvedValue(user);
        const response = await request(app)
            .post('/user/login')
            .send({ email: 'test@example.com', password: 'password123' });

        const expectedResponse = {
            accessToken: expect.any(String),
            message: 'user logged in',
            error: false,
            user: {
                user
            },
        };

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });

    it('should return an error if user does not exist', async () => {
        User.findOne.mockResolvedValue(null);
        const response = await request(app)
            .post('/user/login')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'User does not exist' });
    })

    it('showuld give error when password is not matching', async () => {
        const newUser = { firstName: 'Test', lastName: "User", email: 'test@example.com', password: 'pasword123' };

        User.findOne.mockResolvedValue({...newUser, password: 'pasword12' });
        const response = await request(app)
          .post('/user/login')
          .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Password is incorrect' });
    });

    it('should give error when any field is missing', async () => {
        const newUser = { email: '', password: 'password123' };
        const response = await request(app)
          .post('/user/login')
          .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'All fields are required' });
    });

  })
});