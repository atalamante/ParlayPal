import mongoose from "mongoose";

const gameByDatesSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    sports: [
        {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    ],
});

const Game = mongoose.model("Game", gameByDatesSchema);

export default Game;