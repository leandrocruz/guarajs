define(function (require) {
	
	var _isConnected = false;
	
	var _ws = null;
	
	var engine = {
		
		module_name: 'guara/push-ws-connector',

		name: "WebSocket",
		
		open: function(push) {
			
			_ws = new WebSocket("ws://" + push.url + "/ws/connect");
			
			_ws.onopen = function(evt) {
				_isConnected = true;
				push.hooks.onConnect(engine, evt);
			};
		
			_ws.onclose = function(evt) {
				if(_isConnected)
				{
					_isConnected = false;
					push.hooks.onClose(engine, evt);
				}
				else
				{
					/*
					 * Chrome websocket impl calls onclose() when the connection was not made
					 */
					push.hooks.onConnectError(engine, evt);
				}
			};
		
			_ws.onmessage = function(evt) {
				push.messageReceived(engine, evt.data);
			};
			
			return engine;
		},
		
		close: function() {
			if(_ws)
			{
				var onCloseHandler = _ws.onclose; 
				_ws.onclose = null; /* http://stackoverflow.com/questions/4812686/closing-websocket-correctly-html5-javascript */
				_ws.close();
				_ws = null;
				onCloseHandler();
			}
		},

		isConnected: function() {
			return _ws && _isConnected;	
		},
		
		write: function(message, id) {
			_ws.send(message);
		}
	};
	
	return engine;
	
});
