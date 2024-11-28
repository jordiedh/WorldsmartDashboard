import fs from 'fs';
export var stream = fs.createWriteStream("./logs/log-" + getFormattedDateForFile() + ".txt", {flags: 'a'});

export function newDay() {
    if(!fs.existsSync("./logs/log-" + getFormattedDateForFile() + ".txt")) {
        fs.writeFile('./logs/log-' + getFormattedDateForFile() + ".txt", "", function(err) {
            if(err) {
                logError(err);
            }
            stream = fs.createWriteStream("./logs/log-" + getFormattedDateForFile() + ".txt", {flags: 'a'});
            logInfo("Created new log file.")
        })
    }
}

function log(text, type) {

    let msg = getFormattedDate() +  " [" + type + "] " + text;

    console.log(msg);
    if(!fs.existsSync("./logs/log-" + getFormattedDateForFile() + ".txt")) {
        fs.writeFile('./logs/log-' + getFormattedDateForFile() + ".txt", "", function(err) {
            if(err) {
                logError(err);
                return;
            }
            stream = fs.createWriteStream("./logs/log-" + getFormattedDateForFile() + ".txt", {flags: 'a'});
            logInfo("Created new log file.")
        })
    }
    stream.write("\n" + msg)

}

export function logInfo(text) {
    log(text, "INFO")
}

export function logError(text) {
    log(text, "ERROR")
}

function getFormattedDate() {
    var date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + " | " +  hour + ":" + min + ":" + sec;

    /*alert(str);*/

    return str;
}

function getFormattedDateForFile() {
    var date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var str = date.getFullYear() + "-" + month + "-" + day;

    /*alert(str);*/

    return str;
}