(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.application = view.template.application;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName
}

protoclass(BaseAttrBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;
    this._scriptBinding = this.scripts.value.bind(context, function (value, oldValue) {
      if (value === oldValue) return;

      // if rendering, do this immediately
      if(binding) return self.didChange(value, oldValue);

      // otherwise defer to rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  },

  /**
   */

  test: function (attrValue) {
    return true;
  }
});

module.exports = BaseAttrBinding;
},{"protoclass":107}],2:[function(require,module,exports){
var EventDataBinding = require("./event"),
_bind                = require("../../utils/bind");

function ChangeAttrBinding () {
  EventDataBinding.apply(this, arguments);
}

ChangeAttrBinding.events = "keydown change keyup input mousedown mouseup click";

EventDataBinding.extend(ChangeAttrBinding, {
  preventDefault: false,
  event: ChangeAttrBinding.events,
  _update: function (event) {
    clearTimeout(this._changeTimeout);
    this._changeTimeout = setTimeout(_.bind(this._update2, this), 5);
  },
  _update2: function () {
    this.script.update();
  }
});

module.exports = ChangeAttrBinding;
},{"../../utils/bind":49,"./event":7}],3:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[8].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":7}],4:[function(require,module,exports){
var BaseBinding = require("./base");


function EnableBinding (view, node, script, attrName) {
  BaseBinding.apply(this, arguments);
}

BaseBinding.extend(EnableBinding, {

  /**
   */

  didChange: function (value) {
    if (value) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = EnableBinding;

},{"./base":1}],5:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[13].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":7}],6:[function(require,module,exports){
var EventDataBinding = require("./event");

module.exports = EventDataBinding.extend({
  preventDefault: true,
  event: "keydown",
  _onEvent: function (event) {

    if (!~[27].indexOf(event.keyCode)) {
      return;
    }
    EventDataBinding.prototype._onEvent.apply(this, arguments);
  }
});

},{"./event":7}],7:[function(require,module,exports){
var protoclass = require("protoclass"),
_bind = require("../../utils/bind");

function EventAttrBinding (view, node, scripts, attrName) {
  this.view     = view;
  this.node     = node;
  this.scripts  = scripts;
  this.attrName = attrName;
  this._onEvent = _bind(this._onEvent, this);
}

protoclass(EventAttrBinding, {

  stopPropagation: true,
  preventDefault: false,

  /**
   */

  bind: function (context) {
    this.context = context;

    var event = (this.event || this.attrName).toLowerCase(),
    name      = this.attrName.toLowerCase();

    if (name.substr(0, 2) === "on") {
      name = name.substr(2);
    }

    if (event.substr(0, 2) === "on") {
      event = event.substr(2);
    }

    // this._updateScript(this.script("propagateEvent"));
    // this._updateScript(this.clip.script("preventDefault"));


    if (~["click", "mouseup", "mousedown", "submit"].indexOf(name)) {
      this.preventDefault  = true;
      this.stopPropagation = false;
    }

    this._pge = "propagateEvent." + name;
    this._pde = "preventDefault." + name;

    // this._setDefaultProperties(this._pge);
    // this._setDefaultProperties(this._pde);


    this.node.addEventListener(this._event = event, this._onEvent);
  },

  /**
   */

  _onEvent: function (event) {

    var pe, pd;

    if (this.scripts.stopPropagation == null) {
      pe = this.stopPropagation;
    } else {
      pe = this.scripts.stopPropagation.evaluate(this.context);
    }

    if (this.scripts.preventDefault == null) {
      pd = this.preventDefault;
    } else {
      pd = this.scripts.preventDefault.evaluate(this.context)
    }

    if (pe) event.stopPropagation();
    if (pd) event.preventDefault();

    if (this.node.disabled) return;
    this.context.set("event", event);
    this._update(event);
  },

  _update: function (event) {
    this.scripts.value.evaluate(this.context);
  },


  /*_setDefaultProperties: function (ev) {
    var prop = ev.split(".").shift();
    if (!this.clip.has(ev) && !this.clip.has(prop) && this[prop] != null) {
      this.clip.set(ev, this[prop]);
    }
  },*/

  /**
   */

  unbind: function () {
    this.node.removeEventListener(this._event, this._onEvent);
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = EventAttrBinding;
},{"../../utils/bind":49,"protoclass":107}],8:[function(require,module,exports){
extend = require("../../utils/extend");

"<div data-onClick={{}}></div>"

module.exports = function () {

  var attrBindings = extend({}, {

    "show"   : require("./show"),
    "enable" : require("./enable"),
    "focus"  : require("./focus"),
    "model"  : require("./model"),
    // "bind-style"  : require("./style"),
    // "bind-class"  : require("./class"),



    "onClick"       : require("./event"),
    "onDoubleClick" : require("./event"),
    "onLoad"        : require("./event"),
    "onSubmit"      : require("./event"),
    "onMouseDown"   : require("./event"),
    "onMouseUp"     : require("./event"),
    "onMouseOver"   : require("./event"),
    "onMouseMove"   : require("./event"),
    "onMouseOut"    : require("./event"),
    "onFocusIn"     : require("./event"),
    "onFocusOut"    : require("./event"),
    "onKeyDown"     : require("./event"),
    "onKeyUp"       : require("./event"),

    "onEnter"       : require("./enter"),
    "onEscape"      : require("./escape"),
    "onChange"      : require("./change"),
    "onDelete"      : require("./delete"),
  });

  return {
    register: function (name, attrBinding) {
      attrBindings[name] = attrBinding;
    },
    getClass: function (name, attrValue) {
      var clazz = attrBindings[name];
      if (clazz && (!clazz.prototype.test || clazz.prototype.test(attrValue))) {
        return clazz;
      }
    }
  };
}
},{"../../utils/extend":50,"./change":2,"./delete":3,"./enable":4,"./enter":5,"./escape":6,"./event":7,"./focus":9,"./model":10,"./show":11}],9:[function(require,module,exports){
var BaseBinding = require("./base");

function FocusBinding (view, node, scripts, attrName) {
  BaseBinding.apply(this, arguments);
}

BaseBinding.extend(FocusBinding, {

  /**
   */

  didChange: function (value) {
    if (!value) return;
    if (this.node.focus) {
      var self = this;

      // focus after being on screen. Need to break out
      // of animation, so setTimeout is the best option
      setTimeout(function(){ 
        self.node.focus(); 
      }, 1);
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});


module.exports = FocusBinding;
},{"./base":1}],10:[function(require,module,exports){
(function (process){
var BaseBinding = require("./base"),
_bind = require("../../utils/bind");

function ModelBinding (view, node, script, attrName) {
  BaseBinding.apply(this, arguments);
  this._onInput = _bind(this._onInput, this);
}

BaseBinding.extend(ModelBinding, {

  _events: ["change","keyup","input"],

  bind: function (context) {
    BaseBinding.prototype.bind.call(this, context);

    var self = this;

    if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
      this._autocompleteCheckInterval = setInterval(function () {
        self._onInput();
      }, process.browser ? 500 : 10);
    }

    this._events.forEach(function (event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  unbind: function () {
    BaseBinding.prototype.unbind.call(this);
    clearInterval(this._autocompleteCheckInterval);

    var self = this;
    this._events.forEach(function (event) {
      self.node.removeEventListener(event, self._onInput);
    });
  },

  /**
   */

  didChange: function (model) {
    this.model = model;

    if (this._modelBindings) this._modelBindings.dispose();
    if (!model) return;

    var self = this;

    this._modelBindings = this.context.bind(model.path, function (value) {
      self._elementValue(self._parseValue(value));
    }).now();
  },


  _parseValue: function (value) {
    if (value == null || value === "") return void 0;
    return value;
  },


  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  },

  /**
   */

  _onInput: function (event) {
    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }


    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function (value) {



    var isCheckbox    = /checkbox/.test(this.node.type),
    isRadio           = /radio/.test(this.node.type),
    isRadioOrCheckbox = isCheckbox || isRadio,
    isInput           = Object.prototype.hasOwnProperty.call(this.node, "value") || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());


    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.node.checked);
      } else if (isInput) {
        return this.node.value || "";
      } else {
        return this.node.innerHTML || "";
      }
    }

    if (value == null) {
      value = "";
    } else {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String(this.node.value)) {
          this.node.checked = true;
        }
      } else {
        this.node.checked = value;
      }
    } else if(value != this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }

});


module.exports = ModelBinding;
}).call(this,require('_process'))
},{"../../utils/bind":49,"./base":1,"_process":70}],11:[function(require,module,exports){
var BaseBinding = require("./base");

function ShowBinding (view, node, scripts, attrName) {
  BaseBinding.apply(this, arguments);
  this._displayStyle = this.node.style.display;
}

BaseBinding.extend(ShowBinding, {

  /**
   */

  didChange: function (value) {

    var state = value ? this._displayStyle : "none";

    if (this.node.__isNode) {
      this.node.style.setProperties({ display: state })
    } else {
      this.node.style.display = state;
    }
  },

  /**
   */

  test: function (attrValue) {
    return attrValue.length === 1;
  }
});

module.exports = ShowBinding;
},{"./base":1}],12:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseBlockBinding (view, name, scripts, section, contentTemplate, childTemplate) {
  this.view            = view;
  this.scripts         = scripts;
  this.mainScript      = scripts[name];
  this.application     = view.template.application;
  this.section         = section;
  this.nodeFactory     = this.application.nodeFactory;
  this.contentTemplate = contentTemplate;
  this.childTemplate   = childTemplate;
}

protoclass(BaseBlockBinding, {

  /**
   */

  bind: function (context) {
    var self = this, binding = true;
    this.context = context;
    this._scriptBinding = this.mainScript.bind(context, function (value, oldValue) {
      if (binding) return self.didChange(value, oldValue);
      if (value === oldValue) return;
      // rAf
      self.application.animate({
        update: function () {
          self.didChange(value, oldValue);
        }
      });
    });

    this._scriptBinding.now();
    binding = false;
  },

  /**
   */

  unbind: function () {
    this._scriptBinding.dispose();
  },

  /**
   */

  didChange: function () {
    // override me
  }
});

module.exports = BaseBlockBinding;
},{"protoclass":107}],13:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (value, oldValue) {

    // cast as a boolean value - might be something like
    // an integer
    value = !!value;


    if (this._oldValue === value) {
      if (this.child && !this.child.bound) {
        this.child.bind(this.context);
      }
      return;
    }

    this._oldValue = value;

    if (this.child) {
      this.child.dispose();
      this.child = undefined;
    }

    var childTemplate;

    if (value) {
      childTemplate = this.contentTemplate;
    } else {
      childTemplate = this.childTemplate;
    }

    if (childTemplate) {
      this.child = childTemplate.bind(this.context);
      this.section.appendChild(this.child.render());
    }
  },
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    var child = this.child;
    return child ? child.unbind() : undefined;
  }
});
},{"./base":12}],14:[function(require,module,exports){
var BaseBlockBinding = require("./base"),
BindableObject       = require("bindable-object");

// TODO - need to create own context which inherits properties
// TODO - ability to set property for each value {{#each:{ source: source, as: 'name'}}}

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    BaseBlockBinding.prototype.bind.call(this, context);

    var allocate = this.scripts.allocate ? this.scripts.allocate.evaluate(this.context) : 0,
    chunk        = this.scripts.chunk    ? this.scripts.chunk.evaluate(this.context)    : allocate,
    delay        = this.scripts.delay    ? this.scrtips.delay.evaluate(this.context)    : 1;

    if (!allocate) return;

    var i = 0, self = this;

    function allocateItems () {
      while (i++ < chunk) {
        self.contentTemplate.bind().dispose();
      }

      if (i < allocate) setTimeout(allocateItems, delay);
    }

    allocateItems();
  },
  unbind: function () {
    BaseBlockBinding.prototype.unbind.call(this);
    if (this._updateListener) this._updateListener.dispose();
  },
  didChange: function (source) {

    if (this._updateListener) this._updateListener.dispose();

    var name = this.scripts.as ? this.scripts.as.evaluate(this.context) : void 0;

    if (!source) source = [];

    if (source.__isBindableCollection) {

      var self = this, collection = source;

      this._updateListener = source.once("update", function () {
        self.didChange(collection);
      });

      source = source.source;
    }

    if (!this._children) this._children = [];
    var self = this;

    for (var i = 0, n = source.length; i < n; i++) {

      if (name) {

        var props = new BindableObject();
        props[name] = source[i];

        // dirty - inherit props
        props.get = function (path) {
          if (this[path[0]] != null) return BindableObject.prototype.get.call(this, path);
          var ret = self.context.get(path);

          if (typeof ret === "function") {
            return function () {
              return ret.apply(self.context, arguments);
            }
          }

          return ret;
        }
      } else {
        var props = source[i];
      }

      if (i < this._children.length) {
        this._children[i].bind(props);
      } else {
        var child = this.contentTemplate.bind(props);
        this._children.push(child);
        this.section.appendChild(child.render());
      }
    }

    // TODO - easeOutSync?
    this._children.splice(i).forEach(function (child) {
      child.remove();
    });
  }
});
},{"./base":12,"bindable-object":64}],15:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  bind: function (context) {
    this.context = context;
    if (this.child) {
      return this.child.bind(context);
    }
    this.child = this.contentTemplate.bind(context);
    this.section.appendChild(this.child.render());
  },
  unbind: function () {
    if (this.child) this.child.unbind();
  }
});
},{"./base":12}],16:[function(require,module,exports){
extend = require("../../utils/extend");


module.exports = function () {

  var blockBindings = extend({}, {
    "if": require("./condition"),
    "else": require("./else"),
    "elseif": require("./condition"),
    "html": require("./html"),
    "each": require("./each")
  });

  return {
    register: function (name, blockBinding) {
      blockBindings[name] = blockBinding;
    },
    getClass: function (name) {
      return blockBindings[name];
    }
  };
}
},{"../../utils/extend":50,"./condition":13,"./each":14,"./else":15,"./html":17}],17:[function(require,module,exports){
var BaseBlockBinding = require("./base");

module.exports = BaseBlockBinding.extend({
  didChange: function (value, oldValue) {

    // has a remove script
    if (oldValue && oldValue.remove) {
      oldValue.remove();
    }


    if (!value) {
      return this.section.removeAll();
    }

    var node;

    if (value.render) {
      value.remove();
      node = value.render();
    } else if (value.nodeType != null) {
      node = value;
    } else {
      if (this.nodeFactory.name !== "dom") {
        node = this.nodeFactory.createTextNode(String(value));
      } else {
        var div = this.nodeFactory.createElement("div");
        div.innerHTML = String(value);
        node = this.nodeFactory.createFragment(div.childNodes);
      }
    }

    return this.section.replaceChildNodes(node);
  }
});
},{"./base":12}],18:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 * bindings specific to the view
 */

function Bindings () {
  this._bindings = [];
}

protoclass(Bindings, {

  /**
   */

  push: function (clip) {
    this._bindings.push(clip);
  },

  /**
   */

  bind: function (context) {
    if (this._bound) this.unbind();
    this._bound = true;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].bind(context);
    }
  },

  /**
   */

  unbind: function () {
    this._bound = false;
    for (var i = this._bindings.length; i--;) {
      this._bindings[i].unbind();
    }
  }
});

