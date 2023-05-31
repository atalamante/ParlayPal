pathForNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="
pathForMLBScores = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates="
pathForWNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates="
pathForNHLScores = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates="

async function getScores(pathForSport) {
    currentDateInFormat = getDate();
    let response = await fetch(pathForSport + currentDateInFormat);
    let data = await response.json();
    console.log(data.events);
    return data.events;
}

function getDate() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    // Proper Format: yyyymmdd
    properDateFormat = yyyy + mm + dd;
    return properDateFormat;
}

async function parseMLBGameSlates() {
    mlbGameSlateInfo = await getScores(pathForMLBScores);
    let mlbTable = document.getElementById("mlbTable");
    for (var game = 0; game < mlbGameSlateInfo.length; game++) {
        updateTableHelper(mlbTable, mlbGameSlateInfo[game]);
    }
}

async function parseNBAGameSlate() {
    gameSlateInfo = await getScores(pathForNBAScores);
    let nbaTable = document.getElementById("nbaTable");
    for (var game = 0; game < gameSlateInfo.length; game++) {
        updateTableHelper(nbaTable, gameSlateInfo[game]);
    }
}

async function parseWNBAGameSlate() {
    gameSlateInfo = await getScores(pathForWNBAScores);
    let wnbaTable = document.getElementById("wnbaTable");
    for (var game = 0; game < gameSlateInfo.length; game++) {
        updateTableHelper(wnbaTable, gameSlateInfo[game]);
    }
}

async function parseNHLGameSlate() {
    gameSlateInfo = await getScores(pathForNHLScores);
    let nhlTable = document.getElementById("nhlTable");
    for (var game = 0; game < gameSlateInfo.length; game++) {
        updateTableHelper(nhlTable, gameSlateInfo[game]);
    }
}

function updateTableHelper(currTable, currGame) {
    console.log(currGame.name);
    // console.log(currGame.competitions[0].odds[0].details);
    let row = currTable.insertRow(-1);
    let gameName = row.insertCell(0);
    let gameSpread = row.insertCell(1);
    let gameScore = row.insertCell(2);
    gameName.innerText = currGame.name;
    if (currGame.competitions[0].hasOwnProperty('odds')) {
        gameSpread.innerText = currGame.competitions[0].odds[0].details;
    } else {
        gameSpread.innerText = "-----"
    }
    let gameID = currGame.status.type.id;
    switch(gameID){
        case "1": // Scheduled Game. Hasn't started yet.
            gameScore.innerText = "------";
            break;
        case "2": // Live Game
            gameScore.innerText = currGame.competitions[0].competitors[1].score + " - " + currGame.competitions[0].competitors[0].score;
            break;
        case "3": // Completed. 
            gameScore.innerText =  currGame.competitions[0].competitors[1].score + " - " + currGame.competitions[0].competitors[0].score;
            break;
        case "4":
            gameScore.innerText = "Forfeit";
        case "5":
            gameScore.innerText = "Cancelled";
        case "6":
            gameScore.innerText = "Postponed";
        case "7":
            gameScore.innerText = "Delayed";
        case "8":
            gameScore.innerText = "Suspended";
        default:
            gameScore.innerText = "Other"
    }
}


function callAPISpecificTime() {
    var now = new Date();
    var millisTill12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 24, 00) - now;
    if (millisTill12 < 0) {
        millisTill12 += 86400000; 
    }
    setTimeout(function(){
        alert("It's 11:22!")
    }, millisTill12);

}

parseNBAGameSlate();
parseMLBGameSlates();
parseWNBAGameSlate();
parseNHLGameSlate();
// callAPISpecificTime();