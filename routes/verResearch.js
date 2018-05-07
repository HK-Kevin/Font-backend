let express = require('express');
let VerResearch = require('../model/model').VerResearch;
let path = require("path");
let multer = require('multer');
let xlsx = require('node-xlsx');
let router = express.Router();
let  {verRsearch}= require('../config/config');
let {checkNotLogin, checkLogin} = require('../middleware/middleware');
// 注册
let {exportExcel, formatDate} = require('../bin/util')

router.get('/init',(erq, res) => {
    res.end(JSON.stringify(verRsearch))
})



// 添加项目
router.post('/add', function (req, res) {
    let oneProgram = req.body;
    VerResearch.create(oneProgram, function (err) {
        if (err) {
            res.end(JSON.stringify({result: false, msg: '添加失败'}))
        } else {
            res.end(JSON.stringify({result: true, msg: '添加成功'}))
        }
    })
});


// 获取数据库中所有的项目类型
router.get('/typeList', function (req, res) {
    VerResearch.find({}, function (err, data) {
        let arr = [];
        data.forEach(item => {
            arr.push(item.type)
        });
        let typeList = Array.from(new Set(arr));
        res.end(JSON.stringify(typeList))
    })
});

// 查询所有 或者 通过type查询
router.post('/allver', (req, res)=>
{
    let {page, limit, type} = req.body;
    if (type) {
        VerResearch.count({
            type: {
                $in: type
            }
        }, (err, count) => {
            let query;
            query = VerResearch.find({
                type: {
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
        VerResearch.count({}, (err, count) => {
            VerResearch.find({})
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(function (err, data) {
                    // data = formatDate(data);
                    res.send(JSON.stringify({data, count}))
                })
        })
    }

});


// 查询各项目类型数

router.get('/count', (req, res) => {
    let arr = []
    VerResearch.count({}, (err, allCount) => {
        arr.push({title:'项目总数',value:allCount})
        VerResearch.count({
            type: {$in: "国家自然科学基金"}
        }, (err, dgjzrkxjjCount) => {
            arr.push({title:'国家自然科学基金',value:dgjzrkxjjCount})
            VerResearch.count({
                type: {$in: "国家重点基础研究发展计划（973计划）"}
            }, (err, gj973Count) => {
                arr.push({title:'国家重点基础研究发展计划（973计划）',value:gj973Count})
                VerResearch.count({
                    type: {$in: "国家科技重大专项"}
                }, (err, gjzdzxCount) => {
                    arr.push({title:'国家科技重大专项',value:gjzdzxCount})
                    VerResearch.count({
                        type: {$in: "省部级科研项目（基金）"}
                    }, (err, sbjCount) => {
                        arr.push({title:'省部级科研项目（基金）',value:sbjCount})
                        res.send(JSON.stringify(arr))

                    })

                })

            })

        })

    });
})

// 删除项目
router.post('/delete', function (req, res) {
    let deleteId = req.body.id;
    VerResearch.remove({
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

// 获取一个项目
router.get('/oneVer', function (req, res) {
    let id = req.query.id;
    VerResearch.findById(id, function (err, data) {
        res.send(data)
    })
});

// 更改项目
router.put('/update', function (req, res) {
    let id = req.body._id;
    let updateData = req.body;
    VerResearch.update({
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
    let {ver} = req.query;
    let reg = new RegExp(ver, 'i');
    VerResearch.find({title: reg}, function (err, data) {
        res.send(JSON.stringify(data))
    })
});

// 导出excel
router.get('/exportVerExcel',function (req,res) {
    let arr = [],rows =[];
    VerResearch.find({},function (err,data) {
        data = formatDate(data);
        data.forEach(item =>{
            arr = [];
            arr.push(item.name) ;
            arr.push(item.title) ;
            arr.push(item.type) ;
            arr.push(item.num) ;
            arr.push(item.startTime) ;
            arr.push(item.endTime) ;
            arr.push(item.date) ;
            rows.push(arr)
        });
        let result = exportExcel(verRsearch.header,rows);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "VerticalResearch.xlsx");
        res.end(result, 'binary');
    })
});


// 导入excel
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.resolve(__dirname).replace('routes','')+ 'upload/ver';
        cb(null,uploadPath)
    },
    filename: function (req, file, cb) {
        let fileName = 'VerticalResearch.xlsx';
        cb(null, fileName)
    }
});
let upload = multer({
    storage: storage
}).single('file');
router.post('/importVerExcel',upload,function (req,res) {
    let uploadPath = path.resolve(__dirname).replace('routes','')+ 'upload/ver/VerticalResearch.xlsx';
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
    VerResearch.create(arr, function (err,doc) {
        res.end(JSON.stringify(doc))
    });
});



module.exports = router;