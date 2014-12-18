define(function (require) {
	
	var $log 	= require("gl!guara/log");
	var $notify = require("gl!guara/notify");
	var $ws		= require("gl!guara/push-ws-connector");
	var $lp		= require("gl!guara/push-lp-connector");
	
	var _messageCounter = 1;
	var _callbacks      = [];
	var _impl           = null;
	var _wsSupport      = "WebSocket" in window;
	var _interval       = null;
	
	var _toString = function(message) {
		try
		{
			return JSON.stringify(message);
		}
		catch(err)
		{
			$log.error("Error converting json '" + message + "' to string");
		}
		return null;
	};
	
	var _toJson = function(s) {
		try
		{
			return JSON.parse(s);
		}
		catch(err)
		{
			$log.error("Error converting string '" + s + "' to json");
		}
		return null;
	};
	
	var _error = function(code, msg, trace, handlers) {
		if(handlers && handlers.onError)
		{
			handlers.onError(code, msg, trace);
		}
		else
		{
			$log.info(msg, trace);
		}
	};

	var push = {

		module_name: 'guara/push',

		url: "",
		
		printObjects: false,

		engine: function(mode) {
			if(!mode)
			{
				return _impl;
			}
			
			/* 'ws' for websockets,  'lp' for long polling or 'auto' for ws, then lp */
			if("lp" === mode || !_wsSupport)
			{
				_impl = $lp;
			}
			else
			{
				_impl = $ws;
			}
		},

		open: function(callbacks) {
			
			if(this.url == "")
			{
				$log.warn("[PushService] Guara.Push.url is not configured");
				return false;
			}

			if(this.isConnected())
			{
				$log.info("[PushService] Already connected");
				return false;
			}
			
			$log.info("[PushService] New connection to '" + this.url + "' (" + this.engine().name + ")");
			this.engine().open(push, callbacks);
			return true;
		},

		close: function(err) {
			
			if(this.isConnected())
			{
				this.engine().close(err);
			}
			else
			{
				$log.info("[PushService] Connection not found");
			}
		},

		isConnected: function() {
			return this.engine().isConnected() ? true : false;
		},
		
		send: function(message, handlers) {
			
			//console.log("[SEND]", message);
			/*
			 * 
			 * You can pass an object with onReply, onSucess, onError, etc, or
			 * a simple function that works like {onReply: function(){...}}
			 * 
			 */
			if(handlers && typeof handlers === "function")
			{
				handlers = {onReply: handlers};		
			}
			
			if(!this.isConnected())
			{
				_error(0, "[PushService] Not connected.", null, handlers);
				return;
			}
			
			if(typeof message === "string")
			{
				message = _toJson(message);
			}

			message.signalId = (_messageCounter++).toString();
			
			if(handlers)
			{
				_callbacks[message.signalId] = handlers;
			}
			
			$notify.startSpin();

			var txt = _toString(message);
			$log.debug("[PushService] SND> " + message.class + "/" + message.signalId);
			
			try
			{
				this.engine().write(txt, message.signalId);
				//TODO: call handlers.onSucess
			}
			catch(err)
			{
				_error(0, "[PushService] Can't send data to server", err, handlers);
				$notify.stopSpin();
			}
		},
		
		messageReceived: function(engine, message) {
			
			$notify.stopSpin();
			
			if(typeof message === "string")
			{
				message = _toJson(message);
			}
			
			var id 			= message.signalId;
			var callback 	= _callbacks[id];
			_callbacks[id] 	= undefined; // cleanup
			
			//console.log("[RECEIVE]", message);
			$log.debug("[PushService] RCV> " + message.class + "/" + id);
			if(callback && callback.onReply)
			{
				try
				{
					callback.onReply(/* engine, */ message);
				}
				catch (err)
				{
					if (err.stack)
					{
						$log.info("Push error: \n" + err.stack);
					}
					else
					{
						$log.info("Push error: \n" + err);					
					}
				}
			}
			/*  
			 * TODO: We should execute 'hooks.onMessage()' only if no callback is found, but
			 * Our code would required too many changes to make it work properly
			 */
			this.hooks.onMessage(/* engine, */ message);
		},
		
		clearInterval: function() {
			if(_interval)
			{
				clearInterval(_interval);
			}
		},
		
		keepTryingToConnect: function(timeToWait, whenConnected) {
			
			this.clearInterval();

			this.hooks.onClose = function(message){};
			
			this.hooks.onOpen = function() {
				$log.info("[PushService] Reconnected");
				this.clearInterval();
				whenConnected();
			};
			
			_interval = setInterval(function() {
				$log.info("[PushService] Trying a new connection to: " + push.url);
				push.open();
			}, timeToWait);

		},

		hooks: {
			
			onConnect: function(engine, data) {
				alert("[PushService] onConnect() not defined");
			},
			
			onConnectError: function(engine, data) {
				alert("[PushService] onConnectError() not defined");
			}, 
	
			onClose: function(engine, err) {
				alert("[PushService] onClose() not defined ");
			},
		
			onMessage: function(engine, data) {
				alert("[PushService] onMessage() not defined");
			},
			
			onError: function(engine, data) {
				alert("[PushService] onError() not defined");
			}
		},
		
	};
	
	return push;
	
});
