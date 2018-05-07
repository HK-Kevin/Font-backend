exports.checkLogin = function(req, res, next) {
	if(req.session.user){
		next();
	}else{
		res.end('未登入')
	}
};

exports.checkNotLogin = function(req, res, next) {
	if(req.session.user){
        res.end("已登入")
	}else{
        next()
	}
}