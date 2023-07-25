async function makeCallForParlays(status) {
    let response = await fetch("/" + status + "Parlays");
    let data = await response.json();
    console.log("Data From makeCall: ", data);
    return data;
}

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

async function dynamicParlayCards(parlayData, parlayStatus) {
    const containerForGameCards = document.querySelector(`.${parlayStatus}-parlays .parlay-cards`);
    console.log("Parlay Data (inside dyanmic): ", parlayData);

    for (const singleParlay of parlayData) {

        const parlayID = singleParlay.parlayID;
        
        const response = await fetch(`/getParlayInfo/${parlayID}`);
        const parlayDetails = await response.json();

        console.log("PARLAY DETAILS FROM FETCH: ", parlayDetails);

        const parlayCard = document.createElement("div");
        parlayCard.classList.add("parlay-card");

        for (const parlay of parlayDetails.games) {
            console.log("Single Parlay: ", parlay);
            const singleCard = document.createElement("div");
            singleCard.classList.add("card");
            if (parlayData.status == "1") {
                singleCard.classList.add("scheduled");
            } else if (parlayData.status == "2") {
                singleCard.classList.add("active");
            } else if (parlayData.status == "3"){
                singleCard.classList.add("finished");
            }

            const nameOfTeams = document.createElement("h2");
            nameOfTeams.classList.add("team-names");
            nameOfTeams.textContent = `${parlay.awayTeam} vs ${parlay.homeTeam}`;

            const shortNameTeams = document.createElement("h4");
            shortNameTeams.classList.add("short-team-names");
            shortNameTeams.textContent = `${parlay.shortName}`;

            const spread = document.createElement("p");
            spread.classList.add("Bet:");
            let betType;
            let betValue;
            const matchingGame = parlayDetails["0"]["games"].find((game) => game["gameID"] === parlay.gameID);
            if (matchingGame) {
                betType = matchingGame["betType"];
                betValue = matchingGame["betValue"];
                spread.textContent = `Bet: ${betType}` + " " + `${betValue}`;
            }
            // spread.textContent = `Bet: ${betType}` + " " + `${betValue}`;

            const gameTime = document.createElement("p");
            gameTime.classList.add("time");
            gameTime.textContent = `Time: ${parlay.startTime}`;

            const currScore = document.createElement("p");
            currScore.classList.add("score");
            if (parlay.status == "2" || parlay.status == "3") {
                currScore.textContent = `Score: ${parlay.awayTeamScore} - ${parlay.homeTeamScore}`;
            } else {
                currScore.textContent = "";
            }

            singleCard.appendChild(nameOfTeams);
            singleCard.appendChild(shortNameTeams);
            singleCard.appendChild(currScore);
            singleCard.appendChild(spread);
            singleCard.appendChild(gameTime);

            // singleCard.addEventListener("click", () => {
            //     const homeTeam = game.homeTeam;
            //     const awayTeam = game.awayTeam;
            //     const spread = game.spread;
            //     const startTime = game.startTime;

            //     console.log(`Clicked card: ${awayTeam} vs ${homeTeam}, Spread: ${spread}, Start Time: ${startTime}`, `Score: ${game.awayTeamScore} - ${game.homeTeamScore}`);
            //     console.log("Before addToParlay: ", game);
            //     addToParlay(game);
            // })

            parlayCard.appendChild(singleCard);
        }
        containerForGameCards.appendChild(parlayCard);
    }
}

async function switchingTabs(event) {
    const tabClicked = event.target;
    const status = tabClicked.dataset.tab;

    // Remove 'active' class from all tabs and tab contents
    const tabs = document.querySelectorAll('.tab-link');

    tabs.forEach((tab) => tab.classList.remove('active'));

    // Add 'active' class to clicked tab and its corresponding tab content
    tabClicked.classList.add('active');

    // Retrieve the list of active and finished parlays by making call to server.
    var parlayData;
    switch (status) {
        case 'active':
            parlayData = await makeCallForParlays("active");
            break;
        case 'finished':
            parlayData = [];
            break;
        default:
            console.log("Default case in myParlays.js");
    }

    // Clear the game cards container and generate new game cards
    const parlayCardsContainer1 = document.querySelector(".active-parlays .parlay-cards");
    parlayCardsContainer1.innerHTML = '';
    const parlayCardsContainer2 = document.querySelector(".finished-parlays .parlay-cards");
    parlayCardsContainer2.innerHTML = '';
    console.log("About to enter dynamic parlay cards.");
    console.log("Parlay Data: ", parlayData);
    console.log("Status: ", status);
    dynamicParlayCards(parlayData, status);
}

function setupEventHandlingForTabs() {
    // Attach event listener to tab buttons
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach((tab) => tab.addEventListener('click', switchingTabs));

    // Show the initial tab (e.g., Active) by triggering a click event
    const initialTab = document.querySelector('.tab-link[data-tab="active"]');
    initialTab.click();
}

async function refreshParlays() {
    console.log("REFRESHING PARLAYS IN REFRESHPARLAY");
    try {
        const updatedGames = await updateGames();

        console.log("UDPATED GAMES FORM UPDATEGAMES IN REFRESHPARLAY: ", updatedGames);

        const activeParlays = await makeCallForParlays("active");

        const activeParlaysContainer = document.querySelector(".active-parlays .parlay-cards");
        activeParlaysContainer.innerHTML = '';
        dynamicParlayCards(activeParlays, "active");

        // const finishedParlays = await makeCallForParlays("finished");

        // const finishedParlaysContainer = document.querySelector(".finished-parlays .parlay-cards");
        // finishedParlaysContainer.innerHTML = '';
        // dynamicParlayCards(finishedParlays, "finished");
    } catch (error) {
        console.error("Error updating and refreshing parlays: ", error);
    }
}

function mainForParlays() {
    refreshParlays();
    setInterval(refreshParlays, 1*60*1000);
}

// setupEventHandlingForTabs();
mainForParlays();