var express = require('express');
var router = express.Router();
var mysql = require("./tool/mysql");
var url = require("url");
var multer  = require('multer');
var upload = multer({ dest: 'uploads/bannerimg/' })
var fs = require("fs");

/* GET users listing. */
router.get('/', function(req, res, next) {

    mysql.connect( ( db ) => {
        mysql.find( {
            db,
            collectionName: 'banner',
            whereObj:{},
            showObj: {
                _id:0
            },
            success: (result) => {
                res.render('banner', {
                    menuActiveIndex: 3,
                    result,
                    flag:2,
                    rule:req.cookies.rule
                } );
            }
        })
    })
});

//添加轮播图
router.get('/addBanner', function(req, res, next) {
    var id = url.parse(req.url, true).query.id;
    id = id < 10 ? "0"+ id : id;
    var bannerID = "banner_" + id;
    mysql.connect( ( db ) => {
        mysql.find({
            db,
            collectionName:"bannerimgs",
            whereObj:{},
            showObj:{_id:0},
            success: (result) => {
                res.render('banner_add', {
                    menuActiveIndex: 3,
                    rule:result[0].rule,
                    bannerID,
                    result,
                    imgUrl:""
                } );
            }
        })
    })

});

//响应添加轮播图事件
router.post('/addBannerAction', function(req, res, next) {

    var insertObj = req.body;
    insertObj.flag = 1;//默认都是可用的
    console.log(insertObj)
    mysql.connect( ( db ) => {
        mysql.insert( db, 'banner', insertObj, ( result ) => {
            res.redirect("/banner");
        })
    })


});
//响应添加轮播图事件
router.get('/deleteBanner', function(req, res, next) {

    var id = url.parse(req.url, true).query.id;

    mysql.connect( ( db ) => {
        mysql.deleteOne( db, 'banner', {id}, ( result ) => {
            res.redirect("/banner");
        })
    })


});
//轮播图是否可用事件
router.get('/updateUse', function(req, res, next) {

    var obj = url.parse(req.url, true).query;
    var { id, type} = obj;
    var whereObj = {
        id
    }

    var updateObj = {
        $set: {
            flag: type
        }
    }

    mysql.connect( ( db ) => {
        mysql.updateOne( db, 'banner', whereObj, updateObj, ( result ) => {
            res.redirect("/banner");
        })
    })


});
//显示可用或者不可用轮播图
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
                res.render("banner", {
                    menuActiveIndex: 3,
                    rule:result[0].rule,
                    result,
                    flag
                });
                // res.send(result)
            }
        })
    })


});
//上传banner图
router.post("/uploadBanner", upload.single('bannerimg'), (req, res, next) => {
    console.log(req.file)
    var bannerID = req.body.bid;
    var filename = req.file.filename;
    var realname = filename + "." + req.file.mimetype.split("/")[1];
    var imgUrl = "/bannerimg/"+realname;
    fs.rename(__dirname+"/../uploads/bannerimg/"+filename, __dirname+'/../uploads/bannerimg/' + realname, (err, data) => {
        if(err) throw err;
        console.log("update name success")
        console.log(imgUrl)
        mysql.connect( ( db ) => {
            mysql.insert(db, "bannerimgs", {img:imgUrl}, (data) => {
                // res.redirect('addBanner?id=' + id);
                mysql.find({
                    db,
                    collectionName:"bannerimgs",
                    whereObj:{},
                    showObj:{_id:0},
                    success: (result) => {
                        res.render('banner_add', {
                            menuActiveIndex: 3,
                            bannerID,
                            result,
                            imgUrl
                        } );
                    }
                })
            })

        })
    })
    /*
    { fieldname: 'bannerimg',
  originalname: 'user2-160x160.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'uploads/',
  filename: '472aa18167fd5d02c222f6589218cf2e',
  path: 'uploads\\472aa18167fd5d02c222f6589218cf2e',
  size: 7070 }

     */
})
module.exports = router;
