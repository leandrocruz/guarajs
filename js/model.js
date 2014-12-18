define(function (require) {

	var $log = require('gl!guara/log');

	var _computeChange = function(model)
	{

	};

	var _createModelFrom = function(model)
	{
		var _listeners = [];
		var _model     = model;
		return {
			
			unwrap: function() {
				return _model;
			},

			get: function(name) {
				return _model[name];
			},
			
			set: function(name, value) {
				_model[name] = value;
				for (var idx in _listeners)
				{
					try
					{
						_listeners[idx].setModel(this);
					}
					catch(err)
					{
						$log.error(err);
					}
				}
			},

			plug: function(listener) {
				if(listener)
				{
					_listeners.push(listener);	
				}
				return this;
			}
		};
	};

	var result = {
		
		module_name: 'guara/model',

		create: function(model) {
			return _createModelFrom(model);
		}
	};

	return result;
});