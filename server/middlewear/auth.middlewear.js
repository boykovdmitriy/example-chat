module.exports = (req, res, next) => {
	console.log(req.session.userId);
	if (!!req.session.userId) {
		next();
	} else {
		res.status(401).send();
	}
};