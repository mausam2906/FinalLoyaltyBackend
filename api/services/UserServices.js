'use strict';

var config = require('../../config/config.json');
var crud = require('../utils/CrudService');
var stellarasset = require('../../asset')
var service = {};
var Q = require('q');
var collectionName = 'User';
var paramNotReq = {};
var scf = require('../utils/scf');
var stellar = require('../../stellaraccount');
var rp = require('request-promise');

// find user in collection if exist then don't create new record
exports.user = function (body) {
    // var deferred = Q.defer();
    var condition = {};
    condition["email"] = body.email;

    var name = "user";
    
    return crud.insertData(config.connectionString, config.dbName, collectionName, condition, paramNotReq, body, name);
}

exports.validateuser = async function (body) {

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

exports.exchangerate = function (body) {

    var value1 = body.value1.value;
    value1 = parseInt(value1, 10);
    var currency1 = body.currency1.value;
    
}
exports.transfertoken = async function (body) {
    console.log("Inside user service transfer token")
    console.log(body.senderaddress.value +" "+ body.receiveraddress.value)
    // return body;
    var condition = {

    };
    //Check if sender is valid and get details
    condition["stellarAccountId"] = body.senderaddress.value;
    var senderdetail = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
    // console.log("Sender detail",senderdetail)
    // stellarasset.getAccountBalance(body.senderaddress.value)
    //Check if receiver is valid and get details
    condition["stellarAccountId"] = body.receiveraddress.value;
    var receiverdetail = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
    // console.log("Receiver detail",receiverdetail)
    //console.log(receiverdetail)
    var receiverfortrust = {}
    receiverfortrust.stellarAccountId = receiverdetail[0].stellarAccountId;
    receiverfortrust.secretKey = receiverdetail[0].secretKey;
    // console.log(body.companyname.value)
    condition = {};
    condition["name"] = body.companyname.value;
    
    // console.log(condition)
    var companydetail = await crud.readByCondition(config.connectionString, config.dbName, 'Company', condition, paramNotReq);
    console.log("Company token",companydetail[0].tokenname)
    // console.log("COMPANY BALANCE")
    // var companybalance = await stellarasset.getAccountBalance(companydetail[0].distributionAccountpublicAddress)
    // console.log(companybalance)
    // var response = await stellar.getAsset(senderdetail[0],companydetail[0],body.tokenamount.value)
    // stellar.transfertokenstellar(senderdetail,receiverdetail,companydetail,body)
    var trust = await stellarasset.changeTrust(companydetail[0],receiverfortrust)
    console.log(trust)
    var payment = await stellarasset.pay(senderdetail[0],receiverdetail[0], companydetail[0],body.tokenamount.value)
    console.log("Pay", payment)
    return payment
    // var response =  crud.updateData(config.connectionString, config.dbName, collectionName,updateData, condition, paramNotReq);

}

exports.getUserBalance= async function (body) {
        console.log("Inside user services")
        console.log(body)
        var stellarAccountId = body.stellarAccountId.value;
        console.log("Stellar account id",stellarAccountId)
        // var password = body.password.value;
        
        // console.log(data);
        var balance = await stellarasset.getAccountBalance(stellarAccountId)
        var response = JSON.stringify(balance)
        console.log("Response",response)
        return response
        
}

exports.getOffers = async function(email){
    console.log("Inside getOffers")
    console.log(email)
    var condition = {}
    condition["email"] = email;
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName, 'User', condition, paramNotReq);
    console.log(userdetails)
    var offers = await stellarasset.getOffers(userdetails[0].stellarAccountId)
    offers = JSON.stringify(offers)
    console.log("Offers=====",offers)
    return offers
}

