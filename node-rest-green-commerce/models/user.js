var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//Creating the user object schema/representation that will be inserted into db
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
	},
	email: {
		type: String
	}
});

//an accessible variable that we can use outside the file 
///Pass in the model name and the UserSchema variable
var User = module.exports = mongoose.model('User', UserSchema); 



//User functions that we can also access outside file 
//**********                                   *************
//We start with create user which we pass a newUser, and a callback fucntion
module.exports.createUser = function(newUser, callback){
	//need to use bcrypt to hash our password
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        // Store hash in your password DB.
        newUser.password = hash;
        newUser.save(callback); //pass in callback
    });
});
}

//another function to search a user with given query name 
module.exports.getUserByUsername = async function(username, callback){
	//set a query variable to seerach the db w/
	var query = {username: username};
	//call mongoose findOne function on User, passing search obj and callback
	await User.findOne(query, callback);
}

//another fucntion to search user by given ID
module.exports.getUserByID = async function(id, callback){
	//Searach DB with mongoose method findByID 
	await User.findById(id, callback);
}

//fucntion to compare passwords
module.exports.comparePassword = function(candidatePassword, hash, callback){
	//Comparing of passwords
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		//throw error if error 
		if (err) throw err;
		callback(null, isMatch);
	});
}
