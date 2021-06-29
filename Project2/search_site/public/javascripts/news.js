var app = angular.module('news', []);
app.controller('news_Ctrl', function ($scope, $http, $timeout) {
    // 控制查询页面是否显示
    $scope.showSearch = function () {
        $scope.isShow = true;
        $scope.isShow2 = true;
        $scope.isisshowresult = false;

        // 再次回到查询页面时，表单里要保证都空的
        $scope.title1 = undefined;
        $scope.title2 = undefined;
        $scope.selectTitle = 'AND';
        $scope.content1 = undefined;
        $scope.content2 = undefined;
        $scope.selectContent = 'AND';
        $scope.author = undefined;
        $scope.source = undefined;
        $scope.sorttime = undefined;
    };

    $scope.logout = function () {
        $http.get("/users/logout").then(
            function (res) {
                window.location.href = res.data.result;

            }, function (err) {
                $scope.msg = err.data;
            }
        );

    };

    // 管理
    $scope.manage = function () {
        $http.get("/users/manage").then(
            function (res) {
                window.location.href = res.data.result;

            }, function (err) {
                $scope.msg = err.data;
            }
        );
    }

    // 查询数据
    $scope.search = function () {
        var title1 = $scope.title1;
        var title2 = $scope.title2;
        var selectTitle = $scope.selectTitle;
        var content1 = $scope.content1;
        var content2 = $scope.content2;
        var selectContent = $scope.selectContent;
        var author = $scope.author;
        var source = $scope.source;
        var sorttime = $scope.sorttime;

        // 检查用户传的参数是否有问题
        //用户有可能这样输入：___  and/or  新冠（直接把查询词输在了第二个位置）
        if (typeof title1 == "undefined" && typeof title2 != "undefined" && title2.length > 0) {
            title1 = title2;
        }
        if (typeof content1 == "undefined" && typeof content2 != "undefined" && content2.length > 0) {
            content1 = content2;
        }
        // 用户可能一个查询词都不输入，默认就是查找全部数据
        var myurl = `/news/search?t1=${title1}&ts=${selectTitle}&t2=${title2}&c1=${content1}&cs=${selectContent}&c2=${content2}&a=${author}&s=${source}&stime=${sorttime}`;

        $http.get(myurl).then(
            function (res) {
                if (res.data.message == 'data') {
                    $scope.isisshowresult = true; //显示表格查询结果
                    // $scope.searchdata = res.data;
                    $scope.initPageSort(res.data.result)
                } else {
                    window.location.href = res.data.result;
                }

            }, function (err) {
                $scope.msg = err.data;
            });
    };

    // 分页
    $scope.initPageSort = function (item) {
        $scope.pageSize = 5;　　//每页显示的数据量，可以随意更改
        $scope.selPage = 1;
        $scope.data = item;
        $scope.pages = Math.ceil($scope.data.length / $scope.pageSize); //分页数
        $scope.pageList = [];  //最多显示5页，后面6页之后不会全部列出页码来
        $scope.index = 1;
        $scope.datasize = $scope.data.length;  // 数据总数
        // var page = 1;
        // for (var i = page; i < $scope.pages+1 && i < page+5; i++) {
        //     $scope.pageList.push(i);
        // }
        var len = $scope.pages > 5 ? 5 : $scope.pages;
        $scope.pageList = Array.from({ length: len }, (x, i) => i + 1);

        //设置表格数据源(分页)
        $scope.items = $scope.data.slice(0, $scope.pageSize);

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
        $scope.items = $scope.data.slice(($scope.pageSize * (page - 1)), (page * $scope.pageSize));//通过当前页数筛选出表格当前显示数据
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

    $scope.searchsortASC = function () {
        $scope.sorttime = '1';
        $scope.search();
    };
    $scope.searchsortDESC = function () {
        $scope.sorttime = '2';
        $scope.search();
    };

    // 下面是四个图的操作
    $scope.histogram = function () {
        $scope.isShow = false;
        $scope.isShow2 = true;
        $http.get("/news/histogram")
            .then(
                function (res) {
                    if (res.data.message == 'url') {
                        window.location.href = res.data.result;
                    } else {

                        // var newdata = washdata(data);
                        let xdata = [], ydata = [], newdata;

                        var pattern = /\d{4}-(\d{2}-\d{2})/;
                        res.data.result.forEach(function (element) {
                            // "x":"2020-04-28T16:00:00.000Z" ,对x进行处理,只取 月日
                            xdata.push(pattern.exec(element["x"])[1]);
                            ydata.push(element["y"]);
                        });
                        newdata = { "xdata": xdata, "ydata": ydata };

                        var myChart = echarts.init(document.getElementById('main1'));

                        // 指定图表的配置项和数据
                        var option = {
                            title: {
                                text: '新闻发布数 随时间变化'
                            },
                            tooltip: {},
                            legend: {
                                data: ['新闻发布数']
                            },
                            xAxis: {
                                data: newdata["xdata"]
                            },

                            yAxis: {},
                            series: [{
                                name: '新闻数目',
                                type: 'bar',
                                data: newdata["ydata"]
                            }]
                        };
                        // 使用刚指定的配置项和数据显示图表。
                        myChart.setOption(option);
                    }
                },
                function (err) {
                    $scope.msg = err.data;
                });

    };

    $scope.pie = function () {
        $scope.isShow = false;
        $scope.isShow2 = true;
        $http.get("/news/pie").then(
            function (res) {
                if (res.data.message == 'url') {
                    window.location.href = res.data.result;
                } else {
                    let newdata = [];

                    res.data.result.forEach(function (element) {
                        var number = element["y"];
                        if (number > 10) {
                            newdata.push({ name: element["x"], value: number });
                        }
                    });

                    var myChart = echarts.init(document.getElementById('main1'));
                    var app = {};
                    option = null;
                    // 指定图表的配置项和数据
                    var option = {
                        title: {
                            text: '作者发布新闻数量(仅选取数量为10以上作者)',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left',
                            // data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                        },
                        series: [
                            {
                                name: '访问来源',
                                type: 'pie',
                                radius: '55%',
                                center: ['50%', '45%'],
                                data: newdata,
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };
                    // myChart.setOption(option);
                    app.currentIndex = -1;

                    setInterval(function () {
                        var dataLen = option.series[0].data.length;
                        // 取消之前高亮的图形
                        myChart.dispatchAction({
                            type: 'downplay',
                            seriesIndex: 0,
                            dataIndex: app.currentIndex
                        });
                        app.currentIndex = (app.currentIndex + 1) % dataLen;
                        // 高亮当前图形
                        myChart.dispatchAction({
                            type: 'highlight',
                            seriesIndex: 0,
                            dataIndex: app.currentIndex
                        });
                        // 显示 tooltip
                        myChart.dispatchAction({
                            type: 'showTip',
                            seriesIndex: 0,
                            dataIndex: app.currentIndex
                        });
                    }, 1000);
                    if (option && typeof option === "object") {
                        myChart.setOption(option, true);
                    }
                    ;
                }
            });
    };

    $scope.word_freq = function () {
        $scope.isShow = true;  // 调用wordSearch()后再显示
        $scope.isShow2 = false;
    };

    $scope.wordSearch = function () {
        $scope.isShow = false;

        var word_search = $scope.word_search;
        var word_url = `/news/wordSearch?word_search=${word_search}`;
        $http.get(word_url).then(
            function (res) {
                if (res.data.message == 'data') {
                    var myChart = echarts.init(document.getElementById("main1"));
                    option = {
                        title: {
                            text: '"' + word_search + '"该词在新闻中的出现次数随时间变化图',
                            x: 'center'
                        },
                        xAxis: {
                            type: 'category',
                            data: Object.keys(res.data.result)
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                            data: Object.values(res.data.result),
                            type: 'line',
                            itemStyle: { normal: { label: { show: true } } }
                        }],
                    };

                    if (option && typeof option === "object") {
                        myChart.setOption(option, true);
                    }
                }
            }, function (err) {
                $scope.msg = err.data;
            });
    };


    $scope.wordcloud = function () {
        $scope.isShow = false;
        $scope.isShow2 = true;
        $http.get("/news/wordcloud").then(
            function (res) {
                if (res.data.message == 'url') {
                    window.location.href = res.data.result;
                } else {
                    var mainContainer = document.getElementById('main1');

                    var chart = echarts.init(mainContainer);

                    var data = [];
                    for (var name in res.data.result) {
                        data.push({
                            name: name,
                            value: Math.sqrt(res.data.result[name])
                        })
                    }

                    var maskImage = new Image();
                    maskImage.src = './images/wordcloud.jpeg'

                    var option = {
                        title: {
                            text: '所有新闻内容 jieba分词 的词云展示'
                        },
                        series: [{
                            type: 'wordCloud',
                            sizeRange: [12, 60],
                            rotationRange: [-90, 90],
                            rotationStep: 45,
                            gridSize: 2,
                            shape: 'circle',
                            maskImage: maskImage,
                            drawOutOfBound: false,
                            textStyle: {
                                normal: {
                                    fontFamily: 'sans-serif',
                                    fontWeight: 'bold',
                                    // Color can be a callback function or a color string
                                    color: function () {
                                        // Random color
                                        return 'rgb(' + [
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160)
                                        ].join(',') + ')';
                                    }
                                },
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            },
                            data: data
                        }]
                    };

                    maskImage.onload = function () {
                        // option.series[0].data = data;
                        chart.clear();
                        chart.setOption(option);
                    };

                    window.onresize = function () {
                        chart.resize();
                    };
                }

            });
    }

});