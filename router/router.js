var router = (function(history){
  var Router = function(options) {
    if (options.routes) this.routes = options.routes;
    this.params = options;
    this._bindRoutes();//绑定路由：将路由注册到handler(history)里,注册回调
    this.initialize.apply(this, arguments);//执行初始化函数
  }

  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  _.extend(Router.prototype, {
    // 初始化函数
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);//route如果不是正则则转成正则
      if (_.isFunction(name)) {//如果name是个函数，则没有callback
        callback = name;
        name = '';
      }
      if (!callback) callback = this.params[name];//如果参数中没有传递callback，则执行this : name
      var router = this;
      history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);//在这里执行每个路由对应的函数
        // router.trigger.apply(router, ['route:' + name].concat(args));//触发基于动作名称的事件
        // router.trigger('route', name, args);
        // history.trigger('route', router, name, args);
      });
      return this;
    },


    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    //从下往上遍历的原因：让一般的路由在route map的底部
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);//获取routers的所有key
      //从最后一个元素开始遍历
      while ((route = routes.pop()) != null) {//pop用于删除并返回数组最后一个元素
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }
  })
  return Router;
})(his);