const fs = require('fs');

function logger(fileName){
    return (req, res, next) => {
        if(req.url != "/favicon.ico"){
            fs.appendFile(
                fileName,
                `${Date.now()} : ${req.ip} : ${req.method} : ${req.path}\n`,
                (err, data) => {
                    next();
                }
            );
        }
    }
};

module.exports = {
    logger
};