module.exports = Bindings;
},{"protoclass":107}],19:[function(require,module,exports){
var protoclass = require("protoclass");

/**
 * Clips are the {{blocks}} that are defined int the template. These
 * are objects that get defined ONCE, then generate bindings which get "clipped"
 * onto views.
 */

function Clips (template) {
  this.template = template;
  this._clips   = [];
}

protoclass(Clips, {

  /**
   */

  push: function (clip) {
    this._clips.push(clip);
  },

  /**
   * called after the template node is created. Sets the clips
   * up to be re-used
   */

  initialize: function () {
    for (var i = this._clips.length; i--;) {
      this._clips[i].initialize();
    }
  },

  /**
   * hydrates the view with bindings
   */

  prepare: function (view) {
    for (var i = this._clips.length; i--;) {
      this._clips[i].prepare(view);
    }
  }
});

module.exports = Clips;
},{"protoclass":107}],20:[function(require,module,exports){
module.exports = {
  uppercase: function (value) {
    return String(value).toUpperCase();
  },
  lowercase: function (value) {
    return String(value).toLowerCase();
  },
  titlecase: function (value) {
    var str;

    str = String(value);
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  },
  json: function (value, count, delimiter) {
    return JSON.stringify.apply(JSON, arguments);
  },
  isNaN: function (value) {
    return isNaN(value);
  }
};
},{}],21:[function(require,module,exports){
(function (process,global){
var Application          = require("mojo-application"),
template                 = require("./template"),
defaultModifiers         = require("./defaultModifiers"),
BaseBlockBinding         = require("./bindings/block/base"),
createBlockBindingFacory = require("./bindings/block/factory"),
createAttrBindingFactory = require("./bindings/attrs/factory"),
BaseAttrBinding          = require("./bindings/attrs/base"),
extend                   = require("./utils/extend");

if (!process.browser) {
  require("./register");
}

module.exports = function (app) {

  if (!app) app = Application.main;
  if (app.paperlip) return app.paperlip;

  var _modifiers = extend({}, defaultModifiers),
  blockBindingFactory = createBlockBindingFacory(app),
  attrBindingFactory  = createAttrBindingFactory(app);

  if (!app.animate) app.use(require("mojo-animator"));

  return app.paperclip = {

    /**
     */

    application: app,

    /**
     */

    modifiers: _modifiers,

    /**
     */

    modifier: function (name, modifier) {
      _modifiers[name] = modifier;
    },

    /**
     */

    template: function (source, rapp) {
      return new template(source, rapp || app);
    },

    /**
     */

    blockBinding: blockBindingFactory.register,

    /**
     */

    blockBindingFactory: blockBindingFactory,

    /**
     */

    attrBinding: attrBindingFactory.register,

    /**
     */

    attrBindingFactory: attrBindingFactory
  };
}


var pc = global.paperclip = module.exports();

for (var key in pc) {
  module.exports[key] = pc[key];
}

module.exports.BaseBlockBinding = BaseBlockBinding;
module.exports.BaseAttrBinding  = BaseAttrBinding;
module.exports.parser = require("./parser");

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./bindings/attrs/base":1,"./bindings/attrs/factory":8,"./bindings/block/base":12,"./bindings/block/factory":16,"./defaultModifiers":20,"./parser":43,"./register":45,"./template":48,"./utils/extend":50,"_process":70,"mojo-animator":74,"mojo-application":76}],22:[function(require,module,exports){
var BaseExpression = require("./base"),
ParametersExpression = require("./parameters");

function ArrayExpression (expressions) {
  this.expressions = expressions || new ParametersExpression();
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ArrayExpression, {
  type: "array",
  toJavaScript: function () {
    return "[" + this.expressions.toJavaScript() + "]";
  }
});

module.exports = ArrayExpression;
},{"./base":24,"./parameters":36}],23:[function(require,module,exports){
var BaseExpression = require("./base");

function AssignmentExpression (reference, value) {
  BaseExpression.apply(this, arguments);
  this.reference = reference;
  this.value     = value;
}

BaseExpression.extend(AssignmentExpression, {
  type: "assignment",
  toJavaScript: function () {

    var path = this.reference.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    return "this.set([" + path + "], " + this.value.toJavaScript() + ")";
  }
});

module.exports = AssignmentExpression;
},{"./base":24}],24:[function(require,module,exports){
var protoclass = require("protoclass");

function BaseExpression () {
  this._children = [];
  this._addChildren(Array.prototype.slice.call(arguments, 0));
}

protoclass(BaseExpression, {

  /**
   */

  __isExpression: true,

  /**
   */

  _addChildren: function (children) {
    for (var i = children.length; i--;) {
      var child = children[i];
      if (!child) continue;
      if (child.__isExpression) {
        this._children.push(child);
      } else if (typeof child === "object") {
        for (var k in child) {
          this._addChildren([child[k]]);
        }
      }
    }
  },

  /**
   */

  filterAllChildren: function (filter) {
    var filtered = [];

    this.traverseChildren(function (child) {
      if(filter(child)) {
        filtered.push(child);
      }
    });
    
    return filtered;
  },

  /**
   */

  traverseChildren: function (fn) {

    fn(this);

    for (var i = this._children.length; i--;) {
      var child = this._children[i];
      child.traverseChildren(fn);
    }
  }
});

module.exports = BaseExpression;
},{"protoclass":107}],25:[function(require,module,exports){
var BaseExpression = require("./base");

function BlockBindingExpression (scripts, contentTemplate, childBlock) {
  this.scripts    = scripts;
  this.contentTemplate = contentTemplate;
  this.childBlock = childBlock;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(BlockBindingExpression, {
  type: "blockBinding",
  toJavaScript: function () {
    var buffer = "block("+ this.scripts.toJavaScript() +", " + (this.contentTemplate ? this.contentTemplate.toJavaScript() : "void 0");

    if (this.childBlock) {
      buffer += ", " + this.childBlock.toJavaScript();
    }

    return buffer + ")";
  }
});

module.exports = BlockBindingExpression;
},{"./base":24}],26:[function(require,module,exports){
var BaseExpression = require("./base");

function CallExpression (reference, parameters) {
  this.reference  = reference;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CallExpression, {
  type: "call",
  toJavaScript: function () {

    var path = this.reference.path.concat(),
    fnName   = path.pop();

    var buffer = "this.call(";

    if (path.length) {
      buffer += "this.get([" + path.map(function (name) {
        return "\"" + name + "\"";
      }).join(",") + "])"
    } else {
      buffer += "this.context"
    }

    buffer += ", \"" + fnName + "\"";

    buffer += ", [" + this.parameters.toJavaScript() + "]"

    return buffer + ")"
  }
});

module.exports = CallExpression;
},{"./base":24}],27:[function(require,module,exports){
var BaseExpression = require("./base");

function CommentNodeExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(CommentNodeExpression, {
  type: "commentNode",
  toJavaScript: function () {
    return "comment(\"" + this.value.replace(/["]/g, "\\\"") + "\")"
  }
});

module.exports = CommentNodeExpression;
},{"./base":24}],28:[function(require,module,exports){
var BaseExpression = require("./base");

function DoctypeExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(DoctypeExpression, {
  type: "doctype",
  toJavaScript: function () {
    return "text('<!DOCTYPE " + this.value + ">')"
  }
});

module.exports = DoctypeExpression;
},{"./base":24}],29:[function(require,module,exports){
var BaseExpression = require("./base"),
ArrayExpression    = require("./array");

function ElementNodeExpression (nodeName, attributes, childNodes) {
  this.name       = nodeName;
  this.attributes = attributes;
  this.childNodes = childNodes || new ArrayExpression();
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ElementNodeExpression, {
  type: "elementNode",
  toJavaScript: function () {
    return "element(\"" + this.name + "\", " + this.attributes.toJavaScript() + ", " + this.childNodes.toJavaScript() + ")";
  }
});

module.exports = ElementNodeExpression;
},{"./array":22,"./base":24}],30:[function(require,module,exports){
var BaseExpression = require("./base");

function GroupExpression (expression) {
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(GroupExpression, {
  type: "call",
  toJavaScript: function () {
    return "(" + this.expression.toJavaScript() + ")";
  }
});

module.exports = GroupExpression;
},{"./base":24}],31:[function(require,module,exports){
var BaseExpression = require("./base");

function HashExpression (values) {
  this.value = values;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(HashExpression, {
  type: "hash",
  toJavaScript: function () {

    var items = [];

    for (var key in this.value) {
      var v = this.value[key];
      items.push("'"+key+"':"+v.toJavaScript());
    }

    return "{" + items.join(", ") + "}";
  }
});

module.exports = HashExpression;
},{"./base":24}],32:[function(require,module,exports){
var BaseExpression = require("./base");

function LiteralExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(LiteralExpression, {
  type: "literal",
  toJavaScript: function () {
    return String(this.value);
  }
});

module.exports = LiteralExpression;
},{"./base":24}],33:[function(require,module,exports){
var BaseExpression = require("./base");

function ModifierExpression (name, parameters) {
  this.name  = name;
  this.parameters = parameters;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ModifierExpression, {
  type: "modifier",
  toJavaScript: function () {

    var buffer = "modifiers." + this.name + ".call(this" 

    var params = this.parameters.toJavaScript();

    if (params.length) {
      buffer += ", " + params;
    }
    
  
    return buffer + ")";

  }
});

module.exports = ModifierExpression;
},{"./base":24}],34:[function(require,module,exports){
var BaseExpression = require("./base");

function NotExpression (operator, expression) {
  this.operator = operator;
  this.expression = expression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(NotExpression, {
  type: "!",
  toJavaScript: function () {
    return this.operator + this.expression.toJavaScript();
  }
});

module.exports = NotExpression;
},{"./base":24}],35:[function(require,module,exports){
var BaseExpression = require("./base");

function OperatorExpression (operator, left, right) {
  this.operator = operator;
  this.left     = left;
  this.right    = right;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(OperatorExpression, {
  type: "operator",
  toJavaScript: function () {
    return this.left.toJavaScript() + this.operator + this.right.toJavaScript();
  }
});

module.exports = OperatorExpression;
},{"./base":24}],36:[function(require,module,exports){
var BaseExpression = require("./base");

function ParametersExpression (expressions) {
  this.expressions = expressions || [];
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ParametersExpression, {
  type: "parameters",
  toJavaScript: function () {
    return this.expressions.map(function (expression) {
      return expression.toJavaScript();
    }).join(", ");
  }
});

module.exports = ParametersExpression;
},{"./base":24}],37:[function(require,module,exports){
var BaseExpression = require("./base");

function ReferenceExpression (path, bindingType) {
  this.path       = path;
  this.bindingType = bindingType;
  this.fast = bindingType === "^";
  this.unbound  = ["~", "~>"].indexOf(bindingType) !== -1;
  this._isBoundTo = ~["<~", "<~>", "~>"].indexOf(this.bindingType);
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ReferenceExpression, {
  type: "reference",
  toJavaScript: function () {

    if (!this._isBoundTo)
    if (this.fast) {
      return "this.context." + this.path.join(".");
    }


    var path = this.path.map(function(p) { return "'"+p+"'"; }).join(', ');

    if (this._isBoundTo) {
      return "this.bindTo([" + path + "], "+(this.bindingType !== "<~")+")";
    }

    return "this.context.get([" + path + "])";
  }
});

module.exports = ReferenceExpression;
},{"./base":24}],38:[function(require,module,exports){
var BaseExpression = require("./base");

function RootExpression (children) {
  this.childNodes = children;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(RootExpression, {
  type: "rootNode",
  toJavaScript: function () {

    var buffer = "(function (fragment, block, element, text, comment, parser, modifiers) { ";

    var element;

    if (this.childNodes.type === "array") {
      if (this.childNodes.expressions.expressions.length > 1) {
        element = "fragment(" + this.childNodes.toJavaScript() + ")";
      } else if (this.childNodes.expressions.expressions.length) {
        element = this.childNodes.expressions.expressions[0].toJavaScript();
      } else {
        return buffer + "})";
      }
    } else {
      element = this.childNodes.toJavaScript();
    }

    return buffer + "return " + element + "; })"
  }
});

module.exports = RootExpression;
},{"./base":24}],39:[function(require,module,exports){
var BaseExpression = require("./base"),
uniq               = require("../../utils/uniq");

function ScriptExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(ScriptExpression, {
  type: "script",
  toJavaScript: function () {

    var refs = this.filterAllChildren(function (child) {
      return child.type === "reference";
    }).filter(function (reference) {
      return !reference.unbound && reference.path;
    }).map(function (reference) {
      return reference.path;
    });




    // remove duplicate references
    refs = uniq(refs.map(function (ref) {
      return ref.join(".")
    })).map(function (ref) {
      return ref.split(".");
    })

    var buffer = "{";

    buffer += "run: function () { return " + this.value.toJavaScript() + "; }";

    buffer += ", refs: " + JSON.stringify(refs)

    return buffer + "}";
  }
});

module.exports = ScriptExpression;
},{"../../utils/uniq":53,"./base":24}],40:[function(require,module,exports){
var BaseExpression = require("./base");

function StringExpression (value) {
  this.value = value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(StringExpression, {
  type: "string",
  toJavaScript: function () {
    return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
  }
});

module.exports = StringExpression;
},{"./base":24}],41:[function(require,module,exports){
var BaseExpression = require("./base");

function TernaryConditionExpression (condition, tExpression, fExpression) {
  this.condition = condition;
  this.tExpression = tExpression;
  this.fExpression = fExpression;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TernaryConditionExpression, {
  type: "ternaryCondition",
  toJavaScript: function () {
    return this.condition.toJavaScript() + "?" + this.tExpression.toJavaScript() + ":" + this.fExpression.toJavaScript();
  }
});

module.exports = TernaryConditionExpression;
},{"./base":24}],42:[function(require,module,exports){
var BaseExpression = require("./base"),
he                 = require("he");

function TextNodeExpression (value) {
  this.value = he.decode(value);
  this.decoded = this.value !== value;
  BaseExpression.apply(this, arguments);
}

BaseExpression.extend(TextNodeExpression, {
  type: "textNode",
  toJavaScript: function () {
    return "text(\"" + this.value.replace(/["]/g, "\\\"") + "\")";
  }
});

module.exports = TextNodeExpression;

},{"./base":24,"he":72}],43:[function(require,module,exports){
var parser = require("./parser");

var scripts = {}, parse;

module.exports = {

  /**
   */

  parse: parse = function (html) {
    return '"use strict";' + "module.exports = " + parser.parse(html).toJavaScript();
  },

  /**
   */

  compile: function (nameOrContent) {
    var content;


    if (scripts[nameOrContent]) {
      return scripts[nameOrContent];
    }

    try {
      if (typeof $ !== "undefined") {
        content = $("script[data-template-name='" + nameOrContent + "']").html();
      }
    } catch (e) {

    }

    if (!content) {
      content = nameOrContent;
    }

    var source = '"use strict";return '+parser.parse(content).toJavaScript();


    return scripts[nameOrContent] = new Function(source)();
  }
}

if (typeof (typeof window !== "undefined" && window !== null ? window.paperclip : void 0) !== "undefined") {
  window.paperclip.compile           = module.exports.compile;
  window.paperclip.script            = module.exports.script;
  window.paperclip.template.compiler = module.exports;
}

},{"./parser":44}],44:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { Start: peg$parseStart },
        peg$startRuleFunction  = peg$parseStart,

        peg$c0 = function(children) { return new RootNodeExpression(children); },
        peg$c1 = peg$FAILED,
        peg$c2 = "<!DOCTYPE",
        peg$c3 = { type: "literal", value: "<!DOCTYPE", description: "\"<!DOCTYPE\"" },
        peg$c4 = [],
        peg$c5 = /^[^>]/,
        peg$c6 = { type: "class", value: "[^>]", description: "[^>]" },
        peg$c7 = ">",
        peg$c8 = { type: "literal", value: ">", description: "\">\"" },
        peg$c9 = function(info) {
              return new DocTypeExpression(info.join(""));
            },
        peg$c10 = function(children) { return new ArrayExpression(new ParametersExpression(trimTextExpressions(children))) },
        peg$c11 = "<!--",
        peg$c12 = { type: "literal", value: "<!--", description: "\"<!--\"" },
        peg$c13 = void 0,
        peg$c14 = "-->",
        peg$c15 = { type: "literal", value: "-->", description: "\"-->\"" },
        peg$c16 = function(v) { return v; },
        peg$c17 = function(value) {
            return new CommentNodeExpression(trimEnds(value.join("")));
          },
        peg$c18 = function(startTag, children, endTag) {

            if (startTag.name != endTag.name) {
              expected("</" + startTag.name + ">");
            }

            return new ElementNodeExpression(startTag.name, startTag.attributes, children);
          },
        peg$c19 = function(value) {
              return new TextNodeExpression(trimNewLineChars(value.join("")))
            },
        peg$c20 = "<",
        peg$c21 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c22 = "{{",
        peg$c23 = { type: "literal", value: "{{", description: "\"{{\"" },
        peg$c24 = function() {
              return text()
            },
        peg$c25 = function(info) { return info; },
        peg$c26 = "/>",
        peg$c27 = { type: "literal", value: "/>", description: "\"/>\"" },
        peg$c28 = function(info) { return new ElementNodeExpression(info.name, info.attributes); },
        peg$c29 = function(name, attributes) {

              var attrs = {};

              for (var i = 0, n = attributes.length; i < n; i++) {
                var attr = attributes[i];
                attrs[attr.name] = attr.value;
              }

              return {
                name: name,
                attributes: new HashExpression(attrs)
              };
            },
        peg$c30 = "</",
        peg$c31 = { type: "literal", value: "</", description: "\"</\"" },
        peg$c32 = function(name) {
              return {
                name: name
              };
            },
        peg$c33 = /^[a-zA-Z0-9:_\-]/,
        peg$c34 = { type: "class", value: "[a-zA-Z0-9:_\\-]", description: "[a-zA-Z0-9:_\\-]" },
        peg$c35 = function(word) { return word.join(""); },
        peg$c36 = "=",
        peg$c37 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c38 = function(name, values) {
              return {
                name: name,
                value: values
              };
            },
        peg$c39 = function(name) {
              return {
                name: name,
                value: new LiteralExpression(true)
              }
            },
        peg$c40 = "\"",
        peg$c41 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c42 = /^[^"]/,
        peg$c43 = { type: "class", value: "[^\"]", description: "[^\"]" },
        peg$c44 = function() { return new StringExpression(trimNewLineChars(text())); },
        peg$c45 = function(values) { return attrValues(values); },
        peg$c46 = "'",
        peg$c47 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c48 = /^[^']/,
        peg$c49 = { type: "class", value: "[^']", description: "[^']" },
        peg$c50 = function(binding) { return attrValues([binding]); },
        peg$c51 = "{{#",
        peg$c52 = { type: "literal", value: "{{#", description: "\"{{#\"" },
        peg$c53 = function(blockBinding) { return blockBinding; },
        peg$c54 = function(scripts, fragment, child) {
              return new BlockBindingExpression(scripts, fragment, child);
            },
        peg$c55 = "{{/",
        peg$c56 = { type: "literal", value: "{{/", description: "\"{{/\"" },
        peg$c57 = function(blockBinding) { return new RootNodeExpression(blockBinding); },
        peg$c58 = "{{/}}",
        peg$c59 = { type: "literal", value: "{{/}}", description: "\"{{/}}\"" },
        peg$c60 = function() { return void 0; },
        peg$c61 = "}}",
        peg$c62 = { type: "literal", value: "}}", description: "\"}}\"" },
        peg$c63 = function(scripts) {
              return new BlockBindingExpression(scripts);
            },
        peg$c64 = function(scripts) {
              return scripts;
            },
        peg$c65 = function(scriptName) {
              var hash = {};
              hash[scriptName] = new ScriptExpression(new LiteralExpression(true));
              return new HashExpression(hash)
            },
        peg$c66 = function(scripts) {
              for (var k in scripts) {
                scripts[k] = new ScriptExpression(scripts[k]);
              }
              return new HashExpression(scripts);
            },
        peg$c67 = ",",
        peg$c68 = { type: "literal", value: ",", description: "\",\"" },
        peg$c69 = function(value, ascripts) {

              var scripts = {
                value: new ScriptExpression(value)
              };

              ascripts = ascripts.length ? ascripts[0][1] : [];
              for (var i = 0, n = ascripts.length; i < n; i++) {
                scripts[ascripts[i].key] = new ScriptExpression(ascripts[i].value);
              }

              return new HashExpression(scripts);
            },
        peg$c70 = "?",
        peg$c71 = { type: "literal", value: "?", description: "\"?\"" },
        peg$c72 = ":",
        peg$c73 = { type: "literal", value: ":", description: "\":\"" },
        peg$c74 = function(condition, left, right) {
              return new TernaryConditionExpression(condition, left, right);
            },
        peg$c75 = "(",
        peg$c76 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c77 = ")",
        peg$c78 = { type: "literal", value: ")", description: "\")\"" },
        peg$c79 = function(params) {
              return params;
            },
        peg$c80 = "()",
        peg$c81 = { type: "literal", value: "()", description: "\"()\"" },
        peg$c82 = function() { []; },
        peg$c83 = function(param1, rest) {
              return [param1].concat(rest.map(function (v) {
                return v[1];
              }));
            },
        peg$c84 = function(left, right) {
              return new AssignmentExpression(left, right);
            },
        peg$c85 = "&&",
        peg$c86 = { type: "literal", value: "&&", description: "\"&&\"" },
        peg$c87 = "||",
        peg$c88 = { type: "literal", value: "||", description: "\"||\"" },
        peg$c89 = "===",
        peg$c90 = { type: "literal", value: "===", description: "\"===\"" },
        peg$c91 = "==",
        peg$c92 = { type: "literal", value: "==", description: "\"==\"" },
        peg$c93 = "!==",
        peg$c94 = { type: "literal", value: "!==", description: "\"!==\"" },
        peg$c95 = "!=",
        peg$c96 = { type: "literal", value: "!=", description: "\"!=\"" },
        peg$c97 = ">==",
        peg$c98 = { type: "literal", value: ">==", description: "\">==\"" },
        peg$c99 = ">=",
        peg$c100 = { type: "literal", value: ">=", description: "\">=\"" },
        peg$c101 = "<==",
        peg$c102 = { type: "literal", value: "<==", description: "\"<==\"" },
        peg$c103 = "<=",
        peg$c104 = { type: "literal", value: "<=", description: "\"<=\"" },
        peg$c105 = "+",
        peg$c106 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c107 = "-",
        peg$c108 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c109 = "%",
        peg$c110 = { type: "literal", value: "%", description: "\"%\"" },
        peg$c111 = "*",
        peg$c112 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c113 = "/",
        peg$c114 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c115 = function(left, operator, right) {
              return new OperatorExpression(operator, left, right);
            },
        peg$c116 = function(value) { return value; },
        peg$c117 = function(expression, modifiers) {

              for (var i = 0, n = modifiers.length; i < n; i++) {
                expression = new ModifierExpression(modifiers[i].name, new ParametersExpression([expression].concat(modifiers[i].parameters)));
              }

              return expression;
            },
        peg$c118 = "|",
        peg$c119 = { type: "literal", value: "|", description: "\"|\"" },
        peg$c120 = null,
        peg$c121 = function(name, parameters) {
            return {
              name: name,
              parameters: parameters || []
            }
          },
        peg$c122 = function(context) { return context; },
        peg$c123 = "!",
        peg$c124 = { type: "literal", value: "!", description: "\"!\"" },
        peg$c125 = function(not, value) {
              return new NotExpression(not, value);
            },
        peg$c126 = /^[0-9]/,
        peg$c127 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c128 = function(value) {
              return new LiteralExpression(parseFloat(text()));
            },
        peg$c129 = ".",
        peg$c130 = { type: "literal", value: ".", description: "\".\"" },
        peg$c131 = function(group) { return new GroupExpression(group); },
        peg$c132 = function(expression) {
              return new LiteralExpression(expression.value);
            },
        peg$c133 = "true",
        peg$c134 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c135 = "false",
        peg$c136 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c137 = function(value) {
              return {
                type: "boolean",
                value: value === "true"
              }
            },
        peg$c138 = "undefined",
        peg$c139 = { type: "literal", value: "undefined", description: "\"undefined\"" },
        peg$c140 = function() { return { type: "undefined", value: void 0 }; },
        peg$c141 = "NaN",
        peg$c142 = { type: "literal", value: "NaN", description: "\"NaN\"" },
        peg$c143 = function() { return { type: "nan", value: NaN }; },
        peg$c144 = "Infinity",
        peg$c145 = { type: "literal", value: "Infinity", description: "\"Infinity\"" },
        peg$c146 = function() { return { type: "infinity", value: Infinity }; },
        peg$c147 = "null",
        peg$c148 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c149 = "NULL",
        peg$c150 = { type: "literal", value: "NULL", description: "\"NULL\"" },
        peg$c151 = function() { return { type: "null", value: null }; },
        peg$c152 = function(reference, parameters) {
              return new CallExpression(reference, new ParametersExpression(parameters));
            },
        peg$c153 = "^",
        peg$c154 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c155 = "~>",
        peg$c156 = { type: "literal", value: "~>", description: "\"~>\"" },
        peg$c157 = "<~>",
        peg$c158 = { type: "literal", value: "<~>", description: "\"<~>\"" },
        peg$c159 = "~",
        peg$c160 = { type: "literal", value: "~", description: "\"~\"" },
        peg$c161 = "<~",
        peg$c162 = { type: "literal", value: "<~", description: "\"<~\"" },
        peg$c163 = function(bindingType, reference, path) {
              path = [reference].concat(path.map(function (p) { return p[1] }));
              return new ReferenceExpression(path, bindingType);
            },
        peg$c164 = /^[a-zA-Z_$0-9]/,
        peg$c165 = { type: "class", value: "[a-zA-Z_$0-9]", description: "[a-zA-Z_$0-9]" },
        peg$c166 = function(name) { return text(); },
        peg$c167 = "{",
        peg$c168 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c169 = "}",
        peg$c170 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c171 = function(values) {
              return new HashExpression(values);
            },
        peg$c172 = function(values) {
              var s = {};
              for (i = 0, n = values.length; i < n; i++) {
                s[values[i].key] = values[i].value;
              }
              return s;
            },
        peg$c173 = function(firstValue, additionalValues) {
              return [
                firstValue
              ].concat(additionalValues.length ? additionalValues[0][1] : []);
            },
        peg$c174 = function(key, value) {
              return {
                key: key,
                value: value || new LiteralExpression(void 0)
              }
            },
        peg$c175 = function(key) { return key.value; },
        peg$c176 = function(key) { return key; },
        peg$c177 = { type: "other", description: "string" },
        peg$c178 = function(chars) {
              return new StringExpression(chars.join(""));
            },
        peg$c179 = "\\",
        peg$c180 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c181 = function() { return text(); },
        peg$c182 = "\\\"",
        peg$c183 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
        peg$c184 = "\\'",
        peg$c185 = { type: "literal", value: "\\'", description: "\"\\\\'\"" },
        peg$c186 = { type: "any", description: "any character" },
        peg$c187 = /^[a-zA-Z]/,
        peg$c188 = { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
        peg$c189 = function(chars) { return chars.join(""); },
        peg$c190 = /^[ \n\r\t]/,
        peg$c191 = { type: "class", value: "[ \\n\\r\\t]", description: "[ \\n\\r\\t]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parseStart() {
      var s0;

      s0 = peg$parseTemplate();

      return s0;
    }

    function peg$parseTemplate() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseChildNodes();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseDocType() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c2) {
        s1 = peg$c2;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c3); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$c5.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              if (peg$c5.test(input.charAt(peg$currPos))) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c6); }
              }
            }
          } else {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 62) {
                s5 = peg$c7;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c9(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseChildNodes() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseElementNode();
      if (s2 === peg$FAILED) {
        s2 = peg$parseTextNode();
        if (s2 === peg$FAILED) {
          s2 = peg$parseBlockBinding();
          if (s2 === peg$FAILED) {
            s2 = peg$parseCommentNode();
          }
        }
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseElementNode();
        if (s2 === peg$FAILED) {
          s2 = peg$parseTextNode();
          if (s2 === peg$FAILED) {
            s2 = peg$parseBlockBinding();
            if (s2 === peg$FAILED) {
              s2 = peg$parseCommentNode();
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c10(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseCommentNode() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c11) {
          s2 = peg$c11;
          peg$currPos += 4;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c12); }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 3) === peg$c14) {
            s6 = peg$c14;
            peg$currPos += 3;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c15); }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = peg$c13;
          } else {
            peg$currPos = s5;
            s5 = peg$c1;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parseSourceCharacter();
            if (s6 !== peg$FAILED) {
              peg$reportedPos = s4;
              s5 = peg$c16(s6);
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$c1;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c1;
          }
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 3) === peg$c14) {
                s6 = peg$c14;
                peg$currPos += 3;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c15); }
              }
              peg$silentFails--;
              if (s6 === peg$FAILED) {
                s5 = peg$c13;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseSourceCharacter();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c16(s6);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c1;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c1;
              }
            }
          } else {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c14) {
              s4 = peg$c14;
              peg$currPos += 3;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c15); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c17(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseDocType();
      }

      return s0;
    }

    function peg$parseElementNode() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseStartTag();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseChildNodes();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseEndTag();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c18(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseStartEndTag();
      }

      return s0;
    }

    function peg$parseTextNode() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseTextCharacter();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseTextCharacter();
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c19(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseTextCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 60) {
        s2 = peg$c20;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c22) {
          s2 = peg$c22;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c23); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c24();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseStartTag() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s2 = peg$c20;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTagInfo();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 62) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c25(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseStartEndTag() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 60) {
          s2 = peg$c20;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c21); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTagInfo();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c26) {
              s4 = peg$c26;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c27); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c28(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseTagInfo() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseTagName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseAttribute();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseAttribute();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c29(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEndTag() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c30) {
        s1 = peg$c30;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c31); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTagName();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 62) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c32(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseTagName() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c33.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c33.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c34); }
            }
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAttribute() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseTagName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s3 = peg$c36;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseAttributeValues();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c38(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseTagName();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseAttributeValues() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c40;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseAttrTextBinding();
        if (s3 === peg$FAILED) {
          s3 = peg$currPos;
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c22) {
            s7 = peg$c22;
            peg$currPos += 2;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
          peg$silentFails--;
          if (s7 === peg$FAILED) {
            s6 = peg$c13;
          } else {
            peg$currPos = s6;
            s6 = peg$c1;
          }
          if (s6 !== peg$FAILED) {
            if (peg$c42.test(input.charAt(peg$currPos))) {
              s7 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
            }
            if (s7 !== peg$FAILED) {
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$c1;
          }
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              s6 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c22) {
                s7 = peg$c22;
                peg$currPos += 2;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              peg$silentFails--;
              if (s7 === peg$FAILED) {
                s6 = peg$c13;
              } else {
                peg$currPos = s6;
                s6 = peg$c1;
              }
              if (s6 !== peg$FAILED) {
                if (peg$c42.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c43); }
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            }
          } else {
            s4 = peg$c1;
          }
          if (s4 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c44();
          }
          s3 = s4;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseAttrTextBinding();
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c22) {
              s7 = peg$c22;
              peg$currPos += 2;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = peg$c13;
            } else {
              peg$currPos = s6;
              s6 = peg$c1;
            }
            if (s6 !== peg$FAILED) {
              if (peg$c42.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c43); }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c22) {
                  s7 = peg$c22;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c23); }
                }
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                  s6 = peg$c13;
                } else {
                  peg$currPos = s6;
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  if (peg$c42.test(input.charAt(peg$currPos))) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c43); }
                  }
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
            } else {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c44();
            }
            s3 = s4;
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c40;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c45(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c46;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c47); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseAttrTextBinding();
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            s4 = [];
            s5 = peg$currPos;
            s6 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c22) {
              s7 = peg$c22;
              peg$currPos += 2;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            peg$silentFails--;
            if (s7 === peg$FAILED) {
              s6 = peg$c13;
            } else {
              peg$currPos = s6;
              s6 = peg$c1;
            }
            if (s6 !== peg$FAILED) {
              if (peg$c48.test(input.charAt(peg$currPos))) {
                s7 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c49); }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            if (s5 !== peg$FAILED) {
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$currPos;
                peg$silentFails++;
                if (input.substr(peg$currPos, 2) === peg$c22) {
                  s7 = peg$c22;
                  peg$currPos += 2;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c23); }
                }
                peg$silentFails--;
                if (s7 === peg$FAILED) {
                  s6 = peg$c13;
                } else {
                  peg$currPos = s6;
                  s6 = peg$c1;
                }
                if (s6 !== peg$FAILED) {
                  if (peg$c48.test(input.charAt(peg$currPos))) {
                    s7 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c49); }
                  }
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
            } else {
              s4 = peg$c1;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c44();
            }
            s3 = s4;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseAttrTextBinding();
            if (s3 === peg$FAILED) {
              s3 = peg$currPos;
              s4 = [];
              s5 = peg$currPos;
              s6 = peg$currPos;
              peg$silentFails++;
              if (input.substr(peg$currPos, 2) === peg$c22) {
                s7 = peg$c22;
                peg$currPos += 2;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              peg$silentFails--;
              if (s7 === peg$FAILED) {
                s6 = peg$c13;
              } else {
                peg$currPos = s6;
                s6 = peg$c1;
              }
              if (s6 !== peg$FAILED) {
                if (peg$c48.test(input.charAt(peg$currPos))) {
                  s7 = input.charAt(peg$currPos);
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c49); }
                }
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              if (s5 !== peg$FAILED) {
                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = peg$currPos;
                  s6 = peg$currPos;
                  peg$silentFails++;
                  if (input.substr(peg$currPos, 2) === peg$c22) {
                    s7 = peg$c22;
                    peg$currPos += 2;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c23); }
                  }
                  peg$silentFails--;
                  if (s7 === peg$FAILED) {
                    s6 = peg$c13;
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c1;
                  }
                  if (s6 !== peg$FAILED) {
                    if (peg$c48.test(input.charAt(peg$currPos))) {
                      s7 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c49); }
                    }
                    if (s7 !== peg$FAILED) {
                      s6 = [s6, s7];
                      s5 = s6;
                    } else {
                      peg$currPos = s5;
                      s5 = peg$c1;
                    }
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                }
              } else {
                s4 = peg$c1;
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c44();
              }
              s3 = s4;
            }
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c46;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c45(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseAttrTextBinding();
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c50(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseBlockBinding() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c51) {
        s1 = peg$c51;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseStartBlockBinding();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseTextBinding();
      }

      return s0;
    }

    function peg$parseStartBlockBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseSingleScript();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTemplate();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseChildBlockBinding();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c54(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseChildBlockBinding() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c55) {
        s1 = peg$c55;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseStartBlockBinding();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c57(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 5) === peg$c58) {
          s1 = peg$c58;
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c59); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c60();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseTextBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseScripts();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c61) {
                s5 = peg$c61;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c63(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAttrTextBinding() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseScripts();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c61) {
                s5 = peg$c61;
                peg$currPos += 2;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c62); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c64(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseSingleScript() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseReferenceName();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c61) {
              s4 = peg$c61;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c65(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseScripts();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c61) {
              s3 = peg$c61;
              peg$currPos += 2;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c62); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c64(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseScripts() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseHashValues();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c66(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse_();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseTernaryConditional();
          if (s2 !== peg$FAILED) {
            s3 = peg$parse_();
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c67;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c68); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parseHashValuesArray();
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s6 = peg$c67;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c68); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseHashValuesArray();
                  if (s7 !== peg$FAILED) {
                    s6 = [s6, s7];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c1;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              }
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c69(s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseTernaryConditional() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseAssignment();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 63) {
          s2 = peg$c70;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c71); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTernaryConditional();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c73); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTernaryConditional();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c74(s1, s3, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseAssignment();
      }

      return s0;
    }

    function peg$parseParameters() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseInnerParameters();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c77;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c79(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c80) {
          s1 = peg$c80;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c81); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c82();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseInnerParameters() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseTernaryConditional();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c67;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseTernaryConditional();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c67;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseTernaryConditional();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c83(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseAssignment() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseObjectReference();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c36;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c37); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseAssignment();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c84(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseOperation();
      }

      return s0;
    }

    function peg$parseOperation() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseOperatable();
      if (s1 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c85) {
          s2 = peg$c85;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c86); }
        }
        if (s2 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c87) {
            s2 = peg$c87;
            peg$currPos += 2;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c88); }
          }
          if (s2 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c89) {
              s2 = peg$c89;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c90); }
            }
            if (s2 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c91) {
                s2 = peg$c91;
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c92); }
              }
              if (s2 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c93) {
                  s2 = peg$c93;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c94); }
                }
                if (s2 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c95) {
                    s2 = peg$c95;
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c96); }
                  }
                  if (s2 === peg$FAILED) {
                    if (input.substr(peg$currPos, 3) === peg$c97) {
                      s2 = peg$c97;
                      peg$currPos += 3;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c98); }
                    }
                    if (s2 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c99) {
                        s2 = peg$c99;
                        peg$currPos += 2;
                      } else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c100); }
                      }
                      if (s2 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 62) {
                          s2 = peg$c7;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c8); }
                        }
                        if (s2 === peg$FAILED) {
                          if (input.substr(peg$currPos, 3) === peg$c101) {
                            s2 = peg$c101;
                            peg$currPos += 3;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c102); }
                          }
                          if (s2 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c103) {
                              s2 = peg$c103;
                              peg$currPos += 2;
                            } else {
                              s2 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c104); }
                            }
                            if (s2 === peg$FAILED) {
                              if (input.charCodeAt(peg$currPos) === 60) {
                                s2 = peg$c20;
                                peg$currPos++;
                              } else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c21); }
                              }
                              if (s2 === peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 43) {
                                  s2 = peg$c105;
                                  peg$currPos++;
                                } else {
                                  s2 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c106); }
                                }
                                if (s2 === peg$FAILED) {
                                  if (input.charCodeAt(peg$currPos) === 45) {
                                    s2 = peg$c107;
                                    peg$currPos++;
                                  } else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c108); }
                                  }
                                  if (s2 === peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 37) {
                                      s2 = peg$c109;
                                      peg$currPos++;
                                    } else {
                                      s2 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c110); }
                                    }
                                    if (s2 === peg$FAILED) {
                                      if (input.charCodeAt(peg$currPos) === 42) {
                                        s2 = peg$c111;
                                        peg$currPos++;
                                      } else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c112); }
                                      }
                                      if (s2 === peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 47) {
                                          s2 = peg$c113;
                                          peg$currPos++;
                                        } else {
                                          s2 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c114); }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseOperation();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c115(s1, s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseOperatable();
      }

      return s0;
    }

    function peg$parseOperatable() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseModifiers();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c116(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseModifiers() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseNot();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseModifier();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseModifier();
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c117(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseFunctionCall();
        if (s0 === peg$FAILED) {
          s0 = peg$parseObjectReference();
        }
      }

      return s0;
    }

    function peg$parseModifier() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 124) {
        s1 = peg$c118;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseReferenceName();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseParameters();
            if (s4 === peg$FAILED) {
              s4 = peg$c120;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c121(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseObjectReference() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseObject();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c122(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseNot() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 33) {
        s1 = peg$c123;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c107;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c108); }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNot();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c125(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseReserved();
        if (s0 === peg$FAILED) {
          s0 = peg$parseFunctionCall();
          if (s0 === peg$FAILED) {
            s0 = peg$parseObjectReference();
          }
        }
      }

      return s0;
    }

    function peg$parseObject() {
      var s0;

      s0 = peg$parseGroup();
      if (s0 === peg$FAILED) {
        s0 = peg$parseHash();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNumber();
          if (s0 === peg$FAILED) {
            s0 = peg$parseStringLiteral();
            if (s0 === peg$FAILED) {
              s0 = peg$parseReference();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseNumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c107;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$c120;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        if (peg$c126.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (peg$c126.test(input.charAt(peg$currPos))) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
          }
        } else {
          s4 = peg$c1;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseDecimalNumber();
          if (s5 === peg$FAILED) {
            s5 = peg$c120;
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        if (s3 === peg$FAILED) {
          s3 = peg$parseDecimalNumber();
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c1;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c128(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseDecimalNumber() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c129;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c130); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c126.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c127); }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$c126.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c127); }
            }
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseGroup() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseTernaryConditional();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c77;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c131(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReserved() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseBoolean();
      if (s1 === peg$FAILED) {
        s1 = peg$parseUndefined();
        if (s1 === peg$FAILED) {
          s1 = peg$parseNull();
          if (s1 === peg$FAILED) {
            s1 = peg$parseNaN();
            if (s1 === peg$FAILED) {
              s1 = peg$parseInfinity();
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c132(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseBoolean() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c133) {
        s1 = peg$c133;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c134); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c135) {
          s1 = peg$c135;
          peg$currPos += 5;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c136); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c137(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseUndefined() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c138) {
        s1 = peg$c138;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c139); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c140();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseNaN() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c141) {
        s1 = peg$c141;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c142); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c143();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseInfinity() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c144) {
        s1 = peg$c144;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c145); }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c146();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseNull() {
      var s0, s1;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c147) {
        s1 = peg$c147;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c148); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c149) {
          s1 = peg$c149;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c150); }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c151();
      }
      s0 = s1;

      return s0;
    }

    function peg$parseFunctionCall() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseObjectReference();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseParameters();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c152(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReference() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 94) {
        s1 = peg$c153;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c154); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c155) {
          s1 = peg$c155;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c156); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 3) === peg$c157) {
            s1 = peg$c157;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c158); }
          }
          if (s1 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 126) {
              s1 = peg$c159;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c160); }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 2) === peg$c161) {
                s1 = peg$c161;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c162); }
              }
            }
          }
        }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c120;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseReferenceName();
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s6 = peg$c129;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c130); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parseReferenceName();
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$c1;
            }
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 46) {
                s6 = peg$c129;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c130); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parseReferenceName();
                if (s7 !== peg$FAILED) {
                  s6 = [s6, s7];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$c1;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c1;
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c163(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseReferenceName() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c164.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c165); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c164.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c165); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c166(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseHash() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c167;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseHashValues();
          if (s3 === peg$FAILED) {
            s3 = peg$c120;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c169;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c170); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c171(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashValues() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseHashValuesArray();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c172(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseHashValuesArray() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseHashValue();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
          s4 = peg$c67;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c68); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseHashValuesArray();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c67;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseHashValuesArray();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c173(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashValue() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseHashKey();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c73); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTernaryConditional();
              if (s5 === peg$FAILED) {
                s5 = peg$c120;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c174(s2, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseHashKey() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseStringLiteral();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c175(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseReferenceName();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c176(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseStringLiteral() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c40;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDoubleStringCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDoubleStringCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c40;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c178(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c46;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c47); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseSingleStringCharacter();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseSingleStringCharacter();
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c46;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c47); }
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c178(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c177); }
      }

      return s0;
    }

    function peg$parseDoubleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c40;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c179;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c180); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c181();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c182) {
          s0 = peg$c182;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c183); }
        }
      }

      return s0;
    }

    function peg$parseSingleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c46;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c179;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c180); }
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c13;
      } else {
        peg$currPos = s1;
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c181();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c184) {
          s0 = peg$c184;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c185); }
        }
      }

      return s0;
    }

    function peg$parseSourceCharacter() {
      var s0;

      if (input.length > peg$currPos) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c186); }
      }

      return s0;
    }

    function peg$parseWord() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c187.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c188); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c187.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c188); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c189(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      if (peg$c190.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c191); }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$c190.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c191); }
        }
      }

      return s0;
    }


      var DoctypeExpression        = require("./ast/doctype"),
      RootNodeExpression           = require("./ast/rootNode"),
      TextNodeExpression           = require("./ast/textNode"),
      CommentNodeExpression        = require("./ast/commentNode"),
      ElementNodeExpression        = require("./ast/elementNode"),
      BlockBindingExpression       = require("./ast/blockBinding"),
      DocTypeExpression            = require("./ast/doctype"),
      TernaryConditionExpression   = require("./ast/ternaryCondition"),
      AssignmentExpression         = require("./ast/assignment"),
      OperatorExpression           = require("./ast/operator"),
      NotExpression                = require("./ast/not"),
      LiteralExpression            = require("./ast/literal"),
      StringExpression             = require("./ast/string"),
      ReferenceExpression          = require("./ast/reference"),
      HashExpression               = require("./ast/hash"),
      ScriptExpression             = require("./ast/script"),
      CallExpression               = require("./ast/call"),
      ModifierExpression           = require("./ast/modifier"),
      ArrayExpression              = require("./ast/array"),
      ParametersExpression         = require("./ast/parameters"),
      GroupExpression              = require("./ast/group");

      function trimWhitespace (ws) {
        return trimNewLineChars(ws).replace(/(^\s+)|(\s+$)/, "");
      }

      function trimEnds (ws) {
        return ws.replace(/(^\s+)|(\s+$)/, "").replace(/[\r\n]/g,"\\n");
      }

      function trimNewLineChars (ws) {
        return ws.replace(/[ \r\n\t]+/g, " ");
      }

      function trimmedText () {
        return trimWhitespace(text());
      }

      function singleOrArrayExpression (values) {
        return values.length === 1 ? values[0] : new ArrayExpression(new ParametersExpression(values));
      }

      function attrValues (values) {

        values = values.filter(function (v) {
          return!/^[\n\t\r]+$/.test(v.value);
        });

        var v = values.length === 1 && values[0].type === "string" ? values[0] : new ArrayExpression(new ParametersExpression(values));
        return v;
      }

      function trimTextExpressions (expressions) {

        function _trim (exprs) {
          var expr, i;
          for (i = exprs.length; i--;) {
            expr = exprs[i];
            if (expr.type == "textNode" && !/\S/.test(expr.value) && !expr.decoded) {
              exprs.splice(i, 1);
            } else {
              break;
            }
          }
          return exprs;
        }

        return _trim(_trim(expressions.reverse()).reverse());
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./ast/array":22,"./ast/assignment":23,"./ast/blockBinding":25,"./ast/call":26,"./ast/commentNode":27,"./ast/doctype":28,"./ast/elementNode":29,"./ast/group":30,"./ast/hash":31,"./ast/literal":32,"./ast/modifier":33,"./ast/not":34,"./ast/operator":35,"./ast/parameters":36,"./ast/reference":37,"./ast/rootNode":38,"./ast/script":39,"./ast/string":40,"./ast/ternaryCondition":41,"./ast/textNode":42}],45:[function(require,module,exports){
var parser = require("./parser"),
fs         = require("fs");

require.extensions[".pc"] = function (module, filename) {

  var paper, watching, compiled;

  function compileOnce () {
    if (compiled) return;
    compiled = true;
    compile();
  }

  function compile () {
    paper = parser.compile(fs.readFileSync(filename, "utf8"));
  }

  function watch () {
    if (watching) return;
    watching = true;
    fs.watchFile(filename, { persistent: true, interval: 500 }, compile)
  }

  module.exports = function () {
    compileOnce();
    watch();
    return paper.apply(this, arguments);
  }
};
},{"./parser":43,"fs":69}],46:[function(require,module,exports){
var BindableReference = require("./ref");

/**
 */


function createRunner (context) {
  return {
    context: context,
    get: function (path) {
      return this.context.get(path);
    },
    set: function (path, value) {
      return this.context.set(path, value);
    },
    bindTo: function (path, settable) {
      return new BindableReference(this, path, settable);
    },
    call: function (ctx, key, params) {

      var fn;

      if (!ctx) return;

      if (ctx.__isBindable) {
        fn = ctx.get(key);
        ctx = ctx;
      } else {
        fn = ctx[key];
      }

      if (fn) return fn.apply(ctx, params);
    }
  }
}


function boundScript (script) {

  var run = script.run, refs = script.refs;

  return {
    refs: refs,
    evaluate: function (context) {
      return run.call(createRunner(context));
    },
    bind: function (context, listener) {

      var runner = createRunner(context),
      currentValue,
      locked = false;

      function now () {
        if (locked) return;
        locked = true;
        var oldValue = currentValue;
        listener(currentValue = run.call(runner), oldValue);
        locked = false;
      }


      var dispose;

      if (!refs.length) return {
        dispose: function () {},
        now: now
      };

      if (refs.length === 1) {
        var dispose = context.bind(refs[0], now).dispose;
      } else {

        var bindings = [];


        for (var i = refs.length; i--;) {
          bindings.push(context.bind(refs[i], now));
        }

        dispose = function () {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }

      return {
        dispose: dispose,
        now: function () {
          now();
          return this;
        }
      }
    }
  };
};


/**
 * scripts combined with strings. defined within attributes usually
 */

function bufferedScript (values) {

  var scripts = values.filter(function (value) {
    return typeof value !== "string";
  }).map(function (scripts) {
    return scripts.value;
  });

  function evaluate (runner) {
    return values.map(function (script) {

      if (typeof script === "string") {
        return script;
      }

      return script.value.run.call(runner);

    }).join("");
  }

  return {
    evaluate: function (context) { 
      return evaluate(createRunner(context)); 
    },
    bind: function (context, listener) {

      var runner = createRunner(context), bindings = [];

      function now () {
        listener(evaluate(runner));
      }

      for (var i = scripts.length; i--;) {

        var script = scripts[i];
        if (!script.refs) continue;

        for (var j = script.refs.length; j--;) {
          var ref = script.refs[j];

          bindings.push(context.bind(ref, now));
        }
      }

      return {
        now: now,
        dispose: function ()  {
          for (var i = bindings.length; i--;) bindings[i].dispose();
        }
      }
    }
  }
}

function boundScripts (scripts) {
  var boundScripts = {};
  for (var name in scripts) {
    boundScripts[name] = boundScript(scripts[name]);
  }
  return boundScripts;
}


module.exports = function (value) {
  if (value.length) {
    if (value.length === 1) return boundScripts(value[0]);
    return { value: bufferedScript(value) };
  } else {
    return boundScripts(value);
  }
}
},{"./ref":47}],47:[function(require,module,exports){
var protoclass = require("protoclass");


function BindableReference (script, path, settable) {
  this.script   = script;
  this.path     = path;
  this.settable = settable;
}

protoclass(BindableReference, {
  __isBindableReference: true,
  value: function (value) {
    if (!arguments.length) return this.script.get(this.path);
    if (this.settable) this.script.set(this.path, value);
  },
  toString: function () {
    return this.script.get(this.path);
  }
});


module.exports = BindableReference;

},{"protoclass":107}],48:[function(require,module,exports){
var protoclass = require("protoclass"),
parser         = require("./parser"),
View           = require("./view"),
ViewRecycler   = require("./viewRecycler"),
Clips          = require("./clips"),

fragmentWriter = require("./writers/fragment"),
blockWriter    = require("./writers/block"),
textWriter     = require("./writers/text"),
commentWriter  = require("./writers/comment");
elementWriter  = require("./writers/element");

function Template (paper, application, cacheNode) {
  this.paper       = paper;
  this.application = application;
  this.paperclip   = application.paperclip;
  this.cacheNode   = !!cacheNode;
  this.clips       = new Clips();

  this._viewPool = [];
}

protoclass(Template, {

  /**
   */

  _getView: function () {
    return this._viewPool.shift() || new View(this, this._getNode());
  },

  /**
   */

  _addView: function (view) {
    this._viewPool.push(view);
  },

  /**
   OLD
   */

  bind2: function (context) {
    // return new ViewRecycler(this).bind(context);
    return new View(this, this._getNode()).bind(context);
  },

  /**
   * DEPRECATED
   */

  bind: function (context) {
    return new ViewRecycler(this).bind(context);
  },

  /**
   */

  view: function (context) {
    return new ViewRecycler(this).bind(context);
  },

  /**
   */

  _getNode: function () {

    // IE doesn't support this, so cloneNode must be optional here
    if (this._cachedNode) return this._cachedNode.cloneNode(true);

    this.clips = new Clips(this);

    var node = this.paper(
      fragmentWriter(this),
      blockWriter(this),
      elementWriter(this),
      textWriter(this),
      commentWriter(this),
      parser,
      this.paperclip.modifiers
    );

    this.clips.initialize();

    return this.cacheNode ? (this._cachedNode = node) && this._getNode() : node;
  },

  /**
   */

  create: function (source) {
    return create(source, this.application);
  }
});

function create (source, application) {

  var paper;

  if (typeof source === "string") {
    paper = parser.compile(source);
  } else {
    paper = source;
  }

  if (paper.template) return paper.template;

  return paper.template = new Template(paper, application, true);
}

module.exports = create;
},{"./clips":19,"./parser":43,"./view":54,"./viewRecycler":55,"./writers/block":58,"./writers/comment":59,"./writers/element":61,"./writers/fragment":62,"./writers/text":63,"protoclass":107}],49:[function(require,module,exports){
module.exports = function (callback, context) {
  return function () {
    return callback.apply(context, arguments);
  }
}

},{}],50:[function(require,module,exports){
module.exports = function (to) {
  if (!to) to = {};
  var froms = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, n = froms.length; i < n; i++) {
    var from = froms[i];
    for (var key in from) {
      to[key] = from[key];
    }
  }
  return to;
}
},{}],51:[function(require,module,exports){
module.exports = {
  getNodePath: function (node) {
    var path = [], p = node.parentNode, c = node;
    while (p) {

      // need to slice since some browsers don't support indexOf for child nodes
      path.unshift(Array.prototype.slice.call(p.childNodes).indexOf(c));
      c = p;
      p = p.parentNode;
    }

    return path;
  },
  getNodeByPath: function (node, path) {
    var c = node;
    for (var i = 0, n = path.length; i < n; i++) {
      c = c.childNodes[path[i]];
    }
    return c;
  }
}
},{}],52:[function(require,module,exports){
module.exports = function (to, from) {
  from.on("change", function (key, value) {
    to[key] = value;
  });
  return from;
}
},{}],53:[function(require,module,exports){
module.exports = function (ary) {
  var occurences = {}, clone = ary.concat();

  for (var i = clone.length; i--;) {
    var item = clone[i];
    if (!occurences[item]) occurences[item] = 0;

    if (++occurences[item] > 1) {
      clone.splice(i, 1);
    }
  }

  return clone;
}
},{}],54:[function(require,module,exports){
var protoclass            = require("protoclass"),
Bindings                  = require("./bindings"),
createSection             = require("document-section"),
BindableObject            = require("bindable-object"),
syncBindableObjectChanges = require("./utils/syncBindableObjectChanges");

function View (template, node) {

  // the template that created the viw
  this.template = template;

  // the node we're binding to
  this.node     = node;

  // the clips that are specific to the node - generated ONCE
  // from the template
  this.clips    = this.template.clips;

  // console.log("create");

  // the bindings specific to this view. Clips should add bindings here
  // when hydrate is called
  this.bindings = new Bindings(this);

  // hydrates the view with bindings
  this.clips.prepare(this);


  this.section = createSection(template.application.nodeFactory);
  this.section.appendChild(node);
}

protoclass(View, {


  /**
   */

  bind: function (context) {

    if (!context) context = {};

    // TODO - sync changes back to context
    if (!context.__isBindable) {
      context = syncBindableObjectChanges(context, new BindableObject(context));
    }

    this.context = context;
    this.bindings.bind(context);
    return this;
  },

  /**
   */

  unbind: function () {
    this.bindings.unbind();
  },

  /**
   */

  dispose: function () {
    this.remove();
    this.bindings.unbind();
  },

  /**
   */

  render: function () {
    return this.section.render();
  },

  /**
   */

  remove: function () {
    this.section.remove();
    return this;
  },

  /**
   */

  toString: function () {

    // TODO - make updates here now
    return this.render().toString();
  }
});

module.exports = View;
},{"./bindings":18,"./utils/syncBindableObjectChanges":52,"bindable-object":64,"document-section":71,"protoclass":107}],55:[function(require,module,exports){
var protoclass            = require("protoclass"),
Bindings                  = require("./bindings"),
createSection             = require("document-section"),
BindableObject            = require("bindable-object"),
syncBindableObjectChanges = require("./utils/syncBindableObjectChanges");

/**
 * Wraps arou
 */

function ViewRecycler (template) {

  // the template that created the viw
  this.template = template;
}

protoclass(ViewRecycler, {

  /**
   */

  _view: function () {
    return this.__view || (this.__view = this.template._getView());
  },

  /**
   */

  bind: function (context) {
    this.bound = true;
    this._view().bind(context);
    this.context = this.__view.context;
    this.clips = this.__view.clips;
    this.node = this.__view.node;
    return this;
  },

  /**
   */

  unbind: function () {
    this._view().unbind();
    this.bound = false;
  },

  /**
   */

  dispose: function () {
    if (this.__view) this.__view.dispose();
    this._recycle();
  },

  /**
   */

  _recycle: function () {
    if (this.__view) {
      this.template._addView(this.__view);
      this.__view = void 0;
    }
  },

  /**
   */

  render: function () {
    return this._view().render();
  },

  /**
   */

  remove: function () {
    if (this.__view) this.__view.remove();
    this._recycle();
    return this;
  },

  /**
   */

  toString: function () {
    return this._view().toString();
  }
});

module.exports = ViewRecycler;
},{"./bindings":18,"./utils/syncBindableObjectChanges":52,"bindable-object":64,"document-section":71,"protoclass":107}],56:[function(require,module,exports){
var protoclass = require("protoclass");

function UnboundValueBinding (script, textNode) {
  this.script      = script;
  this.textNode = textNode;
}

protoclass(UnboundValueBinding, {

  /**
   */

  bind: function (context) {
    this.context = context;
    var value = this.script.evaluate(context);

    if (value == null) value = "";

    if (this.textNode.__isNode) {
      this.textNode.replaceText(value, true);
    } else {
      this.textNode.nodeValue = value;
    }
  },

  /**
   */

  unbind: function () {
  }
});

module.exports = UnboundValueBinding;
},{"protoclass":107}],57:[function(require,module,exports){
var protoclass = require("protoclass"),
Base = require("../../../bindings/block/base");

function BoundValueBinding (view, script, textNode) {
  this.view       = view;
  this.mainScript     = script;
  this.application = view.template.application;
  this.textNode   = textNode;
  this.nodeFactory = view.template.application.nodeFactory;
}

Base.extend(BoundValueBinding, {

  /**
   */

  didChange: function (value) {
    
    if (value == null) value = "";
    if (this.nodeFactory.name === "dom") {
      this.textNode.nodeValue = String(value);
    } else {
      this.textNode.replaceText(value, true);
    }
  }
});

module.exports = BoundValueBinding;
},{"../../../bindings/block/base":12,"protoclass":107}],58:[function(require,module,exports){
var createSection = require("document-section"),
utils = require("../../utils"),
ValueBinding = require("./bindings/value"),
UnboundValueBinding = require("./bindings/unboundValue"),
createScripts = require("../../script");


function writeUnboundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new UnboundValueBinding(script, node))
    }
  });
}

