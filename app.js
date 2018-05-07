let express = require('express');
let app = express();
let fs = require('fs');
let path = require("path");
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let bodyParser = require('body-parser');
let multer = require('multer');
let cookieParser = require('cookie-parser');
let url  =require('./config/config').url;
let urlencodedParser = bodyParser.urlencoded({
    extended: true
});
let {subject} = require('./routes');


let baseUrl = 'http://192.168.205.123:714';

app.use(express.static('public')); //静态文件托管
app.use(express.static('upload')); //静态文件托管
app.use(express.static('node_modules')); //静态文件托管

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(urlencodedParser);
//app.use(cookieParser);
//session可以跨请求保持会话
app.use(cookieParser());
app.use(session({
         secret: '12345',   //用来加密cookie
		 cookie:{maxAge:60*1000*30,secure:false},
         resave: false,//每次客户请求s都要重新保存session
         saveUninitialized: true,//保存为初始化的session
         //指定会话数据的存放位置
         store:new MongoStore({url})
    }
));


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Headers", ",Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == "OPTIONS") res.send(200);
    else next();
});



///////////////////////////////////////路由设置


app.use('/subject', subject);

app.use(function (req, res, next) { //捕捉404页面
    res.status(404).send('Sorry can not find that')
});

///////////////////////////////////////端口///////////////////////////////////
let server = app.listen(2018, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
