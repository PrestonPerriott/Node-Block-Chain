const express  = require('express');
const router = express.Router();
const POS_item = require('../middleware/gc-pos-product');
const {check} = require('express-validator/check');

//middleware var that returns the response in JSOn 
const responseMiddleware = (req, res, next) => {
    return res.json(req.responsValue);
}

router.post('/transactions/new', [
    check('sender', 'Sender must be a String').exists(),
    check('recipient', 'Recipient must be a String').exists(),
    check('amount', 'The transaction must be an Object').exists()
 ], POS_item.newTransaction, responseMiddleware);

 router.get('/mine', POS_item.mine, responseMiddleware);

 router.get('/chain', POS_item.getChain, responseMiddleware);
 
 module.exports = router;
 