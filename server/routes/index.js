const auth = require('./auth.route');
const user = require('./user.route');
const conversation = require('./conversation.route');

exports.initialize = (app) => {
    auth(app);
    user(app);
    conversation(app);

    app.get('*', function (req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};