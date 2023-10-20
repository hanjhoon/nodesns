const passport = require('passport');
const { Strategy: LocalStrategy} = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
      usernameField: 'email', // req.body.email
      passwordField: 'password', // req.body.password
      passReqToCallback: false // 로직에서 request 불필요
    }, async (email, password, done) => { // done(서버실패, 성공유저, 로직실패)
      try {
        const exUser = await User.findOne({ where: { email } });
        console.log("exUser", exUser);
        if (exUser) {
            
          const result = await bcrypt.compare(password, exUser.password); // req 패스워드, db 패스워드
          if (result) {
            done(null, exUser);
          } else {
            done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
          }
        } else {
          done(null, false, { message: '가입되지 않은 회원입니다.' });
        }
      } catch (error) {
        console.error(error);
        done(error);
      }
    }));
  };
