pathForNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="
pathForMLBScores = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates="
pathForWNBAScores = "http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard?dates="
pathForNHLScores = "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates="

pathToFetch = "localhost:5500/fetch";

const parlay = [];
const parlayContainer = document.querySelector(".parlay-container");
const submitButton = document.getElementsByClassName("submit-button");
console.log(submitButton);
submitButton[0].addEventListener("click", handleSubmitParlay);

function handleSubmitParlay() {
    const parlayData = []

    for (const currGame of parlay) {
        const game = currGame[0];

        let typeCheck = `bet-type-${game.shortName}`;
        let valueCheck = `bet-value-${game.shortName}`;

        const betType = document.querySelector(`[name = "${typeCheck}"]`).value;
        // const betType = selectInput.value;

        const betValue = document.querySelector(`[name = "${valueCheck}"]`).value;

        let currGameObject = {};
        let returnCurrGame = Object.assign(currGameObject, game);
        returnCurrGame["betType"] = betType;
        returnCurrGame["betValue"] = betValue;

        parlayData.push(returnCurrGame);
    }
    console.log(parlayData);
    var actualParlayData = {parlayStatus: "active", games: parlayData};
    console.log("ABOUT TO FETCH TO STORE PARLAY");
    fetch("/createParlay", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(actualParlayData),
    })
    .then((response) => {
        if (response.ok) {
            console.log("Parlay created successfully!");
        } else {
            console.log("Error creating parlay!");
        }
    })
    .catch((error) => {
        console.error(error);
    });
    removeParlayFromScreen();
}

function removeParlayFromScreen() {
    parlay.length = 0;

    const parlayDiv = document.querySelector(".parlay");
    const scheduleContainer = document.querySelector(".schedule");

    scheduleContainer.style.width = "100%";
    parlayDiv.style.width = "0%";
    parlayContainer.innerHTML = "";
    parlayDiv.style.padding = "0";
}

async function makeCallToFetchX(sport) {
    let response = await fetch('/fetch' + sport);
    let data = await response.json();
    console.log("Data: ", data);
    return data;
}

function createTextInput(inputName) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = inputName;
    input.maxLength = 10;
    return input;
}

function updateParlayDisplay() {
    const parlayContainer = document.querySelector(".parlay-container");
    console.log("Parlay Container at update: ", parlayContainer);
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

        const shortNameTeams = document.createElement("h4");
        shortNameTeams.classList.add("short-team-names");
        shortNameTeams.textContent = `${game.shortName}`;

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

        const selectLabel = document.createElement("label");
        selectLabel.textContent = "Choose Bet Type:";
        const selectInput = document.createElement("select");
        selectInput.name = `bet-type-${game.shortName}`;

        const spreadOption = document.createElement("option");
        spreadOption.value = "spread";
        spreadOption.textContent = "Spread";
        const moneylineOption = document.createElement("option");
        moneylineOption.value = "moneyline";
        moneylineOption.textContent = "Moneyline";

        selectInput.appendChild(spreadOption);
        selectInput.appendChild(moneylineOption);

        const inputLabel = document.createElement("label");
        inputLabel.textContent = "Enter Bet Value:";
        const inputValue = createTextInput(`bet-value-${game.shortName}`);

        const gridContainer = document.createElement("div");
        gridContainer.classList.add("grid-container");

        const rowA = document.createElement("div");
        rowA.classList.add("grid-row");
        rowA.appendChild(selectLabel);
        rowA.appendChild(selectInput);

        const rowB = document.createElement("div");
        rowB.classList.add("grid-row");
        rowB.appendChild(inputLabel);
        rowB.appendChild(inputValue);

        gridContainer.appendChild(rowA);
        gridContainer.appendChild(rowB);

        parlayItem.appendChild(nameOfTeams);
        parlayItem.appendChild(shortNameTeams);
        parlayItem.appendChild(currScore);
        // parlayItem.appendChild(spread);
        parlayItem.appendChild(gameTime);
        parlayItem.appendChild(gridContainer);

        // console.log("Parlay Item: ", parlayItem);
        console.log("Parlay container: ", parlayContainer);

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
            parlayContainer.style.width = "30%";
            parlayContainer.style.padding = "20px";
        }
        console.log("Before updateParlayDisplay: ", parlay);
        updateParlayDisplay();
    }
}

