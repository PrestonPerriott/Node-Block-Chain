//including express
////setting up express router
express = require('express');    
var router = express.Router();

//passport 
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//JWT requiremetns 
var jwt = require('jsonwebtoken');
var passportJWT = require('passport-jwt');

var extractJWT = passportJWT.ExtractJwt;
var JWT_strategy = passportJWT.Strategy;


var jwtAuth = require('../middleware/jwt-middleware');



//need to include the user model object file, so we can use it functionality
//and add an object the the db 
var User = require('../models/user');

const POS_item = require('../middleware/gc-pos-product');
const {check} = require('express-validator/check');

//middleware var that returns the response in JSOn 
const responseMiddleware = (req, res, next) => {

	var type = req.responseValue['type'];
	console.log(type);
	console.log('\n');
	console.log(req.responseValue);
	console.log('\n');
	// var transaction = req.responseValue['transactions'][0]['metaData'];
	// console.log(transaction);

	determineType(req.responseValue, res);

	//No real need to return the page to JSON data,
	//we instead want to render this somehow
    //return res.json(req.responseValue);
};

//a Get request route for a /register & /login route, that will render the view called register and login respectively
router.get('/register', function(req, res) {
	res.render('register');
});

//Login Page
router.get('/login', function(req, res) {
	res.render('login');
});

//Register user
router.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var repPassword = req.body.repPass;
	var email = req.body.email;

	//basic validation 
	req.checkBody('username', 'Name is required').notEmpty(); //Check if name field is empty
	req.checkBody('password', 'A password is required').notEmpty(); 
	req.checkBody('repPass', 'The Passwords do not match').equals(req.body.password); //Check for comparison 
	req.checkBody('email', 'An email is required').notEmpty();
	req.checkBody('email', 'A valid email is required').isEmail();
	//The checkBody first param is the html name tag in the HTML, not the local js variable

	var errors = req.validationErrors(); //validationErrors created when checkbody fails 
	if (errors){
		console.log('We have errors');

		//If there are errors, we shoudld re-render the form
		//But we also want to pass along the errors 
		res.render('register', {
			errors: errors
		});
	}else {
		console.log('Aint no errors');
		//if no errors we create user variable here
		//passing in the necessary params 
		var newUser = new User({
			username: username,
			password: password,
			email: email
		});

		//call the createUser func that we created in the user model
		//call file ref, then function that takes our newUser obj amd callback
		User.createUser(newUser, function(err, user){
			//check for error and throw if so
			if (err) throw err;
			console.log(user);
		});

		//our succes message we wanna post
//		req.flash('success_msg', 'You are registered and can now login');

		//redirect to login  page 
		res.redirect('/users/login');
	}
});


var cookieExtractor = function(req) {
	var token = null;
	if (req && req.cookies) {
		token = req.cookies['token'];
		console.log('Headers now look like : ', JSON.stringify(req.headers));
		//token = req.headers.cookie;
		console.log('the token from within the extrator ' + token);
	}
	return token;
}


  //passports JWT stratgey for web tokens in prod
  var jwtOptions = {};
  //jwtOptions.jwtFromRequest = extractJWT.fromAuthHeaderAsBearerToken();
  //jwtOptions.jwtFromRequest = extractJWT.fromHeader('cookie'); 
  jwtOptions.jwtFromRequest = cookieExtractor;
  jwtOptions.secretOrKey = 'secret';

  //If this strategy is not give the correct value,
  //I believe it won't even be called - Stack ref
  //Called every passport tries to verfiy a jwt
  //returns to us a user object
  var prodJWTStrategy = new JWT_strategy(jwtOptions, function(jwt_res, next){

	console.log('json web token recieved', jwt_res);


	//here we need to create a db call to find user by jwt
	User.getUserByID(jwt_res.id, function(err, user){ //can also use jwt_res.username
		if (err) {
			return next(err, false);
		}
		if (user) {
			next(null, user);
			console.log('The user object is : ', user);
		} else {
			next(null, false);
		}
	});
  });



