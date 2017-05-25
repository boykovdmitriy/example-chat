const auth = require('./auth.route');
const user = require('./user.route');

exports.initialize = (app) => {
	auth(app);
	user(app);
};