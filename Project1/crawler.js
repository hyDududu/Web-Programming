var fs = require('fs');
var myRequest = require('request');
var myCheerio = require('cheerio');
var myIconv = require('iconv-lite');
// var Buffer = require('buffer').Buffer;  // 缓冲区
require('date-utils');
var mysql = require('./mysql.js');

var myEncoding = "utf-8";

var source_name_chinanews = "中国新闻网";
var seedURL_chinanews = 'http://www.chinanews.com/';
var source_name_sina = "新浪新闻网";
var seedURL_sina = 'https://news.sina.com.cn/china/';
var source_name_xinhua = "新华网";
// var seedURL_xinhua = 'http://www.xinhuanet.com/gangao/';
var seedURL_xinhua = 'http://www.xinhuanet.com/fortunepro/';
var source_name_gmw = "光明网";
var seedURL_gmw = 'https://news.gmw.cn/';
var source_name_people = "中国共产党新闻网";
var domin_people = 'http://jhsjk.people.cn/';
var seedUrl_people = 'http://jhsjk.people.cn/result/';

var seedURL_format = "$('a')";  // 属性选择器
var keywords_format = " $('meta[name=\"keywords\"]').eq(0).attr(\"content\")";
var desc_format = " $('meta[name=\"description\"]').eq(0).attr(\"content\")";
var regExp = /((\d{4}|\d{2})(\-|\/|\.)\d{1,2}\3\d{1,2})|(\d{4}年\d{1,2}月\d{1,2}日)/
// chinanews
var title_format_chinanews = "$('title').text()";
var date_format_chinanews = "$('#pubtime_baidu').text()";  // .:class；#:id
var author_format_chinanews = "$('#editor_baidu').text()";
var content_format_chinanews = "$('.left_zw').text()";
var source_format_chinanews = "$('#source_baidu').text()";
var url_reg_chinanews = /\/(\d{4})\/(\d{2})-(\d{2})\/(\d{7}).shtml/;  // 匹配 2021/04-21/9460219.shtml 格式
// sina
var title_format_sina = "$('.main-title').text()";
var date_format_sina = "$('span.date').text()";  // class='data'的span
var author_format_sina = "$('p.show_author').text()";  // class='show_author'的p
var content_format_sina = "$('.article').text()";
var source_format_sina = "$('a.source').text()";
var url_reg_sina = /\/(\d{4})-(\d{2})-(\d{2})\/(\w{3})-(\w{8})(\d{7}).shtml/;  // 匹配 2021-04-21/doc-ikmxzfmk8048801.shtml 格式
// xinhua
var title_format_xinhua = "$('title').text()";
var date_format_xinhua = "$('.info').text()";
var author_format_xinhua = "$('.editor').text()";
var content_format_xinhua = "$('#detail').text()";
var source_format_xinhua = "$('.source').text()";
var url_reg_xinhua = /\/(\d{4})-(\d{2})\/(\d{2})\/(\w{1})_(\d{10}).htm/;
// gmw
var title_format_gmw = "$('.u-title').text()";
var date_format_gmw = "$('.m-con-time').text()";
var author_format_gmw = "$('span.liability').text()";
var content_format_gmw = "$('.u-mainText').text()";
var source_format_gmw = "$('.m-con-source').find('a').text()";  // 找m-con-source下的a
var url_reg_gmw = /\/(\d{4})-(\d{2})\/(\d{2})\/content_(\d{8}).htm/;
// people
var title_format_people = "$('.d2txt').find('h1').text()";  // 找d2txt下的h1
var date_format_people = "$('.d2txt_1').text()";
var author_format_people = "$('.editor').text()";
var content_format_people = "$('.d2txt_con').text()";
var source_format_people = "$('.d2txt_1').text()";
var url_reg_people = /\/article\/(\d{8})/;


//防止网站屏蔽我们的爬虫
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

//request模块异步fetch url
function request(url, callback) {
    var options = {
        url: url,
        encoding: null,
        //proxy: 'http://x.x.x.x:8080',
        headers: headers,
        timeout: 10000 //
    }
    myRequest(options, callback)
};


