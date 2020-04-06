const StellarSdk = require('stellar-sdk')
const fetch = require('node-fetch')
var request = require('request');
var Q = require('q');

async function createAccount() {
    const pair = StellarSdk.Keypair.random()
    console.log('Requesting Lumens')
  
    await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${pair.publicKey()}`)
  
    return pair
  }

exports.getAsset = async function(senderdetail,companydetail,amount){
  // console.log(senderdetail);
  // console.log(token);
  console.log(amount);
  StellarSdk.Network.useTestNetwork();
  var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  var transaction;
  var companyKeys = StellarSdk.Keypair.fromSecret(companydetail.distributionAccountsecretKey)
  server.loadAccount(companydetail.distributionAccountpublicAddress)
        .then(function (receiver) {
            // console.log(receiver)
            var transaction = new StellarSdk.TransactionBuilder(receiver,{fee:100})
        .addOperation(StellarSdk.Operation.payment({
          destination: senderdetail.stellarAccountId,
          asset: new StellarSdk.Asset(companydetail.tokenname, companydetail.distributionAccountpublicAddress),
          amount: amount,
          source: companydetail.distributionAccountpublicAddress,
      }))
      .addMemo(StellarSdk.Memo.text('1000 new asset to newAcc'))
      .setTimeout(100)
      .build();

      transaction.sign(companyKeys);
      console.log(transaction)
      server.submitTransaction(transaction);
      return "Done"
}).catch(function (error) {
  console.error(error)
  res.send(error);
});
}
  async function run() {
    const pair = await createAccount()
    console.log(`
    Congrats, you have a Stellar account in the test network!
    seed: ${pair.secret()}
    id: ${pair.publicKey()}
  `)
    const url = `https://horizon-testnet.stellar.org/accounts/${pair.publicKey()}`

    console.log(`
        Loading account from test network:
        ${url}
  `)
  const response = await fetch(url)
  const payload = await response.json()
  }    

  // run()