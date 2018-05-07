let nodeExcel = require('excel-export');
let moment = require('moment');
exports.exportExcel = function (_headers, rows) {
    let conf = {};
    conf.name = "stu";
    conf.cols = [];
    for (let i = 0; i < _headers.length; i++) {
        let col = {};
        col.caption = _headers[i].caption;
        col.type = _headers[i].type;
        conf.cols.push(col);
    }
    conf.rows = rows;
    let result = nodeExcel.execute(conf);
    return result;
};
exports.header = [
    {caption: 'userName', type: 'string'},
    {caption: 'sex', type: 'string'},
    {caption: 'phone', type: 'string'},
    {caption: 'email', type: 'string'},
    {caption: 'grade', type: 'string'},
    {caption: 'year', type: 'string'},
    {caption: 'subject', type: 'string'},
    {caption: 'photo', type: 'string'},
    {caption: 'graduate', type: 'string'},
    {caption: 'address', type: 'string'},
    {caption: 'idNum', type: 'string'},
    {caption: 'access', type: 'number'},
    {caption: 'undergraduate', type: 'string'},
    {caption: 'company', type: 'string'},
    {caption: 'words', type: 'string'},
    {caption: 'contact', type: 'string'},
    {caption: 'date', type: 'string'},
];



exports.formatDate = function (date) {
    if(date.length === 0 ) {
        return []
    }
    if(date instanceof Array) {
        let tempData = JSON.parse(JSON.stringify(date));
        return tempData.map(item => {
            item.date = moment(item.date).format('YYYY-MM-DD HH:mm:ss');
            return item;
        });
    }
    if(date instanceof Object) {
        let tempData = JSON.parse(JSON.stringify(date));
        tempData.date = moment(tempData.date).format('YYYY-MM-DD HH:mm:ss');
        return tempData
    }
};
