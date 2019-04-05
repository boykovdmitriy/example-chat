const auth = require('./auth.route');
const user = require('./user.route');
const conversation = require('./conversation.route');

exports.initialize = (app) => {
    auth(app);
    user(app);
    conversation(app);
};