function writeBoundValue (template, node, script) {

  template.clips.push({
    node: node,
    script: script,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.node);
    },
    prepare: function (view) {
      var node = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new ValueBinding(view, this.script, node));
    }
  });
}

function writeValue (template, nodeFactory, block) {

  var node = nodeFactory.createTextNode(""),
  script   = createScripts(block).value;

  if (block.value.refs.length === 0) {
    writeUnboundValue(template, node, script);
  } else {
    writeBoundValue(template, node, script);
  }

  return node;
}

function writeDynamic (template, nodeFactory, blockBindingFactory, scripts, contentPaper, childPaper) {

  var section = createSection(nodeFactory),
  scriptName  = Object.keys(scripts)[0],
  contentTemplate = contentPaper ? template.create(contentPaper) : void 0,
  childTemplate = childPaper ? template.create(childPaper) : void 0;

  // TODO - allow multiple scripts?
  var scripts = createScripts(scripts),
  mainScript  = scripts[scriptName];

  template.clips.push({
    section: section,
    scripts: scripts,
    mainScript: mainScript,
    scriptName: scriptName,
    contentTemplate: contentTemplate,
    childTemplate: childTemplate,
    nodeFactory: nodeFactory,
    initialize: function () {
      this.startNodePath     = utils.getNodePath(this.section.start);
      this.endNodePath       = utils.getNodePath(this.section.end);
      this.blockBindingClass = blockBindingFactory.getClass(this.scriptName);

      // TODO - throw error if binding class doesn't exist?
    },
    prepare: function (view) {
      var startNode = utils.getNodeByPath(view.node, this.startNodePath),
      endNode       = utils.getNodeByPath(view.node, this.endNodePath);
      var section   = createSection(this.nodeFactory, startNode, endNode);

      // binding class might not exist. Don't continue
      if (this.blockBindingClass) {
        view.bindings.push(new this.blockBindingClass(view, this.scriptName, this.scripts, section, this.contentTemplate, this.childTemplate));
      }
    }
  });

  return section.render();
}

