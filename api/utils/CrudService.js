var crud = require('crud-sdk');
var Q = require('q');
var config = require('../../config/config.json');
var scf = require('../utils/scf');
var stellarasset = require('../../asset')

exports.getCompanyList = function(dbConnection, dbName, collectionName, condition, exclude) {
    var deferred = Q.defer();
    crud.readByCondition(dbConnection, dbName, collectionName, condition, exclude, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        if (!data.length) {
            var errorMessage = {
                statusCode: 404,
                message: 'No Record Found'
            }
            deferred.reject(errorMessage);
        }
        // console.log(data)
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.getData = function (dbConnection, dbName, collectionName,   condition, sortby,  exclude) {
    var deferred = Q.defer();
    crud.sort(dbConnection, dbName, collectionName,  condition, sortby,   exclude, function (err, data) {
        console.log("getdata")
        if (err) {
            console.log("getdata")
            deferred.reject(err);
        }
        if (!data.length) {
            
            var errorMessage = {
                statusCode: 404,
                message: 'No Record Found'
            }
            deferred.reject(errorMessage);
        }
        
        console.log(data)
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.insertData = async function (dbConnection, dbName, collectionName, condition, exclude, reqBody,name) {
    var deferred = Q.defer();
    console.log("Inside crud",reqBody);
    crud.readByCondition(dbConnection, dbName, collectionName, condition, exclude, async function (err, data) {
        console.log(data);
        if (data == undefined) {
            var errorMessage = {
                statusCode: 503,
                message: 'Service Unavailable'
            }
            deferred.reject(errorMessage);
        }
        if (err) {
            deferred.reject(err);
        }
        if (data.length) {
            var errorMessage = {
                statusCode: 409,
                message: 'Data already exists'
            }
            deferred.reject(errorMessage);
        }
        else {
            //  Create (Store data in MongoDB)
           
            if(name=="company"){
            // var mausamdetails = {};
            // mausamdetails.accountId = "GA62UDFYHFFHGVCJJDA3C5TQNUVB3LADVWQCR3LFEGRUKEVT7PC6LKLC"
            // mausamdetails.accountSeed = "SCW26QZIQPGK5CHTN5TT6NPPHXVTJE52E663B7X7Y4AZVOL4AAKJX7PU"
//             await stellarasset.createAccount()
//             reqBody["issuingAccountpublicAddress"] = stellarasset.account["accountId"]
//             reqBody["issuingAccountsecretKey"] = stellarasset.account["accountSeed"]
            var stellarData = await stellarasset.createAccount()
            console.log(stellarData)
            reqBody["stellarAccountId"] = stellarData["accountId"]
            reqBody["secretKey"] = stellarData["accountSeed"]
            // data = await stellarasset.changeTrust(reqBody,mausamdetails)
            // .then(function(){
            //     stellarasset.changeTrustAndPay(reqBody)
            // })
            // .then(function(){
            //     stellarasset.makeUberBuyOffer(reqBody,mausamdetails)
            // })
            // data = await stellarasset.sellOfferCompany(reqBody);
            // data = await stellarasset.makeUberBuyOffer(reqBody,mausamdetails)
            // companytoken = stellarasset.createToken(condition.tokenname, stellarasset.account["accountId"]) 
            }
            else
            {
                stellarasset.createAccount()
                reqBody["stellarAccountId"] = stellarasset.account["accountId"]
                reqBody["secretKey"] = stellarasset.account["accountSeed"]
            }
            // console.log(reqBody)

            crud.create(dbConnection, dbName, collectionName, reqBody, function (err, data) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(data);
                
            });
        }
    });
    return deferred.promise;
};

exports.deleteData = function (dbConnection, dbName, collectionName, condition, exclude) {
    scf.log("condition:", condition);
    var deferred = Q.defer();
    crud.readByCondition(dbConnection, dbName, collectionName, condition, exclude, function (err, data) {
        if (data == undefined) {
            var errorMessage = {
                statusCode: 503,
                message: 'Service Unavailable'
            }
            deferred.reject(errorMessage);
        }
        if (err) {
            deferred.reject(err);
        }
        if (data.length) {
            crud.delete(dbConnection, dbName, collectionName, condition, function (err, result) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
        else {
            var errorMessage = {
                statusCode: 404,
                message: 'No record found'
            }
            scf.log(errorMessage)
            deferred.reject(errorMessage);
        }
    });
    return deferred.promise;
};

exports.updateData = function (dbConnection, dbName, collectionName, updateData, condition, exclude) {
    var deferred = Q.defer();
    // console.log("condition",condition);
    crud.readByCondition(dbConnection, dbName, collectionName, condition, exclude, function (err, data) {
        if (data == undefined) {
            var errorMessage = {
                statusCode: 503,
                message: 'Service Unavailable'
            }
            deferred.reject(errorMessage);
        }
        if (err) {
            deferred.reject(err);
        }
        if (data.length) {
            crud.update(dbConnection, dbName, collectionName, updateData, condition, function (err, response) {
                if (err) {
                    deferred.reject(err);
                }
                deferred.resolve(response);
            });
        }
        else {
            var error = {
                statusCode: 404,
                message: 'No Record Found'
            };
            deferred.reject(error); // required json data
        }
    });
    return deferred.promise;
};

exports.aggregate = function (dbConnection, dbName, collectionName, condition) {
    var deferred = Q.defer();
    crud.aggregate(dbConnection, dbName, collectionName, condition, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        if (!data.length) {
            var errorMessage = {
                statusCode: 404,
                message: 'No Record Found'
            }
            deferred.reject(errorMessage);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.readByCondition = async function (dbConnection, dbName, collectionName, condition,exclude) {
    var deferred = Q.defer();
    // var paramNotReq = {_id:0};
    crud.readByCondition(dbConnection, dbName, collectionName, condition, exclude, async function (err, data) {
        if (err) {
            console.error(err);
            deferred.reject(err);
        }
        console.log(data);
        
        //console.log(data);
        if (data.length) {
        // console.log("Inside wrapper ====> ",data);

            deferred.resolve(data);
            
        }
        else {
            // var err = "user not found";
            // console.error(err);
            // deferred.reject(err);
            var error = {
                statusCode: 404,
                message: 'User not Found'
            };
            deferred.reject(error); 
        }

    });
    return deferred.promise;
};

exports.readByMultipleCondition = async function (dbConnection, dbName, collectionName, condition,password) {
    var deferred = Q.defer();
    // var paramNotReq = {_id:0};
    crud.readByMultipleCondition(dbConnection, dbName, collectionName, condition, exclude, async function (err, data) {
        if (err) {
            console.error(err);
            deferred.reject(err);
        }
        console.log(data);
        
        //console.log(data);
        if (data.length) {
        // console.log("Inside wrapper ====> ",data);

            deferred.resolve(data);
            
        }
        else {
            var err = "user not found";
            console.error(err);
            deferred.reject(err);
        }

    });
    return deferred.promise;
};