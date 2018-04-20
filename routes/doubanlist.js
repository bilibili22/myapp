var express = require('express');
var router = express.Router();
var url = require('url');
var mysql = require('./tool/mysql.js');
var async = require('async');
var requestData = require('./tool/requestData.js');

//通过request请求，給集合之中添加数据
router.get('/addData', function(req, res, next) {
    async.waterfall([
        function(cb){
            mysql.connect( (db) => {
                cb(null, db)
            } )
        },
        function (db, cb){
            var config = {
                protocol: "https",
                options: {
                    hostname: 'api.douban.com',
                    port: 443, //如果为https协议就为443，如果为http协议就为80
                    path: '/v2/movie/top250',
                    method: 'GET'
                },
                success: function(data){
                    // console.log("data",typeof data)
                    var insertData = JSON.parse(data).subjects;
                    console.log("insertData",insertData)
                    mysql.insert(db, 'doubanlist', insertData, (result) => {
                        cb(null, 1)
                    })

                }
            }
            requestData.resuest(config);
        }
    ], (err, result) => {
     console.log("okok")
    })

});

//获取列表数据
router.get('/', function(req, res, next) {
    async.waterfall([
        function(cb){
            mysql.connect( (db) => {
                cb(null, db)
            } )
        },
        function (db, cb) {
            mysql.find({
                db,
                collectionName: 'doubanlist',
                whereObj: {},
                showObj: {_id:0},
                success: function (result) {
                    cb(null, result)
                    db.close();
                }
            })
        }
    ],(err, result) => {
        res.render("doubanlist", {
            menuActiveIndex: 4,
            result,
            len: result.length
        });
    })
});

//分页接口
router.get('/paging', (req, res, next) => {
    var { pageCode, limitNum } = url.parse(req.url, true).query;
    async.waterfall([
        function(cb){
            mysql.connect( ( db ) => {
                mysql.find({
                    db,
                    collectionName: 'doubanlist',
                    whereObj: {},
                    showObj: {_id:0},
                    success: function (result) {
                        cb(null, {
                            db,
                            len: result.length
                        })
                    }
                })
            })
        },
        function(config ,cb){
            mysql.paging({
                db:config.db,
                collectionName: 'doubanlist',
                whereObj: {},
                showObj: {_id:0},
                pageCode:pageCode*1,
                limitNum:limitNum*1,
                success:function(result){
                    cb(null, {
                        len: config.len,
                        totalNum: Math.ceil(config.len/(limitNum * 1)),
                        pageCode: pageCode*1,
                        result: result
                    })
                }
            })
        }
    ], (err, result) => {
        res.render("doubanlist", {
            menuActiveIndex: 4,
            result: result.result,
            len: result.len,
            totalNum:result.totalNum,
            pageCode: pageCode*1,
            rule:req.cookies.rule
        })
    })
})

//升序降序排列
router.get('/sortdata', (req, res, next) => {
    var { type, flag } = url.parse(req.url, true).query;
    var sortObj = {};
    if(flag == "collect_count"){
        sortObj = {
            collect_count: type*1
        }
    }else if(flag == 'year'){
        sortObj = {
            year: type*1
        }
    }
    async.waterfall([
        function(cb){
            mysql.connect( (db) => {
                cb(null, db)
            })
        },function(db, cb){
            mysql.sort({
                db,
                collectionName:'doubanlist',
                whereObj: {},
                showObj: {_id:0},
                sortObj,
                success: function( result ){
                    cb(null, result)
                }
            })
        }
    ], (err, result) => {
        res.render("doubanlist", {
            menuActiveIndex: 4,
            result,
            len: result.length,
            pageCode: 0,
            totalNum:1,
            rule:result[0].rule,
        });
    })
});

//区间筛选（现为票房区间）
router.get('/findarea', (req, res, next) => {
    var { min, max, flag } = url.parse(req.url, true).query;
    var whereObj = {};
    if(flag == "collect_count"){
        whereObj = {
            collect_count: {
                $gte: min*1,
                $lte: max*1
            }
        }
    }else if(flag == 'year'){
        whereObj = {
           year: {
               $gte: min*1,
               $lte: max*1
           }
        }
    }

    async.waterfall([
        function(cb){
            mysql.connect( (db) => {
                cb(null, db)
            })
        },function(db, cb){
            mysql.sort({
                db,
                collectionName:'doubanlist',
                whereObj,
                showObj: {_id:0},
                success: function( result ){
                    cb(null, result)
                }
            })
        }
    ], (err, result) => {
        res.render("doubanlist", {
            menuActiveIndex: 4,
            result,
            len: result.length,
            pageCode: 0,
            totalNum:1,
            rule:result[0].rule,
        });
    })
});

//按条件搜索（现为名称搜索）
router.get('/search', (req, res, next) => {
    var {title,flag } = url.parse(req.url, true).query;
    //console.log(title)
    var whereObj = {};
    if(flag == "title"){
        whereObj = {
            title: eval("/"+title+"/")//eval
        }
    }else if(flag == 'year'){
        whereObj = {
            year:eval("/"+title+"/")
        }
    }
    console.log(whereObj)
    async.waterfall([
        function(cb){
            mysql.connect( (db) => {
                cb(null, db)
            })
        },function(db, cb){
            mysql.sort({
                db,
                collectionName:'doubanlist',
                whereObj,
                showObj: {_id:0},
                success: function( result ){
                    cb(null, result)
                }
            })
        }
    ], (err, result) => {
        res.render("doubanlist", {
            menuActiveIndex: 4,
            result,
            len: result.length,
            pageCode: 0,
            totalNum:1,
            rule:result[0].rule,
        });
    })
});

module.exports = router;
