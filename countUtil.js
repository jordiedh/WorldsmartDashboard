import fetch from 'node-fetch';
import {Headers} from 'node-fetch';

import maps from './maps.json' with {
    type: 'json'
};
import {logInfo, logError} from './logger.js';

export let ticketCounts = {
    new: {
        wa: 4,
        qld: 3,
        nsw: 3,
        "sa/nt": 2,
        "vic/tas": 0
    },
    open:
        {
            wa: 27,
            qld: 13,
            nsw: 28,
            "sa/nt": 35,
            "vic/tas": 3,
            other: 2,
            total: 108
        },
    urgent: {
        wa: 10,
            qld: 3,
            nsw: 8,
            "sa/nt": 15,
            "vic/tas": 0
    },
    solved:
        {
            wa: 20,
            qld: 25,
            nsw: 38,
            "sa/nt": 12,
            "vic/tas": 48,
            other: 10,
            total: 153,
        },
	other:
		{
			voicemail: 1
		}
}

let username = '?'
let password = '?'

let headers = new Headers();
headers.set('Authorization', 'Basic ' + Buffer.from(username + ":" + password).toString('base64'));

let settings = {mode: "get", headers: headers}


export function getViewCount(id, callback) {

    logInfo("Getting individual view count of view ID " + id)
    fetch("https://###.zendesk.com/api/v2/views/count.json?id=" + id, settings).then(res => res.json()).then((json) => {
        logInfo("View ID " + id + " returned a count of " +json.count.value)
        return callback(json.count.value);

    })

}

export async function getManyViewCount(ids) {

    let idString = ids.join(",")
    const mapOfCounts = new Map();

    logInfo("Getting counts of view IDs " + ids.join(', '))
	
	try {
    let res = await fetch("https://###.zendesk.com/api/v2/views/count_many.json?ids=" + idString, settings);
    if(!res.ok) {
        const message = `An error has occured: ${res.status}`;
        throw new Error(message)
    }
    let json = await res.json();

    await json.view_counts.forEach((view_count) => {
        logInfo("Count many, View ID " + view_count.view_id + " returned count " + view_count.value)
        let val = view_count.value
        if(val != undefined) mapOfCounts.set(view_count.view_id.toString(), val)
        else {
            let count = 0;
            Object.keys(ticketCounts).forEach(status => {
                Object.keys(ticketCounts[status]).forEach(state => {
                    let viewID = maps[status][state]
                    if(viewID == view_count.view_id) count = ticketCounts[status][state]
                });
            })
            mapOfCounts.set(view_count.view_id.toString(), count)
        }
    })
	} catch(e) {
		logError(e);
		return;
	}

    return mapOfCounts;

}

export async function getCountColour(count) {
    if(count < 16) {
        return "good"
    } else if(count < 30) {
        return "attention"
    } else {
        return "bad"
    }
}

export async function refreshCounts() {

    logInfo("Refreshing counts.")
    let views = []

    Object.keys(ticketCounts).forEach(status => {
        if(status == "new") return;
        Object.keys(ticketCounts[status]).forEach(state => {
            let viewID = maps[status][state]
            if(views.indexOf(viewID) == -1) views.push(viewID)
        });
    })
    
    try {
        
        let mapOfCounts = await getManyViewCount(views);
        Object.keys(ticketCounts).forEach(status => {
            if(status == "new") return;
            Object.keys(ticketCounts[status]).forEach(state => {
                ticketCounts[status][state] = mapOfCounts.get(maps[status][state])
            });
        })

    } catch(e) {

        logError("Exceeded retries! (state views)")

    }

}
export async function refreshNewCounts() {

    logInfo("Refreshing counts.")
    let views = []

    Object.keys(ticketCounts).forEach(status => {
        if(status != "new") return;
        Object.keys(ticketCounts[status]).forEach(state => {
            let viewID = maps[status][state]
            if(views.indexOf(viewID) == -1) views.push(viewID)
        });
    })
    
    try {
        
        let mapOfCounts = await getManyViewCount(views);
        Object.keys(ticketCounts).forEach(status => {
            if(status != "new") return;
            Object.keys(ticketCounts[status]).forEach(state => {
                ticketCounts[status][state] = mapOfCounts.get(maps[status][state])
            });
        })

    } catch(e) {

        logError("Exceeded retries! (state views)")

    }

}