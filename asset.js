var StellarSdk = require('stellar-sdk');
var request = require('request');
var Q = require('q');
var account = {}

exports.createAccount = async function () {
    var pair = StellarSdk.Keypair.random();
    var deferred = Q.defer();

    
    var accountId = pair.publicKey();
    var accountSeed = pair.secret();
    account["accountId"] = accountId;
    account["accountSeed"] = accountSeed;
    // var balance = req.session.insOrg;
    console.log(account);
    request.get({
        url: 'https://horizon-testnet.stellar.org/friendbot',
        qs: {
            addr: accountId
        },
        json: true
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.error('ERROR!', error || body);
        } else {
            console.log('SUCCESS! You have a new account :)\n', body);
            deferred.resolve(account);

        }
    });
    return deferred.promise;
}


// createAccount();

var pay = function (senderdetail, receiverdetail, companydetail,tokenamount) {
    console.log("Inside Pay")
    var deferred = Q.defer();
    StellarSdk.Network.useTestNetwork();
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    console.log(senderdetail)
    var sourceKeys = StellarSdk.Keypair
        .fromSecret(senderdetail.secretKey);
    // console.log("Source keys in payment",sourceKeys)
    var destinationId = receiverdetail.stellarAccountId;
    // Transaction will hold a built transaction we can resubmit if the result is unknown.
    var transaction;

    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    server.loadAccount(destinationId)
        // If the account is not found, surface a nicer error message for logging.
        .catch(StellarSdk.NotFoundError, function (error) {
            throw new Error('The destination account does not exist!');
        })
        // If there was no error, load up-to-date information on your account.
        .then(function () {
            return server.loadAccount(sourceKeys.publicKey());
        })
        .then(async function (sourceAccount) {
            // Start building the transaction.
            transaction = new StellarSdk.TransactionBuilder(sourceAccount,{fee:100})
                .addOperation(StellarSdk.Operation.payment({
                    destination: destinationId,
                    // Because Stellar allows transaction in many currencies, you must
                    // specify the asset type. The special "native" asset represents Lumens.
                    asset: new StellarSdk.Asset(companydetail.tokenname,companydetail.stellarAccountId),
                    // asset: tokenname,
                    amount: tokenamount
                }))
                // A memo allows you to add your own metadata to a transaction. It's
                // optional and does not affect how Stellar treats the transaction.
                .addMemo(StellarSdk.Memo.text('Test Transaction'))
                // Wait a maximum of three minutes for the transaction
                .setTimeout(180)
                .build();
            // Sign the transaction to prove you are actually the person sending it.
            transaction.sign(sourceKeys);
            // And finally, send it off to Stellar!
            try {
                const transactionResult = await server.submitTransaction(transaction);
                console.log(JSON.stringify(transactionResult, null, 2));
                console.log('\nSuccess! View the transaction at: ');
                console.log(transactionResult._links.transaction.href);
                var response = {}
                response.statusCode = 200;
                response.message = "Successful Transaction"
                deferred.resolve(response)
              } catch (e) {
                console.log('An error has occured:');
                // console.log(e);
                var response = {}
                response.statusCode = 400;
                response.message = "Transaction Failed"
                deferred.reject(response)
              }
            //var response = server.submitTransaction(transaction);
            //console.log("Pay response " + response)
            
        })
        // .then(function (result) {
        //     console.log('Success! Results:', result);
        //     var response = {}
        //     response.statusCode = 200;
        //     response.message = "Successful Transaction"
        //     // deferred.resolve(response)
        // })
        // .catch(function (error) {
        //     console.error('Something went wrong!', error);
        //     var response = {}
        //     response.statusCode = 400;
        //     response.message = "Transaction Failed"
        //     deferred.reject(err)
        //     // If the result is unknown (no response body, timeout etc.) we simply resubmit
        //     // already built transaction:
        //     // server.submitTransaction(transaction);
        // });
    return deferred.promise;
}

// pay()

