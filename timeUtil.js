import { logInfo, logError } from "./logger.js";

export function getTime() {

    let now = new Date();
    return now.getHours() * 60 + now.getMinutes()

}

export function convertTime(date) {
    return date.getHours() * 60 + date.getMinutes()
}

export function convertTimeNow() {
    let date = new Date()
    return date.getHours() * 60 + date.getMinutes()
}

export function pad(num, len) {
    return String(num).padStart(len, '0')
}

// https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore


export function toDateString(time) {
    let d = new Date(time);
    return d.toLocaleDateString(
        'en-au'
      );
}


export function getDate() {
    return toDateString(Date.now())
}

export function toEpochWithTime(datestring) {
    var parts = datestring.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    return Date.UTC(+parts[3], parts[2]-1, +parts[1], +parts[4], +parts[5]);
}

export function toEpoch(datestring) {
    var parts = datestring.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return Date.UTC(+parts[3], parts[2]-1, +parts[1]) - 37800000;
}

export function toEpochPlusOneDay(datestring) {
    var parts = datestring.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return Date.UTC(+parts[3], parts[2]-1, +parts[1]) - 37800000 + 86400000;
}