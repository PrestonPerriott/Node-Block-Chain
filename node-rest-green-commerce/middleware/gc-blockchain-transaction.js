const POS_item = require('./gc-pos-product');
const gcBlockChain = require('./gc-blockchain');
var jwt = require('jsonwebtoken');

//Consisting of two major components, inputs and outputs
//Outputs specifying where the coins/obj is going 
//Inputs give a proof that the coins that are sent, exist. 
//Inputs always refer to an existing (unspent) amount
class UnspentOutTransaction {
    constructor (outTransactionID, outTransactionIndex, address, amount) {
        this.outTransactionIndex = out
    }
}
//Unlocks the coin/obj
class InTransaction {
    constructor(){

    }
}
//Locks the coin/obj to new addresses
class OutTransaction {
    constructor(address, amount) {
        this.address = address || "" //if val returns nil we set to ""
        this.amount = amount || 0
    }
}

class Transaction {

}