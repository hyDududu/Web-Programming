var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

module.exports = {
    query_noparam :function(sql, callback) {
        pool.getConnection(function(err, conn) {
            if (err) {
                callback(err, null, null);
            } else {
                conn.query(sql, function(qerr, vals, fields) {
                    conn.release(); //释放连接
                    callback(qerr, vals, fields); //事件驱动回调
                });
            }
        });
    },
    search :function(searchparam, callback) {
        // 组合查询条件
        var sql = 'select * from fetches ';

        if(searchparam["t2"]!="undefined"){
            sql +=(`where title like '%${searchparam["t1"]}%' ${searchparam['ts']} title like '%${searchparam["t2"]}%' `);
        }else if(searchparam["t1"]!="undefined"){
            sql +=(`where title like '%${searchparam["t1"]}%' `);
        };

        if(searchparam["t1"]=="undefined"&&searchparam["t2"]=="undefined"&&searchparam["c1"]!="undefined"){
            sql+='where ';
        }else if(searchparam["t1"]!="undefined"&&searchparam["c1"]!="undefined"){
            sql+='and ';
        }

        if(searchparam["c2"]!="undefined"){
            sql +=(`content like '%${searchparam["c1"]}%' ${searchparam['cs']} content like '%${searchparam["c2"]}%' `);
        }else if(searchparam["c1"]!="undefined"){
            sql +=(`content like '%${searchparam["c1"]}%' `);
        }

        if(searchparam["t1"]=="undefined"&&searchparam["t2"]=="undefined"&&searchparam["c1"]=="undefined"&&searchparam["c1"]=="undefined"){
            if(searchparam["a"]!="undefined"){
                sql += (`where author like '%${searchparam["a"]}%' `);
            }
        }else if(searchparam["a"]!="undefined"){
            sql+= (`and author = '${searchparam["a"]}' `);
        }

        if(searchparam["t1"]=="undefined"&&searchparam["t2"]=="undefined"&&searchparam["c1"]=="undefined"&&searchparam["c1"]=="undefined"&&searchparam["a"]=="undefined"){
            if(searchparam["s"]!="undefined"){
                sql += (`where source_name = '${searchparam["s"]}' `);
            }
        }else if(searchparam["s"]!="undefined"){
            sql+= (`and source_name = '${searchparam["s"]}' `);
        }

        if(searchparam['stime']!="undefined"){
            if(searchparam['stime']=="1"){
                sql+='ORDER BY publish_date ASC ';
            }else {
                sql+='ORDER BY publish_date DESC ';
            }
        }

        sql+=';';
        pool.getConnection(function(err, conn) {
            if (err) {
                callback(err, null, null);
            } else {
                conn.query(sql, function(qerr, vals, fields) {
                    conn.release(); //释放连接
                    callback(qerr, vals, fields); //事件驱动回调
                });
            }
        });
    },

};