var sellOfferCompany = async function (data,amount) {
    console.log("Inside sell offer===============")
    StellarSdk.Network.useTestNetwork();
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    // data = data[0];

    // console.log("Change trust data",data)
    // var issuingAccountPublicAddress = data.issuingAccountpublicAddress;
    // var issuingAccountsecretKey =data.issuingAccountsecretKey;
    var stellarAccountId = data[0].stellarAccountId;
    var secretKey = data[0].secretKey;
    // distributionAccountpublicAddress.toString();
    //Transaction will hold a built transaction we can resubmit if the result is unknown.
    var transaction;

    // var issuerKeyPairs = StellarSdk.Keypair.fromSecret(issuingAccountsecretKey);
    var assetName = data[0].tokenname;
    // console.log(assetName)
    var companyKeyPair = StellarSdk.Keypair.fromSecret(secretKey);
    //console.log("This is destSecret",distributionAccountsecretKey)
    // var issrAccountId = issuerKeyPairs.publicKey();

    server.loadAccount(companyKeyPair.publicKey())
        .then(function (receiver) {
            // console.log(receiver)

            var transaction = new StellarSdk.TransactionBuilder(receiver,{fee:100})
                // The `changeTrust` operation creates (or alters) a trustline
                // The `limit` parameter below is optional
                // .addOperation(StellarSdk.Operation.createAccount({
                //     destination:req.body.destination,
                //     source:issrAccountId,
                //     startingBalance:"50000"
                //     // limit: amountIssued
                // }))

                //Creating Trust
                // .addOperation(StellarSdk.Operation.changeTrust({
                //     asset: new StellarSdk.Asset(assetName, destSecret.publicKey()),
                //     source: destSecret.publicKey(),
                //     limit: "10000000"
                // }))
                // .addOperation(StellarSdk.Operation.changeTrust({
                //     asset: new StellarSdk.Asset(assetName, issrAccountId),
                //     source: 'GBEG4LKAW37NLSRXXPJZ7Z34VQJPPPMB7U4TAISC4BSVJVKPR2CFJEQY',
                //     //limit: 10000000
                // }))
                //Asset Creation
                // .addOperation(StellarSdk.Operation.payment({
                //     destination: destSecret.publicKey(),
                //     asset: new StellarSdk.Asset(data.tokenname, issrAccountId),
                //     amount: "100000",
                //     source: issuerKeyPairs.publicKey(),
                // }))
                // .addOperation(StellarSdk.Operation.changeTrust({
                //     asset: new StellarSdk.Asset(assetName, destSecret.publicKey()),
                //     source: 'GAJV3NXSWNNSV467QMTLHXPCK254I5KFBYCIY2YK4LGOID2FRZFDXFJJ',
                //     //limit: 10000000
                // }))
                //Selling 1 companytoken for 1 XLM
                .addOperation(StellarSdk.Operation.manageSellOffer({
                    selling: new StellarSdk.Asset(data[0].tokenname,companyKeyPair.publicKey()),
                    buying: new StellarSdk.Asset("xlm"),
                    amount: amount,
                    price:1,
                    offerid:0

                 }))
                .addMemo(StellarSdk.Memo.text('Sell offer created'))
                .setTimeout(20)
                .build();

            transaction.sign(companyKeyPair);
            // transaction.sign(issuerKeyPairs);
            
            
            // transaction.sign(destSecret);

            console.log(transaction)
            server.submitTransaction(transaction);
            console.log('Sell Offer created')
            

        })
        .catch(function (error) {
            console.error(error)
            // res.send(error);
        });
}

// changeTrustAndPay()
var changeTrust = async function(companydetail,customerdetail){
    StellarSdk.Network.useTestNetwork();
    var deferred = Q.defer();
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    // var issuingAccountPublicAddress = data.issuingAccountpublicAddress;
    // var issuingAccountsecretKey =data.issuingAccountsecretKey;
    // var issuerKeyPairs = StellarSdk.Keypair.fromSecret(issuingAccountsecretKey);
    // var issrAccountId = issuerKeyPairs.publicKey();
    console.log("Inside change trust=====================")
    var transaction;
    // var assetName = data.tokenname;
    console.log(companydetail.tokenname)
    console.log(companydetail.stellarAccountId)
    console.log(customerdetail)
    var customerKeyPairs = StellarSdk.Keypair.fromSecret(customerdetail.secretKey);
    
    server.loadAccount(customerKeyPairs.publicKey())
        .then(async function (receiver) {
            // console.log(receiver)

            var transaction = new StellarSdk.TransactionBuilder(receiver,{fee:100})
            .addOperation(StellarSdk.Operation.changeTrust({
                asset: new StellarSdk.Asset(companydetail.tokenname,companydetail.stellarAccountId),
                // source: mausamKeyPairs.publicKey()
                //limit: 10000000
            }))
            .addMemo(StellarSdk.Memo.text('Change trust'))
                .setTimeout(20)
                .build();
            transaction.sign(customerKeyPairs);
            console.log(transaction)
            const transactionResult = await server.submitTransaction(transaction);
            console.log('Trustline between user and company created')
            deferred.resolve(transactionResult)
            // console.log()
            // res.setHeader('Content-Type', 'application/json')
            // res.send(companydetail)
            
        })
            .catch(function (error) {
                console.error(error)
                //res.send(error);
            });
    return deferred.promise;

}

