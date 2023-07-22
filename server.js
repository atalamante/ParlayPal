import fetch from "node-fetch";
import mongoose from "mongoose";
import express from "express";
import {MongoClient, ObjectId} from "mongodb";
import session from "express-session";
import {v4 as uuidv4} from "uuid";

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

const currSportsList = ["nba", "mlb", "nhl", "wnba"];

app.use(session({
    secret: "aaronSecret",
    resave: false,
    saveUninitialized: false
}));

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

function getPathForSport(sport) {
    switch (sport) {
        case "nba":
            return pathForNBAScores;
        case "mlb":
            return pathForMLBScores;
        case "nhl":
            return pathForNHLScores;
        case "wnba":
            return pathForWNBAScores;
        default:
            throw new Error(`Invalid sport: ${sport}`);
    }
}

async function parseGameSlates(sportSpecificPath, sportSpecificList, sport) {

    const db = client.db(dbName);
    const gamesCollection = db.collection("games");

    let sportGameSlateInfo = await getScores(sportSpecificPath);
    // console.log("sportGameSlateInfo: ", sportGameSlateInfo);
    for (var game = 0; game < sportGameSlateInfo.length; game++) {
        // sportSpecificList.push(createGameObjects(sportGameSlateInfo[game], sport));
        let gameData = createGameObjects(sportGameSlateInfo[game], sport);

        let apiID = gameData["apiID"];

        const existingGameCheck = await gamesCollection.findOne({apiID});

        if (!existingGameCheck) {
            await gamesCollection.insertOne(gameData);
        } else {
            const currentSpread = gameData.spread;
            const existingSpread = existingGameCheck.spread;
            if (currentSpread !== existingSpread && currentSpread !== "-----") {
                await gamesCollection.updateOne({apiID}, {
                    $set: {
                        homeTeamScore: gameData.homeTeamScore,
                        awayTeamScore: gameData.awayTeamScore,
                        status: gameData.status,
                        winner: null,
                        spread: currentSpread
                    }
                });
            } else {
                await gamesCollection.updateOne({apiID}, {
                    $set: {
                        homeTeamScore: gameData.homeTeamScore,
                        awayTeamScore: gameData.awayTeamScore,
                        status: gameData.status,
                        winner: null
                    }
                });
            }
        }

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
    let uniqueID = uuidv4();
    let espnGameID = currGame.uid;
    switch (currGame.status.type.id) {
        case "1": // Scheduled Game. Hasn't started yet.
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: 0, awayTeamScore: 0, shortName: currGame.shortName, winner: null, gameID: uniqueID, apiID: espnGameID
            };
            break;
        case "2": // Live Game
            var homeScore = currGame.competitions[0].competitors[0].score;
            var awayScore = currGame.competitions[0].competitors[1].score;
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null, gameID: uniqueID, apiID: espnGameID
            };
            break;
        case "3": // Completed. 
            var homeScore = currGame.competitions[0].competitors[0].score;
            var awayScore = currGame.competitions[0].competitors[1].score;
            var currGameObject = {
                sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                status: currGame.status.type.id,
                homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null, gameID: uniqueID, apiID: espnGameID
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
                    homeTeamScore: homeScore, awayTeamScore: awayScore, shortName: currGame.shortName, winner: null, gameID: uniqueID, apiID: espnGameID
                };
            } else {
                var currGameObject = {
                    sport: specificSport, date: gametime.toLocaleDateString(), homeTeam: currGame.competitions[0].competitors[0].team.displayName, awayTeam: currGame.competitions[0].competitors[1].team.displayName,
                    startTime: gametime.toLocaleTimeString('en-US'),spread: spreadHolder,
                    status: currGame.status.type.id,
                    homeTeamScore: "0", awayTeamScore: "0", shortName: currGame.shortName, winner: null, gameID: uniqueID, apiID: espnGameID
                };
            }
            break;
    }
    return currGameObject;
}

app.use(express.static('E:\\BettingTrackerProject\\public'));
app.use(express.json());

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
    console.log("Made it into fetchMLB");
    try {
        const MLBGameList = [];
        await parseGameSlates(pathForMLBScores, MLBGameList, "mlb");
        console.log("MLB Game List in fetchMLB: ", MLBGameList);
        res.send(MLBGameList);
    } catch (error) {
        console.error("Error fetching MLB games in fetchMLB: ", error);
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
        await parseGameSlates(pathForWNBAScores, WNBAGameList, "wnba");
        // console.log("MLB Game List: ", WNBAGameList);
        res.send(WNBAGameList);
    } catch (error) {
        console.error("Error fetching WNBA games: ", error);
        res.status(500).send("Error occurred while fetching WNBA games!");
    }
});

