const fs = require('fs');

function logger(logFileName) {
    return (req, res, next) => {
        if(req.url != "/favicon.ico"){
            fs.appendFile(
                logFileName,
                `${Date.now()} : ${req.ip} : ${req.method} : ${req.path}\n`,
                (err, data) => {
                    next();
                }
            );
        }
    }
};

module.exports = { logger };