exports.getAllOffers = async function(){


    console.log("Inside getAllOffers")
    // console.log(email)
    var condition = {}
    // condition["email"] = "sanjay@gmail.com";
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName, 'User', condition, paramNotReq);
    // console.log(userdetails)
    // var offers = "h";
    //console.log(typeof(userdetails))
    // for ( x of userdetails){
    //     // offers = await stellarasset.getOffers(userdetails[0].stellarAccountId)
    //     // offers = JSON.stringify(offers)
    //     // console.log("x" + offers)
    //     console.log("...../.."+x)
    // }
    var i=0;
    var j=0;
    var offersList = []
    for (var key in userdetails){
        var obj = userdetails[key]
        // console.log("This is obj"+obj.email)
        var offers = await stellarasset.getOffers(obj.stellarAccountId)

        if (offers.records.length !=0){
            for(j=0;j<offers.records.length;j++){
                var offersOnlyRequired = {}
                offersOnlyRequired.sellingToken =offers.records[j].selling.asset_code
                offersOnlyRequired.buyingToken =offers.records[j].buying.asset_code
                offersOnlyRequired.amount = offers.records[j].amount
                offersOnlyRequired.price = offers.records[j].price
                offersList[i] =offersOnlyRequired
                i++;
            }
            
        }

            
        
        // offers = JSON.stringify(offers)
        console.log(" "+obj.email +offers)
    }
    // var offers = await stellarasset.getOffers(userdetails[0].stellarAccountId)
    offersList = JSON.stringify(Object.assign({}, offersList))
    offersList= JSON.parse(offersList);  // convert string to json object
 

    console.log("Offerlist",offersList);
    // console.log(offers)

    return offersList
}

exports.effectsOfAccount = async function(email){
    console.log("Inside effectsOfAccount")
    console.log(email)
    var condition = {}
    condition["email"] = email;
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName, 'User', condition, paramNotReq);
    //console.log(userdetails)
    var effects = await stellarasset.effectsOfAccount(userdetails[0].stellarAccountId)
    console.log("Effects before filter",effects)
    
    var i=0;
    var effectsList=[]
    var j=0;
    if (effects.length !=0){
        for(i=0;i<effects.length;i++){
            if(effects[i].type == "trade"){
                var effectsOnlyRequired = {}
                effectsOnlyRequired.created_at =effects[i].created_at
                effectsOnlyRequired.sold_amount =effects[i].sold_amount
                effectsOnlyRequired.bought_amount = effects[i].bought_amount
                effectsOnlyRequired.sold_asset_code = effects[i].sold_asset_code
                effectsOnlyRequired.bought_asset_code = effects[i].bought_asset_code
                effectsOnlyRequired.type = "trade"
                effectsList[j] =effectsOnlyRequired 
                j++
            }
            if(effects[i].type == "account_credited"){
                var effectsOnlyRequired = {}
                effectsOnlyRequired.created_at =effects[i].created_at
                effectsOnlyRequired.asset_code =effects[i].asset_code
                effectsOnlyRequired.amount = effects[i].amount
                effectsOnlyRequired.type = "account_credited"
                effectsList[j] =effectsOnlyRequired 
                j++
            }
            if(effects[i].type == "account_debited"){
                var effectsOnlyRequired = {}
                effectsOnlyRequired.created_at =effects[i].created_at
                effectsOnlyRequired.asset_code =effects[i].asset_code
                effectsOnlyRequired.amount = effects[i].amount
                effectsOnlyRequired.type = "account_credited"
                effectsList[j] =effectsOnlyRequired 
                j++
            }
            
        }
        
    }
    effectsList = JSON.stringify(Object.assign({}, effectsList))
    effectsList= JSON.parse(effectsList);  // convert string to json object
    console.log("this is last",effectsList)
    return effectsList
}

