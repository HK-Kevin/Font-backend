let mongoose = require('mongoose');
let url = 'mongodb://localhost:27017/qd';
let db = mongoose.connect(url, function (e) {

});

// 题目模型
let SubjectSchema = new mongoose.Schema({
    title: String, // 题名
    company: [], // 公司
    important: Number, // 重要性
    hard: Number, //难度
    clicks: {
        type: Number,
        default: 0
    }, // 点击次数
    type: '', // 类型
    answer: '', // 答案，
    reference:[],
    date: {
        type: Date,
        default: Date.now
    },
});



exports.Subject = mongoose.model("Subject", SubjectSchema);