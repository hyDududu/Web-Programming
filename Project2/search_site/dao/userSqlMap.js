var userSqlMap = {
    add: 'insert into user(username, password, power, state) values(?, ?, \'normal\', \'normal\')',  //注册时用，默认非管理员
    getByUsername: 'select username, password from user where username = ?',  //登陆时用
    getPower: 'select power from user where username = ?',  // 查询该用户是否是管理员
    getAllUsers: 'select * from user',  // 查询所有用户
    freezeUser: 'update user set state = \'freeze\' where username = ?',  // 冻结用户
    unfreezeUser: 'update user set state = \'normal\' where username = ?',  // 解冻用户
    powerUser: 'update user set power = \'super\' where username = ?',  // 设置用户为管理员
    unpowerUser: 'update user set power = \'normal\' where username = ?',  // 取消用户管理员权限
    getHistory: 'select * from user_action where username = ?',  // 获取用户历史记录
    getState: 'select state from user where username = ?',  // 查询用户状态
};

module.exports = userSqlMap;