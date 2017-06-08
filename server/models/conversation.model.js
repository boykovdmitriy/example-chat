const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    user1   : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    user2   : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    messages: [{
        time   : String,
        message: String,
        sender : mongoose.Schema.Types.ObjectId
    }]
});

conversationSchema.statics.getConversations = function (userId) {
    return this.find({$or: [{user1: userId}, {user2: userId}]}, {messages: 0});
};

conversationSchema.statics.addMessage = function (conversationId, message) {
    return this.update({_id: conversationId}, {$push: {messages: message}});
};

const conversationModel = mongoose.model('Conversation', conversationSchema);

exports.createConversation = async (fromId, toId) => {
    return await conversationModel.create({
        user1   : fromId,
        user2   : toId,
        messages: []
    });
};

exports.getConversations = async (userId) => {
    return await conversationModel.getConversations(userId);
};

exports.addMessage = async (conversationId, message) => {
    return await conversationModel.addMessage(conversationId, message);
};

exports.getConversation = async (conversationId) => {
    return await conversationModel.findOne({_id: conversationId}, {messages: 0})
                                  .populate('user1')
                                  .populate('user2');
};


exports.getMessages = async (conversationId) => {
    return await conversationModel.findOne({_id: conversationId}, {messages: 1});
};