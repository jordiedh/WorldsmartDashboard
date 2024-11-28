// Imports
import express from 'express';
import fs from 'fs';
import path from 'path';
import {
	fileURLToPath
} from 'url';

import maps from './maps.json';
import {
	logInfo,
	logError,
	newDay
} from './logger.js';
import {
	ticketCounts,
	refreshCounts,
	getCountColour,
	refreshNewCounts
} from './countUtil.js';
import * as agentUtil from './agentUtil.js';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import * as timeUtil from './timeUtil.js';


const app = express();
const port = process.env.PORT || 4222;
let superuser = "N/A";

const __filename = fileURLToPath(import.meta.url); // Get the directory URL

export let db = new sqlite3.Database('./agentInfo.db', sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		logError(err)
		return;
	}

	logInfo('Connected to the database.')
})

app.set('view engine', 'ejs'); // Set webpages to run from EJS
app.use(express.static(path.dirname(__filename) + '/public')); // Set the public view folder to /public (to get images, css, etc.)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
let sortedAgents = new Object();

init();

// Function to sort the agent list based on tickets closed
export async function sortAgents(json) {
	// define new map and store every agent and their tickets closed
	let map = new Map();
	Object.keys(json).forEach(agent => {
		map.set(agent, json[agent])
	})
	// define another map and sort based on entries using a descending sort entry
	let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
	// set the sorted agents as an object to use for display
	sortedAgents = Object.fromEntries(sortedMap);
}

// initialise function
function init() {

	logInfo("Running init method from app.js.")
	endOfDay();
	agentUtil.init();

	// Initial refresh as setInterval takes the x seconds before calling first.
	//refreshCounts(); // refresh view counts
	refreshAnnualList();
	//refreshNewCounts();
	agentUtil.refreshAgentCounts(); // refresh tickets closed per person counts
	setTimeout(function () {
		sortAgents(agentUtil.agentData.ticketCounts) // sort the agents after 5 seconds to give time to get the counts
	}, 5000)
	// Use FS to read the srsu.txt to update the superuser text
	fs.readFile('./srsu.txt', 'utf8', (err, data) => {
		if (err) {
			logError("Super User file not found, couldn't set Super User.");
			return;
		}
		logInfo("Reading SuperUser file.");
		logInfo("SuperUser Data:\n" + data);
		superuser = data;
	});
	setInterval(function () {
		endOfDay();
		logInfo("181 seconds passed... Refreshing counts.");
		//refreshCounts();
		agentUtil.refreshAgentCounts();
		//refreshNewCounts();
		refreshAnnualList();
		setTimeout(function () {
			sortAgents(agentUtil.agentData.ticketCounts)
		}, 10000)
		fs.readFile('./srsu.txt', 'utf8', (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			logInfo("Reading SuperUser file.");
			logInfo("SuperUser Data:\n" + data);
			superuser = data;
		});
	}, 181000) // Every 181 seconds, refresh. Was going to do 60 but better to be safe than sorry!
}

function endOfDay() {
	logInfo("Attempting End of Day.")
	let date = timeUtil.toDateString(Date.now());
	let storedDate = "";
	fs.readFile('./date.txt', 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		storedDate = data;

		if(storedDate == "") {
			logError("Error reading date.")
			return;
		}
	
		if(storedDate == date) {
			logInfo("Not a new day, cancelling end of day.");
			return;
		}
		newDay();
		logInfo("New day, initializing end of day process.")
	
		logInfo("Taking all agents off of sick mode.")
		let sql = `UPDATE sick SET sick = 0`;
		db.run(sql, [], function (err) {
			if (err) {
				logError(err);
				return;
			}
			logInfo(`Row(s) updated: ${this.changes}`)
		})
	
		fs.writeFile("./date.txt", date, (err) => {
			if(err) {
				logError(err);
			} else {
				logInfo("Updated date file.")
			}
		})
	});


}

let agentShift = agentUtil.agentData.percentageOfShift;
let away = agentUtil.agentData.away;
let awayPast = agentUtil.agentData.awayPast;
let views = agentUtil.agentData.viewID;
var annual;

function refreshAnnualList() {
	db.all(`SELECT * FROM annual ORDER BY startDate`, [], (err, rows) => {
		if (err) {
			logError(err);
			return;
		}
	
		annual = rows;
	});
}

app.get('/', (req, res) => { // Main view (dashboard)

	res.render('home', {
		ticketCounts,
		getCountColour,
		maps,
		sortedAgents,
		agentShift,
		superuser,
		away,
		awayPast,
		views
	}) // Render home.ejs with necessary methods/values

})

app.get('/sick', (req, res) => { // Main view (dashboard)

	let agent = req.query.agent;
	res.render('sick', {
		ticketCounts,
		getCountColour,
		maps,
		sortedAgents,
		agentShift,
		superuser,
		away,
		awayPast,
		agent
	}) // Render home.ejs with necessary methods/values

})

app.get('/leaveadd', (req, res) => { // Main view (dashboard)

	let past = req.query.past;
	let current = req.query.current;
	let future = req.query.future;
	res.render('leaveAdd', { 
		ticketCounts,
		getCountColour,
		maps,
		sortedAgents,
		agentShift,
		superuser,
		away,
		awayPast
	}) // Render home.ejs with necessary methods/values

})

function validateZeroOne(input) {
	if(input == 0) return '0';
	if(input == 1) return '1';
	if(input == '0' || input == '1') return input;
	else return '0'
}

function validateAgent(input) {
	if(agentUtil.agentData.away.hasOwnProperty(input)) {
		return input;
	} else {
		return "All"
	}
}

app.get('/leavelist', (req, res) => {

	let queryDefault = {
		past: '0',
		current: '1',
		future: '1',
		agent: "All"
	}

	if(req.query.past != undefined) queryDefault.past = validateZeroOne(req.query.past);
	if(req.query.current != undefined) queryDefault.current = validateZeroOne(req.query.current);
	if(req.query.future != undefined) queryDefault.future = validateZeroOne(req.query.future);
	if(req.query.agent != undefined) queryDefault.agent = validateAgent(req.query.agent);

	res.render('leaveList', {
		ticketCounts,
		getCountColour,
		maps,
		sortedAgents,
		agentShift,
		superuser,
		away,
		awayPast,
		annual,
		timeUtil,
		queryDefault
	});
})

app.get('/disclaimer', (req, res) => {
	res.render('disclaimer')
})

app.get('/remove', (req, res) => {
	let queryDefault = {
		past: '0',
		current: '1',
		future: '1',
		agent: "All"
	}
	if(req.query.past != undefined) queryDefault.past = validateZeroOne(req.query.past);
	if(req.query.current != undefined) queryDefault.current = validateZeroOne(req.query.current);
	if(req.query.future != undefined) queryDefault.future = validateZeroOne(req.query.future);
	if(req.query.agent != undefined) queryDefault.agent = validateAgent(req.query.agent);
	res.redirect('/leavelist?past=' + queryDefault.past + '&current=' + queryDefault.current + '&future=' + queryDefault.future + '&agent=' + queryDefault.agent)
		
})

app.post('/leaveadd', (req, res) => {
	res.redirect('/')
})

app.post('/sick', (req, res) => {
	res.redirect('/')
})

app.post('/', (req, res) => {
	res.redirect('/')
})

app.get('*', function(req, res){
	res.render('404.ejs', {
		ticketCounts,
		getCountColour,
		maps,
		sortedAgents,
		agentShift,
		superuser,
		away,
		awayPast
	})
  });

app.listen(port, () => logInfo(`Server started on port ${port}.`))