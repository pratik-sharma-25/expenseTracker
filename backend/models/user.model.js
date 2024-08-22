const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const userSchema = new Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         minlength: 3
//     },
// }, {
//     timestamps: true,
// });


// const User = mongoose.model('User', userSchema);

// module.exports = User;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('User', userSchema);