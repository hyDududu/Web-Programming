var app = angular.module('manage', []);
app.controller('manage_Ctrl', function ($scope, $http, $timeout) {

    $scope.logout = function () {

        $http.get("/users/logout").then(
            function (res) {
                window.location.href = res.data.result;

            }, function (err) {
                $scope.msg = err.data;
            }
        );

    };

    $scope.searchUser = function () {
        $scope.isShowUsers = true;   // 显示表格查询用户结果
        $scope.isShowHistorys = false;  // 显示表格查询用户历史记录结果
        
        $http.get("/users/searchUser").then(
            function (res) {
                if (res.data.message == 'data') {
                    $scope.users = res.data.result;
                    $scope.user_num = $scope.users.length;
                    // $scope.initPageSort($scope.users)
                }
            }, function (err) {
                $scope.msg = err.data;
            });
    };

    $scope.power = function () {
        $scope.isShowUsers = false;
        $scope.isShowHistorys = false;

        var user_power = $scope.user_power;
        var power_url = `/users/power?user_power=${user_power}`;
        $http.get(power_url).then(
            function (res) {
                $scope.power_msg = res.data.msg;
            }, function (err) {
                $scope.msg = err.data;
            });
    };

    $scope.unpower = function () {
        $scope.isShowUsers = false;
        $scope.isShowHistorys = false;

        var user_unpower = $scope.user_unpower;
        var unpower_url = `/users/unpower?user_unpower=${user_unpower}`;
        $http.get(unpower_url).then(
            function (res) {
                $scope.unpower_msg = res.data.msg;
            }, function (err) {
                $scope.msg = err.data;
            });
    };

    $scope.freeze = function () {
        $scope.isShowUsers = false;
        $scope.isShowHistorys = false;

        var user_freeze = $scope.user_freeze;
        var freeze_url = `/users/freeze?user_freeze=${user_freeze}`;
        $http.get(freeze_url).then(
            function (res) {
                $scope.freeze_msg = res.data.msg;
            }, function (err) {
                $scope.msg = err.data;
            });
    };

    $scope.unfreeze = function () {
        $scope.isShowUsers = false;
        $scope.isShowHistorys = false;

        var user_unfreeze = $scope.user_unfreeze;
        var unfreeze_url = `/users/unfreeze?user_unfreeze=${user_unfreeze}`;
        $http.get(unfreeze_url).then(
            function (res) {
                $scope.unfreeze_msg = res.data.msg;
            }, function (err) {
                $scope.msg = err.data;
            });
    };

    $scope.history = function () {
        $scope.isShowUsers = false;
        $scope.isShowHistorys = true;

        var user_history = $scope.user_history;
        var history_url = `/users/history?user_history=${user_history}`;
        $http.get(history_url).then(
            function (res) {
                if (res.data.message == 'data') {
                    $scope.historys = res.data.result;
                    $scope.history_num = $scope.historys.length;
                    $scope.initPageSort($scope.historys)
                }
            }, function (err) {
                $scope.msg = err.data;
            });
    };


    // 分页
    $scope.initPageSort = function (history) {
        $scope.pageSize = 8;　　//每页显示的数据量，可以随意更改
        $scope.selPage = 1;
        $scope.data = history;
        $scope.pages = Math.ceil($scope.data.length / $scope.pageSize); //分页数
        $scope.pageList = [];  //最多显示5页，后面6页之后不会全部列出页码来
        $scope.index = 1;
        // var page = 1;
        // for (var i = page; i < $scope.pages+1 && i < page+5; i++) {
        //     $scope.pageList.push(i);
        // }
        var len = $scope.pages > 5 ? 5 : $scope.pages;
        $scope.pageList = Array.from({ length: len }, (x, i) => i + 1);

        //设置表格数据源(分页)
        $scope.historys = $scope.data.slice(0, $scope.pageSize);

    };

    //打印当前选中页
    $scope.selectPage = function (page) {
        //不能小于1大于最大（第一页不会有前一页，最后一页不会有后一页）
        if (page < 1 || page > $scope.pages) return;
        //最多显示分页数5，开始分页转换
        var pageList = [];
        if (page > 2) {
            for (var i = page - 2; i <= $scope.pages && i < page + 3; i++) {
                pageList.push(i);
            }
        } else {
            for (var i = page; i <= $scope.pages && i < page + 5; i++) {
                pageList.push(i);
            }
        }

        $scope.index = (page - 1) * $scope.pageSize + 1;
        $scope.pageList = pageList;
        $scope.selPage = page;
        $scope.historys = $scope.data.slice(($scope.pageSize * (page - 1)), (page * $scope.pageSize));//通过当前页数筛选出表格当前显示数据
        console.log("选择的页：" + page);
    };

    //设置当前选中页样式
    $scope.isActivePage = function (page) {
        return $scope.selPage == page;
    };
    //上一页
    $scope.Previous = function () {
        $scope.selectPage($scope.selPage - 1);
    };
    //下一页
    $scope.Next = function () {
        $scope.selectPage($scope.selPage + 1);
    };

});