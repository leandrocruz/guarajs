define(function (require) {
	
	var $names   = require("gl!guara/names");
	var $push    = require("gl!guara/push");
	var $session = require("gl!guara/session");
	var $conn    = require("gl!guara/connect");
	var $utils   = require("gl!guara/utils");
	var $modals  = require("gl!guara/modal");
	var $states  = require("gl!guara/states");
	var $app     = require("gl!guara/app");
	
	var _hashBeforeLogin = null;

	var _isLoggedIn      = false;

	var _account         = null;

	var result = {

			module_name: 'guara/login',

			required: true,
			
			show: function(params) {
				var isConnected = $push.isConnected();
				if(!isConnected)
				{
					$conn.connect(params);
					return;
				}
				
				var username = '';
				if(params)
				{
					username = params.get("username");
				}
				
				var toFocus = $utils.isEmpty(username) ? 'username' : 'password';
				
				var options = {
					template	: "#login-modal",
					focus		: "#loginForm input[name='"+toFocus+"']",
					style		: {width: "520px"},
					footer		: 'hidden',
					on:{
						confirm: function(evt, modal) {
							evt.preventDefault();
							var u = modal.getInput('username').val();
							var p = modal.getInput('password').val();
							if($utils.isEmpty(u, p))
							{
								modal.error("Por favor, insira seu email e senha nos campos acima.", true);
							}
							else
							{
								modal.info("Verificando usuário/senha");
								result.check({username: u, password: p}, modal);
							}
						}
					},
				};
				$modals.create(options, {username: username});
			},
			
			goTo: function(params) {
				_hashBeforeLogin = location.hash;
				var isLogin 	 = $states.is('#login');
				if(isLogin)
				{
					this.show(params);
				}
				else
				{
					$states.goTo('#login');
				}
			},
			
			onLoginReply: function(data, modal) {
				var app = $app.get(); 
				if(!data.result)
				{
					app.onLoginError(modal, data);
				}
				else
				{
					_isLoggedIn = true;
					
					var targetState = _hashBeforeLogin;
					_hashBeforeLogin = null;
					if("#login" === targetState)
					{
						targetState = "#index";
					}
					modal.hide();
					app.onLoginSuccess(data, targetState);
				}
			},
			
			isLoggedIn: function(){
				return _isLoggedIn;
			},
			
			setAccount: function(account) {
				_account    = account;
				_isLoggedIn = !!account;
			},
			
			getAccount: function() {
				return _account;
			},

			check: function(up /* username and password */, modal) {
				var obj = {class: $names.Login}; 
				if(up)
				{
					obj = {
						class: $names.Login, 
						username: up.username, 
						password: up.password, 
						token: $session.getSessionId()
					};
				}

				$push.send(obj, function(reply) {
					result.onLoginReply(reply, modal);
				});
			},
	};
	return result;

});
