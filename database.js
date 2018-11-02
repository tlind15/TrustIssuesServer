sqlite3 = require('sqlite3').verbose();
var promise = require('promise');

var db = new sqlite3.Database('C:/Users/tlindblom/Downloads/sqlite-tools/sqlite-tools-win32-x86-3250200/test.db', (err) => {
  			if (err) {
    			console.error(err.message);
  			}
  			console.log('Connected to the Trust Issues database.');
		});

module.exports = {
	addUser: function(username, password) {
		let sql = `INSERT INTO User(username, password) VALUES(?, ?)`;
		db.run(sql, [username, password], (err) => {
			if(err) throw err;
			else console.log("New user added!");
		});
	},

	fetchUserCredentials: function(username, password) {
		let sql = `SELECT username, password
				   FROM User WHERE username = ? AND
				   password = ?`;
		var promise = new Promise((resolve, reject) => {
			db.get(sql, [username, password], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
		return promise.then(processFetchCredentials, promiseRejected);
	},

	addMessage: function(sender, recipient, message) {
		let sql = `INSERT INTO Message(sender, recipient, message, timeSent)
				   VALUES(?, ?, ?, datetime('now')`;
		db.run(sql, [sender, recipient, message], (err) => {
			if (err) throw err;
			else console.log("New message added!");			
		});
	},
	
	getNewMessages: function(username) {
		let sql = `SELECT sender, message, timeSent 
				  FROM Message WHERE recipient = ? AND 
				  timeSent > (Select max(pollTime) from MessagePoll WHERE user = ?)`;
		var promise = new Promise((resolve, reject) => {
			db.all(sql, [username, username], (err, rows) => {
				if(err) reject(err);
				else resolve(rows);
			});
		});
		return promise.then(processGetNewMessages, promiseRejected);
	},

	addMessagePollEntry: function(username) {
		let sql = `INSERT INTO MessagePoll(user, pollTime) VALUES(?, datetime('now'))`;
		db.run(sql, [username], (err) =>{
			if(err) throw err;
			else console.log("Poll entry added"); 
		});
	}
};

function promiseRejected(err) {
	throw err;
};

function processGetNewMessages(rows) {
	var messages = []
	var promise = new Promise((resolve, reject) => {
		rows.forEach((row) => {
			messages.push({"sender": row.sender, "message": row.message, "time": row.timeSent});
		});
		resolve(messages);
	});

	function processRow(messages) {
		return messages
	};
	return promise.then(processRow); 
};

function processFetchCredentials(row) {
	var data = {"username": row.username, "password": row.password};
	return data;
};