module.exports = function (template) {

  var nodeFactory      = template.application.nodeFactory,
  blockBindingFactory  = template.paperclip.blockBindingFactory;

  return function (script, contentPaper, childPaper) {

    // only {{ value }} block. MUCH faster.
    if (script.value && Object.keys(script).length === 1) {
      return writeValue(template, nodeFactory, script);
    }

    // more complicated stuff that would require a section of elements. might be
    // something like {{ html: block}}, or {{#if:condition}}content{{/}}
    return writeDynamic(template, nodeFactory, blockBindingFactory, script, contentPaper, childPaper);
  };
};
},{"../../script":46,"../../utils":51,"./bindings/unboundValue":56,"./bindings/value":57,"document-section":71}],59:[function(require,module,exports){
module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (comment) {
    return nodeFactory.createComment(comment);
  };
}
},{}],60:[function(require,module,exports){
var Base = require("../../../bindings/attrs/base")

module.exports = Base.extend({

  /**
   */

  didChange: function (value) {
    this.node.setAttribute(this.attrName, value);
  }
});

},{"../../../bindings/attrs/base":1}],61:[function(require,module,exports){
var utils     = require("../../utils"),
ValueBinding  = require("./bindings/value"),
createScripts = require("../../script");

function addBinding (bindingClass, template, element, attrName, attrValue) {
  template.clips.push({
    attrName: attrName,
    scripts: createScripts(attrValue),
    bindingClass: bindingClass,
    element: element,
    initialize: function () {
      this.nodePath = utils.getNodePath(this.element);
    },
    prepare: function (view) {
      var element = utils.getNodeByPath(view.node, this.nodePath);
      view.bindings.push(new this.bindingClass(view, element, this.scripts, this.attrName));
    }
  });
}

function addBufferedBinding (template, element, key, values) {

}

module.exports = function (template) {

  var nodeFactory    = template.application.nodeFactory,
  attrBindingFactory = template.paperclip.attrBindingFactory;

  return function (name, attributes, childNodes) {
    var element = nodeFactory.createElement(name);

    for (var key in attributes) {

      var value = attributes[key];

      if (typeof value !== "string") {
        addBinding(attrBindingFactory.getClass(key, value) || ValueBinding, template, element, key, value);
      } else {  
        element.setAttribute(key, value);
      }
    }

    if (childNodes.length) {
      element.appendChild(childNodes.length > 1 ? nodeFactory.createFragment(childNodes) : childNodes[0]);
    }
    
    return element;
  };
}
},{"../../script":46,"../../utils":51,"./bindings/value":60}],62:[function(require,module,exports){
module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (childNodes) {
    return nodeFactory.createFragment(childNodes);
  };
}
},{}],63:[function(require,module,exports){

module.exports = function (template) {
  var nodeFactory = template.application.nodeFactory;
  return function (value) {

    // blank text nodes are NOT allowed. Chrome has an issue rendering
    // blank text nodes - way, WAY slower if this isn't here!
    if (/^\s+$/.test(value)) {
      return nodeFactory.createTextNode("\u00A0");
    };

    return nodeFactory.createTextNode(value, true);
  };
}
},{}],64:[function(require,module,exports){
"use strict";

var EventEmitter    = require("fast-event-emitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty"),
toarray             = require("toarray");

/**
 */

function BindableObject (properties) {

  if (properties)
  for (var key in properties) {
    this[key] = properties[key];
  }

  EventEmitter.call(this);
}

watchProperty.BindableObject = BindableObject;

protoclass(EventEmitter, BindableObject, {

  /**
   */

  __isBindable: true,

  /**
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    currentValue = this,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;
    }

    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   */

  setProperties: function (properties) {
    this.emit("willSetProperties");
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    this.emit("didSetProperties");
    return this;
  },

  /**
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue, chain;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this[property]) !== value;
      if (hasChanged) this[property] = value;
    } else {

      // avoid split if possible
      chain     = isString ? property.split(".") : property;

      var currentValue  = this,
      previousValue,
      currentProperty,
      newChain;

      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {

          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   */

  toJSON: function () {
    var obj = {}, value;

    var keys = Object.keys(this);

    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (key.substr(0, 2) === "__") continue;
      value = this[key];

      if(value && value.__isBindable) {
        value = value.toJSON();
      }

      obj[key] = value;
    }

    return obj;
  }
});


BindableObject.computed = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};

module.exports = BindableObject;

},{"./watchProperty":66,"fast-event-emitter":67,"protoclass":107,"toarray":68}],65:[function(require,module,exports){
"use strict";

var toarray = require("toarray");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * created when the second parameter on `bind(property, listener)` is an object.
 *
 * @class BindingTransformer
 * @protected
 */


function getToPropertyFn (target, property) {
  return function (value) {
    target.set(property, value);
  };
}


function hasChanged (oldValues, newValues) {

  if (oldValues.length !== newValues.length) return true;

  for (var i = newValues.length; i--;) {
    if (newValues[i] !== oldValues[i]) return true;
  }
  return false;
}

function wrapFn (fn, previousValues, max) {

  var numCalls = 0;

  return function () {

    var values = Array.prototype.slice.call(arguments, 0),
    newValues  = (values.length % 2) === 0 ? values.slice(0, values.length / 2) : values;


    if (!hasChanged(newValues, previousValues)) return;


    if (~max && ++numCalls >= max) {
      this.dispose();
    }

    previousValues = newValues;


    fn.apply(this, values);
  };
}

function transform (bindable, fromProperty, options) {

  var when        = options.when         || function() { return true; },
  map             = options.map          || function () { return Array.prototype.slice.call(arguments, 0); },
  target          = options.target       || bindable,
  max             = options.max          || (options.once ? 1 : void 0) || -1,
  tos             = toarray(options.to).concat(),
  previousValues  = toarray(options.defaultValue),
  toProperties    = [],
  bothWays        = options.bothWays,
  i;

  
  if (!when.test && typeof when === "function") {
    when = { test: when };
  }

  if (!previousValues.length) {
    previousValues.push(void 0);
  }

  if (!tos.length) {
    throw new Error("missing 'to' option");
  }

  for (i = tos.length; i--;) {

    var to = tos[i],
    tot    = typeof to;

    /*
     need to convert { property: { map: fn}} to another transformed value, which is
     { map: fn, to: property }
     */

    if (tot === "object") {

      // "to" might have multiple properties we're binding to, so 
      // add them to the END of the array of "to" items
      for (var property in to) {

        // assign the property to the 'to' parameter
        to[property].to = property;
        tos.push(transform(target, fromProperty, to[property]));
      }

      // remove the item, since we just added new items to the end
      tos.splice(i, 1);

    // might be a property we're binding to
    } else if(tot === "string") {
      toProperties.push(to);
      tos[i] = wrapFn(getToPropertyFn(target, to), previousValues, max);
    } else if (tot === "function") {
      tos[i] = wrapFn(to, previousValues, max);
    } else {
      throw new Error("'to' must be a function");
    }
  }

  // two-way data-binding
  if (bothWays) {
    for (i = toProperties.length; i--;) {
      target.bind(toProperties[i], { to: fromProperty });
    }
  }

  // newValue, newValue2, oldValue, oldValue2
  return function () {

    var values = toarray(map.apply(this, arguments));

    // first make sure that we don't trigger the old value
    if (!when.test.apply(when, values)) return;

    for (var i = tos.length; i--;) {
      tos[i].apply(this, values);
    }
  };
}

module.exports = transform;
},{"toarray":68}],66:[function(require,module,exports){
"use strict";

var transform   = require("./transform");

function extend (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}


function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  self = {

    /** 
     * the target bindable object
     * @property target
     * @type {BindableObject}
     */

    target: bindable,

    /**
     * triggers the binding listener
     * @method now
     */

    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },

    /**
     * disposes the binding
     * @method dispose
     */

    dispose: function () {
      listener.dispose();
    },

    /**
     */

    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },

    /**
     */

    resume: function () {
      self.pause();
      extend(self, watchSimple(bindable, property, fn));
      return self;
    }
  };

  return self;
}

