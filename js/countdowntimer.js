define(function (require) {
	
	var result = {

		module_name: 'guara/countdowntimer',

		every: function(time, tick, fn) {
			var interval = setInterval(function() {
				var done = tick();
				if(done)
				{
					clearInterval(interval);
					fn();
				}
			}, time);
		}
	};

	return result;
});