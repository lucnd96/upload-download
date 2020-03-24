var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const fs = require('fs')
var busboy = require('connect-busboy');

var app = express();
app.use(busboy({immediate: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const formidable = require('formidable');
// var multer  = require('multer')

app.use('/api/upload', function(req, res, next){
  // req.pipe(req.busboy);
  req.on('aborted', function(){
    console.log("on aborted")
  })
  req.on('data', function(data){
    console.log(data)
  })
  req.on('response', function(){
    console.log('on response')
  })
  
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      if(true) {
        req.on('end', function(){
          console.log('on end')
          res.writeHead(200, { Connection: 'close', "Content-Type": "text/plain" });
          res.end("OK")
        })
        // req.end()
        // res.writeHead(200, { Connection: 'close', "Content-Type": "text/plain" });
        // res.end("OK")
      } else {
        let filePath = path.join(__dirname, '/public/file.apk');
        let writeStream = fs.createWriteStream(filePath);
        file.pipe(writeStream);
        writeStream.on('finish', function(){
          res.send('OK')
        })
        writeStream.on('error', function(){
          next(new Error('upload failed'))
        })
      }
  });
})

app.use('/api/multer', function(req, res, next) {
  const form = formidable({ maxFileSize: 2 * 1024 * 1024 * 1024 , uploadDir: path.join(__dirname,'/temp')});
  form.parse(req, (err, fields, files) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ fields, files }, null, 2));
  });
})

app.use('/api/download', function(req, res, next){
  let filePath = path.join(__dirname, '/public/file.apk');
  fs.access(filePath, err => {
    if(err) {
      next(new Error('File not found'))
    } else {
      res.sendFile(filePath)
    }
  })
  res.sendFile(filePath)
})

app.use('/', indexRouter);
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
  res.render('error');
});

module.exports = app;
