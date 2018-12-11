var jwt = require('jsonwebtoken');
var promise = require('promise');

module.exports = {
	generateToken: function(username, password) {
		/*(resolve, reject) are the paramters to the callback of a Promise object. The callback function
		contains the asynchronous function whose work you want to be contained within the promise. 'resolve' 
		is a function that is called if the asynchronous work does not return an 'err'. 'reject' is the function
		called if the asynchronous work returns an 'err'.*/
		var promise = new Promise((resolve, reject) => {

			//signed using HMACSHA256
			//password is salted and then hashed with SHA256 on the client-side
			jwt.sign({"name": username}, password, { expiresIn: '3h'}, (err, token) => {
				if(err) reject(err);
				else resolve(token);
			});
		});
		/*promise.then(<resolve function>, <reject function>) is a promise that will do the
		asynchronous work and then call either its resolve or reject function. To get result of the
		asynchronous work simply call .then((fulfilled) => {}).catch((err) => {}); Where 'fulfilled' whatever was
		returned by the 'resolve' function specified earlier. 'catch' returns the result of the 'reject' function
		specified earlier.*/
		return promise.then(processGenerateToken, generateTokenFailed);
	},

	verifyToken: function(token, password) {
		var promise = new Promise((resolve, reject) => {
			jwt.verify(token, password, (err, decoded) => {
  				if (err) reject(err);
  				else resolve(decoded);
			});
		});
		return promise.then(processVerifyToken, verifyTokenFailed);
	}
};

function promiseRejected(err) {
	console.log(err);
};

function processGenerateToken(token) {
	let data = {"status": "Success", "data": token};
	return data;
};

function generateTokenFailed(err) {
	let data = {"status": err.message, "data": undefined};
	return data;
};

function processVerifyToken(decoded) {
	var data = {"status": "Success", "verified": true};
	return data;
};

function verifyTokenFailed(err) {
	var data = {"status": err.message, "verified": false};
	return data;
};
