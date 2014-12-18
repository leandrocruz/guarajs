define(function (require) {

	var $push   = require("gl!guara/push");
	var $timer  = require("gl!guara/countdowntimer");
	var $modals = require("gl!guara/modal");

	var _handler = null;
	
	var _options = {
		showOnCreate: false,
		template: "#load-app-modal",
		classes: ["load-app-modal"],
	};
	
	var _modal = $modals.create(_options);
	
	var _connect = function() {
		
		var callbacks = {
			onConnect: null,
			onConnectError: null,
		};

		_modal.info('Conectando ...');
		_modal.show();
		
		callbacks.onConnect = function(engine, data) {
			_modal.hide();
			if(_handler)
			{
				_handler.onConnect(data);
			}
		};
		
		callbacks.onConnectError = function(engine, data) {
			var i = result.interval;
			$timer.every(1000, function() {
				_modal.error("Tentando nova conexão em " + (i--) + "s");
				return i == 0;
			}, function() {
				_modal.clearMessage();
				_modal.info('Conectando ...');
				$push.open(callbacks);
			});
		};

		$push.open(callbacks);
	};

	var result = {
		module_name: 'guara/connect',
		interval	: 5,
		onConnect	: null,
		connect: function() {
			_connect();
		},
		registerHandler: function(handler) {
			_handler = handler;
		}
	};

	return result;
});
