const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//need to include the user model object file, so we can use it functionality
var User = require('../models/user');

//Site Object 
var SiteSchema = mongoose.Schema({
	siteName : {
		type: String,
		index: true
	},
	email : { 
		type: String
	},
	siteImage : {
		data: Buffer, 
		contentType: String
	},
	siteMeta : {
		created   : { type: Date },
		createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		updated   : { type: Date, default: Date.now },
		location  : { type: String },
		rating    : { type: Number, min: 0, max: 5},
		products  : [String]
	}
});

var Site = module.exports = mongoose.model('Site', SiteSchema);

