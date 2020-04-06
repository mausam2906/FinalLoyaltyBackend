
var config = require('../../config/config.json');
var isDebug = config.isDebug;

exports.log = function (msg){
    
    if(isDebug){
        console.log("",msg);
    }
}