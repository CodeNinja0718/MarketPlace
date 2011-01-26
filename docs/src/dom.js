/**
 * DOM generation class
 */

exports.DOM = DOM;
exports.htmlEscape = htmlEscape;

//////////////////////////////////////////////////////////

function htmlEscape(text){
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


function DOM(){
  this.out = [];
  this.headingDepth = 0;
}

var INLINE_TAGS = {
    i: true,
    b: true
};

DOM.prototype = {
  toString: function() {
    return this.out.join('');
  },

  text: function(content) {
    if (typeof content == "string") {
      this.out.push(htmlEscape(content));
    } else if (typeof content == 'function') {
      content.call(this, this);
    } else if (content instanceof Array) {
      this.ul(content);
    }
  },

  html: function(html) {
    if (html) {
      var headingDepth = this.headingDepth;
      for ( var i = 10; i > 0; --i) {
        html = html
          .replace(new RegExp('(<\/?h)' + i + '(>)', 'gm'), function(all, start, end){
            return start + (i + headingDepth) + end;
          });
      }
      this.out.push(html);
    }
  },

  tag: function(name, attr, text) {
    if (!text) {
      text = attr;
      attr = {};
      if (name == 'code')
        attr['ng:non-bindable'] = '';
    }
    this.out.push('<' + name);
    for(var key in attr) {
      this.out.push(" " + key + '="' + attr[key] + '"');
    }
    this.out.push('>');
    this.text(text);
    this.out.push('</' + name + '>');
    if (!INLINE_TAGS[name])
      this.out.push('\n');
  },

  code: function(text) {
    this.tag('div', {'ng:non-bindable':''}, function(){
      this.tag('pre', {'class':"brush: js; html-script: true;"}, text);
    });
  },

  example: function(description, source, scenario) {
    if (description || source || scenario) {
      this.h('Example', function(){
        if (description)
          this.html(description);
        if (scenario === false) {
          this.code(source);
        } else {
          this.tag('doc:example', function(){
            if (source) this.tag('doc:source', source);
            if (scenario) this.tag('doc:scenario', scenario);
          });
        }
      });
    }
  },

  h: function(heading, content, fn){
    if (content==undefined || content && content.legth == 0) return;
    this.headingDepth++;
    this.tag('h' + this.headingDepth, heading);
    var className = typeof heading == 'string'
      ? {'class': heading.toLowerCase().replace(/[^\d\w_]/mg, '-').replace(/-+/gm, '-')}
      : null;
    if (content instanceof Array) {
      this.ul(content, className, fn);
    } else if (fn) {
      this.tag('div', className, function(){
        fn.call(this, content);
      });
    } else {
      this.tag('div', className, content);
    }
    this.headingDepth--;
  },

  h1: function(attr, text) {
    this.tag('h1', attr, text);
  },

  h2: function(attr, text) {
    this.tag('h2', attr, text);
  },

  h3: function(attr, text) {
    this.tag('h3', attr, text);
  },

  p: function(attr, text) {
    this.tag('p', attr, text);
  },

  ul: function(list, attr, fn) {
    if (typeof attr == 'function') {
      fn = attr;
      attr = {};
    }
    this.tag('ul', attr, function(dom){
      list.forEach(function(item){
        dom.out.push('<li>');
        dom.text(fn ? fn(item) : item);
        dom.out.push('</li>\n');
      });
    });
  }

};
