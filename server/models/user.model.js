const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    password   : {type: String, required: true},
    email      : {type: String, required: true},
    name       : String,
    description: String,
    age        : Number,
    sex        : Number,
    icon       : String
});

userSchema.statics.getById    = function (id) {
    return this.findOne({_id: id}, {password: 0});
};
userSchema.statics.getByEmail = function (email) {
    return this.findOne({email: email});
};

const UserModel = mongoose.model('User', userSchema);

exports.create = async (user) => {
    return await UserModel.create({email: user.email, password: user.password});
};

exports.getUserByEmail = async (email) => {
    return await UserModel.getByEmail(email);
};

exports.getUserById = async (id) => {
    return await UserModel.getById(id);
};

exports.auth = async (email, password) => {
    return await UserModel.findOne({email: email, password: password});
};

exports.changeUserInfo = async (id, userInfo) => {
    return await UserModel.findOneAndUpdate({_id: id}, userInfo);
};

exports.getUserList = async () => {
    return await UserModel.find({}, {password: 0});
};



