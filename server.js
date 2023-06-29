import fetch from "node-fetch";
import mongoose from "mongoose";
import express from "express";
import SingleGame from "./models/singleGame.js";
import Game from "./models/game.js";
import {MongoClient} from "mongodb";

const pathForNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="
const pathForMLBScores = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates="
const pathForWNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates="
const pathForNHLScores = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates="

const url = "mongodb://localhost:27017";
const dbName = "parlaypal";
const collectionName = "games";

const client = new MongoClient(url);

const app = express();
const port = 5500;

async function dbConnect() {
    mongoose.connect("mongodb://localhost:27017/parlaypal", 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    ).then(() => {
        console.log("Successfully connected to MongoDB!");
    }).catch((error) => {
        console.log("Unable to connect to MongoDB!");
        console.log(error);
    });
}

async function getScores(pathForSport) {
    let currentDateInFormat = getDate();
    let response = await fetch(pathForSport + currentDateInFormat);
    let data = await response.json();
    // console.log("Data from getScores: ", data.events);
    return data.events;
}

function getDate() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    // Proper Format: yyyymmdd
    let properDateFormat = yyyy + mm + dd;
    return properDateFormat;
}

async function parseGameSlates(sportSpecificPath, sportSpecificList, sport) {
    let sportGameSlateInfo = await getScores(sportSpecificPath);
    console.log("sportGameSlateInfo: ", sportGameSlateInfo);
    for (var game = 0; game < sportGameSlateInfo.length; game++) {
        // sportSpecificList.push(createGameObjects(sportGameSlateInfo[game], sport));
        let gameData = createGameObjects(sportGameSlateInfo[game], sport);
        sportSpecificList.push(gameData);
        // await updateGameInDatabase(gameData);
    }
    console.log(sportSpecificList);
}

function createGameObjects(currGame, specificSport) {
    if (currGame.competitions[0].hasOwnProperty('odds')) {
        var spreadHolder = currGame.competitions[0].odds[0].details;
        // For away team odds: .odds[0].awayTeamOdds.moneyLine
        // For home team odds: .odds[0].homeTeamOdds.moneyLine
        // var homeTeamOdds = currGame.competitions[0].odds[0].homeTeamOdds.moneyLine;
        // var awayTeamOdds = currGame.competitions[0].odds[0].awayTeamOdds.moneyLine;
    } else {
        var spreadHolder = "-----";
    }
    let gametime = new Date(currGame.date);
    switch (currGame.status.type.id) {
        case "1": // Scheduled Game. Hasn't started yet.
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: 0, awayTeamScore: 0, shortName: currGame.shortName, winner: null
            };
            break;
        case "2": // Live Game
            var homeScore = currGame.competitions[0].competitors[0].score;
            var awayScore = currGame.competitions[0].competitors[1].score;
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null
            };
            break;
        case "3": // Completed. 
            var homeScore = currGame.competitions[0].competitors[0].score;
            var awayScore = currGame.competitions[0].competitors[1].score;
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null
            };
            break;
        // case "4":
        //     gameScore.innerText = "Forfeit";
        // case "5":
        //     gameScore.innerText = "Cancelled";
        // case "6":
        //     gameScore.innerText = "Postponed";
        // case "7":
        //     gameScore.innerText = "Delayed";
        // case "8":
        //     gameScore.innerText = "Suspended";
        default:
            if (currGame.competitions[0].competitors[0].hasOwnProperty('score')) {
                var homeScore = currGame.competitions[0].competitors[0].score;
                var awayScore = currGame.competitions[0].competitors[1].score;
                var currGameObject = {
                    sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                    startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                    status: currGame.status.type.id,
                    homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null
                };
            } else {
                var currGameObject = {
                    sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                    startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                    status: currGame.status.type.id,
                    homeTeamScore: "0", awayTeamScore: "0", shortName: currGame.shortName, winner: null
                };
            }
            break;
    }
    return currGameObject;
}


// TODO: In this file, create handlers for /fetchGamesX where X could be NBA, NFL, MLB, etc. In this handler, I will call the code that reads from ESPN API. Then, with this new 
// data, add or update to the database. 

