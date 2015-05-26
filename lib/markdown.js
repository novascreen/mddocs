var marked = require('marked');
var markedRenderer = new marked.Renderer();
var hljs = require('highlight.js');

markedRenderer.code = function (code, lang, escaped) {
  code = hljs.highlightAuto(code).value;

  return '<pre><code' + (lang ? ' class="hljs ' + this.options.langPrefix + lang + '"' : ' class="hljs"') + '>' + code + '\n</code></pre>\n';
};

marked.setOptions({
  renderer: markedRenderer,
  sanitize: true
});

hljs.configure({
  tabReplace: '  '
});

module.exports = {
  convert: function (markdown) {
    return marked(markdown);
  }
}
