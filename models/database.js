var mongodb = require('mongodb');
var database = exports;
//var config = require('../config');

/**
var mongodb = require('mongodb');
var database = exports;
var config = require('../config');
*/

//Database　クラスの作成
var Database = function(){};

Database.prototype._open = function (callback) {
	if (this._db) {
		callback(null, this._db);
		return;
	}
	var database = 'mobbs';
	var server = new mongodb.Server('127.0.0.1', 27017,{});
	var db_connector = new mongodb.Db(database, server, {safe:true});
	var self = this;

	db_connector.open(function (err, db) {
		if (err) {
			callback(err);
			return;
		}
		self._db = db;
		callback(null, self._db);
	});
}

Database.prototype.close = function () {
	if (this._db) {
		this._db.close();
		delete this._db;
	}
}

//_getCollection　メソッドの作成
Database.prototype._getCollection = function (collectionName, callback) {
	this._open(function (err, db) {
		db.createCollection(collectionName, callback);
	});
}



//Topics クラスの作成
var Topics = function () {};
Topics.prototype = new Database();

database.getTopics = function () {
	return new Topics();
}

Topics.prototype.getLatest = function (start, end, callback) {
	this._getCollection('topics', function(err, collection) {
		if (err) {
			callback(err);
			return;
		}
		var cursor = collection.find({});
		cursor.sort([['date', -1]]).limit(end - start).skip(start);
		cursor.toArray(callback);
	});
}

Topics.prototype.findById = function (topicId, callback) {
	this._getCollection('topics', function(err, collection) {
		if (err) {
			callback(err);
			return;
		}
		collection.findOne({topicId: topicId}, callback);
	});
}


Topics.prototype.insert = function(topic, callback) {
	var self = this;
	self._getCollection('counters', function(err, collection) {
		if (err) {
			callback(err);
			return;
		}
		collection.findAndModify({name:'topics'}, {}, {$inc: {count:1}}, createTopic);
	});

	function createTopic(err, counter) {
		var nextId = counter.count;
		var newTopic = {
			topicId: nextId,
			title: topic.title,
			text: topic.text,
			date: new Date(),
			postBy: topic.postBy || '',
			relatedUrl: topic.relatedUrl || '',
			replies: []
		};

		self._getCollection('topics', function(err, collection) {
			if (err) {
				callback(err);
				return;
			}
			collection.insert(newTopic, function (err, obj) {
				if (err) {
					callback(err);
					return;
				}
				callback(err, obj[0]);
			});
		});
	}
}



//Comments クラスの作成
var Comments = function () {};
Comments.prototype = new Database();

database.getComments = function() {
	return new Comments();
}

Comments.prototype.findById = function (commentId, callback) {
	this._getCollection('comments', function (err, collection) {
		if (err) {
			callback(err);
			return;
		}
		if (typeof commentId === 'number') {
			collection.findOne({commentId: commentId}, callback);
		} else {
			var cursor = collection.find({commentId: {$in: commentId}});
			cursor.sort([['date', -1]]);
			cursor.toArray(callback);
		}
	});
}

Comments.prototype.insert = function (topicId, comment, callback) {
	console.log('insert comment');
	var self = this;
	self._getCollection('counters', function (err, collection) {
		if (err) {
			callback(err);
			return;
		}
		collection.findAndModify({name:'comments'}, {}, {$inc: {count:1}}, createComment); 
	});

	function createComment(err, counter) {
		var nextId = counter.count;
		var newComment = {
			commentId: nextId,
			topicId: topicId,
			title: comment.title,
			text: comment.text,
			date: new Date(),
			postBy: comment.postBy || '',
			relatedUrl: comment.relatedUrl || '',
			replies: [],
			parentCommentId: (comment.parentCommentId === undefined) ? null : comment.parentCommentId
		};

		if (newComment.parentCommentId === null) {
			appendReplyToTopic(newComment, function(err) {
				if (err) {
					callback(err);
					return;
				}
				insertComment(newComment);
			});
		} else {
			appendReplyToComment(newComment, function(err) {
				if (err) {
					callback(err);
					return;
				}
				insertComment(newComment);
			});
		}
	}

	function appendReplyToComment(comment, callback) {
		var parentId = comment.parentCommentId;
		var childId = comment.commentId;
		self._getCollection('comments', function (err, collection) {
			if (err) {
				callback(err);
				return;
			}
			collection.findAndModify({commentId:parentId}, {}, {$push:{replies:childId}}, callback);
		});
	}

	function appendReplyToTopic(comment, callback) {
		var parentId = comment.topicId;
		var childId = comment.commentId;
		self._getCollection('topics', function(err, collection) {
			if (err) {
				callback(err);
				return;
			}
			collection.findAndModify({topicId:parentId}, {}, {$push:{replies:childId}}, callback);
		});
	}

	function insertComment(newComment) {
		self._getCollection('comments', function (err, collection) {
			if (err) {
				callback(err);
				return;
			}
			collection.insert(newComment, {}, function (err, obj) {
				if (err) {
					callback(err);
					return;
				}
				callback(err, obj[0]);
			});
		});
	}
}