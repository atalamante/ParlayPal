const mongoose = require('mongoose');

const singleGameSchema = new mongoose.Schema({
    sport:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        required: true,
    },
    homeTeam: {
        type: String,
        required:true,
    },
    awayTeam: {
        type:String,
        required:true,
    },
    startTime: {
        type:Date,
        required:true,
    },
    status: {
        type: String,
        required: true,
    },
    homeTeamScore: {
        type: Number,
        default: null,
    },
    awayTeamScore: {
        type: Number,
        default: null,
    },
    winner: {
        type: String,
        default: null
    }
});

const Game = mongoose.model('Game', singleGameSchema);

module.exports = Game;