define(function (require) {

	var result = {
		module_name: 'guara/types',
		
		convert: function(value, type) {
			
			switch(type)
			{
				case 'int':
					return this.toInt(value);
					
				default:
					return value;
			}
		},
		
		toInt: function(value) {
			if(typeof value === 'number')
			{
				return value;
			}
			
			var result = parseInt(value, 10);
			if(isNaN(result))
			{
				throw value + " can't be converted to an int";
			}
			return result;
		},
		
		isUndefined: function(o) {
			return typeof o === 'undefined';
		},
		
		isFunction: function(o) {
			return typeof o === 'function';
		},
		
		isString: function(o) {
			return typeof o === 'string';
		},
		
		isEmptyString: function(str) {
			return !str || str.length == 0 || $.trim(str) === "";
		},
		
		isNumber: function (n) {
			if(!n || this.isEmptyString(n))
			{
				return false;
			}
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		
		toNumber: function (n, deflt) {
			if(this.isNumber(n))
			{
				return parseFloat(n);
			}
			return deflt;
		},
		
		valueOf: function(o, deflt) {
			if(this.isUndefined(o) 
					&& !this.isUndefined(deflt))
			{
				return deflt;
			}
			
			if(this.isFunction(o))
			{
				return o();
			}
			return o;
		}
		
			
    };
	
	return result;
});