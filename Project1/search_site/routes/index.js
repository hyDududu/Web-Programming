var express = require('express');
var router = express.Router();
var mysql = require('../mysql.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/process_get', function (request, response) {
  //sql字符串和参数
  // console.log("111111"+request.query.title);
  // console.log("222222"+request.query.keywords);
  // console.log("333333"+request.query.author);
  var fetchSql = "select url,title,content,source_name,author,keywords,publish_date " +
    "from fetches where title like '%" + request.query.title + "%'" +
    "and keywords like '%" + request.query.keywords + "%'" +
    "and author like '%" + request.query.author + "%'";
  mysql.query(fetchSql, function (err, result, fields) {
    response.writeHead(200, {
      "Content-Type": "application/json"
    });
    response.write(JSON.stringify(result));
    response.end();
  });
});

router.get('/keywords_get', function (request, response) {
  //sql字符串和参数
  // console.log("222222"+request.query.keywords);
  var fetchSql = "select publish_date from fetches where keywords like '%" + request.query.keywords + "%'";
  mysql.query(fetchSql, function (err, result, fields) {
    response.writeHead(200, {
      "Content-Type": "application/json"
    });
    response.write(JSON.stringify(result));
    response.end();
  });
});

module.exports = router;
