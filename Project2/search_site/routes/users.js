var express = require('express');
var router = express.Router();
var userDAO = require('../dao/userDAO');

router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  userDAO.getByUsername(username, function (user) {
    if (user.length == 0) {
      res.json({ msg: '用户不存在！请检查后输入' });

    } else {
      userDAO.getState(username, function (state) {
        if (state[0].state == 'freeze') {
          res.json({ msg: '用户已冻结，暂不支持登录！' });
        } else {
          if (password === user[0].password) {
            req.session['username'] = username;
            res.cookie('username', username);
            res.json({ msg: 'ok' });
          } else {
            res.json({ msg: '用户名或密码错误！请检查后输入' });
          }
        }
      })
    }
  });
});

/* add users */
router.post('/register', function (req, res) {
  var add_user = req.body;
  // 先检查用户是否存在
  userDAO.getByUsername(add_user.username, function (user) {
    if (user.length != 0) {
      // res.render('index', {msg:'用户不存在！'});
      res.json({ msg: '用户已存在！' });
    } else {
      userDAO.add(add_user, function (success) {
        res.json({ msg: '成功注册！请登录' });
      })
    }
  });

});

// 管理用户
router.get('/manage', function (req, res, next) {
  var user = req.session;
  if (user['username'] === undefined) {
    response.json({ message: 'url', result: '/index.html' });
  } else {
    userDAO.getPower(user.username, function (powerflag) {
      // 返回的powerflag为：[ RowDataPacket { power: 1 } ]
      if (powerflag[0].power != 'super') {
        // res.json({ msg: '您并非管理员，暂无该权限' });
        res.json({ msg: 'url', result: '/news.html' });
      } else {
        res.json({ result: '/manage.html' });
      }
    })
  }
});

// 退出登录
router.get('/logout', function (req, res, next) {
  // 备注：这里用的 session-file-store 在destroy 方法里，并没有销毁cookie
  // 所以客户端的 cookie 还是存在，导致的问题 --> 退出登陆后，服务端检测到cookie
  // 然后去查找对应的 session 文件，报错
  // session-file-store 本身的bug
  req.session.destroy(function (err) {
    if (err) {
      res.json('退出登录失败');
      return;
    }

    // req.session.loginUser = null;
    res.clearCookie('username');
    res.json({ result: '/index.html' });
  });
});

router.get('/searchUser', function (req, res) {
  var user = req.session['username'];
  if (user === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    userDAO.getAllUsers(function (names) {
      // console.log("lalalalalname:",names);
      if (names.length != 0) {
        res.json({ message: 'data', result: names });
      }
    })
  }
});

router.get('/power', function (req, res) {
  var user = req.session['username'];
  if (user === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    var param = req.query;
    userDAO.powerUser(param["user_power"], function (success) {
      res.json({ msg: '修改成功！' });
    })
  }
});

router.get('/unpower', function (req, res) {
  var user = req.session['username'];
  if (user === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    var param = req.query;
    userDAO.unpowerUser(param["user_unpower"], function (success) {
      res.json({ msg: '修改成功！' });
    })
  }
});

router.get('/freeze', function (req, res) {
  var user = req.session['username'];
  if (user === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    var param = req.query;
    userDAO.freezeUser(param["user_freeze"], function (success) {
      res.json({ msg: '修改成功！' });
    })
  }
});

router.get('/unfreeze', function (req, res) {
  var user = req.session['username'];
  if (user === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    var param = req.query;
    userDAO.unfreezeUser(param["user_unfreeze"], function (success) {
      res.json({ msg: '修改成功！' });
    })
  }
});

router.get('/history', function (req, res) {
  var user = req.session['username'];
  console.log(user);
  if (req.session['username'] === undefined) {
    res.json({ message: 'url', result: '/index.html' });
  } else {
    var param = req.query;
    userDAO.getHistory(param["user_history"], function (historys) {
      if (historys.length != 0) {
        res.json({ message: 'data', result: historys });
      }
    })
  }
});

module.exports = router;