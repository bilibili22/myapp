var express = require('express');
var router = express.Router();
var url = require('url');
var mysql = require('./tool/mysql.js');

/* GET users listing. */
router.get('/', function(req, res, next) {

    mysql.connect((db)=>{
        mysql.find({
            db,
            collectionName:'list',
            whereObj:{},
            showObj:{
                _id:0,
                title:1,
                year:1,
                images:1,
                collect_count:1,
                id:1
            },
            success:(result)=>{
                res.render('movielist',{
                    menuActiveIndex:1,
                    result,
                    rule:req.cookies.rule
                } )
                db.close();
            }
        })
    })
});

/*--------根据id删除---------*/
router.get('/deleteMovie', function(req, res, next) {
    var deleteObj = {
        id: url.parse(req.url, true).query.id
    }
    mysql.connect((db) => {
        mysql.deleteOne(db, 'list',deleteObj,(result) => {
            // res.send("<script> window.location.href = '/movielist';</script>")
            res.redirect('/movielist');
            db.close();
        })
    })
});


/*--------根据id修改数据---------*/
router.get('/updateMovie', function(req, res, next) {
    var whereObj = {
        id: url.parse(req.url, true).query.id
    }
    mysql.connect((db)=>{
        mysql.find({
            db,
            collectionName: "list",
            whereObj,
            showObj:{
                _id:0
            },
            success:(result)=>{
                res.render('movie_update',{
                    menuActiveIndex:1,
                    rule:result[0].rule,
                    result
                })
                db.close();
            }
        })
    })
});

/*--------修改数据---------*/
router.post('/updateMovieAction', function(req, res, next) {
    var {id,rating,images,collect_count,introduction } = req.body;
    var whereObj = {
        id
    }
    var updateObj = {
        $set: {
            rating,
            images,
            collect_count,
            introduction
        }
    }
    mysql.connect( (db) => {
        mysql.updateOne( db, "list", whereObj, updateObj , ( result ) => {
            res.redirect("/movielist");
            db.close();
        })
    })
})

/*--------添加电影页面---------*/
router.get('/addMovie', function(req, res, next) {
    var len = url.parse(req.url,true).query.len;

        res.render('movie_add',{
            menuActiveIndex:1,
            rule:req.cookies.rule,
            len
        })
});

/*--------添加电影页面 的 添加电影方法---------*/
router.post('/addMovieAction', function(req, res, next) {
    var insertObj = req.body;
    mysql.connect((db) => {
        mysql.insert(db, 'list',insertObj,(result) => {
            res.redirect("/movielist");
            db.close();
            })
        })
});


module.exports = router;