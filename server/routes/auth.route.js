const userModel     = require('../models/user.model');
const errorChecking = require('../helpers/errorChecking');

module.exports = (app) => {
    app.post('/signin', errorChecking(async (req, res) => {
        const newUser = req.body;
        const dbUser  = await userModel.getUserByEmail(newUser.email);
        if (!dbUser) {
            const user = await userModel.create(newUser);
            res.json(user);
        } else {
            res.status(302).send('user already exist');
        }
    }));

    app.post('/signup', errorChecking(async (req, res) => {
        const user   = req.body;
        const dbUser = await userModel.getUserByEmail(user.email);
        if (!!dbUser && dbUser.password === user.password) {
            req.session.userId = dbUser._id;
            res.send('');
        } else {
            res.status(403).send('user not found');
        }
    }));

    app.post('/signout', errorChecking(async (req, res) => {
        if (req.session) {
            req.session.destroy(function () {
            });
        }
        res.status(200).send('');
    }));
};