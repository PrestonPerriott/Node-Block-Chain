const crypto =  require('crypto');

class Blockchain {
    //Middleware 

//basic block structure that will be expounded upon once we have an actual model
//needs a ref to previous object hash, to keep a chronilogical order for chain integrity
    constructor() {
        
        //empty array of the chain & transactions
        this.chain = [];
        this.currTransactions = [];

        //Bind creates a func that has 'this' set to first param of bind
        /*Stack example : 
        
        var Button = function(content) { 
            this.content = content;
            };
        Button.prototype.click = function() {
            console.log(this.content + ' clicked');
            };
       
            var myButton = new Button('OK');
        myButton.click();

        which returns 'OK clicked' 
        */
        this.newBlock = this.newBlock.bind(this);
        this.newTransaction = this.newTransaction.bind(this);
        this.lastBlock = this.lastBlock.bind(this);
        //Proof of Work
        this.proofOfWork = this.proofOfWork.bind(this);
        /*           
        Used to stop DOS attacks,
        point of POW is to discover a number that solves a problem,
        Something difficult to find, 
        but easy to verify,
        Our POW will be finding a number p,
        p, when hashed with previous Blocks solution,
        will produce a hash that starts with c4ff3
        */

        //Mining the genesis Block 
        this.newBlock(100, 1);
    };

        //Create the new block in chain
    newBlock (proof, previousHash) {  //takes the POW, and last hash
        
        //immutable block object
        const block = {
            index: this.chain.length + 1, //new obj increment
            time_Stamp: new Date(), //get now time for date
            transactions: this.currTransactions, //set the blocks transaction
            proof: proof, //
            previous_Hash: previousHash
        }
        this.currTransactions = [];  //no transaction change
        this.chain.push(block); //push onto array chain stack
        return block;
    };

    //Product (mining?) function of storing transactions
    //Essentially what I'm using to add POS items to the blockchain
    //The metaData should be some JSON object consisting of 
    //The scanned product, vendor, where it was from etc. 
    //An immutable object. 
    newTransaction (sender, recipient, metaData) {
        //Store a new transaction in array
        this.currTransactions.push({
            sender: sender,
            recipient: recipient,
            metaData: metaData
        });
        //returning index of block that will be saved
        return this.lastBlock()['index'] + 1;
    };

    hash (block) {
        //hashing the serialized object to do hash of prev block
        const blockString = JSON.stringify(block);
        //for more info on how this Hmac cryptographic
        //https://nodejs.org/api/crypto.html#crypto_class_hmac
        const hash = crypto.createHmac('sha256', 'caffeina').update(blockString).digest('hex');
        return hash;
/* This is where shit gets cray, so we've made a JSON object of the block,
If a hacker attemtpts to tamper with the block, the time_Stamp,
 ,transactions or index will change, thereby changing the JSON value,
 we hash in order to make the successive hash values. Thereby,
 making all hashes in a blockchain invalid. How could a hacker,
 effeciently change all copies at the same time? It would be tough ;/.
 */

    };

    lastBlock () {
        //return the last black in chain
        return this.chain.slice(-1)[0];
    };

    //check for a valid proof
    validProof (lastProof, proof) {
        //guessHash val is updated with lastProof & the current one,
        //we take the hex val, and return if its first 6 chars,
        //match 

        //proceess.env.HASH_TYPE etc are environment variables,
        //which are assigned in the .env file 
        const guessHash = crypto.createHmac('sha256', 'caffeina').update(`${lastProof}${proof}`).digest('hex');

        //bool return
        return guessHash.substr(0,5) === 'c4ff3';

    } 

    //Try to calc the hashes of the chain
    //larger block chain means a greater 
    proofOfWork (lastProof) {

        //Just cycling thru until a solution is found
        let proof = 0;
        while (true) { //for eva loop
            if (!this.validProof(lastProof, proof)) { //validProof compare
                proof++;
            } else {
                break;
            }
        }
        return proof;  //returning the valid proof val
    }
};

module.exports = Blockchain;