app.get('/', (req, res) => {
    console.log("UserID: ", req.session.userID);
    if (req.session.userID) {
        res.redirect("/main");
    } else {
        res.sendFile('E:\\BettingTrackerProject\\landing.html');
    }
});

app.get("/main", async (req, res) => {
    try {
        for (const sport of currSportsList) {
            const gameList = [];
            await parseGameSlates(getPathForSport(sport), gameList, sport);
            console.log(`${sport.toUpperCase()} Game List in main: `, gameList);
        }
    } catch (error) {
        console.error("Error fetching MLB games in /main: ", error);
    }
    res.sendFile('E:\\BettingTrackerProject\\index.html');
});

app.get('/login.html', (req, res) => {
    res.sendFile("E:\\BettingTrackerProject\\login.html");
});

app.get('/signup.html', (req, res) => {
    res.sendFile("E:\\BettingTrackerProject\\signup.html");
});

app.get("/myParlays.html", (req, res) => {
    res.sendFile("E:\\BettingTrackerProject\\myParlays.html");
});

app.post('/signup', async (req, res) => {
    console.log("Inside /signup!");
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.passwordConfirm;
    
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    try {
        const existingUser = await usersCollection.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: "User already exists!"});
        }
        const newUser = {email, password, parlays:[]};
        const result = await usersCollection.insertOne(newUser);
        
        console.log("New user created: ", result.insertedId);

        req.session.userID = newUser._id;

        return res.redirect('/main');
        // return res.status(201).json({message: "User created successfully!"});
    } catch (error) {
        console.error("Error saving user: ", error);
        return res.status(500).json({error: "Failed to save user!"});
    }
});

app.post("/login", async (req, res) => {
    console.log("Inside /login");
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    try {
        const existingUser = await  usersCollection.findOne({email});
        if (!existingUser || existingUser.password !== password) {
            return res.status(401).json({error: "Invalid email or password!"});
        }

        req.session.userID = existingUser._id;

        return res.redirect('/main');
    } catch (error) {
        console.error("Error during login: ", error);
        return res.status(500).json({error: "Failed to login user!"});
    }

});

app.post("/createParlay", async (req, res) => {
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const userID = req.session.userID;

    console.log("userID: ", userID);
    
    const user = await usersCollection.findOne({"_id": new ObjectId(userID)});

    console.log("user: ", user);

    const parlayData = req.body;

    console.log(parlayData);

    console.log("User Parlays: ", user.parlays);

    user.parlays.push(parlayData);

    await usersCollection.updateOne({_id: new ObjectId(userID)}, {$push: {parlays: parlayData}});

    res.sendStatus(200);
});

app.get("/activeParlays", async (req, res) => {
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const userID = req.session.userID;

    console.log("userID: ", userID);

    try {
        const user = await usersCollection.findOne({"_id": new ObjectId(userID)});
        const activeParlays = user.parlays.filter(parlay => parlay.parlayStatus === "active");
        res.json(activeParlays);
    } catch (error) {
        console.error("Error retrieving active parlays: ", error);
        res.status(500).json({error: "Failed to retrieve active parlays"});
    }
});

app.get("/getGames", async (req, res) => {
    console.log("Inside getGames");
    try {
        const db = client.db(dbName);
        const gamesCollection = db.collection("games");

        const {sport, date} = req.query;

        console.log(sport, date);

        const gamesCursor = await gamesCollection.find({sport: sport, date: date});

        const games = await gamesCursor.toArray();

        console.log("Games inside getGames: ", games);
        
        res.json(games);
    } catch (error) {
        console.error("Error fetching games: ", error);
        res.status(500).send("Error occurred while fetching games!");
    }
});

app.get("/updateGames",async (req, res) => {
    try {
        const allGames = [];
        for (const sport of currSportsList) {
            const gameList = [];
            await parseGameSlates(getPathForSport(sport), gameList, sport);
            console.log(`${sport.toUpperCase()} Game List in updateGames: `, gameList);
            allGames.push(...gameList);
        }
        res.json(allGames);
    } catch (error) {
        console.error("Error fetching games in /updateGames: ", error);
    }
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