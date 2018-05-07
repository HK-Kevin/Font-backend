exports.url = "mongodb://localhost:27017/qd"
exports.verRsearch = {
    teachers : ['程林松','李春兰','黄世军','薛永超', '曹仁义'],
    verTypes : ['国家自然科学基金','国家重点基础研究发展计划（973计划）','国家科技重大专项','省部级科研项目（基金）'],
    verRsearch : {name : '',
    title : '',
    num : '',
    startTime : '',
    endTime : '',
    type : '',
},
    header : [
    {caption: 'name', type: 'string'},
    {caption: 'title', type: 'string'},
    {caption: 'type', type: 'string'},
    {caption: 'num', type: 'string'},
    {caption: 'startTime', type: 'string'},
    {caption: 'endTime', type: 'string'},
    {caption: 'date', type: 'string'}
]
}

