var promise = require('promise');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
	signupUser: function(username, password, database, jwt, res) {
		bcrypt.genSalt(saltRounds, (err, salt) => {
   			bcrypt.hash(password, salt, (err, hash) => {
        			database.addUser(username, hash, salt).then((status) => {
					return jwt.generateToken(username, password)
				}, (queryError) => {
					res.send({"status": "Failed to generate Token", "data": undefined});
				}).then((jwtReturn) => {
					res.send(jwtReturn);
				}, (failedStatus) => {
					res.send({"status": "That username is already taken"});
				});
   			});
		});
	}
};

