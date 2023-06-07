const mongoose = require('mongoose');

const gameByDatesSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
    },
    games: {
        type: Map,
        of: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Game,
            },
        ],
        default: {},
    },
});

const gameByDates = mongoose.model("GameByDates", gameByDatesSchema);

module.exports = Schedule;