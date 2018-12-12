const express = require("express");
const helmet = require("helmet");
var database = require('./database');
var jwt = require('./token');
var signup_controller = require('./signup_controller');
var login_controller = require('./login_controller');
var send_message_controller = require('./send_message_controller');
var check_messages_controller = require('./check_messages_controller');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static("./public"));

app.listen(3000, () => {console.log("Server Connected")});

app.post('/signup', (req, res) => {
	signup_controller.signupUser(req.body.username, req.body.password, database, jwt, res);
});

app.post('/login', (req, res) => {
	login_controller.loginUser(req.body.username, req.body.password, database, jwt, res);
});

app.post('/send-message', (req, res) => {
  	send_message_controller.sendMessage(req.body, extractToken(req), database, jwt, res);
});

app.post('/check-messages', (req, res) => {
  	check_messages_controller.checkMessages(req.body, extractToken(req), database, jwt, res);
});


app.post('/send-friend-request', (req, res) => {
	jwt.verifyToken(extractToken(req), req.body.password).then((jwtReturn) => {
		if(jwtReturn.verified) {
			return database.addFriendRequest(req.body.sender, req.body.recipient);
		}
	}).then((addFriendRequestResult) => {
		res.send(addFriendRequestResult);
	});
});

app.post('/check-friend-requests', (req, res) => {
	jwt.verifyToken(extractToken(req), req.body.password).then((jwtReturn) => {
		if(jwtReturn.verified) {
			return database.getPendingRequests(req.body.username, req.body.timestamp);
		}
	}).then((getRequestsResult) => {
		console.log("Results: " + getRequestsResult);
		res.send(getRequestsResult);
	}, (err) => {
		console.log(err);
	});
});

app.post('/add-friend', (req, res) => {
	jwt.verifyToken(extractToken(req), req.body.password).then((jwtReturn) => {
		if(jwtReturn.verified) {
			return database.addFriend(req.body.user1, req.body.user2);
		}
	}).then((addFriendResult) => {
		res.send(addFriendResult);
	}, (err) => {
		console.log(err);
	});
});

app.post('/get-friends', (req, res) => {
	jwt.verifyToken(extractToken(req), req.body.password).then((jwtReturn) => {
		if(jwtReturn.verified) {
			return database.getFriends(req.body.username);
		}
	}).then((getFriendsResult) => {
		res.send({'status': 'Success', 'data': getFriendsResult});
	}, (err) => {
		console.log(err);
	});
});

function extractToken(req) {
	const authorization = req.get('authorization');
  	return authorization.split('Bearer ')[1];
}; 
