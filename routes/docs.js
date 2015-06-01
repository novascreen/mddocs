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

router.get('/*', function(req, res, next) {
  var slug = req.url.replace(/\?.*?$/, '');

  // redirect to first file if on index
  if (slug === '/') {
    if (req.page.docs.nav[0].children.length) {
      slug = req.page.docs.nav[0].file ? req.page.docs.nav[0].slug : req.page.docs.nav[0].children[0].slug;
      res.redirect('/' + slug);
    }
    else {
      throw new Error('No files found');
    }
  }
  req.page.pageName = slug.replace(/^\//, '').replace(/\//g, ' > ').replace('_', ' ');
  req.page.docs.content = docs.getBySlug(req.config.files, slug);
  res.render('docs', { page: req.page });
});

module.exports = router;
