const express    = require('express');
const helmet     = require('helmet');
const session    = require('express-session');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();
mongoose.connect('mongodb://localhost:27017/nodejs-chat');

app.use(bodyParser.json());
app.use(session({
    secret           : 'secret key',
    name             : "secretCook",
    resave           : true,
    saveUninitialized: true
}));

app.use(helmet());

routes.initialize(app);

app.listen(5000, () => {
    console.log('Server started on 5000 port');
});

module.exports.app = app;