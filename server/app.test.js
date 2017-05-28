const request  = require("supertest");
const mongoose = require('mongoose');
const mlog     = require('mocha-logger');
const app      = require("./index").app;

const user = {email: "mail@ma.ru", password: "123a"};

const userList = [
	{email: "mail1@ma.ru", password: "123a"},
	{email: "mail2@ma.ru", password: "123a"},
	{email: "mail3@ma.ru", password: "123a"}];

before(function (done) {
	function clearDB() {
		for (let i in mongoose.connection.collections) {
			mongoose.connection.collections[i].remove(function () {
			});
		}
		return done();
	}

	if (mongoose.connection.readyState === 0) {
		mongoose.connect('mongodb://localhost:27017/nodejs-chat', function (err) {
			if (err) {
				throw err;
			}
			return clearDB();
		});
	} else {
		return clearDB();
	}
});

after(function (done) {
	mongoose.disconnect();
	return done();
});

describe('authorization', function () {
	it('/signin : adding new user', function (done) {
		request(app)
			.post('/signin')
			.send(user)
			.set('Accept', 'application/json')
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/signin: user already exist', function (done) {
		request(app)
			.post('/signin')
			.send(user)
			.set('Accept', 'application/json')
			.expect(302)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/signup', function (done) {
		request(app)
			.post('/signup')
			.send(user)
			.set('Accept', 'application/json')
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/signup: signup with unregistered user', function (done) {
		request(app)
			.post('/signup')
			.send({email: "mail@ma.ru", password: "1231"})
			.set('Accept', 'application/json')
			.expect(403)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/signin many', function (done) {
		let pr = [];
		userList.forEach(x => {
			const res = request(app)
				.post('/signin')
				.send(x)
				.set('Accept', 'application/json')
				.expect(200);
			pr.push(res);
		});

		Promise.all(pr).then(() => {
			done();
		}, (err) => {
			done(err);
		});
	});

	it('/signup many', function (done) {
		let pr = [];
		userList.forEach(x => {
			const res = request(app)
				.post('/signup')
				.send(x)
				.set('Accept', 'application/json')
				.expect(200);
			pr.push(res);
		});

		Promise.all(pr).then(() => {
			done();
		}, (err) => {
			done(err);
		});
	});
});

describe('user', function () {
	it('/user/me: with autherization user', function (done) {
		const agent = request.agent(app);
		agent.post('/signup')
			.set('Accept', 'application/json')
			.send(user)
			.expect(200)
			.then(() => {
				agent.get('/user/me')
					.set('Accept', 'application/json')
					.expect(200)
					.expect((res) => {
						const userModel = res.body;
						return userModel.email === user.email;
					})
					.end(function (err, res) {
						if (err) return done(err);
						done();
					});
			}, (err) => {
				return done(err);
			});
	});

	it('/user/me: with not authorization user', function (done) {
		request(app)
			.post('/signout')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
			});

		request(app)
			.get('/user/me')
			.set('Accept', 'application/json')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('/users: with authorization user', function (done) {
		const agent = request.agent(app);
		agent.post('/signup')
			.set('Accept', 'application/json')
			.send(user)
			.expect(200)
			.then(() => {
				agent.get('/users')
					.set('Accept', 'application/json')
					.expect(200)
					.expect((res) => {
						const users = res.body;
						users.forEach(x => {
							return userList.some(y => {
								return x.email === y.email;
							})
						});
						return true;
					})
					.end(function (err, res) {
						if (err) return done(err);
						done();
					});
			}, (err) => {
				return done(err);
			});
	});

	it('/users: with unathorization user', function (done) {
		request(app).get('/users')
			.set('Accept', 'application/json')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});
});