function seedget(seedURL, url_reg, source_name, title_format, date_format, author_format, content_format, source_format) {
    request(seedURL, function (err, res, body) { //读取种子页面
        try {
            //用iconv转换编码
            var html = myIconv.decode(body, myEncoding);
            //console.log(html);
            //准备用cheerio解析html
            var $ = myCheerio.load(html, { decodeEntities: true });
        } catch (e) { console.log('读种子页面并转码出错：' + e) };
        var seedURL_news;
        try {
            seedURL_news = eval(seedURL_format);
        } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
        seedURL_news.each(function (i, e) { //遍历种子页面里所有的a链接
            var myURL = "";
            try {
                //得到具体新闻url
                var href = "";
                href = $(e).attr("href");
                if (href == undefined) return;
                if (href.toLowerCase().indexOf('http') >= 0) myURL = href;  // 匹配http://和https://开头的
                else if (href.startsWith('//')) myURL = 'http:' + href;  // //开头的
                else myURL = seedURL.substr(0, seedURL.lastIndexOf('/') + 1) + href;  // 其他
                // console.log("myurl:  "+myURL);
            } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) }

            if (!url_reg.test(myURL)) {
                // console.log(myURL);
                return; //检验是否符合新闻url的正则表达式
            }

            // 查找判断SQL中是否存在该网页
            ifInSql(myURL, source_name, title_format, date_format, author_format, content_format, source_format);
            // newsGet(myURL, source_name, title_format, date_format, author_format, content_format, source_format);
        });
    });
};


function seedget_People(seedURL, url_reg, source_name, title_format, date_format, author_format, content_format, source_format) {
    for (i = 1; i <= 5; i++) {
        seedUrl = seedURL + String(i);
        // console.log(seedURL);

        request(seedUrl, function (err, res, body) { //读取种子页面
            // try {
            //用iconv转换编码
            var html = myIconv.decode(body, myEncoding);
            // console.log(html);
            //准备用cheerio解析html
            var $ = myCheerio.load(html, { decodeEntities: true });
            // } catch (e) { console.log('读种子页面并转码出错：' + e) };
            var seedurl_news;
            try {
                seedurl_news = eval(seedURL_format);
            } catch (e) { console.log('url列表所处的html块识别出错：' + e) };
            seedurl_news.each(function (i, e) { //遍历种子页面里所有的a链接
                var myURL = "";
                try {
                    //得到具体新闻url
                    var href = "";
                    href = $(e).attr("href");
                    if (href == undefined) return;
                    // console.log(href.toLowerCase());
                    if (href.toLowerCase().indexOf('http://') >= 0) myURL = href;  // 匹配http://开头的
                    else if (href.startsWith('//')) myURL = 'http:' + href;  // //开头的
                    else myURL = domin_people.substr(0, domin_people.lastIndexOf('/') + 1) + href;  // 其他
                    // console.log("myurl:  " + myURL);

                } catch (e) { console.log('识别种子页面中的新闻链接出错：' + e) }

                if (!url_reg.test(myURL)) {
                    // console.log(myURL);
                    return; //检验是否符合新闻url的正则表达式
                }

                // 查找判断SQL中是否存在该网页
                ifInSql(myURL, source_name, title_format, date_format, author_format, content_format, source_format);
                // newsGet(myURL, source_name, title_format, date_format, author_format, content_format, source_format);
            });
        });
    }
};


function ifInSql(myURL, source_name, title_format, date_format, author_format, content_format, source_format) {
    var fetch_url_Sql = 'select url from fetches where url=?';
    var fetch_url_Sql_Params = [myURL];
    mysql.query(fetch_url_Sql, fetch_url_Sql_Params, function (qerr, vals, fields) {
        if (vals.length > 0) {
            console.log('URL duplicate!')
        } else {
            newsGet(myURL, source_name, title_format, date_format, author_format, content_format, source_format); //读取新闻页面
        }
    });
};


