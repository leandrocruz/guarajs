define(function (require) {

	var module = {
		
		module_name: 'guara/modal',

		create: function(options, data, callback) {
			console.warn('Creating modal', options, data, callback);
			return {};
		},

		message: function(message, title, classes) {
			throw "NotImplementedYet";		
		},

	    confirm: function(id, msg, callback) {
			throw "NotImplementedYet";		
		}
	};

	return module;
});
