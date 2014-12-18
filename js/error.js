define(function (require) {
	
	var $log = require("gl!guara/log");
	var $modal = require("gl!guara/modal");

	var result = {
		
		module_name: 'guara/error',

		onError: function(msg, err) {
			if(err && err.trace)
			{
				//when receiving an ExceptionSignal
				err.stack = err.trace;
			}
			this.log(msg, err);
			$modal.create("#error-modal", {msg: msg, err: err});
		},
		
		log: function(msg, err) {
			if(err)
			{
				if (err.stack)
				{
					$log.info(msg + '\n' + err.stack);
				}
				else
				{
					$log.info(msg + ' ' + err);					
				}
			}
			else
			{
				$log.info(msg);	
			}
		}
	};
	
	return result;
});