//passports local strategy for Developmetn 
var devLocalStrategy = new LocalStrategy(
  function(username, password, done, req, res) {
    //Going to be using functions that are in our user Model
    //Passing the username to query to our model function, and a function
    User.getUserByUsername(username, function(err, user){
    	//check for error and throw if there is one
		if (err){
			console.log(err); 
			throw err;
		} 
    	//Then check for the actual returned user
    	if(!user){
			res.send({success: false, message: 'No user with that name'});
			//return done(null, false, {message: 'Theres no user with that name!'});
		}
		
    	
    	//If there is a user, the fucntion will contintue on here
    	//where we call another function within our user model class
    	User.comparePassword(password, user.password, function(err, isMatch){
    		//catch and throw error if there is one
    		if(err) throw err;
    		if(isMatch){
				//there is a user
				// var token = jwt.sign({'id': user.id},jwtOptions.secretOrKey, {
				// 	expiresIn: 604800 //7 days
				// });
				// console.log('\nThe New JWT TOken is :' + token);
				// user.token = token;

				//return done(null, user);
				return res.JSON({success: true, otherToekn: 'tokenized Kid'});

				//return res.json({user: user, jwtToken: 'JWT ' + token});
    		} else {
    			//They enetered the wrong password
    			return done(null, false, {message: 'Invalid password entered'});
    		}
    	});
    }); 
  });

  passport.use(prodJWTStrategy);
  //passport.use(devLocalStrategy);
  

//In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. 
//If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
//Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. 
//In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });


// passport.deserializeUser(function(id, done) {
//   User.getUserByID(id, function(err, user) {    //Using our own getuserByID function from our user model
//     done(err, user);
//   });
// });

//Login User, passing it the page we post to, our local strrategy for passport since were using a local db,
//and a function

router.post('/login', function(req, res, next) {

	//basic validation 
	req.checkBody('username', 'Name is required').notEmpty(); //Check if name field is empty
	req.checkBody('password', 'A password is required').notEmpty();
	//The checkBody first param is the html name tag in the HTML, not the local js variable

	var errors = req.validationErrors(); //validationErrors created when checkbody fails 
	var messages = [];
	if (errors){
		console.log('We have errors');
		console.log(errors[0]['msg']);

		//for loop to add messages to an array to prompt template with
		for (obj in errors) {
			messages.push(errors[obj]['msg']+'\n');
		}
		console.log('\n' + messages);
		//If there are errors, we shoudld re-render the form
		//But we also want to pass along the errors 

		res.render('login', {
			error_msg: messages
		});
	}else {
		console.log('Aint no errors');

	User.getUserByUsername(req.body.username, function(err, user){
		if (err) throw err;
		if (!user){
			res.render('login', {error_msg: 'There is no user with that name'});
		} 
	

		User.comparePassword(req.body.password, user.password, function(err, isMatch){
			if (err) throw err;
			if (isMatch){
				// should return user to next middleware
				tokenize(user, req, res);
				//Or instead of returning to next,
				//We just call jwt.sign,
				// And the redirect
				//Also need to figure out how to properly update the template for,
				//when there is an error/user
			}else {
				res.render('login' , {error_msg: 'Invalid Password Entered'});
			}
		});
	});
}
});



//Maybe not seeing it cannot come after function(req, res, next)

//Create token function to be added to new post to /login request
//gets passed the created user, from earlier
function tokenize(user, req, res) {
	var token = jwt.sign({'id':user.id}, jwtOptions.secretOrKey, {
		expiresIn: 604800
	});
	console.log('The user id for the signed token is: ' + user.id);
	res.cookie('token', token); //Don't need to prepend token with JWT**
	console.log('The token created was:' + token + '\n');
	console.log('The headers are :' + JSON.stringify(req.headers));
	console.log(user);
	console.log('\n' + req.headers.cookie);


	//need template to check against token in header
	//should pass token to template since it persists. 
	res.render('index', {info: req});
	
};

// router.post('/login', 
// 	passport.authenticate('local'), //set up our redirects
// 	function(req, res){

// 	var token = jwt.sign({'id': req.user.id},jwtOptions.secretOrKey, {
// 			expiresIn: 604800 //7 days
// 	});
// 	console.log('\nThe New JWT TOken is :' + token);
// 	req.user.token = token;
// 	res.cookie('cookie', 'JWT ' + token);
// 	console.log('\n' + req.headers['cookie']);

