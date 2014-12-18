define(function () {
	var result = {
			
			module_name : 'guara/log',
			enabled     : true,
			level       : 0,

			DEBUG       : 0,
			INFO        : 1,
			WARN        : 2,
			ERROR       : 3,
		
			log: function(code, tag, fn, params) {
				if(this.enabled && this.level <= code)
				{
					var args = Array.prototype.slice.call(params);
					args.unshift(tag);
					fn.apply(this, args);
				}
			},
			
			debug: function() {
				this.log(this.DEBUG, "[DEBUG]", console.debug.bind(console), arguments);
			},
		
			info: function() {
				this.log(this.INFO, "[INFO]", console.log.bind(console), arguments);
			},
		
			warn: function() {
				this.log(this.WARN, "[WARN]", console.warn.bind(console), arguments);
			},
		
			error: function() {
				this.log(this.ERROR, "[ERROR]", console.error.bind(console), arguments);
			}
		};
	
	return result;
	
});