/*
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;


  var onChange = function () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : void 0;
    bind(bindable, chain);
    self.now();
  };

  /*
  if (hasComputed && process.browser) {
    onChange = debounce(bindable, onChange);
  }*/

  function runComputed (eachChain, pushValues) {
    return function (item) {
      if (!item) return;

        // wrap around bindable object as a helper
        if (!item.__isBindable) {
          item = new module.exports.BindableObject(item);
        }

        bind(item, eachChain, pushValues);
    };
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, i, j, n, computed, hadComputed, pv, cv = target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      i = 0;
      n = chain.length;

      for (; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        computed = (currentProperty.charCodeAt(0) === 64);

        if (computed) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, runComputed(eachChain, pushValues));
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {
      i = 0;
      n = chain.length;

      for (; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
      }

      if (pushValues !== false) values = cv;
    }
  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = [];
  }

  self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    dispose: dispose,
    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },
    resume: function () {
      self.pause();
      extend(self, watchChain(bindable, hasComputed, chain, fn));
      return self;
    }
  };

  bind(bindable, chain);

  return self;
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values  = new Array(chains.length),
  oldValues   = new Array(chains.length),
  bindings    = new Array(chains.length),
  fn2         = fn,
  _pause      = false,
  _hasChanged = false,
  self;

  bindings.push(bindable.on("willSetProperties", function () {
    _pause      = true;
    _hasChanged = false;
  }));

  bindings.push(bindable.on("didSetProperties", function () {
    _pause = false;
    if (_hasChanged) onChange();
  }));

  function onChange () {
    _hasChanged = true;
    if (_pause) return;
    fn2.apply(this, values.concat(oldValues));
  }

  function setValues () {
    oldValues = values.concat();
    values    = chains.map(function (property) { 
      return bindable.get(property); 
    });
  }


  chains.forEach(function (chain, i) {
    bindings[i] = bindable.bind(chain, function (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      onChange();
    });
  });

  self = {
    target: bindable,
    now: function () {
      setValues();
      onChange();
      return self;
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
      bindings = [];
    },
    pause: function () {
      self.dispose();
      self.now = function () { return self; };
    },
    resume: function () {
      self.pause();
      extend(self, watchMultiple(bindable, chains, fn));
      return self;
    }
  };
  return self;
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;
},{"./transform":65}],67:[function(require,module,exports){
"use strict";
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class EventEmitter
 */

function EventEmitter () {
  this.__events = {};
}

/**
 * adds a listener on the event emitter
 *
 * @method on
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.on = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  var listeners;
  if (!(listeners = this.__events[event])) {
    this.__events[event] = listener;
  } else if (typeof listeners === "function") {
    this.__events[event] = [listeners, listener];
  } else {
    listeners.push(listener);
  }

  var self = this;

  return {
    dispose: function() {
      self.off(event, listener);
    }
  };
};

/**
 * removes an event emitter
 * @method off
 * @param {String} event to remove
 * @param {Function} listener to remove
 */

EventEmitter.prototype.off = function (event, listener) {

  var listeners;

  if(!(listeners = this.__events[event])) {
    return;
  }

  if (typeof listeners === "function") {
    this.__events[event] = undefined;
  } else {
    var i = listeners.indexOf(listener);
    if (~i) listeners.splice(i, 1);
    if (!listeners.length) {
      this.__events[event] = undefined;
    }
  }
};

/**
 * adds a listener on the event emitter
 * @method once
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.once = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  function listener2 () {
    disp.dispose();
    listener.apply(this, arguments);
  }

  var disp = this.on(event, listener2);
  disp.target = this;
  return disp;
};

/**
 * emits an event
 * @method emit
 * @param {String} event
 * @param {String}, `data...` data to emit
 */


EventEmitter.prototype.emit = function (event) {

  if (this.__events[event] === undefined) return;

  var listeners = this.__events[event],
  n = arguments.length,
  args,
  i,
  j;

  if (typeof listeners === "function") {
    if (n === 1) {
      listeners();
    } else {
      switch(n) {
        case 2:
          listeners(arguments[1]);
          break;
        case 3:
          listeners(arguments[1], arguments[2]);
          break;
        case 4:
          listeners(arguments[1], arguments[2], arguments[3]);
          break;
        default:
          args = new Array(n - 1);
          for(i = 1; i < n; i++) args[i-1] = arguments[i];
          listeners.apply(this, args);
    }
  }
  } else {
    args = new Array(n - 1);
    for(i = 1; i < n; i++) args[i-1] = arguments[i];
    for(j = listeners.length; j--;) {
      if(listeners[j]) listeners[j].apply(this, args);
    }
  }
};

/**
 * removes all listeners
 * @method removeAllListeners
 * @param {String} event (optional) removes all listeners of `event`. Omitting will remove everything.
 */

EventEmitter.prototype.removeAllListeners = function (event) {
  if (arguments.length === 1) {
    this.__events[event] = undefined;
  } else {
    this.__events = {};
  }
};

module.exports = EventEmitter;

},{"protoclass":107}],68:[function(require,module,exports){
module.exports = function(item) {
  if(item === undefined)  return [];
  return Object.prototype.toString.call(item) === "[object Array]" ? item : [item];
}
},{}],69:[function(require,module,exports){

},{}],70:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],71:[function(require,module,exports){
var protoclass = require("protoclass"),
nofactor       = require("nofactor");

// TODO - figure out a way to create a document fragment in the constructor
// instead of calling toFragment() each time. perhaps 
var Section = function (nodeFactory, start, end) {

  this.nodeFactory = nodeFactory = nodeFactory || nofactor["default"];

  // create invisible markers so we know where the sections are

  this.start       = start || nodeFactory.createTextNode("");
  this.end         = end   || nodeFactory.createTextNode("");
  this.visible     = true;

  if (!this.start.parentNode) {
    var parent  = nodeFactory.createFragment();
    parent.appendChild(this.start);
    parent.appendChild(this.end);
  }
};


Section = protoclass(Section, {

  /**
   */

  __isLoafSection: true,

  /**
   */

  render: function () {
    return this.start.parentNode;
  },

  /**
   */

  remove: function () {
    // this removes the child nodes completely
    return this.nodeFactory.createFragment(this.getChildNodes());
  },

  /** 
   * shows the section
   */


  show: function () {
    if(!this._detached) return this;
    this.append.apply(this, this._detached.getInnerChildNodes());
    this._detached = void 0;
    this.visible = true;
    return this;
  },

  /**
   * hides the fragment, but maintains the start / end elements
   * so it can be shown again in the same spot.
   */

  hide: function () {
    this._detached = this.removeAll();
    this.visible = false;
    return this;
  },

  /**
   */

  removeAll: function () {
    return this._section(this._removeAll());
  },

  /**
   */

  _removeAll: function () {

    var start = this.start,
    end       = this.end,
    current   = start.nextSibling,
    children  = [];

    while (current != end) {
      current.parentNode.removeChild(current);
      children.push(current);
      current = this.start.nextSibling;
    }

    return children;
  },

  
  /**
   * DEPRECATED - use appendChild
   */

  append: function () {

    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this.nodeFactory.createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.end.parentNode.insertBefore(newNodes, this.end);
  },

  /**
   */

  appendChild: function () {
    this.append.apply(this, arguments);
  },

  /**
   * DEPRECATED - use prependChild
   */

  prepend: function () {
    var newNodes = Array.prototype.slice.call(arguments);

    if (!newNodes.length) return;

    if(newNodes.length > 1) {
      newNodes = this.nodeFactory.createFragment(newNodes);
    } else {
      newNodes = newNodes[0];
    }

    this.start.parentNode.insertBefore(newNodes, this.start.nextSibling);
  },


  /**
   */

  prependChild: function () {
    this.prepend.apply(this, arguments);
  },


  /**
   */

  replaceChildNodes: function () {

    //remove the children - children should have a parent though
    this.removeAll();
    this.append.apply(this, arguments);
  },

  /**
   */

  toString: function () {
    var buffer = this.getChildNodes().map(function (node) {
      return node.outerHTML || (node.nodeValue != undefined && node.nodeType == 3 ? node.nodeValue : String(node));
    });
    return buffer.join("");
  },

  /**
   */

  dispose: function () {
    if(this._disposed) return;
    this._disposed = true;

    // might have sub sections, so need to remove with a parent node
    this.removeAll();
    this.start.parentNode.removeChild(this.start);
    this.end.parentNode.removeChild(this.end);
  },

  /**
   */

  getChildNodes: function () {
    var cn   = this.start,
    end      = this.end.nextSibling,
    children = [];


    while (cn != end) {
      children.push(cn);
      cn = cn.nextSibling;
    }

    return children;
  },

  /**
   */

  getInnerChildNodes: function () {
    var cn = this.getChildNodes();
    cn.shift();
    cn.pop()
    return cn;
  },


  /**
   */

  _section: function (children) {
    var section = new Section(this.nodeFactory);
    section.append.apply(section, children);
    return section;
  }
});

module.exports = function (nodeFactory, start, end)  {
  return new Section(nodeFactory, start, end);
}
},{"nofactor":90,"protoclass":107}],72:[function(require,module,exports){
(function (global){
/*! http://mths.be/he v0.4.1 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`.
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// http://whatwg.org/html/tokenization.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// http://whatwg.org/html/tokenization.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xC1':'Aacute','\xE1':'aacute','\u0102':'Abreve','\u0103':'abreve','\u223E':'ac','\u223F':'acd','\u223E\u0333':'acE','\xC2':'Acirc','\xE2':'acirc','\xB4':'acute','\u0410':'Acy','\u0430':'acy','\xC6':'AElig','\xE6':'aelig','\u2061':'af','\uD835\uDD04':'Afr','\uD835\uDD1E':'afr','\xC0':'Agrave','\xE0':'agrave','\u2135':'aleph','\u0391':'Alpha','\u03B1':'alpha','\u0100':'Amacr','\u0101':'amacr','\u2A3F':'amalg','&':'amp','\u2A55':'andand','\u2A53':'And','\u2227':'and','\u2A5C':'andd','\u2A58':'andslope','\u2A5A':'andv','\u2220':'ang','\u29A4':'ange','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u2221':'angmsd','\u221F':'angrt','\u22BE':'angrtvb','\u299D':'angrtvbd','\u2222':'angsph','\xC5':'angst','\u237C':'angzarr','\u0104':'Aogon','\u0105':'aogon','\uD835\uDD38':'Aopf','\uD835\uDD52':'aopf','\u2A6F':'apacir','\u2248':'ap','\u2A70':'apE','\u224A':'ape','\u224B':'apid','\'':'apos','\xE5':'aring','\uD835\uDC9C':'Ascr','\uD835\uDCB6':'ascr','\u2254':'colone','*':'ast','\u224D':'CupCap','\xC3':'Atilde','\xE3':'atilde','\xC4':'Auml','\xE4':'auml','\u2233':'awconint','\u2A11':'awint','\u224C':'bcong','\u03F6':'bepsi','\u2035':'bprime','\u223D':'bsim','\u22CD':'bsime','\u2216':'setmn','\u2AE7':'Barv','\u22BD':'barvee','\u2305':'barwed','\u2306':'Barwed','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u0411':'Bcy','\u0431':'bcy','\u201E':'bdquo','\u2235':'becaus','\u29B0':'bemptyv','\u212C':'Bscr','\u0392':'Beta','\u03B2':'beta','\u2136':'beth','\u226C':'twixt','\uD835\uDD05':'Bfr','\uD835\uDD1F':'bfr','\u22C2':'xcap','\u25EF':'xcirc','\u22C3':'xcup','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A06':'xsqcup','\u2605':'starf','\u25BD':'xdtri','\u25B3':'xutri','\u2A04':'xuplus','\u22C1':'Vee','\u22C0':'Wedge','\u290D':'rbarr','\u29EB':'lozf','\u25AA':'squf','\u25B4':'utrif','\u25BE':'dtrif','\u25C2':'ltrif','\u25B8':'rtrif','\u2423':'blank','\u2592':'blk12','\u2591':'blk14','\u2593':'blk34','\u2588':'block','=\u20E5':'bne','\u2261\u20E5':'bnequiv','\u2AED':'bNot','\u2310':'bnot','\uD835\uDD39':'Bopf','\uD835\uDD53':'bopf','\u22A5':'bot','\u22C8':'bowtie','\u29C9':'boxbox','\u2510':'boxdl','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u250C':'boxdr','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2500':'boxh','\u2550':'boxH','\u252C':'boxhd','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2534':'boxhu','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u229F':'minusb','\u229E':'plusb','\u22A0':'timesb','\u2518':'boxul','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u2514':'boxur','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u2502':'boxv','\u2551':'boxV','\u253C':'boxvh','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2524':'boxvl','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u251C':'boxvr','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u02D8':'breve','\xA6':'brvbar','\uD835\uDCB7':'bscr','\u204F':'bsemi','\u29C5':'bsolb','\\':'bsol','\u27C8':'bsolhsub','\u2022':'bull','\u224E':'bump','\u2AAE':'bumpE','\u224F':'bumpe','\u0106':'Cacute','\u0107':'cacute','\u2A44':'capand','\u2A49':'capbrcup','\u2A4B':'capcap','\u2229':'cap','\u22D2':'Cap','\u2A47':'capcup','\u2A40':'capdot','\u2145':'DD','\u2229\uFE00':'caps','\u2041':'caret','\u02C7':'caron','\u212D':'Cfr','\u2A4D':'ccaps','\u010C':'Ccaron','\u010D':'ccaron','\xC7':'Ccedil','\xE7':'ccedil','\u0108':'Ccirc','\u0109':'ccirc','\u2230':'Cconint','\u2A4C':'ccups','\u2A50':'ccupssm','\u010A':'Cdot','\u010B':'cdot','\xB8':'cedil','\u29B2':'cemptyv','\xA2':'cent','\xB7':'middot','\uD835\uDD20':'cfr','\u0427':'CHcy','\u0447':'chcy','\u2713':'check','\u03A7':'Chi','\u03C7':'chi','\u02C6':'circ','\u2257':'cire','\u21BA':'olarr','\u21BB':'orarr','\u229B':'oast','\u229A':'ocir','\u229D':'odash','\u2299':'odot','\xAE':'reg','\u24C8':'oS','\u2296':'ominus','\u2295':'oplus','\u2297':'otimes','\u25CB':'cir','\u29C3':'cirE','\u2A10':'cirfnint','\u2AEF':'cirmid','\u29C2':'cirscir','\u2232':'cwconint','\u201D':'rdquo','\u2019':'rsquo','\u2663':'clubs',':':'colon','\u2237':'Colon','\u2A74':'Colone',',':'comma','@':'commat','\u2201':'comp','\u2218':'compfn','\u2102':'Copf','\u2245':'cong','\u2A6D':'congdot','\u2261':'equiv','\u222E':'oint','\u222F':'Conint','\uD835\uDD54':'copf','\u2210':'coprod','\xA9':'copy','\u2117':'copysr','\u21B5':'crarr','\u2717':'cross','\u2A2F':'Cross','\uD835\uDC9E':'Cscr','\uD835\uDCB8':'cscr','\u2ACF':'csub','\u2AD1':'csube','\u2AD0':'csup','\u2AD2':'csupe','\u22EF':'ctdot','\u2938':'cudarrl','\u2935':'cudarrr','\u22DE':'cuepr','\u22DF':'cuesc','\u21B6':'cularr','\u293D':'cularrp','\u2A48':'cupbrcap','\u2A46':'cupcap','\u222A':'cup','\u22D3':'Cup','\u2A4A':'cupcup','\u228D':'cupdot','\u2A45':'cupor','\u222A\uFE00':'cups','\u21B7':'curarr','\u293C':'curarrm','\u22CE':'cuvee','\u22CF':'cuwed','\xA4':'curren','\u2231':'cwint','\u232D':'cylcty','\u2020':'dagger','\u2021':'Dagger','\u2138':'daleth','\u2193':'darr','\u21A1':'Darr','\u21D3':'dArr','\u2010':'dash','\u2AE4':'Dashv','\u22A3':'dashv','\u290F':'rBarr','\u02DD':'dblac','\u010E':'Dcaron','\u010F':'dcaron','\u0414':'Dcy','\u0434':'dcy','\u21CA':'ddarr','\u2146':'dd','\u2911':'DDotrahd','\u2A77':'eDDot','\xB0':'deg','\u2207':'Del','\u0394':'Delta','\u03B4':'delta','\u29B1':'demptyv','\u297F':'dfisht','\uD835\uDD07':'Dfr','\uD835\uDD21':'dfr','\u2965':'dHar','\u21C3':'dharl','\u21C2':'dharr','\u02D9':'dot','`':'grave','\u02DC':'tilde','\u22C4':'diam','\u2666':'diams','\xA8':'die','\u03DD':'gammad','\u22F2':'disin','\xF7':'div','\u22C7':'divonx','\u0402':'DJcy','\u0452':'djcy','\u231E':'dlcorn','\u230D':'dlcrop','$':'dollar','\uD835\uDD3B':'Dopf','\uD835\uDD55':'dopf','\u20DC':'DotDot','\u2250':'doteq','\u2251':'eDot','\u2238':'minusd','\u2214':'plusdo','\u22A1':'sdotb','\u21D0':'lArr','\u21D4':'iff','\u27F8':'xlArr','\u27FA':'xhArr','\u27F9':'xrArr','\u21D2':'rArr','\u22A8':'vDash','\u21D1':'uArr','\u21D5':'vArr','\u2225':'par','\u2913':'DownArrowBar','\u21F5':'duarr','\u0311':'DownBreve','\u2950':'DownLeftRightVector','\u295E':'DownLeftTeeVector','\u2956':'DownLeftVectorBar','\u21BD':'lhard','\u295F':'DownRightTeeVector','\u2957':'DownRightVectorBar','\u21C1':'rhard','\u21A7':'mapstodown','\u22A4':'top','\u2910':'RBarr','\u231F':'drcorn','\u230C':'drcrop','\uD835\uDC9F':'Dscr','\uD835\uDCB9':'dscr','\u0405':'DScy','\u0455':'dscy','\u29F6':'dsol','\u0110':'Dstrok','\u0111':'dstrok','\u22F1':'dtdot','\u25BF':'dtri','\u296F':'duhar','\u29A6':'dwangle','\u040F':'DZcy','\u045F':'dzcy','\u27FF':'dzigrarr','\xC9':'Eacute','\xE9':'eacute','\u2A6E':'easter','\u011A':'Ecaron','\u011B':'ecaron','\xCA':'Ecirc','\xEA':'ecirc','\u2256':'ecir','\u2255':'ecolon','\u042D':'Ecy','\u044D':'ecy','\u0116':'Edot','\u0117':'edot','\u2147':'ee','\u2252':'efDot','\uD835\uDD08':'Efr','\uD835\uDD22':'efr','\u2A9A':'eg','\xC8':'Egrave','\xE8':'egrave','\u2A96':'egs','\u2A98':'egsdot','\u2A99':'el','\u2208':'in','\u23E7':'elinters','\u2113':'ell','\u2A95':'els','\u2A97':'elsdot','\u0112':'Emacr','\u0113':'emacr','\u2205':'empty','\u25FB':'EmptySmallSquare','\u25AB':'EmptyVerySmallSquare','\u2004':'emsp13','\u2005':'emsp14','\u2003':'emsp','\u014A':'ENG','\u014B':'eng','\u2002':'ensp','\u0118':'Eogon','\u0119':'eogon','\uD835\uDD3C':'Eopf','\uD835\uDD56':'eopf','\u22D5':'epar','\u29E3':'eparsl','\u2A71':'eplus','\u03B5':'epsi','\u0395':'Epsilon','\u03F5':'epsiv','\u2242':'esim','\u2A75':'Equal','=':'equals','\u225F':'equest','\u21CC':'rlhar','\u2A78':'equivDD','\u29E5':'eqvparsl','\u2971':'erarr','\u2253':'erDot','\u212F':'escr','\u2130':'Escr','\u2A73':'Esim','\u0397':'Eta','\u03B7':'eta','\xD0':'ETH','\xF0':'eth','\xCB':'Euml','\xEB':'euml','\u20AC':'euro','!':'excl','\u2203':'exist','\u0424':'Fcy','\u0444':'fcy','\u2640':'female','\uFB03':'ffilig','\uFB00':'fflig','\uFB04':'ffllig','\uD835\uDD09':'Ffr','\uD835\uDD23':'ffr','\uFB01':'filig','\u25FC':'FilledSmallSquare','fj':'fjlig','\u266D':'flat','\uFB02':'fllig','\u25B1':'fltns','\u0192':'fnof','\uD835\uDD3D':'Fopf','\uD835\uDD57':'fopf','\u2200':'forall','\u22D4':'fork','\u2AD9':'forkv','\u2131':'Fscr','\u2A0D':'fpartint','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\u2154':'frac23','\u2156':'frac25','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\u2044':'frasl','\u2322':'frown','\uD835\uDCBB':'fscr','\u01F5':'gacute','\u0393':'Gamma','\u03B3':'gamma','\u03DC':'Gammad','\u2A86':'gap','\u011E':'Gbreve','\u011F':'gbreve','\u0122':'Gcedil','\u011C':'Gcirc','\u011D':'gcirc','\u0413':'Gcy','\u0433':'gcy','\u0120':'Gdot','\u0121':'gdot','\u2265':'ge','\u2267':'gE','\u2A8C':'gEl','\u22DB':'gel','\u2A7E':'ges','\u2AA9':'gescc','\u2A80':'gesdot','\u2A82':'gesdoto','\u2A84':'gesdotol','\u22DB\uFE00':'gesl','\u2A94':'gesles','\uD835\uDD0A':'Gfr','\uD835\uDD24':'gfr','\u226B':'gg','\u22D9':'Gg','\u2137':'gimel','\u0403':'GJcy','\u0453':'gjcy','\u2AA5':'gla','\u2277':'gl','\u2A92':'glE','\u2AA4':'glj','\u2A8A':'gnap','\u2A88':'gne','\u2269':'gnE','\u22E7':'gnsim','\uD835\uDD3E':'Gopf','\uD835\uDD58':'gopf','\u2AA2':'GreaterGreater','\u2273':'gsim','\uD835\uDCA2':'Gscr','\u210A':'gscr','\u2A8E':'gsime','\u2A90':'gsiml','\u2AA7':'gtcc','\u2A7A':'gtcir','>':'gt','\u22D7':'gtdot','\u2995':'gtlPar','\u2A7C':'gtquest','\u2978':'gtrarr','\u2269\uFE00':'gvnE','\u200A':'hairsp','\u210B':'Hscr','\u042A':'HARDcy','\u044A':'hardcy','\u2948':'harrcir','\u2194':'harr','\u21AD':'harrw','^':'Hat','\u210F':'hbar','\u0124':'Hcirc','\u0125':'hcirc','\u2665':'hearts','\u2026':'mldr','\u22B9':'hercon','\uD835\uDD25':'hfr','\u210C':'Hfr','\u2925':'searhk','\u2926':'swarhk','\u21FF':'hoarr','\u223B':'homtht','\u21A9':'larrhk','\u21AA':'rarrhk','\uD835\uDD59':'hopf','\u210D':'Hopf','\u2015':'horbar','\uD835\uDCBD':'hscr','\u0126':'Hstrok','\u0127':'hstrok','\u2043':'hybull','\xCD':'Iacute','\xED':'iacute','\u2063':'ic','\xCE':'Icirc','\xEE':'icirc','\u0418':'Icy','\u0438':'icy','\u0130':'Idot','\u0415':'IEcy','\u0435':'iecy','\xA1':'iexcl','\uD835\uDD26':'ifr','\u2111':'Im','\xCC':'Igrave','\xEC':'igrave','\u2148':'ii','\u2A0C':'qint','\u222D':'tint','\u29DC':'iinfin','\u2129':'iiota','\u0132':'IJlig','\u0133':'ijlig','\u012A':'Imacr','\u012B':'imacr','\u2110':'Iscr','\u0131':'imath','\u22B7':'imof','\u01B5':'imped','\u2105':'incare','\u221E':'infin','\u29DD':'infintie','\u22BA':'intcal','\u222B':'int','\u222C':'Int','\u2124':'Zopf','\u2A17':'intlarhk','\u2A3C':'iprod','\u2062':'it','\u0401':'IOcy','\u0451':'iocy','\u012E':'Iogon','\u012F':'iogon','\uD835\uDD40':'Iopf','\uD835\uDD5A':'iopf','\u0399':'Iota','\u03B9':'iota','\xBF':'iquest','\uD835\uDCBE':'iscr','\u22F5':'isindot','\u22F9':'isinE','\u22F4':'isins','\u22F3':'isinsv','\u0128':'Itilde','\u0129':'itilde','\u0406':'Iukcy','\u0456':'iukcy','\xCF':'Iuml','\xEF':'iuml','\u0134':'Jcirc','\u0135':'jcirc','\u0419':'Jcy','\u0439':'jcy','\uD835\uDD0D':'Jfr','\uD835\uDD27':'jfr','\u0237':'jmath','\uD835\uDD41':'Jopf','\uD835\uDD5B':'jopf','\uD835\uDCA5':'Jscr','\uD835\uDCBF':'jscr','\u0408':'Jsercy','\u0458':'jsercy','\u0404':'Jukcy','\u0454':'jukcy','\u039A':'Kappa','\u03BA':'kappa','\u03F0':'kappav','\u0136':'Kcedil','\u0137':'kcedil','\u041A':'Kcy','\u043A':'kcy','\uD835\uDD0E':'Kfr','\uD835\uDD28':'kfr','\u0138':'kgreen','\u0425':'KHcy','\u0445':'khcy','\u040C':'KJcy','\u045C':'kjcy','\uD835\uDD42':'Kopf','\uD835\uDD5C':'kopf','\uD835\uDCA6':'Kscr','\uD835\uDCC0':'kscr','\u21DA':'lAarr','\u0139':'Lacute','\u013A':'lacute','\u29B4':'laemptyv','\u2112':'Lscr','\u039B':'Lambda','\u03BB':'lambda','\u27E8':'lang','\u27EA':'Lang','\u2991':'langd','\u2A85':'lap','\xAB':'laquo','\u21E4':'larrb','\u291F':'larrbfs','\u2190':'larr','\u219E':'Larr','\u291D':'larrfs','\u21AB':'larrlp','\u2939':'larrpl','\u2973':'larrsim','\u21A2':'larrtl','\u2919':'latail','\u291B':'lAtail','\u2AAB':'lat','\u2AAD':'late','\u2AAD\uFE00':'lates','\u290C':'lbarr','\u290E':'lBarr','\u2772':'lbbrk','{':'lcub','[':'lsqb','\u298B':'lbrke','\u298F':'lbrksld','\u298D':'lbrkslu','\u013D':'Lcaron','\u013E':'lcaron','\u013B':'Lcedil','\u013C':'lcedil','\u2308':'lceil','\u041B':'Lcy','\u043B':'lcy','\u2936':'ldca','\u201C':'ldquo','\u2967':'ldrdhar','\u294B':'ldrushar','\u21B2':'ldsh','\u2264':'le','\u2266':'lE','\u21C6':'lrarr','\u27E6':'lobrk','\u2961':'LeftDownTeeVector','\u2959':'LeftDownVectorBar','\u230A':'lfloor','\u21BC':'lharu','\u21C7':'llarr','\u21CB':'lrhar','\u294E':'LeftRightVector','\u21A4':'mapstoleft','\u295A':'LeftTeeVector','\u22CB':'lthree','\u29CF':'LeftTriangleBar','\u22B2':'vltri','\u22B4':'ltrie','\u2951':'LeftUpDownVector','\u2960':'LeftUpTeeVector','\u2958':'LeftUpVectorBar','\u21BF':'uharl','\u2952':'LeftVectorBar','\u2A8B':'lEg','\u22DA':'leg','\u2A7D':'les','\u2AA8':'lescc','\u2A7F':'lesdot','\u2A81':'lesdoto','\u2A83':'lesdotor','\u22DA\uFE00':'lesg','\u2A93':'lesges','\u22D6':'ltdot','\u2276':'lg','\u2AA1':'LessLess','\u2272':'lsim','\u297C':'lfisht','\uD835\uDD0F':'Lfr','\uD835\uDD29':'lfr','\u2A91':'lgE','\u2962':'lHar','\u296A':'lharul','\u2584':'lhblk','\u0409':'LJcy','\u0459':'ljcy','\u226A':'ll','\u22D8':'Ll','\u296B':'llhard','\u25FA':'lltri','\u013F':'Lmidot','\u0140':'lmidot','\u23B0':'lmoust','\u2A89':'lnap','\u2A87':'lne','\u2268':'lnE','\u22E6':'lnsim','\u27EC':'loang','\u21FD':'loarr','\u27F5':'xlarr','\u27F7':'xharr','\u27FC':'xmap','\u27F6':'xrarr','\u21AC':'rarrlp','\u2985':'lopar','\uD835\uDD43':'Lopf','\uD835\uDD5D':'lopf','\u2A2D':'loplus','\u2A34':'lotimes','\u2217':'lowast','_':'lowbar','\u2199':'swarr','\u2198':'searr','\u25CA':'loz','(':'lpar','\u2993':'lparlt','\u296D':'lrhard','\u200E':'lrm','\u22BF':'lrtri','\u2039':'lsaquo','\uD835\uDCC1':'lscr','\u21B0':'lsh','\u2A8D':'lsime','\u2A8F':'lsimg','\u2018':'lsquo','\u201A':'sbquo','\u0141':'Lstrok','\u0142':'lstrok','\u2AA6':'ltcc','\u2A79':'ltcir','<':'lt','\u22C9':'ltimes','\u2976':'ltlarr','\u2A7B':'ltquest','\u25C3':'ltri','\u2996':'ltrPar','\u294A':'lurdshar','\u2966':'luruhar','\u2268\uFE00':'lvnE','\xAF':'macr','\u2642':'male','\u2720':'malt','\u2905':'Map','\u21A6':'map','\u21A5':'mapstoup','\u25AE':'marker','\u2A29':'mcomma','\u041C':'Mcy','\u043C':'mcy','\u2014':'mdash','\u223A':'mDDot','\u205F':'MediumSpace','\u2133':'Mscr','\uD835\uDD10':'Mfr','\uD835\uDD2A':'mfr','\u2127':'mho','\xB5':'micro','\u2AF0':'midcir','\u2223':'mid','\u2212':'minus','\u2A2A':'minusdu','\u2213':'mp','\u2ADB':'mlcp','\u22A7':'models','\uD835\uDD44':'Mopf','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\u039C':'Mu','\u03BC':'mu','\u22B8':'mumap','\u0143':'Nacute','\u0144':'nacute','\u2220\u20D2':'nang','\u2249':'nap','\u2A70\u0338':'napE','\u224B\u0338':'napid','\u0149':'napos','\u266E':'natur','\u2115':'Nopf','\xA0':'nbsp','\u224E\u0338':'nbump','\u224F\u0338':'nbumpe','\u2A43':'ncap','\u0147':'Ncaron','\u0148':'ncaron','\u0145':'Ncedil','\u0146':'ncedil','\u2247':'ncong','\u2A6D\u0338':'ncongdot','\u2A42':'ncup','\u041D':'Ncy','\u043D':'ncy','\u2013':'ndash','\u2924':'nearhk','\u2197':'nearr','\u21D7':'neArr','\u2260':'ne','\u2250\u0338':'nedot','\u200B':'ZeroWidthSpace','\u2262':'nequiv','\u2928':'toea','\u2242\u0338':'nesim','\n':'NewLine','\u2204':'nexist','\uD835\uDD11':'Nfr','\uD835\uDD2B':'nfr','\u2267\u0338':'ngE','\u2271':'nge','\u2A7E\u0338':'nges','\u22D9\u0338':'nGg','\u2275':'ngsim','\u226B\u20D2':'nGt','\u226F':'ngt','\u226B\u0338':'nGtv','\u21AE':'nharr','\u21CE':'nhArr','\u2AF2':'nhpar','\u220B':'ni','\u22FC':'nis','\u22FA':'nisd','\u040A':'NJcy','\u045A':'njcy','\u219A':'nlarr','\u21CD':'nlArr','\u2025':'nldr','\u2266\u0338':'nlE','\u2270':'nle','\u2A7D\u0338':'nles','\u226E':'nlt','\u22D8\u0338':'nLl','\u2274':'nlsim','\u226A\u20D2':'nLt','\u22EA':'nltri','\u22EC':'nltrie','\u226A\u0338':'nLtv','\u2224':'nmid','\u2060':'NoBreak','\uD835\uDD5F':'nopf','\u2AEC':'Not','\xAC':'not','\u226D':'NotCupCap','\u2226':'npar','\u2209':'notin','\u2279':'ntgl','\u22F5\u0338':'notindot','\u22F9\u0338':'notinE','\u22F7':'notinvb','\u22F6':'notinvc','\u29CF\u0338':'NotLeftTriangleBar','\u2278':'ntlg','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA1\u0338':'NotNestedLessLess','\u220C':'notni','\u22FE':'notnivb','\u22FD':'notnivc','\u2280':'npr','\u2AAF\u0338':'npre','\u22E0':'nprcue','\u29D0\u0338':'NotRightTriangleBar','\u22EB':'nrtri','\u22ED':'nrtrie','\u228F\u0338':'NotSquareSubset','\u22E2':'nsqsube','\u2290\u0338':'NotSquareSuperset','\u22E3':'nsqsupe','\u2282\u20D2':'vnsub','\u2288':'nsube','\u2281':'nsc','\u2AB0\u0338':'nsce','\u22E1':'nsccue','\u227F\u0338':'NotSucceedsTilde','\u2283\u20D2':'vnsup','\u2289':'nsupe','\u2241':'nsim','\u2244':'nsime','\u2AFD\u20E5':'nparsl','\u2202\u0338':'npart','\u2A14':'npolint','\u2933\u0338':'nrarrc','\u219B':'nrarr','\u21CF':'nrArr','\u219D\u0338':'nrarrw','\uD835\uDCA9':'Nscr','\uD835\uDCC3':'nscr','\u2284':'nsub','\u2AC5\u0338':'nsubE','\u2285':'nsup','\u2AC6\u0338':'nsupE','\xD1':'Ntilde','\xF1':'ntilde','\u039D':'Nu','\u03BD':'nu','#':'num','\u2116':'numero','\u2007':'numsp','\u224D\u20D2':'nvap','\u22AC':'nvdash','\u22AD':'nvDash','\u22AE':'nVdash','\u22AF':'nVDash','\u2265\u20D2':'nvge','>\u20D2':'nvgt','\u2904':'nvHarr','\u29DE':'nvinfin','\u2902':'nvlArr','\u2264\u20D2':'nvle','<\u20D2':'nvlt','\u22B4\u20D2':'nvltrie','\u2903':'nvrArr','\u22B5\u20D2':'nvrtrie','\u223C\u20D2':'nvsim','\u2923':'nwarhk','\u2196':'nwarr','\u21D6':'nwArr','\u2927':'nwnear','\xD3':'Oacute','\xF3':'oacute','\xD4':'Ocirc','\xF4':'ocirc','\u041E':'Ocy','\u043E':'ocy','\u0150':'Odblac','\u0151':'odblac','\u2A38':'odiv','\u29BC':'odsold','\u0152':'OElig','\u0153':'oelig','\u29BF':'ofcir','\uD835\uDD12':'Ofr','\uD835\uDD2C':'ofr','\u02DB':'ogon','\xD2':'Ograve','\xF2':'ograve','\u29C1':'ogt','\u29B5':'ohbar','\u03A9':'ohm','\u29BE':'olcir','\u29BB':'olcross','\u203E':'oline','\u29C0':'olt','\u014C':'Omacr','\u014D':'omacr','\u03C9':'omega','\u039F':'Omicron','\u03BF':'omicron','\u29B6':'omid','\uD835\uDD46':'Oopf','\uD835\uDD60':'oopf','\u29B7':'opar','\u29B9':'operp','\u2A54':'Or','\u2228':'or','\u2A5D':'ord','\u2134':'oscr','\xAA':'ordf','\xBA':'ordm','\u22B6':'origof','\u2A56':'oror','\u2A57':'orslope','\u2A5B':'orv','\uD835\uDCAA':'Oscr','\xD8':'Oslash','\xF8':'oslash','\u2298':'osol','\xD5':'Otilde','\xF5':'otilde','\u2A36':'otimesas','\u2A37':'Otimes','\xD6':'Ouml','\xF6':'ouml','\u233D':'ovbar','\u23DE':'OverBrace','\u23B4':'tbrk','\u23DC':'OverParenthesis','\xB6':'para','\u2AF3':'parsim','\u2AFD':'parsl','\u2202':'part','\u041F':'Pcy','\u043F':'pcy','%':'percnt','.':'period','\u2030':'permil','\u2031':'pertenk','\uD835\uDD13':'Pfr','\uD835\uDD2D':'pfr','\u03A6':'Phi','\u03C6':'phi','\u03D5':'phiv','\u260E':'phone','\u03A0':'Pi','\u03C0':'pi','\u03D6':'piv','\u210E':'planckh','\u2A23':'plusacir','\u2A22':'pluscir','+':'plus','\u2A25':'plusdu','\u2A72':'pluse','\xB1':'pm','\u2A26':'plussim','\u2A27':'plustwo','\u2A15':'pointint','\uD835\uDD61':'popf','\u2119':'Popf','\xA3':'pound','\u2AB7':'prap','\u2ABB':'Pr','\u227A':'pr','\u227C':'prcue','\u2AAF':'pre','\u227E':'prsim','\u2AB9':'prnap','\u2AB5':'prnE','\u22E8':'prnsim','\u2AB3':'prE','\u2032':'prime','\u2033':'Prime','\u220F':'prod','\u232E':'profalar','\u2312':'profline','\u2313':'profsurf','\u221D':'prop','\u22B0':'prurel','\uD835\uDCAB':'Pscr','\uD835\uDCC5':'pscr','\u03A8':'Psi','\u03C8':'psi','\u2008':'puncsp','\uD835\uDD14':'Qfr','\uD835\uDD2E':'qfr','\uD835\uDD62':'qopf','\u211A':'Qopf','\u2057':'qprime','\uD835\uDCAC':'Qscr','\uD835\uDCC6':'qscr','\u2A16':'quatint','?':'quest','"':'quot','\u21DB':'rAarr','\u223D\u0331':'race','\u0154':'Racute','\u0155':'racute','\u221A':'Sqrt','\u29B3':'raemptyv','\u27E9':'rang','\u27EB':'Rang','\u2992':'rangd','\u29A5':'range','\xBB':'raquo','\u2975':'rarrap','\u21E5':'rarrb','\u2920':'rarrbfs','\u2933':'rarrc','\u2192':'rarr','\u21A0':'Rarr','\u291E':'rarrfs','\u2945':'rarrpl','\u2974':'rarrsim','\u2916':'Rarrtl','\u21A3':'rarrtl','\u219D':'rarrw','\u291A':'ratail','\u291C':'rAtail','\u2236':'ratio','\u2773':'rbbrk','}':'rcub',']':'rsqb','\u298C':'rbrke','\u298E':'rbrksld','\u2990':'rbrkslu','\u0158':'Rcaron','\u0159':'rcaron','\u0156':'Rcedil','\u0157':'rcedil','\u2309':'rceil','\u0420':'Rcy','\u0440':'rcy','\u2937':'rdca','\u2969':'rdldhar','\u21B3':'rdsh','\u211C':'Re','\u211B':'Rscr','\u211D':'Ropf','\u25AD':'rect','\u297D':'rfisht','\u230B':'rfloor','\uD835\uDD2F':'rfr','\u2964':'rHar','\u21C0':'rharu','\u296C':'rharul','\u03A1':'Rho','\u03C1':'rho','\u03F1':'rhov','\u21C4':'rlarr','\u27E7':'robrk','\u295D':'RightDownTeeVector','\u2955':'RightDownVectorBar','\u21C9':'rrarr','\u22A2':'vdash','\u295B':'RightTeeVector','\u22CC':'rthree','\u29D0':'RightTriangleBar','\u22B3':'vrtri','\u22B5':'rtrie','\u294F':'RightUpDownVector','\u295C':'RightUpTeeVector','\u2954':'RightUpVectorBar','\u21BE':'uharr','\u2953':'RightVectorBar','\u02DA':'ring','\u200F':'rlm','\u23B1':'rmoust','\u2AEE':'rnmid','\u27ED':'roang','\u21FE':'roarr','\u2986':'ropar','\uD835\uDD63':'ropf','\u2A2E':'roplus','\u2A35':'rotimes','\u2970':'RoundImplies',')':'rpar','\u2994':'rpargt','\u2A12':'rppolint','\u203A':'rsaquo','\uD835\uDCC7':'rscr','\u21B1':'rsh','\u22CA':'rtimes','\u25B9':'rtri','\u29CE':'rtriltri','\u29F4':'RuleDelayed','\u2968':'ruluhar','\u211E':'rx','\u015A':'Sacute','\u015B':'sacute','\u2AB8':'scap','\u0160':'Scaron','\u0161':'scaron','\u2ABC':'Sc','\u227B':'sc','\u227D':'sccue','\u2AB0':'sce','\u2AB4':'scE','\u015E':'Scedil','\u015F':'scedil','\u015C':'Scirc','\u015D':'scirc','\u2ABA':'scnap','\u2AB6':'scnE','\u22E9':'scnsim','\u2A13':'scpolint','\u227F':'scsim','\u0421':'Scy','\u0441':'scy','\u22C5':'sdot','\u2A66':'sdote','\u21D8':'seArr','\xA7':'sect',';':'semi','\u2929':'tosa','\u2736':'sext','\uD835\uDD16':'Sfr','\uD835\uDD30':'sfr','\u266F':'sharp','\u0429':'SHCHcy','\u0449':'shchcy','\u0428':'SHcy','\u0448':'shcy','\u2191':'uarr','\xAD':'shy','\u03A3':'Sigma','\u03C3':'sigma','\u03C2':'sigmaf','\u223C':'sim','\u2A6A':'simdot','\u2243':'sime','\u2A9E':'simg','\u2AA0':'simgE','\u2A9D':'siml','\u2A9F':'simlE','\u2246':'simne','\u2A24':'simplus','\u2972':'simrarr','\u2A33':'smashp','\u29E4':'smeparsl','\u2323':'smile','\u2AAA':'smt','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u042C':'SOFTcy','\u044C':'softcy','\u233F':'solbar','\u29C4':'solb','/':'sol','\uD835\uDD4A':'Sopf','\uD835\uDD64':'sopf','\u2660':'spades','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u228F':'sqsub','\u2291':'sqsube','\u2290':'sqsup','\u2292':'sqsupe','\u25A1':'squ','\uD835\uDCAE':'Sscr','\uD835\uDCC8':'sscr','\u22C6':'Star','\u2606':'star','\u2282':'sub','\u22D0':'Sub','\u2ABD':'subdot','\u2AC5':'subE','\u2286':'sube','\u2AC3':'subedot','\u2AC1':'submult','\u2ACB':'subnE','\u228A':'subne','\u2ABF':'subplus','\u2979':'subrarr','\u2AC7':'subsim','\u2AD5':'subsub','\u2AD3':'subsup','\u2211':'sum','\u266A':'sung','\xB9':'sup1','\xB2':'sup2','\xB3':'sup3','\u2283':'sup','\u22D1':'Sup','\u2ABE':'supdot','\u2AD8':'supdsub','\u2AC6':'supE','\u2287':'supe','\u2AC4':'supedot','\u27C9':'suphsol','\u2AD7':'suphsub','\u297B':'suplarr','\u2AC2':'supmult','\u2ACC':'supnE','\u228B':'supne','\u2AC0':'supplus','\u2AC8':'supsim','\u2AD4':'supsub','\u2AD6':'supsup','\u21D9':'swArr','\u292A':'swnwar','\xDF':'szlig','\t':'Tab','\u2316':'target','\u03A4':'Tau','\u03C4':'tau','\u0164':'Tcaron','\u0165':'tcaron','\u0162':'Tcedil','\u0163':'tcedil','\u0422':'Tcy','\u0442':'tcy','\u20DB':'tdot','\u2315':'telrec','\uD835\uDD17':'Tfr','\uD835\uDD31':'tfr','\u2234':'there4','\u0398':'Theta','\u03B8':'theta','\u03D1':'thetav','\u205F\u200A':'ThickSpace','\u2009':'thinsp','\xDE':'THORN','\xFE':'thorn','\u2A31':'timesbar','\xD7':'times','\u2A30':'timesd','\u2336':'topbot','\u2AF1':'topcir','\uD835\uDD4B':'Topf','\uD835\uDD65':'topf','\u2ADA':'topfork','\u2034':'tprime','\u2122':'trade','\u25B5':'utri','\u225C':'trie','\u25EC':'tridot','\u2A3A':'triminus','\u2A39':'triplus','\u29CD':'trisb','\u2A3B':'tritime','\u23E2':'trpezium','\uD835\uDCAF':'Tscr','\uD835\uDCC9':'tscr','\u0426':'TScy','\u0446':'tscy','\u040B':'TSHcy','\u045B':'tshcy','\u0166':'Tstrok','\u0167':'tstrok','\xDA':'Uacute','\xFA':'uacute','\u219F':'Uarr','\u2949':'Uarrocir','\u040E':'Ubrcy','\u045E':'ubrcy','\u016C':'Ubreve','\u016D':'ubreve','\xDB':'Ucirc','\xFB':'ucirc','\u0423':'Ucy','\u0443':'ucy','\u21C5':'udarr','\u0170':'Udblac','\u0171':'udblac','\u296E':'udhar','\u297E':'ufisht','\uD835\uDD18':'Ufr','\uD835\uDD32':'ufr','\xD9':'Ugrave','\xF9':'ugrave','\u2963':'uHar','\u2580':'uhblk','\u231C':'ulcorn','\u230F':'ulcrop','\u25F8':'ultri','\u016A':'Umacr','\u016B':'umacr','\u23DF':'UnderBrace','\u23DD':'UnderParenthesis','\u228E':'uplus','\u0172':'Uogon','\u0173':'uogon','\uD835\uDD4C':'Uopf','\uD835\uDD66':'uopf','\u2912':'UpArrowBar','\u2195':'varr','\u03C5':'upsi','\u03D2':'Upsi','\u03A5':'Upsilon','\u21C8':'uuarr','\u231D':'urcorn','\u230E':'urcrop','\u016E':'Uring','\u016F':'uring','\u25F9':'urtri','\uD835\uDCB0':'Uscr','\uD835\uDCCA':'uscr','\u22F0':'utdot','\u0168':'Utilde','\u0169':'utilde','\xDC':'Uuml','\xFC':'uuml','\u29A7':'uwangle','\u299C':'vangrt','\u228A\uFE00':'vsubne','\u2ACB\uFE00':'vsubnE','\u228B\uFE00':'vsupne','\u2ACC\uFE00':'vsupnE','\u2AE8':'vBar','\u2AEB':'Vbar','\u2AE9':'vBarv','\u0412':'Vcy','\u0432':'vcy','\u22A9':'Vdash','\u22AB':'VDash','\u2AE6':'Vdashl','\u22BB':'veebar','\u225A':'veeeq','\u22EE':'vellip','|':'vert','\u2016':'Vert','\u2758':'VerticalSeparator','\u2240':'wr','\uD835\uDD19':'Vfr','\uD835\uDD33':'vfr','\uD835\uDD4D':'Vopf','\uD835\uDD67':'vopf','\uD835\uDCB1':'Vscr','\uD835\uDCCB':'vscr','\u22AA':'Vvdash','\u299A':'vzigzag','\u0174':'Wcirc','\u0175':'wcirc','\u2A5F':'wedbar','\u2259':'wedgeq','\u2118':'wp','\uD835\uDD1A':'Wfr','\uD835\uDD34':'wfr','\uD835\uDD4E':'Wopf','\uD835\uDD68':'wopf','\uD835\uDCB2':'Wscr','\uD835\uDCCC':'wscr','\uD835\uDD1B':'Xfr','\uD835\uDD35':'xfr','\u039E':'Xi','\u03BE':'xi','\u22FB':'xnis','\uD835\uDD4F':'Xopf','\uD835\uDD69':'xopf','\uD835\uDCB3':'Xscr','\uD835\uDCCD':'xscr','\xDD':'Yacute','\xFD':'yacute','\u042F':'YAcy','\u044F':'yacy','\u0176':'Ycirc','\u0177':'ycirc','\u042B':'Ycy','\u044B':'ycy','\xA5':'yen','\uD835\uDD1C':'Yfr','\uD835\uDD36':'yfr','\u0407':'YIcy','\u0457':'yicy','\uD835\uDD50':'Yopf','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDCCE':'yscr','\u042E':'YUcy','\u044E':'yucy','\xFF':'yuml','\u0178':'Yuml','\u0179':'Zacute','\u017A':'zacute','\u017D':'Zcaron','\u017E':'zcaron','\u0417':'Zcy','\u0437':'zcy','\u017B':'Zdot','\u017C':'zdot','\u2128':'Zfr','\u0396':'Zeta','\u03B6':'zeta','\uD835\uDD37':'zfr','\u0416':'ZHcy','\u0436':'zhcy','\u21DD':'zigrarr','\uD835\uDD6B':'zopf','\uD835\uDCB5':'Zscr','\uD835\uDCCF':'zscr','\u200D':'zwj','\u200C':'zwnj'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See http://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it��s part of a tag or an
		// unquoted attribute value. We��re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer �� 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|iacute|Uacute|plusmn|otilde|Otilde|Agrave|agrave|yacute|Yacute|oslash|Oslash|Atilde|atilde|brvbar|Ccedil|ccedil|ograve|curren|divide|Eacute|eacute|Ograve|oacute|Egrave|egrave|ugrave|frac12|frac14|frac34|Ugrave|Oacute|Iacute|ntilde|Ntilde|uacute|middot|Igrave|igrave|iquest|aacute|laquo|THORN|micro|iexcl|icirc|Icirc|Acirc|ucirc|ecirc|Ocirc|ocirc|Ecirc|Ucirc|aring|Aring|aelig|AElig|acute|pound|raquo|acirc|times|thorn|szlig|cedil|COPY|Auml|ordf|ordm|uuml|macr|Uuml|auml|Ouml|ouml|para|nbsp|Euml|quot|QUOT|euml|yuml|cent|sect|copy|sup1|sup2|sup3|Iuml|iuml|shy|eth|reg|not|yen|amp|AMP|REG|uml|ETH|deg|gt|GT|LT|lt)([=a-zA-Z0-9])?/g;
	var decodeMap = {'Aacute':'\xC1','aacute':'\xE1','Abreve':'\u0102','abreve':'\u0103','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','Acy':'\u0410','acy':'\u0430','AElig':'\xC6','aelig':'\xE6','af':'\u2061','Afr':'\uD835\uDD04','afr':'\uD835\uDD1E','Agrave':'\xC0','agrave':'\xE0','alefsym':'\u2135','aleph':'\u2135','Alpha':'\u0391','alpha':'\u03B1','Amacr':'\u0100','amacr':'\u0101','amalg':'\u2A3F','amp':'&','AMP':'&','andand':'\u2A55','And':'\u2A53','and':'\u2227','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angmsd':'\u2221','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','Aogon':'\u0104','aogon':'\u0105','Aopf':'\uD835\uDD38','aopf':'\uD835\uDD52','apacir':'\u2A6F','ap':'\u2248','apE':'\u2A70','ape':'\u224A','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','Aring':'\xC5','aring':'\xE5','Ascr':'\uD835\uDC9C','ascr':'\uD835\uDCB6','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','Bcy':'\u0411','bcy':'\u0431','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','Beta':'\u0392','beta':'\u03B2','beth':'\u2136','between':'\u226C','Bfr':'\uD835\uDD05','bfr':'\uD835\uDD1F','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bNot':'\u2AED','bnot':'\u2310','Bopf':'\uD835\uDD39','bopf':'\uD835\uDD53','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxHd':'\u2564','boxhD':'\u2565','boxHD':'\u2566','boxhu':'\u2534','boxHu':'\u2567','boxhU':'\u2568','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsolb':'\u29C5','bsol':'\\','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpE':'\u2AAE','bumpe':'\u224F','Bumpeq':'\u224E','bumpeq':'\u224F','Cacute':'\u0106','cacute':'\u0107','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','cap':'\u2229','Cap':'\u22D2','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','Ccaron':'\u010C','ccaron':'\u010D','Ccedil':'\xC7','ccedil':'\xE7','Ccirc':'\u0108','ccirc':'\u0109','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','Cdot':'\u010A','cdot':'\u010B','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','CHcy':'\u0427','chcy':'\u0447','check':'\u2713','checkmark':'\u2713','Chi':'\u03A7','chi':'\u03C7','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cir':'\u25CB','cirE':'\u29C3','cire':'\u2257','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','Colone':'\u2A74','colone':'\u2254','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','Cscr':'\uD835\uDC9E','cscr':'\uD835\uDCB8','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cup':'\u222A','Cup':'\u22D3','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','Darr':'\u21A1','dArr':'\u21D3','dash':'\u2010','Dashv':'\u2AE4','dashv':'\u22A3','dbkarow':'\u290F','dblac':'\u02DD','Dcaron':'\u010E','dcaron':'\u010F','Dcy':'\u0414','dcy':'\u0434','ddagger':'\u2021','ddarr':'\u21CA','DD':'\u2145','dd':'\u2146','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','Delta':'\u0394','delta':'\u03B4','demptyv':'\u29B1','dfisht':'\u297F','Dfr':'\uD835\uDD07','dfr':'\uD835\uDD21','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','DJcy':'\u0402','djcy':'\u0452','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','Dopf':'\uD835\uDD3B','dopf':'\uD835\uDD55','Dot':'\xA8','dot':'\u02D9','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','DownArrowBar':'\u2913','downarrow':'\u2193','DownArrow':'\u2193','Downarrow':'\u21D3','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVectorBar':'\u2956','DownLeftVector':'\u21BD','DownRightTeeVector':'\u295F','DownRightVectorBar':'\u2957','DownRightVector':'\u21C1','DownTeeArrow':'\u21A7','DownTee':'\u22A4','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','Dscr':'\uD835\uDC9F','dscr':'\uD835\uDCB9','DScy':'\u0405','dscy':'\u0455','dsol':'\u29F6','Dstrok':'\u0110','dstrok':'\u0111','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','DZcy':'\u040F','dzcy':'\u045F','dzigrarr':'\u27FF','Eacute':'\xC9','eacute':'\xE9','easter':'\u2A6E','Ecaron':'\u011A','ecaron':'\u011B','Ecirc':'\xCA','ecirc':'\xEA','ecir':'\u2256','ecolon':'\u2255','Ecy':'\u042D','ecy':'\u044D','eDDot':'\u2A77','Edot':'\u0116','edot':'\u0117','eDot':'\u2251','ee':'\u2147','efDot':'\u2252','Efr':'\uD835\uDD08','efr':'\uD835\uDD22','eg':'\u2A9A','Egrave':'\xC8','egrave':'\xE8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','Emacr':'\u0112','emacr':'\u0113','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp13':'\u2004','emsp14':'\u2005','emsp':'\u2003','ENG':'\u014A','eng':'\u014B','ensp':'\u2002','Eogon':'\u0118','eogon':'\u0119','Eopf':'\uD835\uDD3C','eopf':'\uD835\uDD56','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','Epsilon':'\u0395','epsilon':'\u03B5','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','Esim':'\u2A73','esim':'\u2242','Eta':'\u0397','eta':'\u03B7','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','Fcy':'\u0424','fcy':'\u0444','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','Ffr':'\uD835\uDD09','ffr':'\uD835\uDD23','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','Fopf':'\uD835\uDD3D','fopf':'\uD835\uDD57','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','Gamma':'\u0393','gamma':'\u03B3','Gammad':'\u03DC','gammad':'\u03DD','gap':'\u2A86','Gbreve':'\u011E','gbreve':'\u011F','Gcedil':'\u0122','Gcirc':'\u011C','gcirc':'\u011D','Gcy':'\u0413','gcy':'\u0433','Gdot':'\u0120','gdot':'\u0121','ge':'\u2265','gE':'\u2267','gEl':'\u2A8C','gel':'\u22DB','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','gescc':'\u2AA9','ges':'\u2A7E','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','Gfr':'\uD835\uDD0A','gfr':'\uD835\uDD24','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','GJcy':'\u0403','gjcy':'\u0453','gla':'\u2AA5','gl':'\u2277','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','Gopf':'\uD835\uDD3E','gopf':'\uD835\uDD58','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','Gscr':'\uD835\uDCA2','gscr':'\u210A','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gtcc':'\u2AA7','gtcir':'\u2A7A','gt':'>','GT':'>','Gt':'\u226B','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','HARDcy':'\u042A','hardcy':'\u044A','harrcir':'\u2948','harr':'\u2194','hArr':'\u21D4','harrw':'\u21AD','Hat':'^','hbar':'\u210F','Hcirc':'\u0124','hcirc':'\u0125','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','Hstrok':'\u0126','hstrok':'\u0127','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','Iacute':'\xCD','iacute':'\xED','ic':'\u2063','Icirc':'\xCE','icirc':'\xEE','Icy':'\u0418','icy':'\u0438','Idot':'\u0130','IEcy':'\u0415','iecy':'\u0435','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','Igrave':'\xCC','igrave':'\xEC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','IJlig':'\u0132','ijlig':'\u0133','Imacr':'\u012A','imacr':'\u012B','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','Im':'\u2111','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','incare':'\u2105','in':'\u2208','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','intcal':'\u22BA','int':'\u222B','Int':'\u222C','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','IOcy':'\u0401','iocy':'\u0451','Iogon':'\u012E','iogon':'\u012F','Iopf':'\uD835\uDD40','iopf':'\uD835\uDD5A','Iota':'\u0399','iota':'\u03B9','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','Itilde':'\u0128','itilde':'\u0129','Iukcy':'\u0406','iukcy':'\u0456','Iuml':'\xCF','iuml':'\xEF','Jcirc':'\u0134','jcirc':'\u0135','Jcy':'\u0419','jcy':'\u0439','Jfr':'\uD835\uDD0D','jfr':'\uD835\uDD27','jmath':'\u0237','Jopf':'\uD835\uDD41','jopf':'\uD835\uDD5B','Jscr':'\uD835\uDCA5','jscr':'\uD835\uDCBF','Jsercy':'\u0408','jsercy':'\u0458','Jukcy':'\u0404','jukcy':'\u0454','Kappa':'\u039A','kappa':'\u03BA','kappav':'\u03F0','Kcedil':'\u0136','kcedil':'\u0137','Kcy':'\u041A','kcy':'\u043A','Kfr':'\uD835\uDD0E','kfr':'\uD835\uDD28','kgreen':'\u0138','KHcy':'\u0425','khcy':'\u0445','KJcy':'\u040C','kjcy':'\u045C','Kopf':'\uD835\uDD42','kopf':'\uD835\uDD5C','Kscr':'\uD835\uDCA6','kscr':'\uD835\uDCC0','lAarr':'\u21DA','Lacute':'\u0139','lacute':'\u013A','laemptyv':'\u29B4','lagran':'\u2112','Lambda':'\u039B','lambda':'\u03BB','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larrb':'\u21E4','larrbfs':'\u291F','larr':'\u2190','Larr':'\u219E','lArr':'\u21D0','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','latail':'\u2919','lAtail':'\u291B','lat':'\u2AAB','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','Lcaron':'\u013D','lcaron':'\u013E','Lcedil':'\u013B','lcedil':'\u013C','lceil':'\u2308','lcub':'{','Lcy':'\u041B','lcy':'\u043B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','LeftArrowBar':'\u21E4','leftarrow':'\u2190','LeftArrow':'\u2190','Leftarrow':'\u21D0','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVectorBar':'\u2959','LeftDownVector':'\u21C3','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','LeftRightArrow':'\u2194','Leftrightarrow':'\u21D4','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTeeArrow':'\u21A4','LeftTee':'\u22A3','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangleBar':'\u29CF','LeftTriangle':'\u22B2','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVectorBar':'\u2958','LeftUpVector':'\u21BF','LeftVectorBar':'\u2952','LeftVector':'\u21BC','lEg':'\u2A8B','leg':'\u22DA','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','lescc':'\u2AA8','les':'\u2A7D','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','Lfr':'\uD835\uDD0F','lfr':'\uD835\uDD29','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','LJcy':'\u0409','ljcy':'\u0459','llarr':'\u21C7','ll':'\u226A','Ll':'\u22D8','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','Lmidot':'\u013F','lmidot':'\u0140','lmoustache':'\u23B0','lmoust':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','LongLeftArrow':'\u27F5','Longleftarrow':'\u27F8','longleftrightarrow':'\u27F7','LongLeftRightArrow':'\u27F7','Longleftrightarrow':'\u27FA','longmapsto':'\u27FC','longrightarrow':'\u27F6','LongRightArrow':'\u27F6','Longrightarrow':'\u27F9','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','Lopf':'\uD835\uDD43','lopf':'\uD835\uDD5D','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','Lstrok':'\u0141','lstrok':'\u0142','ltcc':'\u2AA6','ltcir':'\u2A79','lt':'<','LT':'<','Lt':'\u226A','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','Map':'\u2905','map':'\u21A6','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','Mcy':'\u041C','mcy':'\u043C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','Mfr':'\uD835\uDD10','mfr':'\uD835\uDD2A','mho':'\u2127','micro':'\xB5','midast':'*','midcir':'\u2AF0','mid':'\u2223','middot':'\xB7','minusb':'\u229F','minus':'\u2212','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','Mopf':'\uD835\uDD44','mopf':'\uD835\uDD5E','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','Mu':'\u039C','mu':'\u03BC','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','Nacute':'\u0143','nacute':'\u0144','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natural':'\u266E','naturals':'\u2115','natur':'\u266E','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','Ncaron':'\u0147','ncaron':'\u0148','Ncedil':'\u0145','ncedil':'\u0146','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','Ncy':'\u041D','ncy':'\u043D','ndash':'\u2013','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','ne':'\u2260','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','Nfr':'\uD835\uDD11','nfr':'\uD835\uDD2B','ngE':'\u2267\u0338','nge':'\u2271','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','nGt':'\u226B\u20D2','ngt':'\u226F','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','NJcy':'\u040A','njcy':'\u045A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nlE':'\u2266\u0338','nle':'\u2270','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nLt':'\u226A\u20D2','nlt':'\u226E','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','Not':'\u2AEC','not':'\xAC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangle':'\u22EA','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangle':'\u22EB','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','nparallel':'\u2226','npar':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','nprec':'\u2280','npreceq':'\u2AAF\u0338','npre':'\u2AAF\u0338','nrarrc':'\u2933\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','Nscr':'\uD835\uDCA9','nscr':'\uD835\uDCC3','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsubE':'\u2AC5\u0338','nsube':'\u2288','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupE':'\u2AC6\u0338','nsupe':'\u2289','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','Ntilde':'\xD1','ntilde':'\xF1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','Nu':'\u039D','nu':'\u03BD','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','Oacute':'\xD3','oacute':'\xF3','oast':'\u229B','Ocirc':'\xD4','ocirc':'\xF4','ocir':'\u229A','Ocy':'\u041E','ocy':'\u043E','odash':'\u229D','Odblac':'\u0150','odblac':'\u0151','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','OElig':'\u0152','oelig':'\u0153','ofcir':'\u29BF','Ofr':'\uD835\uDD12','ofr':'\uD835\uDD2C','ogon':'\u02DB','Ograve':'\xD2','ograve':'\xF2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','Omacr':'\u014C','omacr':'\u014D','Omega':'\u03A9','omega':'\u03C9','Omicron':'\u039F','omicron':'\u03BF','omid':'\u29B6','ominus':'\u2296','Oopf':'\uD835\uDD46','oopf':'\uD835\uDD60','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','orarr':'\u21BB','Or':'\u2A54','or':'\u2228','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','Oscr':'\uD835\uDCAA','oscr':'\u2134','Oslash':'\xD8','oslash':'\xF8','osol':'\u2298','Otilde':'\xD5','otilde':'\xF5','otimesas':'\u2A36','Otimes':'\u2A37','otimes':'\u2297','Ouml':'\xD6','ouml':'\xF6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','para':'\xB6','parallel':'\u2225','par':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','Pcy':'\u041F','pcy':'\u043F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','Pfr':'\uD835\uDD13','pfr':'\uD835\uDD2D','Phi':'\u03A6','phi':'\u03C6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','Pi':'\u03A0','pi':'\u03C0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plus':'+','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','prap':'\u2AB7','Pr':'\u2ABB','pr':'\u227A','prcue':'\u227C','precapprox':'\u2AB7','prec':'\u227A','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','pre':'\u2AAF','prE':'\u2AB3','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportional':'\u221D','Proportion':'\u2237','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','Pscr':'\uD835\uDCAB','pscr':'\uD835\uDCC5','Psi':'\u03A8','psi':'\u03C8','puncsp':'\u2008','Qfr':'\uD835\uDD14','qfr':'\uD835\uDD2E','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','Qscr':'\uD835\uDCAC','qscr':'\uD835\uDCC6','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','Racute':'\u0154','racute':'\u0155','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarr':'\u2192','Rarr':'\u21A0','rArr':'\u21D2','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','Rarrtl':'\u2916','rarrtl':'\u21A3','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','Rcaron':'\u0158','rcaron':'\u0159','Rcedil':'\u0156','rcedil':'\u0157','rceil':'\u2309','rcub':'}','Rcy':'\u0420','rcy':'\u0440','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','Re':'\u211C','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','Rho':'\u03A1','rho':'\u03C1','rhov':'\u03F1','RightAngleBracket':'\u27E9','RightArrowBar':'\u21E5','rightarrow':'\u2192','RightArrow':'\u2192','Rightarrow':'\u21D2','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVectorBar':'\u2955','RightDownVector':'\u21C2','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTeeArrow':'\u21A6','RightTee':'\u22A2','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangleBar':'\u29D0','RightTriangle':'\u22B3','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVectorBar':'\u2954','RightUpVector':'\u21BE','RightVectorBar':'\u2953','RightVector':'\u21C0','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoustache':'\u23B1','rmoust':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','Sacute':'\u015A','sacute':'\u015B','sbquo':'\u201A','scap':'\u2AB8','Scaron':'\u0160','scaron':'\u0161','Sc':'\u2ABC','sc':'\u227B','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','Scedil':'\u015E','scedil':'\u015F','Scirc':'\u015C','scirc':'\u015D','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','Scy':'\u0421','scy':'\u0441','sdotb':'\u22A1','sdot':'\u22C5','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','Sfr':'\uD835\uDD16','sfr':'\uD835\uDD30','sfrown':'\u2322','sharp':'\u266F','SHCHcy':'\u0429','shchcy':'\u0449','SHcy':'\u0428','shcy':'\u0448','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','Sigma':'\u03A3','sigma':'\u03C3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','SOFTcy':'\u042C','softcy':'\u044C','solbar':'\u233F','solb':'\u29C4','sol':'/','Sopf':'\uD835\uDD4A','sopf':'\uD835\uDD64','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squ':'\u25A1','squf':'\u25AA','srarr':'\u2192','Sscr':'\uD835\uDCAE','sscr':'\uD835\uDCC8','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','Star':'\u22C6','star':'\u2606','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','subE':'\u2AC5','sube':'\u2286','subedot':'\u2AC3','submult':'\u2AC1','subnE':'\u2ACB','subne':'\u228A','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succapprox':'\u2AB8','succ':'\u227B','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','sup':'\u2283','Sup':'\u22D1','supdot':'\u2ABE','supdsub':'\u2AD8','supE':'\u2AC6','supe':'\u2287','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supnE':'\u2ACC','supne':'\u228B','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','Tau':'\u03A4','tau':'\u03C4','tbrk':'\u23B4','Tcaron':'\u0164','tcaron':'\u0165','Tcedil':'\u0162','tcedil':'\u0163','Tcy':'\u0422','tcy':'\u0442','tdot':'\u20DB','telrec':'\u2315','Tfr':'\uD835\uDD17','tfr':'\uD835\uDD31','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','Theta':'\u0398','theta':'\u03B8','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','ThinSpace':'\u2009','thinsp':'\u2009','thkap':'\u2248','thksim':'\u223C','THORN':'\xDE','thorn':'\xFE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','timesbar':'\u2A31','timesb':'\u22A0','times':'\xD7','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','topbot':'\u2336','topcir':'\u2AF1','top':'\u22A4','Topf':'\uD835\uDD4B','topf':'\uD835\uDD65','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','Tscr':'\uD835\uDCAF','tscr':'\uD835\uDCC9','TScy':'\u0426','tscy':'\u0446','TSHcy':'\u040B','tshcy':'\u045B','Tstrok':'\u0166','tstrok':'\u0167','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','Uacute':'\xDA','uacute':'\xFA','uarr':'\u2191','Uarr':'\u219F','uArr':'\u21D1','Uarrocir':'\u2949','Ubrcy':'\u040E','ubrcy':'\u045E','Ubreve':'\u016C','ubreve':'\u016D','Ucirc':'\xDB','ucirc':'\xFB','Ucy':'\u0423','ucy':'\u0443','udarr':'\u21C5','Udblac':'\u0170','udblac':'\u0171','udhar':'\u296E','ufisht':'\u297E','Ufr':'\uD835\uDD18','ufr':'\uD835\uDD32','Ugrave':'\xD9','ugrave':'\xF9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','Umacr':'\u016A','umacr':'\u016B','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','Uogon':'\u0172','uogon':'\u0173','Uopf':'\uD835\uDD4C','uopf':'\uD835\uDD66','UpArrowBar':'\u2912','uparrow':'\u2191','UpArrow':'\u2191','Uparrow':'\u21D1','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','UpDownArrow':'\u2195','Updownarrow':'\u21D5','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','Upsilon':'\u03A5','upsilon':'\u03C5','UpTeeArrow':'\u21A5','UpTee':'\u22A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','Uring':'\u016E','uring':'\u016F','urtri':'\u25F9','Uscr':'\uD835\uDCB0','uscr':'\uD835\uDCCA','utdot':'\u22F0','Utilde':'\u0168','utilde':'\u0169','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','Uuml':'\xDC','uuml':'\xFC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','Vcy':'\u0412','vcy':'\u0432','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','veebar':'\u22BB','vee':'\u2228','Vee':'\u22C1','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','Vfr':'\uD835\uDD19','vfr':'\uD835\uDD33','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','Vopf':'\uD835\uDD4D','vopf':'\uD835\uDD67','vprop':'\u221D','vrtri':'\u22B3','Vscr':'\uD835\uDCB1','vscr':'\uD835\uDCCB','vsubnE':'\u2ACB\uFE00','vsubne':'\u228A\uFE00','vsupnE':'\u2ACC\uFE00','vsupne':'\u228B\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','Wcirc':'\u0174','wcirc':'\u0175','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','Wfr':'\uD835\uDD1A','wfr':'\uD835\uDD34','Wopf':'\uD835\uDD4E','wopf':'\uD835\uDD68','wp':'\u2118','wr':'\u2240','wreath':'\u2240','Wscr':'\uD835\uDCB2','wscr':'\uD835\uDCCC','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','Xfr':'\uD835\uDD1B','xfr':'\uD835\uDD35','xharr':'\u27F7','xhArr':'\u27FA','Xi':'\u039E','xi':'\u03BE','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','Xopf':'\uD835\uDD4F','xopf':'\uD835\uDD69','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','Xscr':'\uD835\uDCB3','xscr':'\uD835\uDCCD','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','Yacute':'\xDD','yacute':'\xFD','YAcy':'\u042F','yacy':'\u044F','Ycirc':'\u0176','ycirc':'\u0177','Ycy':'\u042B','ycy':'\u044B','yen':'\xA5','Yfr':'\uD835\uDD1C','yfr':'\uD835\uDD36','YIcy':'\u0407','yicy':'\u0457','Yopf':'\uD835\uDD50','yopf':'\uD835\uDD6A','Yscr':'\uD835\uDCB4','yscr':'\uD835\uDCCE','YUcy':'\u042E','yucy':'\u044E','yuml':'\xFF','Yuml':'\u0178','Zacute':'\u0179','zacute':'\u017A','Zcaron':'\u017D','zcaron':'\u017E','Zcy':'\u0417','zcy':'\u0437','Zdot':'\u017B','zdot':'\u017C','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','Zeta':'\u0396','zeta':'\u03B6','zfr':'\uD835\uDD37','Zfr':'\u2128','ZHcy':'\u0416','zhcy':'\u0436','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','Zscr':'\uD835\uDCB5','zscr':'\uD835\uDCCF','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'Aacute':'\xC1','aacute':'\xE1','Acirc':'\xC2','acirc':'\xE2','acute':'\xB4','AElig':'\xC6','aelig':'\xE6','Agrave':'\xC0','agrave':'\xE0','amp':'&','AMP':'&','Aring':'\xC5','aring':'\xE5','Atilde':'\xC3','atilde':'\xE3','Auml':'\xC4','auml':'\xE4','brvbar':'\xA6','Ccedil':'\xC7','ccedil':'\xE7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','Eacute':'\xC9','eacute':'\xE9','Ecirc':'\xCA','ecirc':'\xEA','Egrave':'\xC8','egrave':'\xE8','ETH':'\xD0','eth':'\xF0','Euml':'\xCB','euml':'\xEB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','Iacute':'\xCD','iacute':'\xED','Icirc':'\xCE','icirc':'\xEE','iexcl':'\xA1','Igrave':'\xCC','igrave':'\xEC','iquest':'\xBF','Iuml':'\xCF','iuml':'\xEF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','Ntilde':'\xD1','ntilde':'\xF1','Oacute':'\xD3','oacute':'\xF3','Ocirc':'\xD4','ocirc':'\xF4','Ograve':'\xD2','ograve':'\xF2','ordf':'\xAA','ordm':'\xBA','Oslash':'\xD8','oslash':'\xF8','Otilde':'\xD5','otilde':'\xF5','Ouml':'\xD6','ouml':'\xF6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','THORN':'\xDE','thorn':'\xFE','times':'\xD7','Uacute':'\xDA','uacute':'\xFA','Ucirc':'\xDB','ucirc':'\xFB','Ugrave':'\xD9','ugrave':'\xF9','uml':'\xA8','Uuml':'\xDC','uuml':'\xFC','Yacute':'\xDD','yacute':'\xFD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see http://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// ��Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.��
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(symbol) {
		return '&#x' + symbol.charCodeAt(0).toString(16).toUpperCase() + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return hexEscape(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			string = string.replace(regexEscape, function(string) {
				return '&' + encodeMap[string] + ';'; // no need to check `has()` here
			});
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else {
			// Encode `<>"'&` using hexadecimal escapes, now that they��re not handled
			// using named character references.
			string = string.replace(regexEscape, hexEscape);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return '&#x' + codePoint.toString(16).toUpperCase() + ';';
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, hexEscape);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7) {
			var codePoint;
			var semicolon;
			var hexDigits;
			var reference;
			var next;
			if ($1) {
				// Decode decimal escapes, e.g. `&#119558;`.
				codePoint = $1;
				semicolon = $2;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				return codePointToSymbol(codePoint, strict);
			}
			if ($3) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $3;
				semicolon = $4;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}
			if ($5) {
				// Decode named character references with trailing `;`, e.g. `&copy;`.
				reference = $5;
				if (has(decodeMap, reference)) {
					return decodeMap[reference];
				} else {
					// Ambiguous ampersand; see http://mths.be/notes/ambiguous-ampersands.
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					return $0;
				}
			}
			// If we��re still here, it��s a legacy reference for sure. No need for an
			// extra `if` check.
			// Decode named character references without trailing `;`, e.g. `&amp`
			// This is only a parse error if it gets converted to `&`, or if it is
			// followed by `=` in an attribute context.
			reference = $6;
			next = $7;
			if (next && options.isAttributeValue) {
				if (strict && next == '=') {
					parseError('`&` did not start a character reference');
				}
				return $0;
			} else {
				if (strict) {
					parseError(
						'named character reference was not terminated by a semicolon'
					);
				}
				// Note: there is no need to check `has(decodeMapLegacy, reference)`.
				return decodeMapLegacy[reference] + (next || '');
			}
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '0.4.1',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return he;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = he;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in he) {
				has(he, key) && (freeExports[key] = he[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.he = he;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],73:[function(require,module,exports){
(function (process){
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * Animator that makes changes to the UI state of the application. Prevents layout thrashing.
 *
 * @class Animator
 */

function Animator () {
  this._animationQueue = [];
}

protoclass(Animator, {

  /**
   * Runs animatable object on requestAnimationFrame. This gets
   * called whenever the UI state changes.
   *
   * @method animate
   * @param {Object} animatable object. Must have `update()`
   */

  animate: function (animatable) {

    // if not browser, or fake app
    if (!process.browser) {
      return animatable.update();
    }

    // push on the animatable object
    this._animationQueue.push(animatable);

    var self = this;

    // if animating, don't continue
    if (this._requestingFrame) return;
    this._requestingFrame = true;
    var self = this;

    function runAnimations () {

      var queue = self._animationQueue;
      self._animationQueue = [];

      // queue.length is important here, because animate() can be
      // called again immediately after an update
      for (var i = 0; i < queue.length; i++) {
        queue[i].update();

        // check for anymore animations - need to run
        // them in order
        if (self._animationQueue.length) {
          runAnimations();
        }
      }
    }

    // run the animation frame, and callback all the animatable objects
    requestAnimationFrame(function () {
      runAnimations();
      self._requestingFrame = false;
    });
  }
});

module.exports = Animator;

}).call(this,require('_process'))
},{"_process":70,"protoclass":75}],74:[function(require,module,exports){
var Animator = require("./animator");

module.exports = function (app) {
  var animator = new Animator();
  app.animate = function (animatable) {
    animator.animate(animatable);
  };
}

},{"./animator":73}],75:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }
    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }
  }

  return child;
}


