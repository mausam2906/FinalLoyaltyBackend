'use strict';

var config = require('../../config/config.json');
var crud = require('../utils/CrudService');
var service = {};
var Q = require('q');
var collectionName = 'Company';
var paramNotReq = {};
var stellarasset = require('../../asset')
var scf = require('../utils/scf');
var rp = require('request-promise');

// find company in collection if exist then don't create new record
exports.company = function (body) {
    // var deferred = Q.defer();
    var condition = {};
    // condition["email"] = body.email;
    condition["tokenname"] = body.tokenname;
    // condition["email"] = body.email;
    var name = "company"

    
    return crud.insertData(config.connectionString, config.dbName, collectionName, condition, paramNotReq, body, name);
}
exports.makeselloffer = async function (body){
    var publicaddress = body.publickey.value;
    var privateaddress = body.privatekey.value;
    // console.log(body)
    var condition = {};
    condition["stellarAccountId"] = publicaddress;
    var companydetails = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
    console.log(companydetails)
    var data = stellarasset.sellOfferCompany(companydetails)
}
exports.writeToLedger = async function (bctIp, bctPort, bctChannelName, bctChaincodeName, bctPeers, bctFcnName, bctOrgName, jsonBody) {

    var tokenUri = "http://" + bctIp + ":" + bctPort + "/users";
    console.log(tokenUri)
    
    // var tokenBody = "username="+jsonBody.transactionGroupId+"&orgName=" + bctOrgName;
    var tokenBody = "username="+jsonBody.companyName+"&orgName=" + bctOrgName;
    console.log(tokenBody)
    
    var tokenOptions = {
        method: 'POST',
        uri: tokenUri,
        body: tokenBody,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'  // Is set automatically
        },
    };
    await rp(tokenOptions)
        .then(async function (tokenResp) {
            console.log(tokenResp);
            var auth_token = JSON.parse(tokenResp)
            var token = "Bearer "+auth_token["token"];
            console.log(token)
            var bctUri = "http://" + bctIp + ":" + bctPort + "/channels/" + bctChannelName + "/chaincodes/" + bctChaincodeName;
            if (typeof jsonBody["_id"] !== "undefined" && jsonBody["_id"]) {
                delete jsonBody["_id"];
            }
            console.log(bctUri)
            var condition = {};
            condition["name"] = jsonBody.companyName;
            var companydetails = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
            console.log(companydetails)
            jsonBody["docType"] = "transactions";
            jsonBody["stellarAccountId"] = companydetails[0].stellarAccountId
            jsonBody["secretKey"] = companydetails[0].secretKey;
            jsonBody["AssetName"] = companydetails[0].tokenname;
            console.log("JSONBody",jsonBody)
            var body = {};
            body["peers"] = bctPeers;
            body["fcn"] = bctFcnName;
            body["args"] = [];
            body["args"][0] = jsonBody["companyName"]
            body["args"][1] = jsonBody["docType"]
            body["args"][2] = jsonBody["stellarAccountId"]
            body["args"][3] = jsonBody["secretKey"]
            body["args"][4] = jsonBody["AssetName"]


            console.log(body)

            var options = {
                method: 'POST',
                uri: bctUri,
                body: body,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': token,
                },
                json: true // Automatically stringifies the body to JSON
            };
            await rp(options)
                .then(function (parsedBody) {
                    console.log(parsedBody);
                })
                .catch(function (err) {
                    // POST failed...
                    // throw new Error(err);
                });
        })
        .catch(function (err) {
            // POST failed...
            // throw new Error(err);
        });

}

exports.getCompanyList = async function (){
    var condition ={}
    return crud.getCompanyList(config.connectionString, config.dbName, collectionName, condition, paramNotReq)
}

exports.validatecompany = async function (body) {

    var email = body.email.value;
    var password = body.password.value;
    
    // console.log(data);
    var condition = {
        
    };
    condition["email"] = email;
    
    // console.log("Return", body)
// console.log("READBYCONDITION =====>",crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq))
    return await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
    
    
}

exports.addLoyaltyAssettoLedger = async function (bctIp, bctPort, bctChannelName, bctChaincodeName, bctPeers, bctFcnName, bctOrgName, jsonBody) {

    var tokenUri = "http://" + bctIp + ":" + bctPort + "/users";
    console.log(tokenUri)
    
    // var tokenBody = "username="+jsonBody.transactionGroupId+"&orgName=" + bctOrgName;
    var tokenBody = "username="+jsonBody.companyName+"&orgName=" + bctOrgName;
    console.log(tokenBody)
    
    var tokenOptions = {
        method: 'POST',
        uri: tokenUri,
        body: tokenBody,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'  // Is set automatically
        },
    };
    await rp(tokenOptions)
        .then(async function (tokenResp) {
            console.log(tokenResp);
            var auth_token = JSON.parse(tokenResp)
            var token = "Bearer "+auth_token["token"];
            console.log(token)
            var bctUri = "http://" + bctIp + ":" + bctPort + "/channels/" + bctChannelName + "/chaincodes/" + bctChaincodeName;
            if (typeof jsonBody["_id"] !== "undefined" && jsonBody["_id"]) {
                delete jsonBody["_id"];
            }
            console.log(bctUri)
            // var condition = {};
            // condition["name"] = jsonBody.companyName;
            // var companydetails = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
            // console.log(companydetails)
            // // jsonBody["docType"] = "transactions";
            // jsonBody["issuingAccountId"] = companydetails[0].stellarAccountId
            // jsonBody["assettype"] = companydetails[0].assettype;
            // jsonBody["AssetName"] = companydetails[0].tokenname;
            console.log("JSONBody",jsonBody)
            var body = {};
            body["peers"] = bctPeers;
            body["fcn"] = bctFcnName;
            body["args"] = [];
            body["args"][0] = jsonBody["AssetName"]
            body["args"][1] = jsonBody["issuingAccountId"]
            body["args"][2] = jsonBody["AssetType"]


            console.log(body)

            var options = {
                method: 'POST',
                uri: bctUri,
                body: body,
                headers: {
                    'content-type': 'application/json',
                    'Authorization': token,
                },
                json: true // Automatically stringifies the body to JSON
            };
            await rp(options)
                .then(function (parsedBody) {
                    console.log(parsedBody);
                })
                .catch(function (err) {
                    // POST failed...
                    // throw new Error(err);
                });
        })
        .catch(function (err) {
            // POST failed...
            // throw new Error(err);
        });

}
