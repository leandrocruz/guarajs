define(function (require) {

	var $states = require("gl!guara/states");
	
	var MyRouter = Backbone.Router.extend({
		routes: {
			"*x": "routeMe"
		},
		routeMe: function(token) {
			$states.onRouteChange(token ? '#'+token : null);
		}
	});

	var router = new MyRouter();

	return {
		
		module_name: 'guara/router',

		init: function() {
			Backbone.history.start({pushState: false, root: "/"});		
		}
	};

});