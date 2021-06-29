var mysql = require('mysql');
var mysqlConf = require('../conf/mysqlConf');
var userSqlMap = require('./userSqlMap');
var pool = mysql.createPool(mysqlConf.mysql);
// 使用了连接池，重复使用数据库连接，而不必每执行一次CRUD操作就获取、释放一次数据库连接，从而提高了对数据库操作的性能。

module.exports = {
    add: function (user, callback) {
        pool.query(userSqlMap.add, [user.username, user.password], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    getByUsername: function (username, callback) {
        pool.query(userSqlMap.getByUsername, [username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    getPower: function (username, callback) {
        pool.query(userSqlMap.getPower, [username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    getAllUsers: function (callback) {
        pool.query(userSqlMap.getAllUsers, function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    freezeUser: function (username, callback) {
        pool.query(userSqlMap.freezeUser, [username], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    unfreezeUser: function (username, callback) {
        pool.query(userSqlMap.unfreezeUser, [username], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    powerUser: function (username, callback) {
        pool.query(userSqlMap.powerUser, [username], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    unpowerUser: function (username, callback) {
        pool.query(userSqlMap.unpowerUser, [username], function (error, result) {
            if (error) throw error;
            callback(result.affectedRows > 0);
        });
    },
    getHistory: function (username, callback) {
        pool.query(userSqlMap.getHistory, [username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
    getState: function (username, callback) {
        pool.query(userSqlMap.getState, [username], function (error, result) {
            if (error) throw error;
            callback(result);
        });
    },
};
