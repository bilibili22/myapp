var express = require('express');
var router = express.Router();
var mysql = require('./tool/mysql.js');
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.cookie("isLogin","1")

    if(req.cookies.isLogin == "1"){
        mysql.connect((db)=>{
            var whereObj = {
                username:req.cookies.username
            }
            mysql.find({
                db,
                collectionName:'admin',
                whereObj ,
                showObj:{_id:0,rule:1},
                success:function(result){
                    res.cookie("rule",result[0].rule)
                    res.render('index',{
                        menuActiveIndex:0,
                        test:"<h1>test</h1>",
                        rule:result[0].rule
                    });
                }
            })
        })
    }else{
        res.render('login',{
            tip:""
        });
    };
})

router.post('/login', function(req, res, next) {
    var whereObj = req.body;
    async.waterfall([
        function(cb){
            mysql.connect((db)=>{
                cb(null,db);
            })
        },function(db,cb){
            mysql.find({
                db,
                collectionName:"admin",
                whereObj,
                showObj:{_id:0},
                success:function(result){
                    cb(null,result)
                }
            })
        }
    ],(err,result)=>{
        if(result.length > 0){
            res.cookie("isLogin","1");
            res.cookie("username",whereObj.username);
            res.cookie("rule",1);
            res.redirect("/")
        }else{
            res.render('login',{
                tip:"您不是管理员！"
            });
        }
    })
});
router.get('/logout', function(req, res, next) {
    res.cookie("isLogin","0");
    res.redirect("/")
})

module.exports = router;
