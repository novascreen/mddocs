module.exports = {
  convertToTree: function (paths) {
    var obj = this.convertPathsToObject(paths);
    return this.convertObjectToArray(obj);
  },

  convertPathToObject: function (nodes, obj) {
    obj = obj || {};
    var node = nodes[0];
    obj[node] = obj[node] || {};
    nodes.shift();
    if (nodes.length) {
      this.convertPathToObject(nodes, obj[node]);
    }
    else {
      obj[node] = false;
    }
  },

  convertPathsToObject: function (arr) {
    var self = this;
    var obj = {};

    arr.forEach(function (path) {
      var fragments = path.split('/');
      self.convertPathToObject(fragments, obj);
    });

    return obj;
  },

  convertObjectToArray: function (obj) {
    var arr = [];

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var node = {
          node: key
        };
        if (obj[key]) {
          node.children = this.convertObjectToArray(obj[key]);
        }
        arr.push(node);
      }
    }

    return arr;
  }
};