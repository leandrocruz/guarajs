define(function (require) {

	var $log    = require("gl!guara/log");
	var $app    = require("gl!guara/app");
	var $utils = require("gl!guara/utils");
	var $binder = require("gl!guara/binder");
		
	var _map = [];
	
	var _currentState;

	var _parse = function(stateName) {
		var idx = stateName != null ? stateName.indexOf("/") : -1,
			tk = stateName,
			pp = null;
		
		if(idx > 0)
		{
			tk = stateName.substring(0, idx);
			pp = stateName.substring(idx + 1);
		}
		return {token: tk, params: pp};
	};

	var _stateFor = function(token) {
		return _map[token];
	};
	
	function _loadState(state, params)
	{
		var ctrl = state.controller ? state.controller.apply(state, params) : null;
		if(ctrl)
		{
			ctrl.render();
		}
		else 
		{
			if(!state.load)
			{
				$log.warn("state.load() not defined for: " + state.token);
			}
			else
			{
				state.load.apply(state, params);
			}
		}
	}

	return {
	
		module_name: 'guara/states',

		defaultState: {
			token: "index",
			el: $("#index"),
			load: function(params) {
				alert("YOU MUST REGISTER A DEFAULT STATE IN YOUR APP");
			}
		},
	
		register: function(state) {
			$log.debug("StateManager: Registering handler for token '" + state.token + "'");
			_map[state.token] = state;
			if(state.isDefault)
			{
				this.defaultState = state;
			}
		},
	
		onRouteChange: function(stateName) {
			if($app.get() == null)
			{
				$log.error("Guara Application is not set");
				return;
			}
		
			var data  = _parse(stateName);
			var state = _stateFor(data.token);
			
			if(!state)
			{
				$log.warn("Can't find state for '" + stateName + "'. Please, register a state for this url. We will use the default state '" + this.defaultState.token + "'");
				state = this.defaultState;
			}

			var curr = _currentState ? _currentState.token : "NULL";
			$log.info("Changed state from '" + curr + "' to '" + state.token + "'");
			
			var params = data.params;
			if(state.bind)
			{
				params = $binder.bind(state.bind, params);
			}
			else
			{
				params = $utils.toPathString(params);
			}

			_currentState = state;
			_currentState.params = params;

			$app.get().applicationStateChangedTo(state, params); /* doesn't work if we are loading the page for the first time */
		},
		
		current: function() {
			return _currentState;
		},
		
		goTo: function(url) {
			window.location.hash = url;
		},
		
		is: function(token) {
			return token === this.current().token;
		},

		load: function(state, params) {
			return _loadState(state, params);
		}
	};
});
