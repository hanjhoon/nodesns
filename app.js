const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const {sequelize} = require('./models');

// process.env.COOKIE_SECRET 없음
dotenv.config(); // process.env
// process.env.COOKIE_SECRET 있음

const redisClient = redis.createClient({
    url : 'redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}',
    legacyMode : true,
});

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const passportConfig = require('./passport');
const app = express();
passportConfig();

app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({force:true})
    .then(() => {
        console.log('데이터 베이스 연결 성공')
    })
    .catch((err) => {
        console.log(err);
    })

if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossPriginResourcePolicy: false,
    }));
    app.use(hpp());
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public'))); // nodesns 폴더 안의 public 폴더를 static 폴더로 만들어준다.
app.use('/img', express.static(path.join(__dirname, 'uploads'))); 
app.use(express.json()); // json 요청을 받는다.
app.use(express.urlencoded({ extended: false })); // form 요청을 받는다.
app.use(cookieParser(process.env.COOKIE_SECRET)); 

app.use(session ( {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    store: new RedisStore({ client: redisClient }),
}));

// express session 밑에 passport 작성
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout
app.use(passport.session()); // connect.sid라는 이름으로 세션 쿠기가 브라우저로 전송


app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);


app.use((req, res, next) => { // 404 NOT FOUND
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    console.error(err);
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 배포 모드일 때는 에러 표시 (x)
    res.status(err.status || 500);
    res.render('error');
});