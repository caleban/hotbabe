// Needs to be smart about external links
var Router = function(options){
  var router = this
  ;

  router.options = _.defaults(options, {
    all: function(route){
      router.trigger(route);
    }
  });

  History.Adapter.bind(window, 'statechange', function(){
    var state = History.getState()
      , root = History.getRootUrl()
      , route = state.url.replace(root, '/')
    ;

    router.options.all.call(router, route, state);
  });
};

Router.prototype.trigger = function(route){
  var router = this
    , state = History.getState()
  ;

  if (router.options[route]){
    return router.options[route].call(router, state)
  }

  if (route === 'current') {
    var root = History.getRootUrl()
      , route = state.url.replace(root, '/')
    ;

    if (router.options[route]) {
      return router.options[route].call(router, state)
    }

    // return router.options.all.call(router, route, state);
  }
};

Router.prototype.current = function(){
  var state = History.getState()
    , root = History.getRootUrl()
    , route = state.url.replace(root, '/')
  ;

  return route;
};