function dynamicGameCards(sportSpecificList, sport) {
    const containerForGameCards = document.querySelector(`.tab-content[data-sport="${sport}"] .game-cards`);
    console.log("SportSpecificList: ", sportSpecificList);
    for (const game of sportSpecificList) {
        const singleCard = document.createElement("div");
        singleCard.classList.add("card");
        singleCard.setAttribute("data-game-id", game.apiID);
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

        const shortNameTeams = document.createElement("h4");
        shortNameTeams.classList.add("short-team-names");
        shortNameTeams.textContent = `${game.shortName}`;

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
        singleCard.appendChild(shortNameTeams);
        singleCard.appendChild(currScore);
        singleCard.appendChild(spread);
        singleCard.appendChild(gameTime);

        singleCard.addEventListener("click", () => {
            const homeTeam = game.homeTeam;
            const awayTeam = game.awayTeam;
            const spread = game.spread;
            const startTime = game.startTime;

            console.log(`Clicked card: ${awayTeam} vs ${homeTeam}, Spread: ${spread}, Start Time: ${startTime}`, `Score: ${game.awayTeamScore} - ${game.homeTeamScore}`);
            console.log("Before addToParlay: ", game);
            addToParlay(game);
        })

        containerForGameCards.appendChild(singleCard);
    }
}

async function fetchGamesFromDatabase(sport, date) {
    try {
        const response = await fetch(`/getGames?sport=${sport}&date=${date}`);
        const games = await response.json();
        return games;
    } catch (error) {
        console.error(`Error fetching ${date} ${sport} games: `, error);
        return [];
    }
}

function getDate() {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1);
    var yyyy = today.getFullYear();
    // Proper Format: yyyymmdd
    let properDateFormat = mm + "/" + dd + "/" + yyyy;
    return properDateFormat;
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
    let todayDate = getDate();
    switch (sport) {
        case 'nba':
        case 'mlb':
        case 'nhl':
        case 'wnba':
            gameArray = await fetchGamesFromDatabase(sport, todayDate);
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

function toggleDropdown() {
    const dropDownMenu = document.querySelector('.dropdown-menu');
    dropDownMenu.classList.toggle('show');
}

document.addEventListener('click', function(event) {
    const dropDownMenu = document.querySelector('.dropdown-menu');
    const profileDropDown = document.querySelector('.profile-dropdown');
    if (!profileDropDown.contains(event.target)) {
        dropDownMenu.classList.remove('show');
    }
});

const profilePic = document.querySelector('.profile-pic');
profilePic.addEventListener('click', function(event) {
    event.stopPropagation();
    toggleDropdown();
});

async function updateGames() {
    try {
        const response = await fetch ("/updateGames");
        const updatedGames = await response.json();
        return updatedGames;
    } catch (error) {
        console.error("Error fetching updated games: ", error);
        throw error;
    }
}

async function updateGameCardsDynamically() {
    try {
        const gamesList = [];
        const updatedGames = await updateGames();
        for (const game of updatedGames) {
            const specificCard = document.querySelector(`.tab-content[data-sport="${game.sport}"] .card[data-game-id = "${game.apiID}"]`);
            if (specificCard) {
                const gameStatus = game.status === "1" ? "scheduled" : game.status === "2" ? "active": "finished";
                specificCard.className = "card";
                specificCard.classList.add(gameStatus);

                specificCard.querySelector(".team-names").textContent = `${game.awayTeam} vs ${game.homeTeam}`;

                specificCard.querySelector(".short-team-names").textContent = game.shortName;

                const spreadText = game.spread === "-----" ? "Spread: -----" : `Spread: ${game.spread}`;
                specificCard.querySelector(".spread").textContent = spreadText;

                specificCard.querySelector(".time").textContent = `Time: ${game.startTime}`; 

                const currScore = game.status === "2" || game.status === "3" ? `Score: ${game.awayTeamScore} - ${game.homeTeamScore}` : "";
                specificCard.querySelector(".score").textContent = currScore;
            }
        }
    } catch (error) {
        console.error("Error updating game cards: ", error);
    }
}

const NBAGameList = [];
tabEventHandlingSetup();
setInterval(updateGameCardsDynamically, 1 * 60 * 1000);