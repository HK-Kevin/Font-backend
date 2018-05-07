
let express = require('express');
let Stu = require('../model/model').Stu;
let path = require("path");
let multer = require('multer');
let xlsx = require('node-xlsx');
let router = express.Router();
let {checkNotLogin, checkLogin} = require('../middleware/middleware');
// 注册
let {exportExcel, header, formatDate} = require('../bin/util')

// 获取数据库中所有的年级
router.get('/yearList', function (req, res) {
    Stu.find({}, function (err, data) {
        let arr = [];
        data.forEach(item => {
            arr.push(item.year)
        });
        let yearList = Array.from(new Set(arr))
        yearList.sort(-1);
        res.end(JSON.stringify(yearList))
    })
});

// 添加学生
router.post('/add', function (req, res) {
    let oneStu = req.body;
    Stu.create(oneStu, function (err) {
        if (err) {
            res.end(JSON.stringify({result: false, msg: '添加失败'}))
        } else {
            res.end(JSON.stringify({result: true, msg: '添加成功'}))
        }
    })
});

// 删除学生
router.post('/delete', function (req, res) {
    let deleteId = req.body.id;
    Stu.remove({
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

// 获取一个学生
router.get('/oneStu', function (req, res) {
    let id = req.query.id;
    Stu.findById(id, function (err, data) {
        res.send(data)
    })
});

// 更改学生
router.put('/update', function (req, res) {
    let id = req.body._id;
    let updateData = req.body;
    Stu.update({
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

//通过姓名查询
router.get('/searchName', function (req, res) {
    let {stu} = req.query;
    let reg = new RegExp(stu, 'i');
    Stu.find({userName: reg}, function (err, data) {
        if (err) console.log('search查询查询出错： ' + err);
        res.send(JSON.stringify(data))
    })
});

// 查询所有 或者 通过年级查询
router.post('/allstu', (req, res)=>
{
    let {page, limit, type} = req.body;
    if (type) {
        Stu.count({
            year: {
                $in: type
            }
        }, (err, count) => {
            let query;
            query = Stu.find({
                year: {
                    $in: type
                }
            });
            query.skip((page - 1) * limit)
                .limit(limit)
                .exec(function (err, data) {
                    data = formatDate(data);
                    res.send(JSON.stringify({data, count}))
                })
        })
    } else {
        Stu.count({}, (err, count) => {
            Stu.find({})
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(function (err, data) {
                    // data = formatDate(data);
                    res.send(JSON.stringify({data, count}))
                })
        })
    }

})


// 查询学生人数,博士生,硕士生

router.get('/stucount', (req, res) => {
    let arr = []
    Stu.count({}, (err, allCount) => {
        arr.push({title:'学生总数',value:allCount})
        Stu.count({
            grade: {
                $in: "博士"
            }
        }, (err, docCount) => {
            arr.push({title:'博士',value:docCount})
            Stu.count({
                grade: {
                    $in: "硕士"
                }
            }, (err, masterCount) => {
                arr.push({title:'硕士',value:masterCount})
                res.send(JSON.stringify(arr))

            })

        })

    })











})


// 导出excel
router.get('/exportStuExcel',function (req,res) {
    let arr = [],rows =[];
    Stu.find({},function (err,data) {
        data = formatDate(data);
        data.forEach(item =>{
            arr = [];
            arr.push(item.userName) ;
            arr.push(item.sex) ;
            arr.push(item.phone) ;
            arr.push(item.email) ;
            arr.push(item.grade) ;
            arr.push(item.year) ;
            arr.push(item.subject) ;
            arr.push(item.photo) ;
            arr.push(item.graduate) ;
            arr.push(item.address) ;
            arr.push(item.idNum) ;
            arr.push(item.access) ;
            arr.push(item.undergraduate) ;
            arr.push(item.company) ;
            arr.push(item.words) ;
            arr.push(item.contact) ;
            arr.push(item.date) ;
            rows.push(arr)
        });
        let result = exportExcel(header,rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "user.xlsx");
        res.end(result, 'binary');
    })
});


// 导入excel
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.resolve(__dirname).replace('routes','')+ 'upload';
        cb(null,uploadPath)
    },
    filename: function (req, file, cb) {
        let fileName = 'user.xlsx';
        cb(null, fileName)
    }
});
let upload = multer({
    storage: storage
}).single('file');
router.post('/importUserExcel',upload,function (req,res) {let uploadPath = path.resolve(__dirname).replace('routes','')+ 'upload/stu/user.xlsx';
    const workSheetsFromFile = xlsx.parse(uploadPath);
    // 表头
    const header = workSheetsFromFile[0].data[0];
    workSheetsFromFile[0].data.shift();
    // 表体
    const rows =workSheetsFromFile[0].data;
    let obj = {};
    let arr =[];

    rows.forEach(item => {
        obj = {};
        item.forEach((one,index) => {
            obj[header[index]]= one
        });
        arr.push(obj)
    });
    Stu.create(arr, function (err,doc) {
        res.end(JSON.stringify(doc))
    });
});


/*
 // 登入
 router.post('/login',checkNotLogin, function (req, res) {
 let user = req.body;
 User.count(user,(err,count) => {
 console.log(count)
 })
 User.find(user, function (err, data) {
 console.log(data)
 if (err) console.log('search查询查询出错： ' + err);
 console.log(data)
 if(data.length === 0) {
 res.end(JSON.stringify({result:false,describe:'用户名和密码不对'}))
 }else if(data.length === 1) {
 req.session.user = data;

 res.end(JSON.stringify({result:true,describe:'登入成功'}))
 }else{
 res.end("repeat")
 }
 })
 });

 // 退出
 router.get('/logout', function (req, res) {
 req.session.user = null;
 res.end(JSON.stringify({result:true,describe:'退出成功'}))


 });

 router.get('/session', function (req, res , next) {
 res.end(JSON.stringify({res:false,describe:'退出成功'}))
 });

*/
module.exports = router;