module.exports = protoclass;
},{}],76:[function(require,module,exports){
var bindable      = require("bindable"),
nofactor          = require("nofactor");

function Application (options) {
  if (!options) options = {};
  Application.parent.call(this, this);
  this.setProperties(options);
  this.nodeFactory = options.nodeFactory || nofactor["default"];
  this.models      = new bindable.Object();
  this._registerPlugins();

  var self = this;
}

module.exports = bindable.Object.extend(Application, {

  /**
   */

  plugins: [],

  /**
   */

  _registerPlugins: function () {

    var cp = this, parentPlugins = [];

    // inherit all plugins from the parent
    while (cp) {
      parentPlugins.push(cp.plugins || []);
      cp = cp.constructor.__super__;
    }


    for (var i = parentPlugins.length; i--;) {
      this.use.apply(this, parentPlugins[i]);
    }

    this.registerPlugins();
  },

  /**
   */

  registerPlugins: function () {

  },

  /**
   */

  willInitialize: function () {
    // OVERRIDE ME
  },

  /**
   */

  didInitialize: function () {
    // OVERRIDE ME
  },

  /**
   * Plugins to use for the mojo application.
   *
   * @method use
   * @param {Function} plugins... must be defined as `function (app) { }`
   */

  use: function () {

    // simple impl - go through each arg and pass self ref
    for(var i = 0, n = arguments.length; i < n; i++) {
      arguments[i](this);
    }

    return this;
  },

  /**
   */

  initialize: function () {
    
    if (this._initialized) throw new Error("cannot initialize application more than once");
    this._initialized = true;

    var args = Array.prototype.slice.call(arguments, 0);
    this.willInitialize.apply(this, args);
    this.emit.apply(this, ["initialize"].concat(args));
    this.didInitialize.apply(this, args);
  }
});


module.exports.main = new Application();
},{"bindable":79,"nofactor":90}],77:[function(require,module,exports){
"use strict";

var BindableObject = require("../object"),
computed           = require("../utils/computed"),
_                  = require("underscore");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class BindableCollection
 * @extends BindableObject
 */

/**
 * Emitted when an item is inserted
 * @event insert
 * @param {Object} item inserted
 */


/**
 * Emitted when an item is removed
 * @event remove
 * @param {Object} item removed
 */

/**
 * Emitted when items are replaced
 * @event replace
 * @param {Array} newItems
 * @param {Array} oldItems
 */



function BindableCollection (source) {
  BindableObject.call(this, this);
  this.source = source || [];
  this._updateInfo();
  this.bind("source", _.bind(this._onSourceChange, this));
}

/**
 */

BindableObject.extend(BindableCollection, {

  /**
   */

  __isBindableCollection: true,

  /**
   */

  _onSourceChange: function (source) {
    if (!source) this.source = [];
    this._updateInfo();
    // this.emit("update", { insert: source, remove: this._currentSource })
    this.emit("reset", this._currentSource = source);
  },
  
  /**
   * Resets the collection. Same as `source(value)`.
   */

  reset: function (source) {
    return this.set("source", source);
  },

  /**
   * Returns the index of a value
   * @method indexOf
   * @param {Object} object to get index of
   * @returns {Number} index or -1 (not found)
   */

  indexOf: function (item) {
    return this.source.indexOf(item);
  },

  /**
   * filters the collection
   * @method filter
   * @returns {Array} array of filtered items
   */

  filter: function (fn) {
    return this.source.filter(fn);
  },

  /**
   * Returns an object at the given index
   * @method at
   * @returns {Object} Object at specific index
   */

  at: function (index) {
    return this.source[index];
  },

  /**
   * forEach item
   * @method each
   * @param {Function} fn function to call for each item
   */

  each: computed(["length"], function (fn) {
    this.source.forEach(fn);
  }),

  /**
   */

  map: function (fn) {
    return this.source.map(fn);
  },

  /**
   */

  join: function (sep) {
    return this.source.join(sep);
  },

  /**
   */

  slice: function () {
    return this.source.slice.apply(this.source, arguments);
  },

  /**
   * Pushes an item onto the collection
   * @method push
   * @param {Object} item
   */

  push: function () {
    var items = Array.prototype.slice.call(arguments);
    this.source.push.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], this.length - 1);
    this.emit("update", { insert: items, index: this.length - 1});
  },

  /**
   * Unshifts an item onto the collection
   * @method unshift
   * @param {Object} item
   */

  unshift: function () {

    var items = Array.prototype.slice.call(arguments);
    this.source.unshift.apply(this.source, items);
    this._updateInfo();

    // DEPRECATED
    this.emit("insert", items[0], 0);
    this.emit("update", { insert: items });
  },

  /**
   * Removes N Number of items
   * @method splice
   * @param {Number} index start index
   * @param {Number} count number of items to remove
   */

  splice: function (index, count) {
    var newItems = Array.prototype.slice.call(arguments, 2),
    oldItems     = this.source.splice.apply(this.source, arguments);

    this._updateInfo();

    // DEPRECATED
    this.emit("replace", newItems, oldItems, index);
    this.emit("update", { insert: newItems, remove: oldItems });
  },

  /**
   * Removes an item from the collection
   * @method remove
   * @param {Object} item item to remove
   */

  remove: function (item) {
    var i = this.indexOf(item);
    if (!~i) return false;
    this.source.splice(i, 1);
    this._updateInfo();

    this.emit("remove", item, i);
    this.emit("update", { remove: [item] });
    return item;
  },

  /**
   * Removes an item from the end
   * @method pop
   * @returns {Object} removed item
   */

  pop: function () {
    if (!this.source.length) return;
    return this.remove(this.source[this.source.length - 1]);
  },

  /**
   * Removes an item from the beginning
   * @method shift
   * @returns {Object} removed item
   */

  shift: function () {
    if (!this.source.length) return;
    return this.remove(this.source[0]);
  },

  /*
   */

  toJSON: function () {
    return this.source.map(function (item) {
      return item && item.toJSON ? item.toJSON() : item;
    });
  },

  /*
   */

  _updateInfo: function () {
    this.setProperties({
      first  : this.source.length ? this.source[0] : void 0,
      length : this.source.length,
      empty  : !this.source.length,
      last   : this.source.length ? this.source[this.source.length - 1] : void 0
    });
  }
});