var getOffers = async function (pubKey) {
    console.log("hey")
    var deferred = Q.defer();
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    
    server.offers('accounts', pubKey)
      .call()
      .then(async function (offerResult) {
        console.log("hello....")
        console.log(offerResult);
        console.log(typeof(offerResult))
        deferred.resolve(offerResult)
      })
      .catch(function (err) {
        
        console.error(err);
        
      })
    
    return deferred.promise;
}

var effectsOfAccount = async function (pubKey) {
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var deferred = Q.defer();
    console.log("Inside asset.js")
    server.effects()
        .forAccount(pubKey)
        .order("desc")
        .call()
        .then(async function (effectResults) {
            //page 1
            console.log("Effect results",effectResults.records)
            deferred.resolve(effectResults)
            // res.setHeader('Content-Type', 'application/json');
            // res.send(effectResults.records);
        })
        .catch(function (err) {
            console.log(err);

        })
    return deferred.promise
}

// effectsOfAccount("GDX5P24SIOMLOSU2NM7ZT4US5B3N2SX66TUXOYRLLDCLKRY3MVXUUH4U")
exports.makeBuyOffer = async function(companydetail,senderdetail,buyamount){
    // console.log("Get Uber assets")
    // console.log(companydetail[0],senderdetail[0])
    companydetail = companydetail[0];
    buyerdetail = senderdetail[0];
    console.log(buyerdetail)
    var distributionAccountpublicAddress = companydetail.distributionAccountpublicAddress
    StellarSdk.Network.useTestNetwork();
    var buyerKeyPairs = StellarSdk.Keypair.fromSecret(buyerdetail.secretKey);
    // var companyKeyPairs = StellarSdk.Keypair.fromSecret(companydetail.issuingAccountsecretKey)
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var transaction;
    server.loadAccount(buyerdetail.stellarAccountId)
        .then(function (receiver) {
             console.log(receiver)

            var transaction = new StellarSdk.TransactionBuilder(receiver,{fee:100})
            
            .addOperation(StellarSdk.Operation.manageBuyOffer({
                selling: new StellarSdk.Asset("xlm"),
                buying: new StellarSdk.Asset(companydetail.tokenname,distributionAccountpublicAddress),
                buyAmount: buyamount,
                price:1,
                offerid:0,


             }))
             .addMemo(StellarSdk.Memo.text('Buy offer created'))
                .setTimeout(100)
                .build();
              
                transaction.sign(buyerKeyPairs);
                console.log(transaction)
            server.submitTransaction(transaction);
            console.log('Buy offer created')
            // return "successful"
        })
        .catch(function (error) {
            console.error(error)
            // res.send(error);
        });
}
// exports.makeSellOffer = async function(sellingcompanydetail,buyingcompanydetail,sellerdetail,buyamount,price){
//     // var deferred = Q.defer();
//     console.log("Seller details",sellerdetail)
//     console.log("Buy amount",buyamount)
//     console.log(typeof(buyamount));
//     console.log(price)
//     var sellingcompanystellarAccountId = sellingcompanydetail.stellarAccountId
//     var buyingcompanystellarAccountId = buyingcompanydetail.stellarAccountId
//     console.log("selling "+sellingcompanystellarAccountId)
//     console.log("buying "+buyingcompanystellarAccountId)
    
   
//     StellarSdk.Network.useTestNetwork();
//     var sellerKeyPairs = StellarSdk.Keypair.fromSecret(sellerdetail.secretKey);
//     // var companyKeyPairs = StellarSdk.Keypair.fromSecret(companydetail.issuingAccountsecretKey)
//     var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
//     var transaction;
//     (async function main() {
//     server.loadAccount(sellerdetail.stellarAccountId)
//         .then(function (receiver) {
//             //  console.log(receiver)

//             var transaction = new StellarSdk.TransactionBuilder(receiver,{fee:100})
            
//             .addOperation(StellarSdk.Operation.manageSellOffer({
//                 selling: new StellarSdk.Asset(sellingcompanydetail.tokenname,sellingcompanystellarAccountId),
//                 buying: new StellarSdk.Asset(buyingcompanydetail.tokenname,buyingcompanystellarAccountId),
//                 amount: buyamount,
//                 price:"1"
//             }))
//             .addMemo(StellarSdk.Memo.text('Sell offer created'))
//             .setTimeout(180)
//             .build();
            
