define(function (require) {

	var _app = null;
	
	return {

		module_name: 'guara/app',
		
		names: {},
		
		set: function(application) {
			_app = application;
		},
		
		get: function() {
			return _app;
		}
	};

});