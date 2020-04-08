'use strict';

var util = require('util');
var utils = require('../utils/writer');
var userService = require('../services/UserServices');
var companyService = require('../services/CompanyServices')
var scf = require('../utils/scf');
var config = require('../../config/config.json');
var cookieParser = require('cookie-parser');
var stellarasset = require('../../asset')
module.exports = {
  hello: hello,
  createUser:createUser,
  createCompany:createCompany,
  validateUser:validateUser,
  validateCompany:validateCompany,
  exchangerate : exchangerate,
  transferToken: transferToken,
  sellOfferCompany: sellOfferCompany,
  exchangeToken: exchangeToken,
  getOffers: getOffers,
  buyOfferUser : buyOfferUser,
  getUserBalance: getUserBalance,
  getPointsforShopping: getPointsforShopping,
  getCompanyList: getCompanyList,
  effectsOfAccount: effectsOfAccount,
  getAllOffers: getAllOffers,
  exchangeTokenSetPrice: exchangeTokenSetPrice
};

var sess;

function hello(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);
  // this sends back a JSON response which is a single string
  res.json(hello);
}

function getUserBalance(req,res,next){
    var body = req.swagger.params;
    userService.getUserBalance(body).then(function(response){
      console.log(response)
      res.json(JSON.parse(response))
    })
    .catch(function(response){
      console.log("response",response)
      // var statusCode = response.statusCode;
      // var msg = response.message;
      // res.status(statusCode).send({ message: msg });
    })
}

