var fs = require('fs');
var express = require('express');
var nunjucks    = require('nunjucks');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var docs = require('./routes/docs');

var app = express();
var config;
try {
  app.config = JSON.parse(fs.readFileSync(process.cwd() + '/.mddocs'));
}
catch (e) {
  app.config = {
    title: 'mddocs',
    files: [{
      title: 'Docs',
      slug: 'docs',
      pattern: [
        '**/*.md'
      ],
      root: ''
    }]
  };
  // console.error('There is no mddocs.json in this directory.');
  // process.exit(1);
  // throw new Error('There is no mddocs.json in this directory.');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));

var env = nunjucks.configure(app.get('views'), {
    autoescape: false,
    express:    app
});

//  Example filter setup - remote link assets
env.addFilter('asset', function(assetpath) {
    var asset_url = "/path/to/assets";      // can be a path, or an absolute web URL
    return asset_url + assetpath;
});

app.engine('html', nunjucks.render);
app.set('view engine', 'html');

// uncomment after placing your favicon in /app
//app.use(favicon(__dirname + '/app/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'app'),
    dest: path.join(__dirname, 'app'),
    debug: true,
    outputStyle: 'expanded'
}));
app.use(express.static(path.join(__dirname, 'app')));
app.use(function (req, res, next) {
    req.page = req.page || {};
    req.page.title = app.config.title;
    req.config = app.config;

    next();
});

app.use('/', routes);
app.use('/docs', docs);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
