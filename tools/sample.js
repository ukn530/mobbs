/**
  * sample data for mobbs
  */
 
 var topics = [];
 var comments = [];
 var topicCount = 0;
 var commentCount = 0;
 
 function newTopic(topic) {
   topics[topicCount] = {
     topicId: topicCount,
     title: topic.title,
     text: topic.text,
     date: new Date(2011, 10, 1, 12, 12, 12),
     postBy: topic.postBy || '',
     relatedUrl: topic.relatedUrl || '',
     replies: topic.replies || []
   };
   topicCount++;
 }
 
 function newComment(comment) {
   comments[commentCount] = {
     topicId: comment.topicId,
     commentId: commentCount,
     title: comment.title,
     text: comment.text,
     date: new Date(2011, 10, 1, 12, 12, 12),
     postBy: comment.postBy || '',
     relatedUrl: comment.relatedUrl || '',
     replies: comment.replies || [], 
     parentCommentId: comment.parentCommendId || null
   };
   commentCount++;
 }
 
 newTopic({
   title: 'トピック1：これはトピック#1です',
   text: 'トピック1：これはテスト用トピック1です。',
   postBy: 'Taro',
   relatedUrl: 'http://example.com/',
   replies: [0, 2]
 });
 
 newComment({
   topicId: 0,
   title: 'コメント01',
   text: 'これはテスト用コメント01です。',
   postBy: 'Jiro',
   relatedUrl: 'http://example.com/01',
   replies: [2]
 });
 
 newComment({
   topicId: 0,
   title: 'Re:コメント01',
   text: 'これはテスト用コメント01への返信です。',
   postBy: 'Saburo',
   relatedUrl: 'http://example.com/01-r01',
   parentCommentId: 1
 });
 
 newComment({
   topicId: 0,
   title: 'コメント02',
   text: 'これはテスト用コメント02です。',
   postBy: 'Shiro',
   relatedUrl: 'http://example.com/02',
 });
 
 newTopic({
   title: 'トピック2：これはトピック#2です',
   text: 'トピック2：これはテスト用トピック2です。',
   postBy: 'Jiro',
   relatedUrl: 'http://example.com/02',
 });
 
 newTopic({
   title: 'トピック3：これはトピック#3です',
   text: 'トピック3：これはテスト用トピック3です。',
   date: new Date(2011, 10, 4, 12, 12, 12),
   postBy: 'Saburo',
   relatedUrl: 'http://example.com/03',
 });
 
 // トピックデータの投入
 // データベースの全要素を削除
 db.topics.remove();
 
 // データベースにデータを投入
 for (var i = 0; i < topics.length; i++) {
   db.topics.save(topics[i]);
 }
 
 // コメントデータの投入
 db.comments.remove();
 for (var i = 0; i < comments.length; i++) {
   db.comments.save(comments[i]);
 }
 
 // カウンタの投入
 db.counters.remove();
 db.counters.save({name: 'topics', count: topicCount});
 db.counters.save({name: 'comments', count: commentCount});