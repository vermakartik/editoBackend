var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
var cors = require('cors')
var dotenv = require('dotenv').config()


// console.log(process.env.DB_USERNAME)
// console.log(process.env.DB_PASSWORD)

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-zauig.mongodb.net/test?retryWrites=true&r=majority`, {useNewUrlParser: true})

// mongoose.connect(`mongodb://localhost:27017/test`, {useNewUrlParser: true})



var indexRouter = require('./routes/blog');
var usersRouter = require('./routes/auth');

var app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res, next) => {
  return res.json({
    'status': 200,
    'message': "Hey Hi, You are here!"
  })
})
app.use('/posts', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({'error': err});
});

module.exports = app;
