// Imports
import express from 'express';
import ejs from 'ejs';
import path from 'path';
import {fileURLToPath} from 'url';
import maps from './maps.json' assert {type: 'json'};
import {logInfo, logError} from './logger.js';
import { getViewCount, getManyViewCount, ticketCounts, refreshCounts, getCountColour } from './countUtil.js';
import { getTime } from './timeUtil.js';
import * as agentUtil from './agentUtil.js';


const app = express();
let port = 4222;

const __filename = fileURLToPath(import.meta.url); // Get the directory URL

app.set('view engine', 'ejs'); // Set webpages to run from EJS
app.use(express.static(path.dirname(__filename) +'/public')); // Set the public view folder to /public (to get images, css, etc.)

init();

function init() {

    logInfo("Running init method from app.js.")

    setInterval(function() {
        logInfo("181 seconds passed... Refreshing counts.");
    }, 181000) // Every 121 seconds, refresh. Was going to do 60 but better to be safe than sorry!
}


/*let leaderboard = new Map();
leaderboard.set("Jordan Harrison", 21)
leaderboard.set("George Zelenka", 5)
leaderboard.set("Jaye Geary", 14)
leaderboard.set("Dylan Maiolo", 12)
leaderboard.set("Kumkum Paudel", 19)
leaderboard.set("Ethan Fienga", 7)
leaderboard.set("Leighton Lindsay", 4)
leaderboard.set("William McLennan", 8)
leaderboard.set("Craig Turner", 11)
leaderboard.set("Drew Leeds", 1)
let sortedLeaderboard = new Map([...leaderboard.entries()].sort((a, b) => b[1] - a[1]));*/
let sortedLeaderboard = "";

console.log(sortedLeaderboard)

app.get('/', (req, res) => { // Main view (dashboard)

    res.render('home', { ticketCounts, getCountColour, maps, sortedLeaderboard }) // Render home.ejs with necessary methods/values

})

app.get('/new', (req, res) => { // Main view (dashboard)

    res.render('home new', { ticketCounts, getCountColour, maps, sortedLeaderboard }) // Render home.ejs with necessary methods/values

})

app.listen(port, () => logInfo(`Server started on port ${port}.`))