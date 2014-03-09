
/*
 * GET home page.
 */

var database = require('../models/database');

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.topicsList = function(req, res) {
	var topics = database.getTopics();
	topics.getLatest(0, 10, function (err, items) {
		topics.close();
		if (err) {
			res.send(404);
			return;
		}
		res.json(200, items);
		return;
	});
};

exports.createTopic = function(req, res) {
	
	var newTopic = {
		postBy: req.body.postBy,
		title: req.body.title,
		relatedUrl: req.body.relatedUrl,
		text: req.body.text
	};

	var topics = database.getTopics();
	topics.insert(newTopic, function (err, topic) {
		topics.close();
		if (err) {
			res.send(500);
			return;
		}
		res.redirect('/topic/' + topic.topicId + '/');
	});
};

exports.topic = function(req, res){
	var topicId = Number(req.params.topicId);
	if (isNaN(topicId)) {
		res.send(404);
		return;
	}

	var topics = database.getTopics();
	topics.findById(topicId, function (err, topic) {
		topics.close();
		if (err) {
			res.send(500);
			return;
		}
		if (topic === null) {
			res.send(404);
			return;
		}
		res.render('topic', {
			topic: topic,
			title: 'トピック'
		});
	});
};


exports.commentsList = function (req, res) {
	console.log('commentlist');
	var parentTopicId = Number(req.query.parentTopicId);
	var parentCommentId = Number(req.query.parentCommentId);
	if (isNaN(parentTopicId) && isNaN(parentCommentId)) {
		res.send(404);
		return;
	}

	if (!isNaN(parentTopicId)) {
		var topics = database.getTopics();
		topics.findById(parentTopicId, function (err, topic) {
			topics.close();
			if (err) {
				res.send(404);
				return;
			}
			findComments(topic.replies);
			return;
		});
	}

	if (!isNaN(parentCommentId)) {
		var comments = database.getComments();
		comments.findById(parentCommentId, function (err, comment) {
			comments.close();
			if (err) {
				res.send(404);
				return;
			}
			findComments(comment.replies);
			return;
		});
	}

	function findComments(items) {
		var comments = database.getComments();
		comments.findById(items, function (err, items) {
			comments.close();
			if (err) {
				res.send(404);
				return;
			}
			res.json(200, items);
			return;
		});
	}
}


exports.createComment = function(req, res) {
	var comments = database.getComments();
	var topicId = Number(req.body.topicId);
	var newComment = {
		name: req.body.name,
		title: req.body.title,
		relatedUrl: req.body.relatedUrl,
		text: req.body.text,
		topicId: topicId,
		parentCommentId: (req.body.parentCommentId === undefined) ? null : Number(req.body.parentCommentId)
	};
		console.log('comments test')
	comments.insert(topicId, newComment, function (err, comment) {
		console.log('comments.insert test')
		comments.close();
		if(err) {
			console.log('comments.insert err')
			res.send(500);
			return;
		}
		res.redirect('/comment/' + comment.commentId + '/');
	});
}

exports.comment = function(req, res) {
	var commentId = Number(req.params.commentId);
	if (isNaN(commentId)) {
		res.send(404);
		return;
	}

	var comments = database.getComments();
	comments.findById(commentId, function(err, comment) {
		comments.close;
		if (err) {
			res.send(500);
			return;
		}
		if (comment === null) {
			comments.close();
			res.send(404);
			return;
		}
		var params = {
			comment: comment,
			title: 'コメント:' + comment.title
		};
		res.render('comment', params);
	});
};

