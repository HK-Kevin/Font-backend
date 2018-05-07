let express = require('express');
let Subject = require('../model/model').Subject;
let path = require("path");
let multer = require('multer');
let xlsx = require('node-xlsx');
let router = express.Router();
let {
    checkNotLogin,
    checkLogin
} = require('../middleware/middleware');
let {
    formatDate
} = require('../bin/util')


// 添加题目
router.post('/add', function (req, res) {
    let oneSubject = req.body;
    Subject.create(oneSubject, function (err) {
        if (err) {
            res.end(JSON.stringify({
                result: false,
                msg: '添加失败'
            }))
        } else {
            res.end(JSON.stringify({
                result: true,
                msg: '添加成功'
            }))
        }
    })
});

// 删除题目
router.post('/delete', function (req, res) {
    let deleteId = req.body.id;
    Subject.remove({
        _id: {
            $in: deleteId
        }
    }, function (err) {
        if (err) res.send(JSON.stringify({
            result: false,
            msg: '删除失败'
        }));
        else res.send(JSON.stringify({
            result: true,
            msg: '删除成功'
        }))
    })
});

// 获取一个题目
router.get('/one', function (req, res) {
    let id = req.query.id;
    Subject.findById(id, function (err, data) {
        res.send(data)
    })
});
// 获取一个题目
router.get('/addClicks', function (req, res) {
    let id = req.query.id;
    Subject.findById(id, function (err, data) {
        data.clicks++;
        Subject.update({
            _id: id
        }, data, function (err, data) {
            if (err) {
                res.end(JSON.stringify({
                    result: false,
                    msg: '添加失败'
                }))
            } else {
                res.end(JSON.stringify({
                    result: true,
                    msg: '添加成功'
                }))
    
            }
        })
    })
});
// 更改题目
router.put('/update', function (req, res) {
    let id = req.body._id;
    let updateData = req.body;
    Subject.update({
        _id: id
    }, updateData, function (err, data) {
        if (err) {
            res.end(JSON.stringify({
                result: false,
                msg: '更新失败'
            }))
        } else {
            res.end(JSON.stringify({
                result: true,
                msg: '更新成功'
            }))

        }
    })

});

//通过题名查询
router.get('/searchName', function (req, res) {
    let {stu} = req.query;
    let reg = new RegExp(stu, 'i');
    Subject.find({userName: reg}, function (err, data) {
        if (err) console.log('search查询查询出错： ' + err);
        res.send(JSON.stringify(data))
    })
});

// 查询所有 或者 通过年级查询
router.post('/all', (req, res) => {
    let {page,limit,sort,type} = req.body;
    if (type) {
        Subject.count({
            type: type
        }, (err, count) => {
             Subject.find({type: type})
                .sort('-'+sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(function (err, data) {
                    data = formatDate(data);
                    res.send(JSON.stringify({
                        data,
                        count
                    }))
                })
        })
    } else {

        Subject.count({}, (err, count) => {
                Subject.find({})
                    .sort('-'+sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec(function (err, data) {
                    data = formatDate(data);
                        res.send(JSON.stringify({
                            data,
                            count
                        }))
                    })

        })
    }

})








module.exports = router;