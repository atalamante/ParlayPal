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

async function parseGameSlates(sportSpecificPath, sportSpecificList) {
    sportGameSlateInfo = await getScores(sportSpecificPath);
    for (var game = 0; game < sportGameSlateInfo.length; game++) {
        sportSpecificList.push(createGameObjects(sportGameSlateInfo[game]));
    }
    console.log(sportSpecificList);
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
    switch (gameID) {
        case "1": // Scheduled Game. Hasn't started yet.
            gameScore.innerText = "------";
            break;
        case "2": // Live Game
            gameScore.innerText = currGame.competitions[0].competitors[1].score + " - " + currGame.competitions[0].competitors[0].score;
            break;
        case "3": // Completed. 
            gameScore.innerText = currGame.competitions[0].competitors[1].score + " - " + currGame.competitions[0].competitors[0].score;
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
    setTimeout(function () {
        alert("It's 11:22!")
    }, millisTill12);

}

// TODO: Read in the games into object format where a single game object contains: team1, team2, spread, time. 
// Eventually, post these games to database. For now, need to just get an array containing all game objects.
// Once we have all the games, need to populate "game cards" inside the tabs. 

function createGameObjects(currGame) {
    if (currGame.competitions[0].hasOwnProperty('odds')) {
        spreadHolder = currGame.competitions[0].odds[0].details;
    } else {
        spreadHolder = "-----";
    }
    gametime = new Date(currGame.date);
    switch (currGame.status.type.id) {
        case "1": // Scheduled Game. Hasn't started yet.
            var currGameObject = {
                teamHome: currGame.competitions[0].competitors[0].team.displayName, teamAway: currGame.competitions[0].competitors[1].team.displayName,
                spread: spreadHolder, teamHomeScore: 0, teamAwayScore: 0, time: gametime.toLocaleTimeString('en-US'), shortName: currGame.shortName, gameID: currGame.status.type.id
            };
            break;
        case "2": // Live Game
            homeScore = currGame.competitions[0].competitors[0].score;
            awayScore = currGame.competitions[0].competitors[1].score;
            console.log(awayScore);
            console.log(homeScore);
            var currGameObject = {
                teamHome: currGame.competitions[0].competitors[0].team.displayName, teamAway: currGame.competitions[0].competitors[1].team.displayName,
                spread: spreadHolder, teamHomeScore: homeScore, teamAwayScore: awayScore, time: gametime.toLocaleTimeString('en-US'), shortName: currGame.shortName, gameID: currGame.status.type.id
            };
            break;
        case "3": // Completed. 
            homeScore = currGame.competitions[0].competitors[0].score;
            awayScore = currGame.competitions[0].competitors[1].score;
            var currGameObject = {
                teamHome: currGame.competitions[0].competitors[0].team.displayName, teamAway: currGame.competitions[0].competitors[1].team.displayName,
                spread: spreadHolder, teamHomeScore: homeScore, teamAwayScore: awayScore, time: gametime.toLocaleTimeString('en-US'), shortName: currGame.shortName, gameID: currGame.status.type.id
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
                homeScore = currGame.competitions[0].competitors[0].score;
                awayScore = currGame.competitions[0].competitors[1].score;
                var currGameObject = {
                    teamHome: currGame.competitions[0].competitors[0].team.displayName, teamAway: currGame.competitions[0].competitors[1].team.displayName,
                    spread: spreadHolder, teamHomeScore: homeScore, teamAwayScore: awayScore, time: gametime.toLocaleTimeString('en-US'), shortName: currGame.shortName, gameID: currGame.status.type.id
                };
            } else {
                var currGameObject = {
                    teamHome: currGame.competitions[0].competitors[0].team.displayName, teamAway: currGame.competitions[0].competitors[1].team.displayName,
                    spread: spreadHolder, teamHomeScore: "0", teamAwayScore: "0", time: gametime.toLocaleTimeString('en-US'), shortName: currGame.shortName, gameID: currGame.status.type.id
                };
            }
            break;
    }
    return currGameObject;
}

function dynamicGameCards(sportSpecificList, sport) {
    const containerForGameCards = document.querySelector(`.tab-content[data-sport="${sport}"] .game-cards`);
    for (const game of sportSpecificList) {
        const singleCard = document.createElement("div");
        singleCard.classList.add("card");
        if (game.gameID == "1") {
            singleCard.classList.add("scheduled");
        } else if (game.gameID == "2") {
            singleCard.classList.add("active");
        } else if (game.gameID == "3"){
            singleCard.classList.add("finished");
        }

        const nameOfTeams = document.createElement("h2");
        nameOfTeams.classList.add("team-names");
        nameOfTeams.textContent = `${game.teamAway} vs ${game.teamHome}`;

        const spread = document.createElement("p");
        spread.classList.add("spread");
        spread.textContent = `Spread: ${game.spread}`;

        const gameTime = document.createElement("p");
        gameTime.classList.add("time");
        gameTime.textContent = `Time: ${game.time}`;

        const currScore = document.createElement("p");
        currScore.classList.add("score");
        if (game.gameID == "2" || game.gameID == "3") {
            currScore.textContent = `Score: ${game.teamAwayScore} - ${game.teamHomeScore}`;
        } else {
            currScore.textContent = "";
        }


        singleCard.appendChild(nameOfTeams);
        singleCard.appendChild(currScore);
        singleCard.appendChild(spread);
        singleCard.appendChild(gameTime);

        singleCard.addEventListener("click", () => {
            const homeTeam = game.teamHome;
            const awayTeam = game.teamAway;
            const spread = game.spread;
            const startTime = game.time;

            console.log(`Clicked card: ${awayTeam} vs ${homeTeam}, Spread: ${spread}, Start Time: ${startTime}`, `Score: ${game.teamAwayScore} - ${game.teamHomeScore}`);
        })

        containerForGameCards.appendChild(singleCard);
    }
}

function switchingTabs(event) {
    const tabClicked = event.target;
    const sport = tabClicked.dataset.sport;

    // Remove 'active' class from all tabs and tab contents
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab) => tab.classList.remove('active'));
    tabContents.forEach((content) => content.classList.remove('active'));

    // Add 'active' class to clicked tab and its corresponding tab content
    tabClicked.classList.add('active');
    const selectedTabContent = document.querySelector(`.tab-content[data-sport="${sport}"]`);
    selectedTabContent.classList.add('active');

    // Retrieve the game array based on the selected sport and generate game cards
    let gameArray;
    switch (sport) {
        case 'nba':
            gameArray = NBAGameList;
            break;
        case 'mlb':
            gameArray = MLBGameList;
            break;
        case 'nhl':
            gameArray = NHLGameList;
            break;
        case 'wnba':
            gameArray = WNBAGameList
            break;
        default:
            gameArray = [];
    }

    // Clear the game cards container and generate new game cards
    const gameCardsContainer = selectedTabContent.querySelector('.game-cards');
    gameCardsContainer.innerHTML = '';
    console.log("About to enter dynamic.");
    console.log(gameArray);
    console.log(sport)
    dynamicGameCards(gameArray, sport);
}

function tabEventHandlingSetup() {
    // Attach event listener to tab buttons
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach((tab) => tab.addEventListener('click', switchingTabs));

    // Show the initial tab (e.g., NBA) by triggering a click event
    const initialTab = document.querySelector('.tab-link[data-sport="nba"]');
    initialTab.click();
}

const NBAGameList = [];
const MLBGameList = [];
const NHLGameList = [];
const WNBAGameList = [];
const CBBGameList = [];
parseGameSlates(pathForNBAScores, NBAGameList);
parseGameSlates(pathForMLBScores, MLBGameList);
parseGameSlates(pathForNHLScores, NHLGameList);
parseGameSlates(pathForWNBAScores, WNBAGameList);
tabEventHandlingSetup();
// callAPISpecificTime();