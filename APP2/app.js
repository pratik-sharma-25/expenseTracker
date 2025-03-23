const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // Import the routes
const {subscribe} = require('./pubsub');
const config = require('./config');
require('dotenv').config()

const app = express();

const mongoose = require("mongoose");
mongoose.connect(config.mongoURI);

app.use(cors());
app.use(express.json());

app.use(
    cors({
        origin: "*", // currently enabling for all origins
        credentials: true,
    })
);

subscribe(); // responsible for subscribing to the channels and making updates as the data recieved

app.use('/', routes); // Use the routes for all

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});