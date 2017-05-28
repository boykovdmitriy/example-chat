const authMiddlewear    = require('../middlewear/auth.middlewear');
const errorChecking     = require('../helpers/errorChecking');
const conversationModel = require('../models/conversation.model');

module.exports = (app) => {

	app.get('/conversations', authMiddlewear, errorChecking(async (req, res) => {
		const id = req.session.userId;
		res.json(await conversationModel.getConversations(id));
	}));

	app.get('/conversation/:id', authMiddlewear, errorChecking(async (req, res) => {
		const conversationId = req.params.id;
		const id             = req.session.userId;
		const conversation   = await conversationModel.getConversation(conversationId);

		if (conversation.user1 === id || conversation.user2 === id) {
			res.json(conversation);
		} else {
			res.status(403).send('');
		}
	}));

	app.put('/conversation', authMiddlewear, errorChecking(async (req, res) => {
		const id   = req.session.userId;
		const conv = req.body;
		res.json(await conversationModel.createConversation(id, conv.userId));
	}));

	app.put('/conversation/message', authMiddlewear, errorChecking(async (req, res) => {
		const conv = req.body;
		res.json(await conversationModel.addMessage(conv.id, conv.message));
	}));
};