/* 
How includes work for JS, as they don't support include
*/
//Making it immutable, understand let and var use
const express = require('express'); //need to assign the package
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;  //Local strategy for our passport
const mongo = require('mongodb');
const mongoose = require('mongoose');
const debug = require('debug');

mongoose.connect('mongodb://localhost/gcapp');
var db = mongoose.connection;

var routes = require('./routes/index');   //folder called routes with index & users
var users = require('./routes/users');    
var sites = require('./routes/sites');

//Initialize the app
var app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));  //telling the system we want a folder called views, to handle our views 
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));  //setting handlebars as the app.engine, and the default layout file should be called layout, or layout.handlebars
app.set('view engine', 'handlebars');  //set the view engine as handlebars

//Body Parser & CookieParser Middleware; Configurations & Set up code 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

//Setting public folder, holds stylesheets, jquery and images
app.use(express.static(path.join(__dirname, 'public'))); 

//Middlware for Express Session 
app.use(session({
	secret: 'secret',  //secret key can be anything left it as 'secret'
	saveUninitialized: true,
	resave: true
}));

//Passport initialization
app.use(passport.initialize());
app.use(passport.session());

//Exoress Validator  
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg : msg, 
			value : value
		};
	}
}));


//Connect flash middleware
app.use(flash());

//Global Variables for flash messages
app.use(function(req, res, next) {       //global function
	res.locals.success_msg = req.flash('success_msg');    
	res.locals.error_msg =req.flash('error_msg');      //for any error mesages we have
	res.locals.error = req.flash('error');              //passport sets its own error messages and we need this one as well 
	res.locals.user = req.user || null;                //if user is present, we can access from anywhere, else null
	next();
});

//All the routes that our app will use, defined above
app.use('/', routes);
app.use('/users', users);
app.use('/sites', sites);

//Set Port
app.set('port', (process.env.PORT || 3000));

//passing port number to app.listen 
app.listen(app.get('port'), function(){
	console.log('Sever started on port' + app.get('port'));
});




// const app = express(); //executes express

// app.use((req, res, next) => { //we get the request, response and next, which we use to move the function to the next middleware
// 	res.status(200).json({   //here we're sending a response which is in json format
// 		message: 'HaHA node js server'
// 	});

// }); //sets up middleware, incoming request goes through this, and what we pass to it. 

// module.exports = app;