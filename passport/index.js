const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => { // user === exUser
    done(null, user.id); // user id만 추출 = 메모리 용량 줄이기 위해
  });
  // 세션 {12315646 : 1} {세션쿠키 : 유저아이디} -> 메모리 저장 / 서버간 공유 x => 공유된 메모리
  
  passport.deserializeUser((id, done) => { 
    User.findOne({
      where: { id },
      iclude: [
        {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followers',
        }, // 팔로워
        {          
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followings',}, /// 팔로잉
      ]
    })
      .then(user => done(null, user)) // req.user
      .catch(err => done(err));
  });

  local();
  kakao();
};
