var promise = require('promise');

module.exports = {
	loginUser: function(username, password, database, jwt, res) {
		database.validateCredentials(username, password).then((queryReturn) => {
			if (typeof queryReturn.data !== 'undefined' && queryReturn.data.valid)
				return jwt.generateToken(username, password);
			else res.send(queryReturn);
		}, (err) => {
			console.log(err);
			res.send({"status": "Unexpected Error"});
		}).then((jwtReturn) => {
			res.send(jwtReturn);
		}, (err) => {
			console.log(err);
			res.send({"status": "Failed to generate Token", "data": undefined});
		});
	}
};
