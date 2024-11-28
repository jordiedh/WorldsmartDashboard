import {
    getManyViewCount
} from "./countUtil.js";
import {
    logError,
    logInfo
} from "./logger.js";
import * as timeUtil from "./timeUtil.js";
import maps from './maps.json';
import * as app from './app.js';

export let agentData = {
    away: {}, awayPast: {}, ticketCounts: {}, percentageOfShift: {}, startTime: {}, endTime: {}, viewID: {}
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }

export function init() {
    for(var i = 0; i < maps["people"].length; i++) {
        let agent = maps["people"][i]
        agentData.away[agent.name] = 0;
        agentData.awayPast[agent.name] = 0;
        if (agentData.away[agent.name] >= 0) agentData.ticketCounts[agent.name] = getRandomInt(0, 28);
        else agentData.ticketCounts[agent.name] = -1;
        agentData.percentageOfShift[agent.name] = -1;
        agentData.startTime[agent.name] = timeUtil.convertTime(new Date("2023-01-01 " + agent.startTime));
        agentData.endTime[agent.name] = timeUtil.convertTime(new Date("2023-01-01 " + agent.endTime));
        agentData.viewID[agent.name] = agent.closedView;
        app.db.all(`SELECT * FROM sick WHERE agent="${agent.name}"`, [], (err, rows) => {
            if(rows.length == 0) {
                    let input = [agent.name, 0]
                    let sql = `INSERT INTO sick (agent, sick) VALUES (?, ?)`;
                app.db.run(sql, input, function (err) {
                    if (err) {
                        logError(err);
                        return;
                    }
                    logInfo(`Row(s) updated, added ${agent.name} to sick DB: ${this.changes}`)
                })
            }
        })
    }

    refreshSick();
    refreshAgentCounts();
}

// 1.6+ good
// 1.2 1.6 orange
// <1.2 bad

export function sortMap(map) {
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
}

export async function refreshSick() {

    Object.keys(agentData.ticketCounts).forEach(agent => {
        if (agentData.away[agent] < 0) agentData.ticketCounts[agent] = -1
    });
    app.db.all(`SELECT * FROM lunch WHERE date = "${timeUtil.getDate()}" AND timeEnd=0`, [], (err, rows) => {
        if (err) {
            logError(err);
            return;
        }

        rows.forEach((row) => {
            let total = 0;
            logInfo(row.agent + " is at lunch.");
            app.db.all(`SELECT * FROM lunch WHERE date = "${timeUtil.getDate()}" AND timeEnd > 0`, [], (err, rows1) => {
                if (err) {
                    logError(err);
                    return;
                }
                rows1.forEach(row1 => {
                    let bo = row.agent == row1.agent
                    if (row.agent == row1.agent) total += (row1.timeEnd - row1.timeStart)
                })
            });

            setTimeout(function () {
                agentData.awayPast[row.agent] = total;
                agentData.away[row.agent] = row.timeStart;
            }, 500)
        })
    });

    app.db.all(`SELECT agent FROM sick WHERE sick=1`, [], (err, rows) => {
        if (err) {
            logError(err);
            return;
        }

    })

    app.db.all(`SELECT agent FROM sick WHERE sick=1`, [], (err, rows) => {
        if (err) {
            logError(err);
            return;
        }

        rows.forEach((row) => {
            logInfo(row.agent + " is sick today.");
            agentData.away[row.agent] = -1;
            agentData.ticketCounts[row.agent] = -1;
        })

    })

    let now = Date.now()

    app.db.all(`SELECT * FROM annual WHERE startDate <= ${now} AND endDate >= ${now}`, [], (err, rows) => {
        if (err) {
            logError(err);
            return;
        }

        rows.forEach((row) => {
            logInfo(row.agent + " is on annual today.");
            agentData.away[row.agent] = -2;
            agentData.ticketCounts[row.agent] = -1;
        })

    })
}

export async function refreshAgentCounts() {

    logInfo("Refreshing counts.")
    refreshSick();
    let views = []

    for(var i = 0; i < maps["people"].length; i++) {
        let agent = maps["people"][i]
        agentData.percentageOfShift[agent.name] = 50
        let viewID = agent.closedView;
        if (views.indexOf(viewID) == -1) views.push(viewID)
    }

    // try {
    //     let mapOfCounts = await getManyViewCount(views);

    //     for(var i = 0; i < maps["people"].length; i++) {
    //         let agent = maps["people"][i];
    //         if (mapOfCounts.get(agent.closedView) != undefined) {
    //             if (agentData.away[agent.name] >= 0) agentData.ticketCounts[agent.name] = mapOfCounts.get(agent.closedView)
    //             else agentData.ticketCounts[agent.name] = -1
    //         }
    //     }

    // } catch (e) {

    //     for(var i = 0; i < maps["people"].length; i++) {
    //         let agent = maps["people"][i];

    //         if (agentData.away[agent.name] >= 0) agentData.ticketCounts[agent.name] = 0;
    //     }
    //     logError("Exceeded retries! (agent views)")
    //     logError(e)

    // }


}

export function timeSinceStarted(agent) {
    let startTime = agentData.startTime[agent]
    let endTime = agentData.endTime[agent]

    if (startTime == null || endTime == null) return -1;

    let compareTime = timeUtil.getTime()
    if (timeUtil.getTime() > endTime) compareTime = endTime;

    return compareTime - startTime;

}

export function ticketEfficiency(tickets, mins) {
    let hours = mins / 60;
    return tickets / hours;
}