// 	console.log('\n' + JSON.stringify(req.headers));
// 	//if this function gets called, auth was successful
// 	//req.user contains auth'd user
// 	//res.json({message: 'word', token: token});
// 	console.log('\n' + JSON.stringify(req.cookies) + '\n');

// 	console.log(JSON.stringify(jwtOptions.jwtFromRequest));

// 	res.redirect('/'); 
// });

router.get('/logout', function(req, res, next){
	req.logout();
	//then send a message 
//	req.flash('success_msg', 'You have successfully logged out');
	//then redirect to the login page 
	res.cookie = null;
	console.log('The cookies after loggin out:' + req.cookies);
	

	res.redirect('login');
});

router.get('/profiles/self', passport.authenticate('jwt', {session: false})
,function (req, res){
	var currUser = req.user;
	//req.user is  {id: 2938y923, username:something, email:ah.com}
	if (currUser.id === req.user.id){

	//passing object to template 
	res.render('profile', {info: req});
	//console.log(req);
	console.log(req.user.username);
	//console.log(req.user._id);
	console.log(req.user.id);
	console.log('\n');	
	} else  {
//		req.flash('error_msg', 'There was an error with your User ID');
		res.redirect('/');
	}	
});

router.get('/mine', passport.authenticate('jwt', {session: false}) , POS_item.mine, function(req, res) {
	console.log('\n');
	console.log(req['responseValue']);
	const user = (req.responseValue['user'])
	console.log('Our user object from within the Mine function is : ' + user)
	res.render('profile', {info: req});

});
//need to make changes to the generic response middLeware function to reflect our JWT auth
router.get('/chain' ,jwtAuth.auth ,POS_item.getChain, function(req, res){
	var type = req.responseValue['type'];
	console.log(type);
	console.log('\n');
	console.log(req.responseValue);
	console.log('\n');
	res.render('profile', {info: req});
});

router.get('/new/transaction', POS_item.newTransaction, responseMiddleware);

router.get('/analytics', passport.authenticate('jwt', {session: false})
	,function (req, res) {
		
		console.log(req);
		res.redirect('/');
});

// router.get('/profiles/self/:navOption', ensureAuth, function(req, res){
// 	console.log(req.params);
// 	console.log(req.body);
// 	var navOption = req.params.navOption;
// 	console.log(navOption);

// 	switch (navOption) {
// 		case "chain":
// 			router.get('/profiles/self', POS_item.getChain, async function(req, res, next){
			
// 				res.render('profile');
// 				console.log(await res.body);
// 				console.log(await req.params);
// 				// console.log(await POS_item.getChain);
// 				// console.log(await responseMiddleware);
// 				// console.log(await res.responsValue);	
// 			});
// 			// console.log(POS_item.getChain);
// 			// console.log(responseMiddleware);
// 			// console.log(res.responsValue);
// 			break;
// 		case "mine":
// 			router.get('/profiles/self', POS_item.mine, responseMiddleware);
// 			console.log(responseMiddleware)
// 			break;
// 			default:
// 			console.log(navOption);
// 			break;
// 	}
// });

function ensureAuth(req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
	//	req.flash('error_msg', 'Log in to access that page!');
		res.redirect('/users/login');
	}
};

//req is whatever is sent, res what we intend to send back 
function determineType(req, res, next) {

	switch(req['type']) {
		case 'mine':
		renderMinedProduct(req, res);
		break;
		case 'chain':
		renderBlockChain(req, res);
		break;
		case 'transaction':
		renderTransaction(req, res);
	 default:
		console.log('default');
		break;
	}
};

function renderMinedProduct(req, res, next) {
	console.log('Going to render Mined Object from render func');
	//pass in req to the template in all similar funcs
	res.render('profile', {product: req});
	next();
};

function renderBlockChain(req, res, next) {
	console.log('Going to render Block Chain');
};

function renderTransaction(req, res, next) {
	console.log('GOING to render last Transaction');
};
module.exports = router;