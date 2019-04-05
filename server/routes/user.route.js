const authMiddlewear = require('../middlewear/auth.middlewear');
const userModel = require('../models/user.model');
const errorChecking = require('../helpers/errorChecking');

module.exports = (app) => {
  app.get('/user/me', authMiddlewear, errorChecking(async (req, res) => {
    const id = req.session.userId;
    res.json(await userModel.getUserById(id));
  }));

  app.get('/user/:id', authMiddlewear, errorChecking(async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).send('userId is required');

    const user = await userModel.getUserById(id);
    if (!user) return res.status(400).send('user not found');

    res.json(user);
  }));

  app.get('/users', authMiddlewear, errorChecking(async (req, res) => {
    const users = await userModel.getUserList();
    res.json(users);
  }));
};