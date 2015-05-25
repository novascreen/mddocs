var fs = require('fs');
var glob = require('glob-all');
var _ = require('lodash');
var pathsUtil = require('./paths');
var markdownUtil = require('./markdown');

var cache;

var docs = {
  fetch: function (files, refresh, callback) {
    var self = this;

    if (cache && !refresh) {
      callback(cache);
      return;
    }

    console.info('Globbing files...');

    if (typeof files === 'string' ||
      (Array.isArray(files) && files.length && typeof files[0] === 'string')) {
      files = [{
        slug: 'docs',
        pattern: files
      }];
    }

    var i = 0;
    files.forEach(function (group) {
      glob(group.pattern.slice(0), function (err, paths) {
        i++;
        // group.pathsLog = JSON.stringify(paths, null, 2).replace(/,/g, ',<br>');

        group.paths = paths;
        if (i === files.length) {
          cache = self.generateTree(files);
          console.log(JSON.stringify(cache, null, 2));

          console.info('Done globbing files!');
          callback(cache);
        }
      });
    });
  },

  generateTree: function (files) {
    files.forEach(function (group) {
      var paths = [];
      group.paths.forEach(function (path) {
        paths.push(path.replace(group.root, '').replace(/^\//, ''));
      });
      group.children = pathsUtil.convertToTree(paths);
      docs.fillNodes(group);
    });

    return files;
  },

  fillNodes: function (parent) {
    var children = [];
    parent.children.forEach(function (child) {
      var slug =  child.node
        .replace(/^[\d]*_*(.*?)/, '') // remove sorting number (e.g. 01_Examples -> Examples)
        .replace('.md', '');
      child.title = slug.replace('_', ' ');
      child.slug = (parent.slug || '') + '/' + slug;
      if (child.node.match(/^(readme|index)\.md/i)) {
        parent.file = child.node;
      }
      else {
        if (child.node.match(/\.md$/i)) {
          child.file = child.node;
        }
        children.push(child);
      }
      if (child.children) {
        docs.fillNodes(child);
      }
    });
    parent.children = children;
  },

  getAll: function () {

  },

  getBySlug: function (files, slug) {
    var regex = new RegExp('^\/*([^/]+)\/(.*?)$');
    var groupSlug = slug.replace(regex, '$1');
    slug = slug.replace(regex, '$2');
    var group = _.findWhere(files, { slug: groupSlug });
    var path = _.find(group.paths, function (path) {
      var match = false
      path = path
        .replace(group.root, '')
        .replace(/^\//, '')
        .replace(/(^|[\/]+)[\d]*_*(.*?)/g, '$1') // remove sorting number (e.g. 01_Examples -> Examples)
        .replace('.md', '');
      return slug === path ||
        slug.toLowerCase() + '/readme' === path.toLowerCase() ||
        slug.toLowerCase() + '/index' === path.toLowerCase();
    });
    console.log('slug, path', slug, path);
    var content = fs.readFileSync(process.cwd() + '/' + path, {
      encoding: "utf8"
    });

    return markdownUtil.convert(content);
  }
};

module.exports = docs;