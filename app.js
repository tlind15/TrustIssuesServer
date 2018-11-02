const express = require("express");
const helmet = require("helmet");
var database = require('./database');
var tokenGenerator = require('./token');
var promise = require('promise');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(express.static("./public"));

app.listen(3000, () => {console.log("Server Connected")});

app.post('/login', function(req, res) {
	database.fetchUserCredentials(req.body.username, req.body.password).then((fulfilled) => {
		tokenGenerator.generateToken(fulfilled.username, fulfilled.password).then((fulfilled) => {
			res.send(fulfilled);
		});
	});
});

app.post('/send-message', (req, res) => {
	//verify the token
	database.addMessage(req.body.sender, req.body.recipient, req.body.message);
});
