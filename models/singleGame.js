import mongoose from "mongoose";

const singleGameSchema = new mongoose.Schema({
    sport:{
        type: String,
    },
    date:{
        type: String,
    },
    homeTeam: {
        type: String,
    },
    awayTeam: {
        type:String,
    },
    startTime: {
        type:String,
    },
    spread: {
        type: String,
    },
    status: {
        type: String,
    },
    homeTeamScore: {
        type: String,
    },
    awayTeamScore: {
        type: String,
    },
    shortName: {
        type: String,
    },
    winner: {
        type: String,
    }
}, {collection: 'games'});

const SingleGame = mongoose.model('SingleGame', singleGameSchema);

export default SingleGame;