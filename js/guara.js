/*
 * See: IIFE - http://benalman.com/news/2010/11/immediately-invoked-function-expression/
	(function() {
		return {};
	}());
 */

define(function (require) {
	
	var $log        = require("gl!guara/log");
	var $utils      = require("gl!guara/utils");
	var $map        = require("gl!guara/map");
	var $types      = require("gl!guara/types");
	var $push       = require("gl!guara/push");
	var $keys       = require("gl!guara/keys");
	var $bus        = require("gl!guara/bus");
	var $states     = require("gl!guara/states");
	var $app        = require("gl!guara/app");
	var $err        = require("gl!guara/error");
	var $modals     = require("gl!guara/modal");
	var $wizards    = require("gl!guara/wizard");
	var $login      = require("gl!guara/login");
	var $conn       = require("gl!guara/connect");
	var $timer      = require("gl!guara/countdowntimer");
	var $render     = require("gl!guara/render");
	var $names      = require("gl!guara/names");
	var $validator  = require("gl!guara/validator");
	var $forms      = require("gl!guara/forms");
	var $binder     = require("gl!guara/binder");
	var $router     = require("gl!guara/router");
	var $notify     = require("gl!guara/notify");

	/*
	var $template   = require("gl!guara/template");
	var $model      = require("gl!guara/model");
	var $view       = require("gl!guara/view");
	var $controller = require("gl!guara/controller");
	*/
	
	var _initialized = false;
	var guara = {
		
			module_name : 'guara/guara',
			name	    : "GuaraJS",
			version	    : "1.0.0",

			init: function() {
				$router.init();
				$bus.init();
				$notify.init();
				if($app.get() == null)
				{
					$log.warn("Guara Application hook $g.app is not defined");
				}
				$log.info("\t -- Guara " + this.version + " is up and running --");
				_initialized = true;
			},
		
			initialized: function() {
				return _initialized;
			},
		
			log        : $log,
			utils      : $utils,
			types      : $types,
			map        : $map,
			push       : $push,
			keys       : $keys,
			bus        : $bus,
			//router     : $router,
			states     : $states,
			//notify     : $notify,
			app        : $app,
			//template   : $template,
			error      : $err,
			modals     : $modals,
			wizards    : $wizards,
			login      : $login,
			conn       : $conn,
			timer      : $timer,
			render     : $render,
			names      : $names,
			//model      : $model,
			//view       : $view,
			//controller : $controller,
			validator  : $validator,
			forms      : $forms,
			binder     : $binder
		};
	
	return guara;
	
});
