pathForNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="
pathForMLBScores = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates="
pathForWNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates="
pathForNHLScores = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates="

pathToFetch = "localhost:5500/fetch";

const parlay = [];

// function callAPISpecificTime() {
//     var now = new Date();
//     var millisTill12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 24, 00) - now;
//     if (millisTill12 < 0) {
//         millisTill12 += 86400000;
//     }
//     setTimeout(function () {
//         alert("It's 11:22!")
//     }, millisTill12);
// }


async function makeCallToFetchX(sport) {
    let response = await fetch('/fetch' + sport);
    let data = await response.json();
    console.log("Data: ", data);
    return data;
}

function makeUnderDogSpread(shortName, spread) {
    console.log(shortName.split(" "));
    shortNameSplit = shortName.split(" ");
    spreadSplit = spread.split(" ");
    removeFavored = shortNameSplit.indexOf(spreadSplit[0]);
    shortNameSplit.splice(removeFavored, 1);
    console.log(shortNameSplit);
    removeAtSymbol = shortNameSplit.indexOf("@");
    shortNameSplit.splice(removeAtSymbol, 1);
    return "+ " + shortNameSplit[0];
}

function updateParlayDisplay() {
    const parlayContainer = document.querySelector(".parlay-container");
    console.log("Parlay: ", parlay);

    for (const currGame of parlay) {
        let game = currGame[0];
        console.log("Game Stat: ", currGame[1]);

        if (currGame[1] === 0) {
            currGame[1] = 1;
        } else {
            continue;
        }
        const parlayItem = document.createElement('div');
        parlayItem.classList.add("card");
        if (game.status == "1") {
            parlayItem.classList.add("scheduled");
        } else if (game.status == "2") {
            parlayItem.classList.add("active");
        } else if (game.status == "3"){
            parlayItem.classList.add("finished");
        }

        const nameOfTeams = document.createElement("h2");
        nameOfTeams.classList.add("team-names");
        nameOfTeams.textContent = `${game.awayTeam} vs ${game.homeTeam}`;

        const spread = document.createElement("p");
        spread.classList.add("spread");
        spread.textContent = `Spread: ${game.spread}`;

        const gameTime = document.createElement("p");
        gameTime.classList.add("time");
        gameTime.textContent = `Time: ${game.startTime}`;

        const currScore = document.createElement("p");
        currScore.classList.add("score");
        if (game.status == "2" || game.status == "3") {
            currScore.textContent = `Score: ${game.awayTeamScore} - ${game.homeTeamScore}`;
        } else {
            currScore.textContent = "";
        }

        const oddsOption = document.createElement("div");
        oddsOption.classList.add("oddsOption");

        const favorLabel = document.createElement("label");
        const favorRadio = document.createElement("input");
        favorRadio.type = "radio";
        favorRadio.name = `spread-${game.shortName}`;
        favorRadio.value = "favor";
        favorLabel.textContent = `${game.spread}`;
        favorLabel.appendChild(favorRadio);
        oddsOption.appendChild(favorLabel);

        const underDogLabel = document.createElement("label");
        const underDogRadio = document.createElement("input");
        underDogRadio.type = "radio";
        underDogRadio.name = `spread-${game.shortName}`;
        underDogRadio.value = "underdog";
        underDogSpread = makeUnderDogSpread(game.shortName, game.spread);
        underDogLabel.textContent = underDogSpread;
        underDogLabel.appendChild(underDogRadio);
        oddsOption.appendChild(underDogLabel);

        parlayItem.appendChild(nameOfTeams);
        parlayItem.appendChild(currScore);
        parlayItem.appendChild(spread);
        parlayItem.appendChild(gameTime);
        parlayItem.appendChild(oddsOption);
        
        parlayContainer.appendChild(parlayItem);
    }
}

function addToParlay(selectedGame) {
    const parlayContainer = document.querySelector(".parlay");
    const scheduleContainer = document.querySelector(".schedule");

    // Check to see if selectedGame is already in parlay!
    let gameIndex = parlay.findIndex((item) => item[0].shortName === selectedGame.shortName);
    if (gameIndex == -1) {
        // Game is NOT in parlay. Add it!
        parlay.push([selectedGame, 0]);

        if (parlay.length != 0) {
            parlayContainer.style.display = 'grid';
            scheduleContainer.style.width = '70%';
        }

        updateParlayDisplay();
    }
}

function dynamicGameCards(sportSpecificList, sport) {
    const containerForGameCards = document.querySelector(`.tab-content[data-sport="${sport}"] .game-cards`);
    console.log("SportSpecificList: ", sportSpecificList);
    for (const game of sportSpecificList) {
        const singleCard = document.createElement("div");
        singleCard.classList.add("card");
        if (game.status == "1") {
            singleCard.classList.add("scheduled");
        } else if (game.status == "2") {
            singleCard.classList.add("active");
        } else if (game.status == "3"){
            singleCard.classList.add("finished");
        }

        const nameOfTeams = document.createElement("h2");
        nameOfTeams.classList.add("team-names");
        nameOfTeams.textContent = `${game.awayTeam} vs ${game.homeTeam}`;

        const spread = document.createElement("p");
        spread.classList.add("spread");
        spread.textContent = `Spread: ${game.spread}`;

        const gameTime = document.createElement("p");
        gameTime.classList.add("time");
        gameTime.textContent = `Time: ${game.startTime}`;

        const currScore = document.createElement("p");
        currScore.classList.add("score");
        if (game.status == "2" || game.status == "3") {
            currScore.textContent = `Score: ${game.awayTeamScore} - ${game.homeTeamScore}`;
        } else {
            currScore.textContent = "";
        }

        singleCard.appendChild(nameOfTeams);
        singleCard.appendChild(currScore);
        singleCard.appendChild(spread);
        singleCard.appendChild(gameTime);

        singleCard.addEventListener("click", () => {
            const homeTeam = game.homeTeam;
            const awayTeam = game.awayTeam;
            const spread = game.spread;
            const startTime = game.startTime;

            console.log(`Clicked card: ${awayTeam} vs ${homeTeam}, Spread: ${spread}, Start Time: ${startTime}`, `Score: ${game.awayTeamScore} - ${game.homeTeamScore}`);
            addToParlay(game);
        })

        containerForGameCards.appendChild(singleCard);
    }
}

async function switchingTabs(event) {
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
            // gameArray = NBAGameList;
            gameArray = await makeCallToFetchX(sport.toUpperCase());
            break;
        case 'mlb':
            // gameArray = MLBGameList;
            gameArray = await makeCallToFetchX(sport.toUpperCase());
            break;
        case 'nhl':
            // gameArray = NHLGameList;
            gameArray = await makeCallToFetchX(sport.toUpperCase());
            break;
        case 'wnba':
            // gameArray = WNBAGameList;
            gameArray = await makeCallToFetchX(sport.toUpperCase());
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
tabEventHandlingSetup();
// callAPISpecificTime();
