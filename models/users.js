const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    picks: {
        type: Map,
        of: [
            {
                date: {type: Date, required: true},
                teams: [{type: String, required: true}],
            },
        ],
        defaut: {},
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;