module.exports = BindableCollection;

},{"../object":80,"../utils/computed":83,"underscore":109}],78:[function(require,module,exports){
"use strict";
var protoclass = require("protoclass");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class EventEmitter
 */

function EventEmitter () {
  this.__events = {};
}

EventEmitter.prototype.setMaxListeners = function () {

};

/**
 * adds a listener on the event emitter
 *
 * @method on
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.on = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  var listeners;
  if (!(listeners = this.__events[event])) {
    this.__events[event] = listener;
  } else if (typeof listeners === "function") {
    this.__events[event] = [listeners, listener];
  } else {
    listeners.push(listener);
  }

  var self = this;

  return {
    dispose: function() {
      self.off(event, listener);
    }
  };
};

/**
 * removes an event emitter
 * @method off
 * @param {String} event to remove
 * @param {Function} listener to remove
 */

EventEmitter.prototype.off = function (event, listener) {

  var listeners;

  if(!(listeners = this.__events[event])) {
    return;
  }

  if (typeof listeners === "function") {
    this.__events[event] = undefined;
  } else {
    var i = listeners.indexOf(listener);
    if (~i) listeners.splice(i, 1);
    if (!listeners.length) {
      this.__events[event] = undefined;
    }
  }
};

/**
 * adds a listener on the event emitter
 * @method once
 * @param {String} event event to listen on
 * @param {Function} listener to callback when `event` is emitted.
 * @returns {Disposable}
 */


EventEmitter.prototype.once = function (event, listener) {

  if (typeof listener !== "function") {
    throw new Error("listener must be a function for event '"+event+"'");
  }

  function listener2 () {
    disp.dispose();
    listener.apply(this, arguments);
  }

  var disp = this.on(event, listener2);
  disp.target = this;
  return disp;
};

/**
 * emits an event
 * @method emit
 * @param {String} event
 * @param {String}, `data...` data to emit
 */


EventEmitter.prototype.emit = function (event) {

  if (this.__events[event] === undefined) return;

  var listeners = this.__events[event],
  n,
  args,
  i,
  j;


  if (typeof listeners === "function") {
    if (arguments.length === 1) {
      listeners();
    } else {
    switch(arguments.length) {
      case 2:
        listeners(arguments[1]);
        break;
      case 3:
        listeners(arguments[1], arguments[2]);
        break;
      case 4:
        listeners(arguments[1], arguments[2], arguments[3]);
        break;
      default:
        n = arguments.length;
        args = new Array(n - 1);
        for(i = 1; i < n; i++) args[i-1] = arguments[i];
        listeners.apply(this, args);
    }
  }
  } else {
    n = arguments.length;
    args = new Array(n - 1);
    for(i = 1; i < n; i++) args[i-1] = arguments[i];
    for(j = listeners.length; j--;) {
      if(listeners[j]) listeners[j].apply(this, args);
    }
  }
};

/**
 * removes all listeners
 * @method removeAllListeners
 * @param {String} event (optional) removes all listeners of `event`. Omitting will remove everything.
 */

EventEmitter.prototype.removeAllListeners = function (event) {
  if (arguments.length === 1) {
    this.__events[event] = undefined;
  } else {
    this.__events = {};
  }
};

module.exports = EventEmitter;

},{"protoclass":85}],79:[function(require,module,exports){
"use strict";

module.exports = {
  Object       : require("./object"),
  Collection   : require("./collection"),
  EventEmitter : require("./core/eventEmitter"),
  computed     : require("./utils/computed"),
  options      : require("./utils/options")
};

if (typeof window !== "undefined") {
  window.bindable = module.exports;
}
},{"./collection":77,"./core/eventEmitter":78,"./object":80,"./utils/computed":83,"./utils/options":84}],80:[function(require,module,exports){
"use strict";

var EventEmitter    = require("../core/eventEmitter"),
protoclass          = require("protoclass"),
watchProperty       = require("./watchProperty");

/**
 * @module mojo
 * @submodule mojo-core
 */

/**

BindableObjects make it easy to link properties of two separate objects - when one changes,
the other will automatically update with that change. It enables much easier interactions between data models and UIs,
among other uses outside of MVC.

<br>
<br>

BindableObjects provide a way to maintain the state between server <-> client for a realtime front-end
application (similar to Firebase), or perhaps a way to communicate between server <-> server for a realtime distributed Node.js
application.


### Example

```javascript
var bindable = require("bindable");

var person = new bindable.Object({
  name: "craig",
  last: "condon",
  location: {
    city: "San Francisco"
  }
});

person.bind("location.zip", function(value) {
  // 94102
}).now();

//triggers the binding
person.set("location.zip", "94102");

//bind location.zip to another property in the model, and do it only once
person.bind("location.zip", { to: "zip", max: 1 }).now();

//bind location.zip to another object, and make it bi-directional.
person.bind("location.zip", { target: anotherModel, to: "location.zip", bothWays: true }).now();

//chain to multiple items, and limit it!
person.bind("location.zip", { to: ["property", "anotherProperty"], max: 1 }).now();


//you can also transform data as it's being bound
person.bind("name", {
  to: "name2",
  map: function (name) {
    return name.toUpperCase();
  }
}).now();
```

@class BindableObject
@extends EventEmitter
*/

/**
 * Emitted when the bindable object is disposed. This happens
 * when the object is no-longer needed.
 * @event dispose
 */


/**
 * Emitted everytime a property changes
 * @event change
 * @param {String} property
 * @param {Object} value
 * @param {Object} oldValue
 */

/**
 * Emitted when a specific property changes
 * @event change:*
 * @param {Object} value
 * @param {Object} oldValue
 */



/**
 * @constructor
 * @param {Object} context context of the bindable object
 */


/**
 * emitted when a property is being watched
 * @event watching
 */


function Bindable (properties) {

  if (properties)
  for (var key in properties) {
    this[key] = properties[key];
  }

  Bindable.parent.call(this);
}

watchProperty.BindableObject = Bindable;

protoclass(EventEmitter, Bindable, {

  /**
   */

  __isBindable: true,

  /**
   * Returns TRUE if a property exists in the context
   * @method has
   * @param {String} path
   * @returns {Boolean}
   */

  has: function (key) {
    return this.get(key) != null;
  },

  /**
   * Returns a property stored in the bindable object context
   * @method get
   * @param {String} path path to the value. Can be something like `person.city.name`.
   */

  get: function (property) {

    var isString;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      return this[property];
    }

    // avoid split if possible
    var chain    = isString ? property.split(".") : property,
    currentValue = this,
    currentProperty;

    // go through all the properties
    for (var i = 0, n = chain.length - 1; i < n; i++) {

      currentValue    = currentValue[chain[i]];

      if (!currentValue) return;
    }

    // might be a bindable object
    if(currentValue) return currentValue[chain[i]];
  },

  /**
   * Properties to set on the bindable object
   * @method setProperties
   * @param {Object} properties properties to set
   * @returns {BindableObject} this
   */

  setProperties: function (properties) {
    for (var property in properties) {
      this.set(property, properties[property]);
    }
    return this;
  },

  /**
   * Sets a property on the bindable object's context
   * @method set
   * @param {String} path path to the value. Can be something like `person.city.name`.
   */

  set: function (property, value) {

    var isString, hasChanged, oldValue, chain;

    // optimal
    if ((isString = (typeof property === "string")) && !~property.indexOf(".")) {
      hasChanged = (oldValue = this[property]) !== value;
      if (hasChanged) this[property] = value;
    } else {

      // avoid split if possible
      chain     = isString ? property.split(".") : property;

      var currentValue  = this,
      previousValue,
      currentProperty,
      newChain;


      for (var i = 0, n = chain.length - 1; i < n; i++) {

        currentProperty = chain[i];
        previousValue   = currentValue;
        currentValue    = currentValue[currentProperty];


        // need to take into account functions - easier not to check
        // if value exists
        if (!currentValue /* || (typeof currentValue !== "object")*/) {
          currentValue = previousValue[currentProperty] = {};
        }

        // is the previous value bindable? pass it on
        if (currentValue.__isBindable) {

          newChain = chain.slice(i + 1);
          // check if the value has changed
          hasChanged = (oldValue = currentValue.get(newChain)) !== value;
          currentValue.set(newChain, value);
          currentValue = oldValue;
          break;
        }
      }


      if (!newChain && (hasChanged = (currentValue !== value))) {
        currentProperty = chain[i];
        oldValue = currentValue[currentProperty];
        currentValue[currentProperty] = value;
      }
    }

    if (!hasChanged) return value;

    var prop = chain ? chain.join(".") : property;

    this.emit("change:" + prop, value, oldValue);
    this.emit("change", prop, value, oldValue);
    return value;
  },

  /**
   * Binds a property to a function
   * @method bind
   * @param {String} property path to bind to.
   * @param {Object} listener `function` or `transformer` to bind to
   * @param {Boolean} now (optional) call binding now. Otherwise wait till property changes.
   * @returns {Binding}
   */

  bind: function (property, fn, now) {
    return watchProperty(this, property, fn, now);
  },

  /**
   * Disposes the bindable object. Emits `dispose`.
   * @method dispose
   */

  dispose: function () {
    this.emit("dispose");
  },

  /**
   * Converts the context to a JSON object
   * @method toJSON
   */

  toJSON: function () {
    var obj = {}, value;

    var keys = Object.keys(this);

    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (key.substr(0, 2) === "__") continue;
      value = this[key];

      if(value && value.__isBindable) {
        value = value.toJSON();
      }

      obj[key] = value;
    }

    return obj;
  }
});

module.exports = Bindable;

},{"../core/eventEmitter":78,"./watchProperty":82,"protoclass":85}],81:[function(require,module,exports){
"use strict";

var toarray = require("toarray"),
_           = require("underscore");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * created when the second parameter on `bind(property, listener)` is an object.
 *
 * @class BindingTransformer
 * @protected
 */


function getToPropertyFn (target, property) {
  return function (value) {
    target.set(property, value);
  };
}


function hasChanged (oldValues, newValues) {

  if (oldValues.length !== newValues.length) return true;

  for (var i = newValues.length; i--;) {
    if (newValues[i] !== oldValues[i]) return true;
  }
  return false;
}

function wrapFn (fn, previousValues, max) {

  var numCalls = 0;

  return function () {

    var values = Array.prototype.slice.call(arguments, 0),
    newValues  = (values.length % 2) === 0 ? values.slice(0, values.length / 2) : values;


    if (!hasChanged(newValues, previousValues)) return;


    if (~max && ++numCalls >= max) {
      this.dispose();
    }

    previousValues = newValues;


    fn.apply(this, values);
  };
}

function transform (bindable, fromProperty, options) {

  var when        = options.when         || function() { return true; },
  map             = options.map          || function () { return Array.prototype.slice.call(arguments, 0); },
  target          = options.target       || bindable,
  max             = options.max          || (options.once ? 1 : void 0) || -1,
  tos             = toarray(options.to).concat(),
  previousValues  = toarray(options.defaultValue),
  toProperties    = [],
  bothWays        = options.bothWays,
  i;

  
  if (!when.test && typeof when === "function") {
    when = { test: when };
  }

  if (!previousValues.length) {
    previousValues.push(void 0);
  }

  if (!tos.length) {
    throw new Error("missing 'to' option");
  }

  for (i = tos.length; i--;) {

    var to = tos[i],
    tot    = typeof to;

    /*
     need to convert { property: { map: fn}} to another transformed value, which is
     { map: fn, to: property }
     */

    if (tot === "object") {

      // "to" might have multiple properties we're binding to, so 
      // add them to the END of the array of "to" items
      for (var property in to) {

        // assign the property to the 'to' parameter
        to[property].to = property;
        tos.push(transform(target, fromProperty, to[property]));
      }

      // remove the item, since we just added new items to the end
      tos.splice(i, 1);

    // might be a property we're binding to
    } else if(tot === "string") {
      toProperties.push(to);
      tos[i] = wrapFn(getToPropertyFn(target, to), previousValues, max);
    } else if (tot === "function") {
      tos[i] = wrapFn(to, previousValues, max);
    } else {
      throw new Error("'to' must be a function");
    }
  }

  // two-way data-binding
  if (bothWays) {
    for (i = toProperties.length; i--;) {
      target.bind(toProperties[i], { to: fromProperty });
    }
  }

  // newValue, newValue2, oldValue, oldValue2
  return function () {

    var values = toarray(map.apply(this, arguments));

    // first make sure that we don't trigger the old value
    if (!when.test.apply(when, values)) return;

    for (var i = tos.length; i--;) {
      tos[i].apply(this, values);
    }
  };
}

module.exports = transform;
},{"toarray":86,"underscore":109}],82:[function(require,module,exports){
(function (process){
"use strict";

var _     = require("underscore"),
transform = require("./transform"),
options   = require("../utils/options");

/** 
 * @module mojo
 * @submodule mojo-core
 */

/**
 * @class Binding
 */

/*
 * bindable.bind("a", fn);
 */

function watchSimple (bindable, property, fn) {

  bindable.emit("watching", [property]);

  var listener = bindable.on("change:" + property, function () {
    fn.apply(self, arguments);
  }), self;

  self = {

    /** 
     * the target bindable object
     * @property target
     * @type {BindableObject}
     */

    target: bindable,

    /**
     * triggers the binding listener
     * @method now
     */

    now: function () {
      fn.call(self, bindable.get(property));
      return self;
    },

    /**
     * disposes the binding
     * @method dispose
     */

    dispose: function () {
      listener.dispose();
    },

    /**
     */

    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },

    /**
     */

    resume: function () {
      self.pause();
      _.extend(self, watchSimple(bindable, property, fn));
      return self;
    }
  };

  return self;
}

/*
 * bindable.bind("a.b.c.d.e", fn);
 */


function watchChain (bindable, hasComputed, chain, fn) {

  var listeners = [], values = hasComputed ? [] : undefined, self;

  var onChange = function () {
    dispose();
    listeners = [];
    values = hasComputed ? [] : void 0;
    bind(bindable, chain);
    self.now();
  };


  if (hasComputed && process.browser) {
    onChange = _.debounce(onChange, 1);
  }

  function runComputed (eachChain, pushValues) {
    return function (item) {
      if (!item) return;

        // wrap around bindable object as a helper
        if (!item.__isBindable) {
          item = new module.exports.BindableObject(item);
        }

        bind(item, eachChain, pushValues);
    };
  }

  function bind (target, chain, pushValues) {

    var currentChain = [], subValue, currentProperty, i, j, n, computed, hadComputed, pv, cv = target;

    // need to run through all variations of the property chain incase it changes
    // in the bindable.object. For instance:
    // target.bind("a.b.c", fn); 
    // triggers on
    // target.set("a", obj);
    // target.set("a.b", obj);
    // target.set("a.b.c", obj);

    // does it have @each in there? could be something like
    // target.bind("friends.@each.name", function (names) { })
    if (hasComputed) {

      i = 0;
      n = chain.length;

      for (; i < n; i++) {

        currentChain.push(chain[i]);
        currentProperty = chain[i];

        target.emit("watching", currentChain);

        // check for @ at the beginning
        computed = (currentProperty.charCodeAt(0) === 64);

        if (computed) {
          hadComputed = true;
          // remove @ - can't be used to fetch the propertyy
          currentChain[i] = currentProperty = currentChain[i].substr(1);
        }
        
        pv = cv;
        if (cv) cv = cv[currentProperty];

        if (computed && cv) {


          // used in cases where the collection might change that would affect 
          // this binding. length for instance on the collection...
          if (cv.compute) {
            for (j = cv.compute.length; j--;) {
              bind(target, [cv.compute[j]], false);
            }
          }

          // the sub chain for each of the items from the loop
          var eachChain = chain.slice(i + 1);

          // call the function, looping through items
          cv.call(pv, runComputed(eachChain, pushValues));
          break;
        } else if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
          cv = cv.__context;
        }

        listeners.push(target.on("change:" +  currentChain.join("."), onChange));

      } 

      if (!hadComputed && pushValues !== false) {
        values.push(cv);
      }

    } else {
      i = 0;
      n = chain.length;

      for (; i < n; i++) {
        currentProperty = chain[i];
        currentChain.push(currentProperty);

        target.emit("watching", currentChain);

        if (cv) cv = cv[currentProperty];

        // pass the watch onto the bindable object, but also listen 
        // on the current target for any
        if (cv && cv.__isBindable && i !== n - 1) {
          bind(cv, chain.slice(i + 1), false);
        }

        listeners.push(target.on("change:" + currentChain.join("."), onChange));
      }

      if (pushValues !== false) values = cv;
    }
  }

  function dispose () {
    if (!listeners) return;
    for (var i = listeners.length; i--;) {
      listeners[i].dispose();
    }
    listeners = [];
  }

  self = {
    target: bindable,
    now: function () {
      fn.call(self, values);
      return self;
    },
    dispose: dispose,
    pause: function () {
      self.dispose();
      self.now = function () { return this; };
    },
    resume: function () {
      self.pause();
      _.extend(self, watchChain(bindable, hasComputed, chain, fn));
      return self;
    }
  };

  bind(bindable, chain);

  return self;
}

/**
 */

function watchMultiple (bindable, chains, fn) { 

  var values = new Array(chains.length),
  oldValues  = new Array(chains.length),
  bindings   = new Array(chains.length),
  fn2        = options.computedDelay === -1 ? fn : _.debounce(fn, options.computedDelay),
  self;


  chains.forEach(function (chain, i) {

    function onChange (value, oldValue) {
      values[i]    = value;
      oldValues[i] = oldValue;
      fn2.apply(this, values.concat(oldValues));
    }

    bindings[i] = bindable.bind(chain, onChange);
  });

  self = {
    target: bindable,
    now: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].now();
      }
      return self;
    },
    dispose: function () {
      for (var i = bindings.length; i--;) {
        bindings[i].dispose();
      }
      bindings = [];
    },
    pause: function () {
      self.dispose();
      self.now = function () { return self; };
    },
    resume: function () {
      self.pause();
      _.extend(self, watchMultiple(bindable, chains, fn));
      return self;
    }
  };
  return self;
}