function newsGet(myURL, source_name, title_format, date_format, author_format, content_format, source_format) { //读取新闻页面
    request(myURL, function (err, res, body) { //读取新闻页面
        try {
            var html_news = myIconv.decode(body, myEncoding); //用iconv转换编码
            // console.log("myURL:  "+myURL);
            // console.log("html_news:  "+html_news);
            //准备用cheerio解析html_news
            var $ = myCheerio.load(html_news, { decodeEntities: true });
            myhtml = html_news;
        } catch (e) {
            // console.log('读新闻页面并转码出错：' + e);
            return;
        };

        console.log("转码读取成功:" + myURL);
        //动态执行format字符串，构建json对象准备写入文件或数据库
        var fetch = {};
        fetch.title = "";
        fetch.content = "";
        fetch.publish_date = (new Date()).toFormat("YYYY-MM-DD");
        //fetch.html = myhtml;
        fetch.url = myURL;
        fetch.source_name = source_name;
        fetch.source_encoding = myEncoding; //编码
        fetch.crawltime = new Date();

        if (keywords_format == "") fetch.keywords = source_name; // eval(keywords_format);  //没有关键词就用sourcename
        else fetch.keywords = eval(keywords_format);
        // console.log("111 key:  "+fetch.keywords);

        if (title_format == "") fetch.title = ""
        else fetch.title = eval(title_format).replace(/\s+/, ""); //标题，去除空格
        // console.log("222 title: " + fetch.title);

        if (date_format != "") {
            if (source_name == source_name_people) {
                fetch.publish_date = eval(date_format).replace("发布日期：", "").split(/\s+/)[1]; //刊登日期   
            }
            else {
                fetch.publish_date = eval(date_format); //刊登日期 
            }
            if (regExp.exec(fetch.publish_date) != null) {
                fetch.publish_date = regExp.exec(fetch.publish_date)[0];
                fetch.publish_date = fetch.publish_date.replace('年', '-')
                fetch.publish_date = fetch.publish_date.replace('月', '-')
                fetch.publish_date = fetch.publish_date.replace('日', '')
                fetch.publish_date = new Date(fetch.publish_date).toFormat("YYYY-MM-DD");
            }
        }
        // console.log("33333 data: " + fetch.publish_date);


        if (author_format == "") fetch.author = source_name; //eval(author_format);  //作者
        else fetch.author = eval(author_format).replace("【", "").replace("】", "").replace("(", "").replace(")", "").replace(/\s+/, "");
        // console.log("444 author: " + fetch.author);

        if (content_format == "") fetch.content = "";
        else fetch.content = eval(content_format).replace("\r\n" + fetch.author, "").replace(/\s+/, " "); //内容,是否要去掉作者信息自行决定
        // console.log("55 content: " + fetch.content);

        if (source_format == "") fetch.source = fetch.source_name;
        else {
            if (source_name == source_name_people) {
                fetch.source = eval(source_format).replace("\r\n", "").replace("来源：", "").split(/\s+/)[0];
            }
            else {
                fetch.source = eval(source_format).replace("\r\n", "").replace("来源：", ""); //来源
            }
        }
        // console.log("6666 sour: " + fetch.source);

        if (desc_format == "") fetch.desc = fetch.title;
        else {
            if (eval(desc_format) != null)
                fetch.desc = eval(desc_format).replace("\r\n", ""); //摘要    
        }
        // console.log("77777 desc: "+fetch.desc);

        // var filename = source_name + "_" + (new Date()).toFormat("YYYY-MM-DD") +
        //     "_" + myURL.substr(myURL.lastIndexOf('/') + 1) + ".json";
        // ////存储json
        // fs.writeFileSync(filename, JSON.stringify(fetch));

        var fetchAddSql = 'INSERT INTO fetches(url,source_name,source_encoding,title,' +
            'keywords,author,publish_date,crawltime,content) VALUES(?,?,?,?,?,?,?,?,?)';
        var fetchAddSql_Params = [fetch.url, fetch.source, fetch.source_encoding,
        fetch.title, fetch.keywords, fetch.author, fetch.publish_date,
        fetch.crawltime.toFormat("YYYY-MM-DD HH24:MI:SS"), fetch.content
        ];

        //执行sql，数据库中fetch表里的url属性是unique的，不会把重复的url内容写入数据库
        mysql.query(fetchAddSql, fetchAddSql_Params, function (qerr, vals, fields) {
            if (qerr) {
                console.log(qerr);
            }
        }); //mysql写入
    });
}

seedget(seedURL_chinanews, url_reg_chinanews, source_name_chinanews, title_format_chinanews, date_format_chinanews, author_format_chinanews, content_format_chinanews, source_format_chinanews);
// seedget(seedURL_sina, url_reg_sina, source_name_sina, title_format_sina, date_format_sina, author_format_sina, content_format_sina, source_format_sina);
// seedget(seedURL_xinhua, url_reg_xinhua, source_name_xinhua, title_format_xinhua, date_format_xinhua, author_format_xinhua, content_format_xinhua, source_format_xinhua);
// seedget(seedURL_gmw, url_reg_gmw, source_name_gmw, title_format_gmw, date_format_gmw, author_format_gmw, content_format_gmw, source_format_gmw);
// seedget_People(seedUrl_people, url_reg_people, source_name_people, title_format_people, date_format_people, author_format_people, content_format_people, source_format_people);
