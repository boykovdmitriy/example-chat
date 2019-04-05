const request  = require("supertest");
const mongoose = require('mongoose');
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
    it('/signup : adding new user', function (done) {
        request(app)
            .post('/signup')
            .send(user)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('/signup: user already exist', function (done) {
        request(app)
            .post('/signup')
            .send(user)
            .set('Accept', 'application/json')
            .expect(302)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('/signin', function (done) {
        request(app)
            .post('/signin')
            .send(user)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('/signin: signin with unregistered user', function (done) {
        request(app)
            .post('/signin')
            .send({email: "mail@ma.ru", password: "1231"})
            .set('Accept', 'application/json')
            .expect(403)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                done();
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
});

describe('user', function () {
    it('/user/me: with autherization user', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
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
                      .end(function (err) {
                          if (err) {
                              return done(err);
                          }
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
            .end(function (err) {
                if (err) {
                    return done(err);
                }
            });

        request(app)
            .get('/user/me')
            .set('Accept', 'application/json')
            .expect(401)
            .end(function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('/users: with authorization user', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
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
                      .end(function (err) {
                          if (err) {
                              return done(err);
                          }
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
                    .end(function (err) {
                        if (err) {
                            return done(err);
                        }
                        done();
                    });
    });
});

describe('conversations', function () {
    it('create conversation. PUT conversation', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
             .set('Accept', 'application/json')
             .send(user)
             .expect(200)
             .then(() => {
                 agent.get('/users')
                      .expect(200)
                      .expect((res) => {
                          const users = [...res.body];
                          agent.put('/conversation')
                               .set('Accept', 'application/json')
                               .send({userId: users[1]._id})
                               .expect(200)
                               .expect((res) => {
                                   const userModel = res.body;
                                   return userModel.user2._id === users[1]._id;
                               })
                               .end(function (err) {
                                   if (err) {
                                       return done(err);
                                   }
                                   done();
                               });
                      })
                      .end(function (err) {
                          if (err) {
                              return done(err);
                          }
                      });
             }, (err) => {
                 return done(err);
             });
    });

    it('get conversations. Conversations exists', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
             .set('Accept', 'application/json')
             .send(user)
             .expect(200)
             .then(() => {
                 agent.get('/conversations')
                      .expect(200)
                      .expect((res) => {
                          const users = [...res.body];
                          return users.length !== 0;
                      })
                      .end(function (err) {
                          if (err) {
                              return done(err);
                          }
                          done();
                      });
             }, (err) => {
                 return done(err);
             });
    });

    it('get conversations. Conversations don\'t exists', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
             .set('Accept', 'application/json')
             .send(userList[2])
             .expect(200)
             .then(() => {
                 agent.get('/conversations')
                      .expect(200)
                      .expect((res) => {
                          const users = [...res.body];
                          return users.length === 0;
                      })
                      .end(function (err) {
                          if (err) {
                              return done(err);
                          }
                          done();
                      });
             }, (err) => {
                 return done(err);
             });
    });

    it('get conversation.', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
             .set('Accept', 'application/json')
             .send(user)
             .expect(200)
             .then(() => {
                 agent.get('/conversations')
                      .expect(200)
                      .then((res) => {
                          const conversations = [...res.body];
                          agent.get('/conversation/' + conversations[0]._id)
                               .expect(200)
                               .expect((res) => {
                                   const conv = res.body;
                                   return !!conv.id && !!conv.user1 && !!conv.user2;
                               })
                               .end((err) => {
                                   if (err) {
                                       return done(err);
                                   }
                                   done();
                               });

                      }, (err) => {
                          done(err);
                      });
             }, (err) => {
                 return done(err);
             });
    });

    it('send message.', function (done) {
        const agent = request.agent(app);
        agent.post('/signin')
             .set('Accept', 'application/json')
             .send(user)
             .expect(200)
             .then(() => {
                 agent.get('/conversations')
                      .expect(200)
                      .then((res) => {
                          const conversations = [...res.body];
                          agent.put('/conversation/message')
                               .set('Accept', 'application/json')
                               .send({id: conversations[0]._id, message: 'таки да'})
                               .expect(200)
                               .then(() => {
                                   agent.get('/messages/' + conversations[0]._id)
                                        .expect(200)
                                        .expect((res) => {
                                            const conv = res.body;
                                            return conv.messages.length !== 0;
                                        })
                                        .end((err) => {
                                            if (err) {
                                                return done(err);
                                            }
                                            done();
                                        });
                               }, (err) => {
                                   done(err);
                               });

                      }, (err) => {
                          done(err);
                      });
             }, (err) => {
                 return done(err);
             });
    });
});