/**
 */

function watchProperty (bindable, property, fn) {

  if (typeof fn === "object") {
    fn = transform(bindable, property, fn);
  }

  // TODO - check if is an array
  var chain;

  if (typeof property === "string") {
    if (~property.indexOf(",")) {
      return watchMultiple(bindable, property.split(/[,\s]+/), fn);
    } else if (~property.indexOf(".")) {
      chain = property.split(".");
    } else {
      chain = [property];
    }
  } else {
    chain = property;
  }

  // collection.bind("length")
  if (chain.length === 1) {
    return watchSimple(bindable, property, fn);

  // person.bind("city.zip")
  } else {
    return watchChain(bindable, ~property.indexOf("@"), chain, fn);
  }
}

module.exports = watchProperty;
}).call(this,require('_process'))
},{"../utils/options":84,"./transform":81,"_process":70,"underscore":109}],83:[function(require,module,exports){
"use strict";

var toarray = require("toarray");

module.exports = function (properties, fn) {
  properties = toarray(properties);
  fn.compute = properties;
  return fn;
};
},{"toarray":86}],84:[function(require,module,exports){
"use strict";

module.exports = {
  computedDelay : 0
};

},{}],85:[function(require,module,exports){
module.exports=require(75)
},{"/Users/craig/Developer/Public/paperclip.js/node_modules/mojo-animator/node_modules/protoclass/lib/index.js":75}],86:[function(require,module,exports){
module.exports=require(68)
},{"/Users/craig/Developer/Public/paperclip.js/node_modules/bindable-object/node_modules/toarray/index.js":68}],87:[function(require,module,exports){
var protoclass = require("protoclass");


/**
 * @module mojo
 * @module mojo-core
 */


/**


  
@class BaseNodeFactory
*/

function BaseFactory () {

}

protoclass(BaseFactory, {

  /**
   * creates a new element
   * @method createElement
   * @param {String} name name of the element
   * @returns {ElementNode}
   */

  createElement: function (element) {},

  /**
   * creates a new fragment
   * @method createFragment
   * @returns {FragmentNode}
   */

  createFragment: function () { },

  /**
   * creates a new comment
   * @method createComment
   * @returns {CommentNode}
   */

  createComment: function (value) { },

  /**
   * creates a new text node
   * @method createTextNode
   * @returns {TextNode}
   */

  createTextNode: function (value) { },

  /*
   */

  parseHtml: function (content) { }
});



module.exports = BaseFactory;

},{"protoclass":107}],88:[function(require,module,exports){
var BaseFactory = require("./base"),
factories       = require("factories");

/**
 * @module
 * @submodule mojo-core
 */

/**

### Example

```javascript
var nofactor = require("nofactor");

// use string factory
customNodeFactory = nofactor.custom(nofactor.string);

// register BR void element
customNodeFactory.registerElement("br", nofactor.string.Element.extend({
	toString: function () {
		return "<" + this.name + ">";
	}
}));
// <br>
console.log(customNodeFactory.createElement("br").toString());
```

 @class CustomNodeFactory
 @extends BaseNodeFactory
 @constructor
 @param {BaseNodeFactory} nodeFactory the main node factory to call
*/


function CustomFactory (mainFactory, elements) {
	BaseFactory.call(this);
	this._mainFactory = mainFactory;

	if (!mainFactory) {
		throw new Error("main factory must be provided. User string, or dom");
	}

	this._factories = {
		element: {}
	}

	if (elements) {
		for (var name in elements) {
			this.registerElement(name, elements[name]);
		}
	}
}


BaseFactory.extend(CustomFactory, {

	/**
	 * Registers a new element class
	 * @method registerElement
	 * @param {String} name name of the element
	 * @param {Class} The element class
	 */

	registerElement: function (name, factory) {
		this._factories.element[name] = factories.factory.create(factory);
		return this;
	},

	/*
	 */

	createElement: function (name) {
		var factory = this._factories.element[name];
		if (factory) return factory.create(name);
		return this._mainFactory.createElement(name);
	},


	/*
	 */

	createComment: function (text) {
		return this._mainFactory.createComment(text);
	},

	/*
	 */

	createTextNode: function (text) {
		return this._mainFactory.createTextNode(text);
	},

	/*
	 */

	createFragment: function () {
		return this._mainFactory.createFragment.apply(this._mainFactory, arguments);
	},

	/**
	 */

	parseHtml: function (source) {
		return this._mainFactory.parseHtml(source);
	}
});

module.exports = function (mainFactory, elements) {
	return new CustomFactory(mainFactory, elements);
};

},{"./base":87,"factories":106}],89:[function(require,module,exports){
var Base = require("./base");

/**
 * @module mojo
 * @module mojo-core
 */

/**
 * @class DomFactory
 * @extends BaseNodeFactory
 */


function DomFactory () {

}


Base.extend(DomFactory, {

  /*
   */

  name: "dom",

  /*
   */

  createElement: function (name) {
    return document.createElement(name);
  },

  /*
   */

  createComment: function (value) {
    return document.createComment(value);
  },

  /*
   */

  createTextNode: function (value) {
    return document.createTextNode(value);
  },

  /*
   */

  createFragment: function (children) {

    if (!children) children = [];

    var frag = document.createDocumentFragment()

    var childrenToArray = [];

    for (var i = 0, n = children.length; i < n; i++) {
      childrenToArray.push(children[i]);
    }

    for(var j = 0, n2 = childrenToArray.length; j < n2; j++) {
      frag.appendChild(childrenToArray[j]);
    }

    return frag;
  }
});

module.exports = new DomFactory();
},{"./base":87}],90:[function(require,module,exports){
module.exports = {
  string  : require("./string"),
  dom     : require("./dom"),
  custom  : require("./custom")
};

module.exports["default"] = typeof window !== "undefined" ? module.exports.dom : module.exports.custom(module.exports.string, module.exports.string.voidElements);

if (typeof window !== "undefined") {
  window.nofactor = module.exports;
}
},{"./custom":88,"./dom":89,"./string":95}],91:[function(require,module,exports){
var Text = require("./text");

function Comment () {
  Comment.superclass.apply(this, arguments);
}

Text.extend(Comment, {

  /**
   */

  nodeType: 8,

  /**
   */

  getInnerHTML: function () {
    return "<!--" + Comment.__super__.getInnerHTML.call(this) + "-->";
  },

  /**
   */

  cloneNode: function () {
    var clone = new Comment(this.nodeValue);
    clone._buffer = this._buffer;
    return clone;
  }
});

module.exports = Comment;
},{"./text":98}],92:[function(require,module,exports){
var Node = require("./node");

function Container () {
  this.childNodes = [];
}

Node.extend(Container, {

  /**
   */

  appendChild: function (node) {

    if (node.nodeType === 11 && node.childNodes.length) {
      while (node.childNodes.length) {
        this.appendChild(node.childNodes[0]);
      }
      return;
    }

    if (node === this) return;

    this._unlink(node);
    this.childNodes.push(node);
    this._link(node);
    this._triggerChange();
  },

  /**
   */

  prependChild: function (node) {
    if (!this.childNodes.length) {
      this.appendChild(node);
    } else {
      this.insertBefore(node, this.childNodes[0]);
    }
  },

  /**
   */

  removeChild: function (child) {
    var i = this.childNodes.indexOf(child);

    if (!~i) return;

    this.childNodes.splice(i, 1);

    if (child.previousSibling) child.previousSibling.nextSibling = child.nextSibling;
    if (child.nextSibling)     child.nextSibling.previousSibling = child.previousSibling;

    child.parentNode      = void 0;
    child.nextSibling     = void 0;
    child.previousSibling = void 0;
    this._triggerChange();
  },

  /**
   */

  insertBefore: function (newElement, before) {

    if (newElement.nodeType === 11) {
      var before, node;
      for (var i = newElement.childNodes.length; i--;) {
        this.insertBefore(node = newElement.childNodes[i], before);
        before = node;
      }
    }

    if (newElement == before || newElement === this) {
      return;
    }

    if (newElement) this._unlink(newElement);

    var index = this.childNodes.indexOf(before)

    if (typeof index === "undefined") return;
    if (!~index) return;
    
    this.childNodes.splice(index, 0, newElement);

    if (newElement) this._link(newElement);
    this._triggerChange();

  },

  /**
   */

  _unlink: function (node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },

  /**
   */

  _link: function (node) {

    if (!node.__isNode) {
      throw new Error("cannot append non-node");
    }

    node.parentNode = this;
    var i = this.childNodes.indexOf(node);

    // FFox compatible
    if (i !== 0)                         node.previousSibling = this.childNodes[i - 1];
    if (i != this.childNodes.length - 1) node.nextSibling     = this.childNodes[i + 1];

    if (node.previousSibling) node.previousSibling.nextSibling = node;
    if (node.nextSibling)     node.nextSibling.previousSibling = node;
  }
});

module.exports = Container;
},{"./node":96}],93:[function(require,module,exports){
var Container = require("./container"),
Style         = require("./style");

function Element (nodeName) {
  Element.superclass.call(this);

  this.nodeName    = nodeName.toUpperCase();
  this._name       = nodeName.toLowerCase();
  this.attributes  = [];
  this._attrsByKey = {};
  this.style       = new Style(this);
}

Container.extend(Element, {

  /**
   */

  nodeType: 3,

  /**
   */

  setAttribute: function (name, value) {

    name = name.toLowerCase();

    // if the name is a
    if (name === "style") {
      return this.style.reset(value);
    }

    if (value == undefined) {
      return this.removeAttribute(name);
    }

    var abk,
    hasChanged;

    if (!(abk = this._attrsByKey[name])) {
      this.attributes.push(abk = this._attrsByKey[name] = {})
    }


    hasChanged = abk.value != value;

    abk.name  = name;
    abk.value = value;

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  removeAttribute: function (name) {

    var hasChanged;

    for (var i = this.attributes.length; i--;) {
      var attr = this.attributes[i];
      if (attr.name == name) {
        hasChanged = true;
        this.attributes.splice(i, 1);
        delete this._attrsByKey[name];
        break;
      }
    }

    if (hasChanged) this._triggerChange();
  },

  /**
   */

  getAttribute: function (name) {
    var abk;
    if(abk = this._attrsByKey[name]) return abk.value;
  },

  /**
   */

  getInnerHTML: function () {

    var buffer = "<" + this._name,
    attribs    =  "",
    attrbuff;

    for (var name in this._attrsByKey) {

      var v    = this._attrsByKey[name].value;
      attrbuff = name;

      if (name != undefined) {
        attrbuff += "=\"" + v + "\"";
      }

      attribs += " " + attrbuff;
    }

    if (this.style.hasStyles()) {
      attribs += " style=" + "\"" + this.style.toString() + "\"";
    }

    if (attribs.length) {
      buffer += attribs;
    }


    return buffer + ">" + this.childNodes.join("") + "</" + this._name + ">"
  },

  /**
   */

  cloneNode: function () {
    var clone = new Element(this.nodeName);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    clone.setAttribute("style", this.style.toString());

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Element;

},{"./container":92,"./style":97}],94:[function(require,module,exports){
var Container = require("./container");

function Fragment () {
  Fragment.superclass.call(this);
}

Container.extend(Fragment, {

  /**
   */

  nodeType: 11,

  /**
   */

  getInnerHTML: function () {
    return this.childNodes.join("");
  },

  /**
   */

  cloneNode: function () {
    var clone = new Fragment();

    for (var i = 0, n = this.childNodes.length; i < n; i++) {
      clone.appendChild(this.childNodes[i].cloneNode());
    }

    clone._buffer = this._buffer;

    return clone;
  }
});

module.exports = Fragment;
},{"./container":92}],95:[function(require,module,exports){
var Base     = require("../base"),
Element      = require("./element"),
Fragment     = require("./fragment"),
Text         = require("./text"),
Comment      = require("./comment"),
Container    = require("./container"),
voidElements = require("./voidElements");


/**
 * @module mojo
 * @submodule mojo-core
 */

/**

@class StringNodeFactory
@extends BaseNodeFactory
*/

function StringNodeFactory (context) {
  this.context = context;
}

Base.extend(StringNodeFactory, {

  /**
   */

  name: "string",

  /**
   */

  createElement: function (name) {
    return new Element(name);
  },

  /**
   */

  createTextNode: function (value, encode) {
    return new Text(value, encode);
  },

  /**
   */

  createComment: function (value) {
    return new Comment(value);
  },

  /**
   */

  createFragment: function (children) {

    if (!children) children = [];
    var frag = new Fragment(),
    childrenToArray = Array.prototype.slice.call(children, 0);

    for (var i = 0, n = childrenToArray.length; i < n; i++) {
      frag.appendChild(childrenToArray[i]);
    }

    return frag;
  },

  /**
   */

  parseHtml: function (buffer) {

    //this should really parse HTML, but too much overhead
    return this.createTextNode(buffer);
  }
});

module.exports           = new StringNodeFactory();

module.exports.Element      = Element;
module.exports.Fragment     = Fragment;
module.exports.Text         = Text;
module.exports.Container    = Container;
module.exports.voidElements = voidElements;
},{"../base":87,"./comment":91,"./container":92,"./element":93,"./fragment":94,"./text":98,"./voidElements":99}],96:[function(require,module,exports){
var protoclass  = require("protoclass");


function Node () {

}

protoclass(Node, {

  /**
   */

  __isNode: true,

  /**
   */

  toString: function () {
    if (this._innerHTML) return this._innerHTML;
    return this._innerHTML = this.getInnerHTML();
  },

  /**
   */

  _triggerChange: function () {
    if (!this._innerHTML) return;
    this._innerHTML = void 0;
    if (this.parentNode) this.parentNode._triggerChange();
  }
});

module.exports = Node;
},{"protoclass":107}],97:[function(require,module,exports){
var protoclass = require("protoclass");

function Style (element) {
  this._element = element;
}

protoclass(Style, {

  /**
   */

  _hasStyle: false,


  /**
   */


  setProperty: function(key, value) {

    var newValue = value === "" || value == void 0 ? void 0 : value;

    if (this[key] === newValue) return;

    this[key] = value;

    this._element._triggerChange();
  },

  /**
   */


  setProperties: function(properties) {
    for (var key in properties) {
      this.setProperty(key, properties[key]);
    }
  },

  /**
   */

  reset: function (styles) {

    var styleParts = styles.split(/;\s*/),
    hasChanged     = false;

    for (var i = 0, n = styleParts.length; i < n; i++) {
      var sp = styleParts[i].split(/:\s*/),
      key    = sp[0],
      value  = sp[1];

      if (value == void 0 || value == "") {
        continue;
      }

      hasChanged = hasChanged || this[key] === value;

      this[key] = value;
    }

    if (hasChanged) this._element._triggerChange();
  },

  /**
   */

  toString: function () {
    var buffer = "", styles = this.getStyles();

    for (var key in styles) {
      buffer += key + ":" + styles[key] + ";"
    }

    return buffer;
  },

  /**
   */

  hasStyles: function () {
    if(this._hasStyle) return true;

    for (var key in this) {
      if (key.substr(0, 1) !== "_" && this[key] != undefined && this.constructor.prototype[key] == undefined) {
        return this._hasStyle = true;
      }
    }

    return false;
  },

  /**
   */

  getStyles: function () {
    var styles = {};
    for (var key in this) {
      var k = this[key];
      if (key.substr(0, 1) !== "_" && k !== "" && this[key] != void 0 && this.constructor.prototype[key] == undefined) {
        styles[key] = this[key];
      }
    }
    return styles;
  }
});

module.exports = Style;

},{"protoclass":107}],98:[function(require,module,exports){
var Node = require("./node"),
he      = require("he");



function Text (value, encode) {
  this.replaceText(value, encode);
}

Node.extend(Text, {

  /**
   */

  nodeType: 3,

  /**
   */

  getInnerHTML: function () {
    return this.nodeValue;
  },

  /**
   */

  cloneNode: function () {
     var clone = new Text(this.nodeValue);
    clone._buffer = this._buffer;
    return clone;
  },

  /**
   */

  replaceText: function (value, encode) {
    this.nodeValue = encode ? he.encode(String(value)) : value;
    this._triggerChange();
  }
});

module.exports = Text;
},{"./node":96,"he":72}],99:[function(require,module,exports){
var Element = require("./element");

function VoidElement () {
	Element.apply(this, arguments);
}

Element.extend(VoidElement, {
	getInnerHTML: function () {
		return Element.prototype.getInnerHTML.call(this).replace("></" + this._name + ">", ">");
	},
	cloneNode: function () {
		var clone = new VoidElement(this._name);

    for (var key in this._attrsByKey) {
      clone.setAttribute(key, this._attrsByKey[key].value);
    }

    clone.setAttribute("style", this.style.toString());

    clone._buffer = this._buffer;

    return clone;
	}
});

/*
area, base, br, col, command, embed, hr, img, input,
keygen, link, meta, param, source, track, wbr
*/

["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track"].forEach(function (name) {
	exports[name] = VoidElement;
});
},{"./element":93}],100:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var AnyFactory, factoryFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  factoryFactory = require("./factory");

  AnyFactory = (function(_super) {
    __extends(AnyFactory, _super);

    /*
    */


    function AnyFactory(factories) {
      if (factories == null) {
        factories = [];
      }
      this.factories = factories.map(factoryFactory.create);
    }

    /*
    */


    AnyFactory.prototype.test = function(data) {
      return !!this._getFactory(data);
    };

    /*
    */


    AnyFactory.prototype.push = function(factory) {
      return this.factories.push(factoryFactory.create(factory));
    };

    /*
    */


    AnyFactory.prototype.create = function(data) {
      var _ref;

      return (_ref = this._getFactory(data)) != null ? _ref.create(data) : void 0;
    };

    /*
    */


    AnyFactory.prototype._getFactory = function(data) {
      var factory, _i, _len, _ref;

      _ref = this.factories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        factory = _ref[_i];
        if (factory.test(data)) {
          return factory;
        }
      }
    };

    return AnyFactory;

  })(require("./base"));

  module.exports = function(factories) {
    return new AnyFactory(factories);
  };

}).call(this);

},{"./base":101,"./factory":103}],101:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var BaseFactory;

  BaseFactory = (function() {
    function BaseFactory() {}

    BaseFactory.prototype.create = function(data) {};

    BaseFactory.prototype.test = function(data) {};

    return BaseFactory;

  })();

  module.exports = BaseFactory;

}).call(this);

},{}],102:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var ClassFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ClassFactory = (function(_super) {
    __extends(ClassFactory, _super);

    /*
    */


    function ClassFactory(clazz) {
      this.clazz = clazz;
    }

    /*
    */


    ClassFactory.prototype.create = function(data) {
      return new this.clazz(data);
    };

    /*
    */


    ClassFactory.prototype.test = function(data) {
      return this.clazz.test(data);
    };

    return ClassFactory;

  })(require("./base"));

  module.exports = function(clazz) {
    return new ClassFactory(clazz);
  };

}).call(this);

},{"./base":101}],103:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var ClassFactory, FactoryFactory, FnFactory, factory, type,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ClassFactory = require("./class");

  type = require("type-component");

  FnFactory = require("./fn");

  FactoryFactory = (function(_super) {
    __extends(FactoryFactory, _super);

    /*
    */


    function FactoryFactory() {}

    /*
    */


    FactoryFactory.prototype.create = function(data) {
      var t;

      if (data.create && data.test) {
        return data;
      } else if ((t = type(data)) === "function") {
        if (data.prototype.constructor) {
          return new ClassFactory(data);
        } else {
          return new FnFactory(data);
        }
      }
      return data;
    };

    return FactoryFactory;

  })(require("./base"));

  factory = new FactoryFactory();

  module.exports = factory;

}).call(this);

},{"./base":101,"./class":102,"./fn":104,"type-component":108}],104:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var FnFactory;

  FnFactory = (function() {
    /*
    */
    function FnFactory(fn) {
      this.fn = fn;
    }

    /*
    */


    FnFactory.prototype.test = function(data) {
      return this.fn.test(data);
    };

    /*
    */


    FnFactory.prototype.create = function(data) {
      return this.fn(data);
    };

    return FnFactory;

  })();

  module.exports = function(fn) {
    return new FnFactory(fn);
  };

}).call(this);

},{}],105:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  var GroupFactory, factoryFactory,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  factoryFactory = require("./factory");

  GroupFactory = (function(_super) {
    __extends(GroupFactory, _super);

    /*
    */


    function GroupFactory(mandatory, optional, groupClass) {
      if (mandatory == null) {
        mandatory = [];
      }
      if (optional == null) {
        optional = [];
      }
      this.groupClass = groupClass;
      this.mandatory = mandatory.map(factoryFactory.create);
      this.optional = optional.map(factoryFactory.create);
    }

    /*
    */


    GroupFactory.prototype.test = function(data) {
      return !!this._getFactories(data, this.mandatory).length;
    };

    /*
    */


    GroupFactory.prototype.create = function(data) {
      var factory, items, _i, _j, _len, _len1, _ref, _ref1;

      items = [];
      _ref = this._getFactories(data, this.mandatory);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        factory = _ref[_i];
        items.push(factory.create(data));
      }
      _ref1 = this._getFactories(data, this.optional);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        factory = _ref1[_j];
        items.push(factory.create(data));
      }
      if (items.length === 1) {
        return items[0];
      }
      return new this.groupClass(data, items);
    };

    /*
    */


    GroupFactory.prototype._getFactories = function(data, collection) {
      var factories, factory, _i, _len;

      factories = [];
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        factory = collection[_i];
        if (factory.test(data)) {
          factories.push(factory);
        }
      }
      return factories;
    };

    return GroupFactory;

  })(require("./base"));

  module.exports = function(mandatory, optional, groupClass) {
    return new GroupFactory(mandatory, optional, groupClass);
  };

}).call(this);

},{"./base":101,"./factory":103}],106:[function(require,module,exports){
// Generated by CoffeeScript 1.6.2
(function() {
  module.exports = {
    any: require("./any"),
    "class": require("./class"),
    factory: require("./factory"),
    fn: require("./fn"),
    group: require("./group")
  };

}).call(this);

},{"./any":100,"./class":102,"./factory":103,"./fn":104,"./group":105}],107:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent    = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }

    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }

    child.create = function () {
      var obj = Object.create(child.prototype);
      child.apply(obj, arguments);
      return obj;
    }
  }

  return child;
}


module.exports = protoclass;
},{}],108:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],109:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}]},{},[21]);
