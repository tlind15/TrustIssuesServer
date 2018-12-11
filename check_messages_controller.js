var promise = require('promise');

module.exports = {
	checkMessages: function(body, token, database, jwt, res) {
  		jwt.verifyToken(token,body.password).then((tokenVerificationObject) => {
			return database.getNewMessages(body.username, body.timestamp);
		}).then((messages) => {
			res.send(messages);
		});
	}
};
