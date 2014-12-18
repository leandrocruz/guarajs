define(function (require) {

	var $err = require("gl!guara/error");
	
	var _handlersByTopic = {};
	
	var module = {
		
		module_name: 'guara/bus',

		init: function() {
		},
		
		publish: function(topic, message) {
			var handlers = _handlersByTopic[topic];
			if(handlers && handlers.length > 0)
			{
				$.each(handlers, function(idx, handler) {
					try
					{
						var fn     = handler.handler;
						var filter = handler.filter;
						var ctx    = handler.context;
						if(filter && filter.apply(ctx, [topic, message]))
						{
							fn.apply(ctx, [topic, message]);
						}
					} 
					catch(err)
					{
						module.onPublishError(err, handler, topic, message);
					}
				});
			}
		},
		
		onPublishError: function(err, callback, topic, message) {
			console.error("Publish Error", err, callback, topic, message);
			console.error("Publish Error", err.stack);
		},
		
		subscribe: function(topic, fn, filter, context) {
			if(!context)
			{
				throw "Context not provided. Can't point it to 'this' when calling your handler";
			}
			
			var handlers = _handlersByTopic[topic];
			if(!handlers)
			{
				handlers = [];
				_handlersByTopic[topic] = handlers; 
			}
			handlers.push({handler: fn, filter: filter, context: context});
		},
		
		unsubscribe: function(topic, handler) {
			var handlers = _handlersByTopic[topic];
			if(handlers && handlers.length > 0)
			{
				$.each(handlers, function(idx, h) {
					if(h.handler === handler)
					{
						handlers.splice(idx, 1);
					}
				});
			}
		}
	};
	
	return module;

});