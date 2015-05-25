var fs = require('fs');
var express = require('express');
var router = express.Router();
var docs = require('../lib/docs');

router.use(function (req, res, next) {
  req.docs = req.docs || {};
  var refresh = req.query.refresh && req.query.refresh !== 'false';
  docs.fetch(req.config.files, refresh, function (data) {
    req.page.docs = {};
    req.page.docs.nav = data;
    req.page.docs.navJSON = JSON.stringify(data);
    next();
  });
});

router.get('/', function(req, res, next) {
  res.render('docs', { page: req.page });
});

router.get('/*', function(req, res, next) {
  req.page.docs.content = docs.getBySlug(req.config.files, req.url);
  res.render('docs', { page: req.page });
});

module.exports = router;
