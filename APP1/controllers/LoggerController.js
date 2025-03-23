const fs = require('fs');
const path = require('path');


// log file to root directory
const logFilePath = path.join(__dirname, '../logs/app.log');

const createLog = (message, type, userInfo = {}) => {
  const logMessage = `${new Date().toISOString()} -  ${type} => ${message} , Request from : ${JSON.stringify(userInfo)} \n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
};

module.exports = createLog;