//             transaction.sign(sellerKeyPairs);

//             // console.log(transaction.toEnvelope().toXDR('base64'));

//             server.submitTransaction(transaction)
//               .then(function(transactionResult) {
//                 console.log(JSON.stringify(transactionResult, null, 2));
//                 console.log('\nSuccess! View the transaction at: ');
//                 console.log(transactionResult._links.transaction.href);
//               })
//               .catch(function(err) {
//                 console.log('An error has occured:');
//                 console.log(err.response.data.extras)
//                 //console.log(err);
//               });
//           })
//         })
       
// }
exports.makeSellOffer = async function(sellingcompanydetail,buyingcompanydetail,sellerdetail,buyamount,price){
    
    var deferred = Q.defer();
    console.log("Seller details",sellerdetail)
    console.log("Buy amount",buyamount)
    console.log(typeof(buyamount));
    console.log(price)
    var sellingcompanystellarAccountId = sellingcompanydetail.stellarAccountId
    var buyingcompanystellarAccountId = buyingcompanydetail.stellarAccountId
    console.log("selling "+sellingcompanystellarAccountId)
    console.log("buying "+buyingcompanystellarAccountId)
    var sellerKeyPairs = StellarSdk.Keypair.fromSecret(sellerdetail.secretKey);
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const account = await server.loadAccount(sellerdetail.stellarAccountId);
    console.log("Sequence",account.sequence)
    // var sequence = parseInt(account.sequence)
    // sequence = sequence 
    // account.sequence = sequence.toString()
    // console.log("Sequence",account.sequence)
    const fee = await server.fetchBaseFee();
    
    const transaction = new StellarSdk.TransactionBuilder(account, { 
            fee,
            networkPassphrase: StellarSdk.Networks.TESTNET
          })
          .addOperation(StellarSdk.Operation.manageSellOffer({
            selling: new StellarSdk.Asset(sellingcompanydetail.tokenname,sellingcompanystellarAccountId),
            buying: new StellarSdk.Asset(buyingcompanydetail.tokenname,buyingcompanystellarAccountId),
            amount: buyamount,
            price:"1",

          }))
          .setTimeout(200)
    .build();
    transaction.sign(sellerKeyPairs);

  // Let's see the XDR (encoded in base64) of the transaction we just built
//   console.log(transaction.toEnvelope().toXDR('base64'));
  try {
    const transactionResult = await server.submitTransaction(transaction);
    // console.log(transactionResult.data)
    // deferred.resolve(transactionResult.data)
    console.log(JSON.stringify(transactionResult, null, 2));
    console.log('\nSuccess! View the transaction at: ');
    console.log(transactionResult._links.transaction.href);
    // return "Successful"
    var response = {}
    response.statusCode = 200;
    response.message = "Offer successfully created"
    deferred.resolve(response)
    
  } catch (e) {
    console.log('An error has occured:');
    deferred.reject(e.response.data.extras)
    console.log(e.response.data.extras)
    // return "Error"
    // console.log(e);
    var response = {}
    response.statusCode = 400;
    response.message = "Offer Creation Failed"
    deferred.reject(response)
    
  }
  return deferred.promise

}

var getAccountBalance = async function (pubKey) {
        var deferred = Q.defer();
        var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
        var wallet = []
        server.loadAccount(pubKey).then(function (account) {
            // console.log(pubKey);
            // console.log('Balances for account: ' + pubKey);
            account.balances.forEach(function (balance) {
                // console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
                console.log(balance)
                if(balance.asset_type == 'native'){
                    wallet.push({'Asset Name':balance.asset_type,'Balance':balance.balance})
                }
                else{
                    wallet.push({'Asset Name':balance.asset_code,'Balance':balance.balance,'Issuer':balance.asset_issuer})
                }
            });
            deferred.resolve(wallet)
            
            // console.log(wallet)
        });
        return deferred.promise;
    }


exports.createToken = async function(tokenname,accountId){
    var companyToken = new StellarSdk.Asset(tokenname,accountId)
    console.log(companyToken);
    return companyToken;
}


// getAccountBalance("GDX5P24SIOMLOSU2NM7ZT4US5B3N2SX66TUXOYRLLDCLKRY3MVXUUH4U")

exports.account = account
exports.getAccountBalance = getAccountBalance
exports.sellOfferCompany = sellOfferCompany
exports.changeTrust = changeTrust
exports.pay = pay
exports.getOffers = getOffers
exports.effectsOfAccount = effectsOfAccount