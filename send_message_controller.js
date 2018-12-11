var promise = require('promise');

module.exports = {
	sendMessage: function(body, token, database, jwt, res) {
		console.log(body.password);
		 jwt.verifyToken(token, body.password).then((tokenVerificationObject) => {
			if(tokenVerificationObject.verified)
				return database.addMessage(body.sender, body.recipient, body.message, body.iv, body.tag, body.key);
			else
				res.send(tokenVerificationObject);	
		}).then((status) => {
			res.send(status);
		});
	}
};
