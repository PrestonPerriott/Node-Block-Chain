//include express
//set up expresss router
var express = require('express');
var router = express.Router();

//a Get request route for /, that will render the index page
router.get('/', function(req, res) {
	res.render('index');
});

module.exports = router;