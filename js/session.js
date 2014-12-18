define(function (require) {

	var cookieName = "guara_session";
	
	var _sessionId = null;
	
	var module = {

		module_name: 'guara/session',
		
		getSessionId: function() {
			if(!_sessionId)
			{
				_sessionId = $.cookie(cookieName);
			}
			
			return _sessionId;
		},

		setSessionId: function(id) {
			if(_sessionId !== id)
			{
				_sessionId = id;
				$.cookie(cookieName, id, {expires: 7, path: '/'});
			}
		}
	};

	return module;
});
