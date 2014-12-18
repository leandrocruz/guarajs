define(function (require) {
	
	var $log = require("gl!guara/log");
	var $not = require("gl!guara/notify");
	var $err = require("gl!guara/error");
	
	var _messageCounter = 1; 

	var _callbacks = [];
	
	var _ws;
	
	var _isConnected = false;
	
	var _serialize = function(message) {
		return JSON.stringify(message);
	};
	
	function _createWith(handler)
	{
		var ws = new WebSocket(handler.url);
		
		ws.onopen = function(evt) {
			_isConnected = true;
			handler.onOpen(evt);
		};
	
		ws.onclose = function(evt) {
			_isConnected = false;
			handler.onClose(evt);
		};
	
		ws.onmessage = function(evt) {
			$not.stopSpin();
			var message  = JSON.parse(evt.data);
			var id       = message.id;
			var callback = _callbacks[id];
			var delegate = handler.allowCallbackFor(message);
			$log.info("> " + message.class + "/" + message.id + " callback=" + (callback && delegate ? "yes" : "no"));
			
			if(callback)
			{
				_callbacks[id] = undefined; // cleanup
				try
				{
					callback(message);
				}
				catch (err)
				{
					$err.onError("Error executing callback", err);
				}
			}
			try
			{
				handler.onMessage(message);
			}
			catch(err)
			{
				$err.onError("Error handling incoming message");
			}
		};
		
		return ws;
	}

	var push = {
			url: "",
			init: function() {

				if(this.url == "")
				{
					$log.warn("Guara.Push.url is not configured");
					return;
				}
				
				_ws = _createWith(push);
			},
	
			onOpen: function() {
				$log.info("PushService: connection opened to: " + this.url);
			},
	
			onClose: function() {
				$log.info("PushService: connection to " + this.url + " was lost");
			},
		
			onMessage: function(message) {
				$log.info("PushService: new message from the server: " + message.data);
			},
			
			open: function() {
				_ws = _createWith(push);
			},
			
			close: function() {
				var onCloseHandler = _ws.onclose; 
				_ws.onclose = null; /* http://stackoverflow.com/questions/4812686/closing-websocket-correctly-html5-javascript */
				_ws.close();
				_ws = null;
				onCloseHandler();
			},
			
			isConnected: function() {
				return _isConnected;
			},
			
			keepTryingToConnect: function(timeToWait, whenConnected) {
				
				var interval = null;
				
				this.onClose = function(message) {
					//console.log("Reconnect failed!");
				};
				
				this.onOpen = function() {
					$log.info("WebSocket Reconnected");
					clearInterval(interval);
					whenConnected();
				};
				
				interval = setInterval(function() {
					$log.info("Trying a new connection to: " + push.url);
					push.open();
				}, timeToWait);

			},
		
			send: function(message, callback) {
				//TODO: execute callback with error if _ws is null
				if(!_isConnected)
				{
					//$not.warn("Não é possível executar o commando");
					return;
				}
				
				message.id = _messageCounter++;
				$log.info("< "+ message.class + "/" + message.id);
				if(callback !== undefined)
				{
					_callbacks[message.id] = callback;
				}
				
				try
				{
					var s = _serialize(message);
					$not.startSpin();
					_ws.send(s);
				}
				catch(err)
				{
					$err.onError("Can't send data to server", err);
				}
			},
			
			allowCallbackFor: function(message)
			{
				return true;
			}
	};
	
	return push;
	
});
