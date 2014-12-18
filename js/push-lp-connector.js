define(function (require) {

	var $session = require("gl!guara/session");
	
	var _isConnected = false;
	
	/* Current Request */
	var _req = null; 

	/* The Push Service/Module */
	var _push = null;	
	
	var _url = function(param)
	{
		return "http://" + _push.url + "/lp" + param;
	};
	
	var _onSendDone = function(data, textStatus, jqXHR) {
		_process(data);
	};
	
	var _onSendFail = function(jqXHR, status, err) {
		alert("push-lp-connector.js :: error", err);
	};

	var _onDrainDone = function(data, textStatus, jqXHR) {
		_process(data);
		if(engine.isConnected())
		{
			_drain();
		}
	};
	
	var _onDrainFail = function(jqXHR, status, err) {
		
		if("parsererror" === status)
		{
			//BAD reply from server
			_push.hooks.onError(engine, {type: 'parserError', response: jqXHR.responseText, err: err});
			_drain();
		}
		else
		{
			/*
			 * Connection was closed by the server. If we closed the connection, _req would have to be null
			 */
			console.warn('[' + engine.name + '] Trying to restore session');
			_restoreSession(function(success){
				if(success)
				{
					console.info('[' + engine.name + '] Session restored');
					_drain();
				}
				else
				{
					console.warn('[' + engine.name + '] Session not restored');
					engine.close({status: status, err: err});					
				}
			});
		}
	};
	
	var _restoreSession = function(handler)
	{
		var sid = $session.getSessionId();
		var url = _url("/rsm/" + sid);
		var req = $.ajax({url : url,dataType : "json"})
		.fail(function() {
			handler(false);
		})
		.done(function(data, textStatus, xhr) {
			var resumed = data.type == 'OK' && data.sessionId == sid;
			handler(resumed);
		});
	};

	var _send = function(message, id)
	{
		var encoded   = encodeURIComponent(message);
		var sessionId = $session.getSessionId();
		var url       = _url("/snd/" + sessionId + "/" + id);

		_req = $.ajax({type	: "POST", url: url, data: encoded, dataType: "json"})
			.done(_onSendDone)
			.fail(_onSendFail);
	};

	var _drain = function()
	{
		var sessionId = $session.getSessionId();
		if(!sessionId)
		{
			throw "No Session Id";
		}
		
		var url = _url("/drn/" + sessionId);
		
		$.ajax({dataType: "json", url: url, timeout: 72000000})
			.done(_onDrainDone)
			.fail(_onDrainFail);
	};

	var _forward = function(msg)
	{
		try
		{
			_push.messageReceived(engine, msg);
		}
		catch(err)
		{
			_push.hooks.onError(engine, {type: 'processError', err: err});
		}
	};

	var _process = function(reply)
	{
		if(!reply || !engine.isConnected())
		{
			return;
		}

		var array = reply.data;
		if(array)
		{
			/* drain reply */
			$.each(array, function(index, value) {
				_forward(value);
			});
		}
		else
		{
			/* send reply */
			_forward(reply);
		}
	};
	
	var _open = function(callbacks)
	{
		if(!callbacks)
		{
			throw "Callbacks not defined";
		}

		var sessionId = $session.getSessionId();
		var url = _url(sessionId ? "/con/" + sessionId : "/con");

		/*
		 * Forcing the creation of a new closure so 'callbacks' is defined.
		 * 
		 * http://benalman.com/news/2010/11/immediately-invoked-function-expression/
		 */
		var success = (function (cb) {
	        return function(data, textStatus, jqXHR) {
				if(!data.sessionId)
				{
					_push.hooks.onError(engine, "SessionId missing from '" + JSON.stringify(data) + "'");
					return;
				}
				
				_isConnected = true;

				_push.clearInterval();
				$session.setSessionId(data.sessionId);
				cb.onConnect(engine, data);
				_push.hooks.onConnect(engine, data);
				_drain();
					
			};
	    }(callbacks));
		
		var error = (function (cb) {
	        return function(data, textStatus, jqXHR) {
	        	cb.onConnectError(engine, data);
	        	_push.hooks.onConnectError(engine, data);
			};
	    }(callbacks));		
		
		$.ajax({dataType: "json", url: url})
			.done(success)
			.fail(error);
	};
	
	var _close = function()
	{
		_isConnected = false;
		
		if(_req)
		{
			var tmp = _req;
			_req = null; /* mark is closing */
			tmp.abort();
		}
	};
	
	var engine = {
		
		module_name: 'guara/push-lp-connector',

		name: "Long Polling",
		
		open: function(push, callbacks) {
			_push = push;
			_open(callbacks);
		},
		
		close: function(data) {
			_close();
			_push.hooks.onClose(engine, data);
		},

		isConnected: function() {
			return _isConnected;
		},

		write: function(message, id) {
			_send(message, id);
		}
	};
	
	return engine;
	
});
