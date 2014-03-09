//
// mobbs.js
//


// 意図しないネームスペース汚染を防ぐため関数スコープで処理を囲む
$(document).ready(function(){
	
	// トピック一覧の動的生成
	// jQuery Mobileではページがロードさせる直前にpagebeforeshowイベントが
	// 発生する
	$('#topics').on('pagebeforeshow', function (event) {
		// 取得したtopic情報からHTMLコード片を作成する
		function markup(topic) {
			var html = '<li>'
			+ '<a href="/topic/' + topic.topicId + '/" data-ajax=false>'
			+ '<h3>' + topic.title + '</h3>'
			+ '<p>' + topic.text + '</p>'
			+ '<p class="ui-li-aside">' + topic.date
			+ ', by ' + topic.postBy + '</p>'
			+ '</a></li>';
			return html;
		}

		// リストビューの内容をクリアする
		$('#topics-listview').empty();

		// JSONでトピック情報を取得する
		$.getJSON('/api/topics/list', null, function (topics) {
			// 取得したトピック情報をリストビューに追加していく
			for (var i = 0; i < topics.length; i++) {
				var subItem = markup(topics[i]);
				$('#topics-listview').append(subItem);
			}
			// リストビューを再描画する
			$('#topics-listview').listview('refresh');
		});
	});

	$('#topic').on('pagebeforeshow', function (e, data) {
		function markup(comment) {
			var html = '<li>'
				+ '<a href="/comment/' + comment.commentId + '/" data-ajax=false>'
				+ '<h1>' + comment.title + '</h1>'
				+ '<p>' + comment.text + '</p>'
				+ '<p class="ui-li-aside">' + comment.date
				+ ', by ' + comment.postBy + '</p>'
				+ '</a></li>';
			return html;
		}

		$('#comments-listview').empty();

		var topicId = $('#comments-listview').attr('mobbs-topic-id');
		$.getJSON('/api/comments/list?parentTopicId=' + topicId, null, function (comments) {
			for (var i = 0; i < comments.length; i++) {
				var subItem = markup(comments[i]);
				$('#comments-listview').append(subItem);
			}
			$('#comments-listview').listview('refresh');
		});
	});

	$('#comment').on('pagebeforeshow', function (e, data) {
		function markup(comment) {
			var html = '<li>'
				+ '<a href="/comment/' + comment.commentId + '/" data-ajax=false>'
				+ '<h1>' + comment.title + '</h1>'
				+ '<p>' + comment.text + '</p>'
				+ '<p class="ui-li-aside">' + comment.date
				+ ', by ' + comment.postBy + '</p>'
				+ '</a></li>';
			return html;
		}

		$('#subcomments-listview').empty();
		var commentId = $('#subcomments-listview').attr('mobbs-comment-id');
		$.getJSON('/api/comments/list?parentCommentId=' + commentId, null, function (comments) {
			for (var i = 0; i < comments.length; i++) {
				var subItem = markup(comments[i]);
				$('#subcomments-listview').append(subItem);
			}
			$('#subcomments-listview').listview('refresh');
		});
	});

// スコープ終了
}).apply(this);
