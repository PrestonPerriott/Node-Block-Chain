//include express
//set up expresss router
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

const cannaReports = require('cannabis-reports');


//need to include the site model object file, so we can use it functionality
//and add an object the the db 
var Site = require('../models/site');

cannaReports.setCannabisReportsKey('1b171d895f86554afd912dba2b8f543f2c85a370');
//var lists = cannaReports.Strain.all();
router.get('/collection', async function(req, res){

	try {

	let dispensaryAry = await cannaReports.Dispensary.all();
		//gonna have to query cannabis reports with your api key and populate the template with those objects
	//we might have to store those into the database as well.
	//
	//See what cannabis reports give you back when querying dispensaries & then make the mongoose db object similar 
	let newStrain = await getDispensary('orange').catch(new Error('Failed from loading the Page.'));
	//console.log(newStrain);
	console.log('\n P \n');
	console.log(dispensaryAry[5]);
	console.log('\n P' + dispensaryAry.length + '\n');
	console.log('\n');
	//console.log(newStrain['data']);
	console.log('\n');
	console.log(newStrain['data'][0]['image']);    //How to access specific object in JSON
	res.render('siteDash', {info: dispensaryAry});
	} catch (err) {
		console.error(err);
		res.status(500);
	}
});

function ensureAuth(req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg', 'Log in to access that page!');
		res.redirect('/users/login');
	}
};

async function getDispensary(name) {
try {
	let newStrain = await fetch('https://www.cannabisreports.com/api/v1.0/strains/search/Orange');
	let strainJson = await newStrain.json();
	//console.log(strainJson);
	return strainJson;
} catch (err) {
	console.log(err);
	throw new Error('failed inside getStrain');
}
};

module.exports = router;