function createUser(req,res,next)
{
  var body = req.body;
  //create Stellar account
  userService.user(body).then(function (response) {
    //Store user details in hyperledger if successful
    var userdetails = {}
    userdetails.name = body.name
    // res.json(response);
    console.log("This is response",response)
    if(response.status == '200'){
      // userService.writeToLedger('localhost',4000,"mychannel","Loyalty_Chaincode",["peer0.org1.example.com","peer1.org1.example.com"],"init_owner",'Org1',userdetails)
      userService.getuserdetails(body).then(function(resp){
        console.log("Userdetails",resp)
        response.userdetails = resp
        res.json(response)
      })
      
      //response.userdetails = userdetails;
      
    }
  })
  .catch(function (response) {
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
};

function getOffers(req, res, next)
{
  var body = req.swagger.params;
  console.log(body)
  userService.getOffers(body.email.value).then(function(response){
    console.log("This is response",response)
    res.json(JSON.parse(response))
  })
  .catch(function (response) {
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
}

function getAllOffers(req, res, next)
{
  
  userService.getAllOffers().then(function(response){
    console.log("This is response",response)
    
    res.json(response)
  })
  .catch(function (response) {
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
}

function effectsOfAccount(req, res, next)
{
  var body = req.swagger.params;
  console.log(body)
  userService.effectsOfAccount(body.email.value).then(function(response){
    console.log("This is response",response)
    res.json(response)
  })
  .catch(function (response) {
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
}

function validateUser(req,res,next)
{
  var body = req.swagger.params;
  sess = req.session;
  sess.email = body.email.value;
  console.log(sess.email)
  userService.validateuser(body).then(function (response) {
    // console.log("response=====>");
    console.log(response);
    res.json(response[0]);
    // console.log(body.password.value === response[0].password)
    // if(body.password.value === response[0].password){
    //   console.log("Successful Login"); 
    // }
  })
  .catch(function (response) {
    console.log("catch response "+response);
    // var resObj = {}
    // resObj.statusCode = 400;
    var statusCode = response.statusCode;
    // resObj.message="mUser not found"
    var msg = response.message;
    // res.status(statusCode).send({ message: msg });
    res.json(response)
  });
};

function exchangerate(req,res,next){
}

function createCompany(req,res,next)
{
  var body = req.body;
  // console.log(body)
  companyService.company(body).then(function (response) {
    //create Stellar account
    var companydetails = {}
    var assetdetails = {}
    assetdetails.AssetName = body.tokenname
    assetdetails.issuingAccountId = body.stellarAccountId
    assetdetails.AssetType = body.assettype
    companydetails.companyName = body.name
    res.json(response);
    console.log("This is response",response)
    if(response.status == '200'){
      companyService.writeToLedger('localhost',4000,"mychannel","Loyalty_Chaincode",["peer0.org1.example.com","peer1.org1.example.com"],"init_issuer",'Org1',companydetails)
      companyService.addLoyaltyAssettoLedger('localhost',4000,"mychannel","Loyalty_Chaincode",["peer0.org1.example.com","peer1.org1.example.com"],"init_loyaltyasset",'Org1',assetdetails)
    }
  })
  .catch(function (response) {
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
    console.log("This is response",response)
  });
};

function createChannel(req, res, next){
  var body = req.swagger.params;
  companyService.createChannel('localhost',4000,'','','',body)
}

function validateCompany(req,res,next){
  console.log("Inside hello world")
  var body = req.swagger.params;
  sess = req.session;
  sess.email = body.email.value;
  console.log(sess.email)
  companyService.validatecompany(body).then(function (response) {
    // console.log("response=====>");
    // console.log(response[0]);
    
    // console.log(body.password.value === response[0].password)
    if(body.password.value === response[0].password){
      console.log("Successful Login"); 
      res.json(response[0]);
    }
    else{
      var resObj={};
      resObj.statusCode = 400;
      resObj.msg = "Invalid login";
      res.json(resObj)
    }
  })
 
  .catch(function (response) {
    console.log("catch response "+response);
    // var resObj = {}
    // resObj.statusCode = 400;
    var statusCode = response.statusCode;
    // resObj.message="mUser not found"
    var msg = response.message;
    // res.status(statusCode).send({ message: msg });
    res.json(response)
  });
};

function transferToken(req,res,next){
  console.log("Inside hello world")
  var body = req.swagger.params;
  console.log(body)
  userService.transfertoken(body).then(function (response) { 
    console.log("response",response)
    res.json(response);
  })
  .catch(function (response) {
    console.log("catch response",response)
    var statusCode = response.statusCode;
    var msg = response.message;
    res.json(response)
    // res.status(statusCode).send({ message: msg });
  });
}

function exchangeToken(req,res,next){
  var body = req.swagger.params;
  // console.log(body)
  userService.makeselloffer(body).then(function (response) {
    console.log("response",response)
    res.json(response);
  })
  .catch(function (response) {
    console.log("response",response)
    res.json(response);
    // var statusCode = response.statusCode;
    // var msg = response.message;
    // res.status(statusCode).send({ message: msg });
  });
}

function exchangeTokenSetPrice(req,res,next){
  var body = req.swagger.params;
  // console.log(body)
  userService.makeselloffersetprice(body).then(function (response) {
    console.log("response",response)
    res.json(response);
  })
  .catch(function (response) {
    console.log("response",response)
    res.json(response);
    // var statusCode = response.statusCode;
    // var msg = response.message;
    // res.status(statusCode).send({ message: msg });
  });
}


function sellOfferCompany(req,res,next){
  console.log("Inside sell offer ")
  var body = req.swagger.params;
  console.log(body)
  companyService.makeselloffer(body).then(function (response) {
    console.log("response",response)
    res.json(response);
  })
  .catch(function (response) {
    console.log("response",response)
    var statusCode = response.statusCode;
    var msg = response.message;
   res.status(statusCode).send({ message: msg });
  });
}

function buyOfferUser(req,res,next){
  console.log("Inside buy offer")
  var body = req.swagger.params;
  console.log(body)
  userService.makebuyoffer(body).then(function (response) {
  
    console.log("response",response)
    res.json(response);
  })
  .catch(function (response) {
    console.log("response",response)
    var statusCode = response.statusCode;
    var msg = response.message;
   res.status(statusCode).send({ message: msg });
  });
}

function getPointsforShopping(req,res, next){
  //console.log("Inside get points")
  var body = req.swagger.params;
  userService.getPointsforShopping(body).then(function(response){
    console.log(response)
    
    var resObj = {}
    resObj.statusCode = 200
    resObj.msg = "Points successfully added";
    res.json(resObj)
  })
  .catch(function (response) {
    console.log("response",response)
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
}

function getCompanyList(req, res, next){
  
  companyService.getCompanyList().then(function(response){
    console.log(response)
    res.json(response)
  })
  .catch(function (response) {
    console.log("response",response)
    var statusCode = response.statusCode;
    var msg = response.message;
    res.status(statusCode).send({ message: msg });
  });
}