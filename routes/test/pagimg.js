/**
 * Created by Administrator on 2018/4/13.
 */
var mysql = require('./../tool/mysql');

mysql.connect((db)=>{
    db.collection('doubanlist').find({},{_id:0}).limit(5).skip(15).toArray((err,result)=>{//limit()查找的个数，skip()从第几个起
        if(err) throw err;
        console.log(result)
    })
})