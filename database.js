sqlite3 = require('sqlite3').verbose();
var promise = require('promise');
const bcrypt = require('bcrypt');
var db = new sqlite3.Database('/home/ubuntu/app/test3.db', (err) => {
  			if (err) {
    			console.error(err.message);
  			}
  			console.log('Connected to the Trust Issues database.');
		});

module.exports = {

	addUser: function(username, password, salt) {
		let sql = `INSERT INTO User(username, password, salt) VALUES(?, ?, ?)`;
		var promise = new Promise((resolve, reject) => {
			db.run(sql, [username, password, salt], (err) => {
				if(err) reject({"status": err.message});
				else resolve({"status": "Success"});
			});
		});
		return promise.then(processAddUser);
	},

	validateCredentials: function(username, password) {
		let saltQuery = `SELECT salt FROM User WHERE
						 username = ?`;
		let sql = `SELECT username, password
				   FROM User WHERE username = ? AND
				   password = ?`;
		var promise = new Promise((resolve, reject) => {
				db.get(saltQuery, [username], (err, row) => {
					if(err) console.log(err);
					else resolve(row.salt);
				});
		}).then((salt) => {
				return new Promise((resolve, reject) => {
					 bcrypt.hash(password, salt, function(err, hash) {
                                        	if (err) console.log(err);
                                        	else resolve(hash)
                       			 });
				});
		}).then((hash) => {
			return new Promise((resolve, reject) => {
				db.get(sql, [username, hash], (err, row) => {
                                	if (err) reject(err);
                                	else resolve(row);
                        	});
			});
	
		});
		return promise.then(processValidateCredentials, validateCredentialsFailed);
	},

	addMessage: function(sender, recipient, message, iv, tag, key) {
		let sql = `INSERT INTO Message(sender, recipient, message, iv, tag, key, timeSent)
				   VALUES(?, ?, ?, ?, ?, ?, datetime('now'))`;
		var promise = new Promise((resolve, reject) => {
			db.run(sql, [sender, recipient, message, iv, tag, key], (err) => {
				if (err) reject({"status": err.message});
				else resolve({"status": "Success"});		
			});
		});
		return promise.then(processAddMessage);
	},
	
	getNewMessages: function(username, timestamp) {
		let sql = `SELECT sender, message, iv, tag, key, timeSent 
				  FROM Message WHERE recipient = ? AND 
				  timeSent > ?`;
		var promise = new Promise((resolve, reject) => {
			db.all(sql, [username, timestamp], (err, rows) => {
				if(err) reject(err);
				else resolve(rows);
			});
		});
		return promise.then(processGetNewMessages, getNewMessagesFailed);
	},

	addMessagePollEntry: function(username) {
		let sql = `INSERT INTO MessagePoll(user, pollTime) VALUES(?, datetime('now'))`;
		var promise = new Promise((resolve, reject) => {
			db.run(sql, [username], (err) => {
				if(err) reject({"status": err.message});
				else resolve({"status": "Success"});
			});
		});
	},

	fetchPassword: function(username) {
		let sql = `SELECT password
				   FROM User WHERE username = ?`;
		var promise = new Promise((resolve, reject) => {
			db.get(sql, [username], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
		return promise.then(processFetchPassword, fetchPasswordFailed);
	},

	addFriendRequest: function(sender, recipient) {
		let sql = `INSERT INTO FriendRequests(sender, recipient, timeSent) VALUES(?, ?, datetime('now'))`;
		var promise = new Promise((resolve, reject) => {
			db.run(sql, [sender, recipient], (err) => {
				if(err) reject({"status": err.message, "request added": false});
				else resolve({"status": "Success", "request added": true});
			});
		});

	},

	getPendingRequests: function(username, timeStamp) {
		let sql = `SELECT DISTINCT sender FROM FriendRequests WHERE recipient = ? and timeSent > ?`;
		var promise = new Promise((resolve, reject) => {
			db.all(sql, [username, timeStamp], (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});
		return promise.then(processPendingFriendRequests);
	},

	addFriend: function(sender, recipient) {
		let sql = `INSERT INTO Friends(sender, recipient) VALUES(?, ?)`;
		return new Promise((resolve, reject) => {
			db.run(sql, [sender, recipient], (err) => {
				if (err) reject(err);
				else resolve();
			});
		}).then(() => {
			db.run(sql, [recipient, sender], (err) => {
				if(err) console.log(err);
				else return {"status": "Success"};
			});
		});
	},

	getFriends: function(username) {
		let sql = `SELECT recipient FROM Friends WHERE sender = ?`;
		return new Promise((resolve, reject) => {
			db.all(sql, [username], (err, rows) => {
				if(err) reject(err);
				else resolve(rows); 
			});
		}).then((rows) => {
			friends = [];
			return new Promise((resolve, reject) => {
				if (typeof rows !== 'undefined') {
					rows.forEach((row) => {
						friends.push(row.recipient);
					});
					resolve(friends);
				} else reject([]);
			});
		});
	}
};

function promiseRejected(err) {
	throw err;
};

function processAddUser(status) {
	return status;
};

function processAddMessage(status) {
	return status;
};

function processAddPollEntry(status) {
	return status;
};

function processGetNewMessages(rows) {
	var messages = []
	if (typeof rows !== 'undefined') {
		var promise = new Promise((resolve, reject) => {
			rows.forEach((row) => {
				messages.push({"sender": row.sender, "message": row.message, "iv": row.iv, "tag": row.tag, "key": row.key, "time": row.timeSent});
			});
			resolve(messages);
		});
	}
	else return {"status": "Invalid Username", "data": undefined};

	function processRow(messages) {
		let data = {"status": "Success", "data": messages};
		return data;
	};
	return promise.then(processRow); 
};

function getNewMessagesFailed(err) {
	let data = {"status": err.message, "data": undefined};
	return data;
};

function processValidateCredentials(row) {
	if(typeof row !== 'undefined') {
		let data = {"status": "Success", "data": {"valid": true}};
		return data;
	}
	else return {"status": "Invalid Credentials", "data": {"valid": false}};
};

function validateCredentialsFailed(err) {
	let data = {"status": err.message, "data": {"valid": false}};
	return data;
};

function processFetchPassword(row) {
	if (typeof row !== 'undefined') {
		let data = {"status": "Success", "data": row.password};
		return data;
	}
	else return {"status": "Invalid Username", "data": undefined};
};

function fetchPasswordFailed(err) {
	let data = {"status": err.message, "data": undefined};
	return data;
};

function processPendingFriendRequests(rows) {
	let requester_usernames = []
	if (typeof rows !== 'undefined') {
		var promise = new Promise((resolve, reject) => {
			rows.forEach((row) => {
				requester_usernames.push(row.sender);
			});
			resolve(requester_usernames);
	
		});
	} else reject([]);

	function processRowResolve(requester_usernames) {
		let data = {"status": "Success", "data": requester_usernames};
		return data;
	};


	function processRowReject(empty_requesters_list) {
		let data = {"status": "Unexpected Error", "data": empty_requesters_list};
	};
	return promise.then(processRowResolve, processRowReject);
}