exports.getuserdetails= async function (body) {
    console.log("Inside user services")
    console.log(body)
    var email = body.email;
    // var password = body.password;
    console.log(email)
    // console.log(data);
    var condition = {
        
    };
    condition["email"] = email;
    
    return await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);

}
exports.makebuyoffer = async function (body){
    console.log("Inside user services buy offer")
    console.log(body)
    var publicaddress = body.publickey.value;
    var privateaddress = body.privatekey.value;
    var tokenname = body.tokenname.value;
    var amount = body.amount.value;
    var condition = {};
    condition["tokenname"] = tokenname;
    var companydetails = await crud.readByCondition(config.connectionString, config.dbName, "Company", condition, paramNotReq);
    condition["stellarAccountId"] = publicaddress;
    condition = {};
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName,collectionName, condition, paramNotReq);
    var trust = await stellarasset.changeTrust(companydetails[0],userdetails[0]);
    // var data = await stellarasset.sellOfferCompany(companydetails,amount)
    var data = stellarasset.makeBuyOffer(companydetails,userdetails,amount)
}
exports.makeselloffer = async function (body){
    console.log("Inside user services sell offer")
    // console.log(body)
    var publicaddress = body.publickey.value;
    var privateaddress = body.privatekey.value;
    var sellcompanyname = body.sellcompanyname.value;
    var buycompanyname = body.buycompanyname.value;
    var amount = body.amount.value;
    var price = "1"

    var condition = {};
    condition["name"] = sellcompanyname;
    var sellingcompanydetails = await crud.readByCondition(config.connectionString, config.dbName, "Company", condition, paramNotReq);
    console.log("Selling Company", sellingcompanydetails)
    
    var condition = {};
    condition["name"] = buycompanyname;
    var buyingcompanydetails = await crud.readByCondition(config.connectionString, config.dbName, "Company", condition, paramNotReq);
    console.log("Buying Company", buyingcompanydetails)
    
    condition = {};
    condition["stellarAccountId"] = publicaddress;
    
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName,collectionName, condition, paramNotReq);
    console.log("User details",userdetails)

    var trust = await stellarasset.changeTrust(buyingcompanydetails[0],userdetails[0]);
    console.log("Sequence",trust.sequence)
    // // var trust = await stellarasset.changeTrust(sellingcompanydetails[0],userdetails[0]);
    // // console.log(trust)
    // if(trust.sequence > 0){
    var transaction = await stellarasset.makeSellOffer(sellingcompanydetails[0],buyingcompanydetails[0],userdetails[0],amount,price)
    console.log("In user service "+transaction)
    // var data = await stellarasset.sellOfferCompany(companydetails,amount)
    return transaction
}
// exports.exchangetoken = async function (body) {
//     console.log("Inside user services exchange token")
//     console.log(body)
//     var 
// }
exports.getPointsforShopping = async function(body){
    // console.log("Inside get points")
    // console.log(body)
   
    console.log()
    var tokenname = body.tokenname.value;
    var amount = body.amount.value;
    var condition = {};
    condition["tokenname"] = tokenname;
    var companydetails = await crud.readByCondition(config.connectionString, config.dbName, "Company", condition, paramNotReq);
    console.log("Company details",companydetails)
    condition = {};
    condition["email"] = body.email.value;
    
    console.log(condition)
    var userdetails = await crud.readByCondition(config.connectionString, config.dbName,collectionName, condition, paramNotReq);
    var transactiondetails = await stellarasset.changeTrust(companydetails[0],userdetails[0]);
    console.log(transactiondetails)
    var response = await stellarasset.pay(companydetails[0],userdetails[0],companydetails[0],amount)
    console.log(response)
    return response
}
exports.writeToLedger = async function (bctIp, bctPort, bctChannelName, bctChaincodeName, bctPeers, bctFcnName, bctOrgName, jsonBody) {

    var tokenUri = "http://" + bctIp + ":" + bctPort + "/users";
    console.log(tokenUri)
    
    // var tokenBody = "username="+jsonBody.transactionGroupId+"&orgName=" + bctOrgName;
    var tokenBody = "username="+jsonBody.name+"&orgName=" + bctOrgName;
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
            condition["name"] = jsonBody.name;
            var userdetails = await crud.readByCondition(config.connectionString, config.dbName, collectionName, condition, paramNotReq);
            console.log(userdetails)
            jsonBody["docType"] = "transactions";
            jsonBody["stellarAccountId"] = userdetails[0].stellarAccountId
            jsonBody["secretKey"] = userdetails[0].secretKey;
            // jsonBody["AssetName"] = userdetails[0].tokenname;
            jsonBody["email"] = userdetails[0].email
            
            console.log("JSONBody",jsonBody)
            var body = {};
            body["peers"] = bctPeers;
            body["fcn"] = bctFcnName;
            body["args"] = [];
            body["args"][0] = jsonBody["name"]
            body["args"][1] = jsonBody["email"]
            body["args"][2] = jsonBody["stellarAccountId"]
            body["args"][3] = jsonBody["secretKey"]
            // body["args"][4] = jsonBody["assetsOwned"]



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
