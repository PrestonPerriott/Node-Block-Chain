const gcBlockChain = require('./gc-blockchain');
const {validationResult} = require('express-validator/check');
var jwt = require('jsonwebtoken');

class POSproduct {
    constructor () {
        this.blockchain = new gcBlockChain();
        this.getChain = this.getChain.bind(this);
        this.mine = this.mine.bind(this);
        this.newTransaction = this.newTransaction.bind(this);
    }

    //Our POCProduct endpoint middleware 
    getChain (req, res, next) {
        const responseValue = {
            message: 'Retrieving Block Chain',
            chain: this.blockchain.chain,
            type: 'chain'
        }
        //might want to try and pass the responseObject to next 
        req.responseValue = responseValue;
        return next();
    }

    //(Mining) essentially adding to the POC Stockpile for that item
    mine (req, res, next) {
        console.log('Mine function started');
        const lastBlock = this.blockchain.lastBlock();
        const lastProof = lastBlock.proof;
        //creating new proof from old proof
        const proof = this.blockchain.proofOfWork(lastProof);

        console.log('User Object from within the mine function' + req.user);

        //All of this is uneccessary because before we call the mine function we call,
        //jwt.auth, which essentially does our verify with the JWTOptions, and returns to the next funct our user
        //req.user should be fine here 
        console.log('\n' + JSON.stringify(req.headers.cookie));
        var cookie = req.cookies['token'];
        var decoded  = jwt.verify(cookie, 'secret');
        console.log('The cookie from the headers is : ', cookie);
        console.log('The decode user object should be : ', decoded.id);

        
        

        /*Might still want to create a mongo Object for this, 
        so that businesses could save them locally?? */
        const mockBrowserTransaction = {
            'id': decoded.id,
            'userName': decoded.name, 
            'timeStamp': Date.now(),
            'transaction': {
                'barCode': '344536364645',
                'productType': 'strain',
                'image': 'http://superfake.url.com',
                'name': 'spaceMonkey',
                'inventoryNum': '7812100029334',
                'originCompany': 'CompanyX',
                'timesTransacted': '27'
            }
        };

        //creating a new transaction at 0 as sender, recipeient is this node,
        //process.env.NODE_NAME is .env file,
        //with a value of .... 
        //SHOULD I CREATE A NEW CLASS FOR THE OBJECT THAT,
        //WILL BE CREATED IN THE BROWSER?!?!?
        this.blockchain.newTransaction('0', "PrestNode", mockBrowserTransaction);

        const previousHash = this.blockchain.hash(lastProof);
        const newBlock = this.blockchain.newBlock(proof, previousHash);

        //our response to server 
        const responseValue = Object.assign({
            message: 'Product Added',
            type: 'mine',
            user: req.user
        }, newBlock );
        req.responseValue = responseValue;
       // console.log(responseValue);
        console.log('called from end of mine');
        //return req;
        //return res.render('profile', {product: req});
       return next();
    }

    newTransaction (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(422).json({errors: errors.mapped()});
        }
        
        const transaction =  req.body;
        const index = this.blockchain.newTransaction(transaction['sender', transaction['recipient'], transaction['metaData']]);
        const responseValue = 
        { 
            message: `Transaction will be added to Block ${index}`,
            type: 'transaction'
        };
        req.responseValue = responseValue;
        console.log(responseValue.message);
        return next();
    }
}
module.exports = new POSproduct();
