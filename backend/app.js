const express = require('express');
const cors = require('cors');
const routes = require('./routes/'); // Import the routes
require('dotenv').config()

const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/userUpdateA");

app.use(cors());
app.use(express.json());

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use('/', routes); // Use the routes for all

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});