async function updateGameInDatabase(game) {
    try {
      // Connect to the MongoDB server
      await client.connect();
  
      // Access the database
      const db = client.db(dbName);
  
      // Access the collection
      const collection = db.collection(collectionName);

      collection.insertOne(game, function(err, res) {
        if (err) throw err;
        console.log(`${game.shortName} was inserted!`);
      })
  
    //   console.log('Game updated in the database.');
    } catch (err) {
      console.error('Error updating game in the database:', err);
    }
}

app.use(express.static('E:\\BettingTrackerProject\\public'));

app.get('/fetchNBA', async (req, res) => {
    try {
        const NBAGameList = [];
        await parseGameSlates(pathForNBAScores, NBAGameList, "nba");
        // console.log("NBA Game List: ", NBAGameList);
        res.send(NBAGameList);
    } catch (error) {
        console.error("Error fetching NBA games: ", error);
        res.status(500).send("Error occurred while fetching NBA games!");
    }
});

app.get('/fetchMLB', async (req, res) => {
    try {
        const MLBGameList = [];
        await parseGameSlates(pathForMLBScores, MLBGameList, "mlb");
        // console.log("MLB Game List: ", MLBGameList);
        res.send(MLBGameList);
    } catch (error) {
        console.error("Error fetching MLB games: ", error);
        res.status(500).send("Error occurred while fetching MLB games!");
    }
});

app.get('/fetchNHL', async (req, res) => {
    try {
        const NHLGameList = [];
        await parseGameSlates(pathForNHLScores, NHLGameList, "nhl");
        // console.log("NHL Game List: ", NHLGameList);
        res.send(NHLGameList);
    } catch (error) {
        console.error("Error fetching NHL games: ", error);
        res.status(500).send("Error occurred while fetching NHL games!");
    }
});

app.get('/fetchWNBA', async (req, res) => {
    try {
        const WNBAGameList = [];
        await parseGameSlates(pathForWNBAScores, WNBAGameList, "nhl");
        // console.log("MLB Game List: ", WNBAGameList);
        res.send(WNBAGameList);
    } catch (error) {
        console.error("Error fetching WNBA games: ", error);
        res.status(500).send("Error occurred while fetching WNBA games!");
    }
});

app.get('/', (req, res) => {
    res.sendFile('E:\\BettingTrackerProject\\index.html');
});

app.listen(port);

dbConnect();

const example1 = {
    "sport": "mlb",
    "date": "6/9/2023",
    "homeTeam": "Detroit Tigers",
    "awayTeam": "Arizona Diamondbacks",
    "startTime": "4:40:00 PM",
    "spread": "ARI -140",
    "status": "1",
    "homeTeamScore": 0,
    "awayTeamScore": 0,
    "shortName": "ARI @ DET",
    "winner": "null"
};

const example2 = {
    "sport": "mlb",
    "date": "6/9/2023",
    "homeTeam": "Tampa Bay Rays",
    "awayTeam": "Texas Rangers",
    "startTime": "4:40:00 PM",
    "spread": "TB -170",
    "status": "1",
    "homeTeamScore": 0,
    "awayTeamScore": 0,
    "shortName": "TEX @ TB",
    "winner": "null"
};

const example3 = {
    "sport": "mlb",
    "date": "6/9/2023",
    "homeTeam": "New York Yankees",
    "awayTeam": "Boston Red Sox",
    "startTime": "5:05:00 PM",
    "spread": "NYY -165",
    "status": "1",
    "homeTeamScore": 0,
    "awayTeamScore": 0,
    "shortName": "BOS @ NYY",
    "winner": "null"
};

const example4 = {
    "sport": "nba",
    "date": "6/9/2023",
    "homeTeam": "New York Yankees",
    "awayTeam": "Boston Red Sox",
    "startTime": "5:05:00 PM",
    "spread": "NYY -165",
    "status": "1",
    "homeTeamScore": 0,
    "awayTeamScore": 0,
    "shortName": "BOS @ NYY",
    "winner": "null"
};


// updateGameInDatabase(example1);
// updateGameInDatabase(example2);
// updateGameInDatabase(example3);
// updateGameInDatabase(example4);