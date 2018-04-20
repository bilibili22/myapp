var express = require('express');
var router = express.Router();
var mysql = require('./tool/mysql');
var url = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {

    mysql.connect((db) => {
        mysql.find({
            db,
            collectionName:'banner',
            whereObj:{},
            showObj:{
                _id:0
            },
            success:(result)=>{
                res.send(result)
            }
        })
    })
});

/* ------------添加轮播图---------------*/
router.get('/addBanner', function(req, res, next) {
    var id = url.parse(req.url,true).query.id;
    id = id < 10 ? "0"+id:"id";
    var bannerID = "banner_"+id;

    res.render('banner_add',{
        menuActiveIndex:3,
        bannerID
    });
});

/* ------------响应事件 添加轮播图事件---------------*/
router.post('/addBannerAction', function(req, res, next) {

    var insertObj = req.body;
    insertObj.flag = 1;

    mysql.connect((db) => {
        mysql.insert(db, 'banner',insertObj,(result) => {
            res.redirect('/banner');
        })
    })
});

/* ------------轮播图是否可用---------------*/
router.get('/updateUse', function(req, res, next) {

    var obj = url.parse(req.url,true).query;
    var {id, type} = obj;
    var whereObj = {
        id
    }
    var updateObj = {
        $set :{
            flag: type
        }
    }
    mysql.connect((db) => {
        mysql.updateOne(db, 'banner',whereObj,updateObj,(result) => {
            res.redirect('/banner');
        })
    })
});

/* ------------显示轮播图是否可用---------------*/
router.get('/showUseBanner', function(req, res, next) {

    var flag = url.parse(req.url, true).query.flag;
    var whereObj = {
        flag
    }

    mysql.connect( ( db ) => {
        mysql.find({
            db,
            collectionName: 'banner',
            whereObj,
            showObj: {_id: 0},
            success: (result) => {

                res.send(result)   //接口数据
            }
        })
    })
});

/* ------------删除轮播图片---------------*/
router.get('/deleteBanner', function(req, res, next) {
    var id = url.parse(req.url,true).query.id;

    mysql.connect((db) => {
        mysql.deleteOne(db, 'banner',{id},(result) => {
            res.redirect('/banner');
            db.close();
        })
    })
});

module.exports = router;
