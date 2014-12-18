define(function (require) {

	var optionalParam = /\((.*?)\)/g;
	var namedParam    = /(\(\?)?:\w+/g;
	var splatParam    = /\*\w+/g;
	var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	var simple      = /:(\w+)/g;
	var replacement = '([A-Za-z0-9_\\-\\.]+)';

	/*
	 * From Backbone.js
	 */
	var _routeToRegExp = function(route) {
        route = route.replace(escapeRegExp, '\\$&')
                     .replace(optionalParam, '(?:$1)?')
                     .replace(namedParam, function(match, optional) {
                       return optional ? match : '([^/?]+)';
                     })
                     .replace(splatParam, '([^?]*?)');
        return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
	};

	var _extractParameters = function(route, fragment) {
        var params = route.exec(fragment).slice(1);
        return _.map(params, function(param, i) {
          // Don't decode the search params.
          if (i === params.length - 1) return param || null;
          return param ? decodeURIComponent(param) : null;
        });
	};
	

	return {
	
		module_name: 'guara/binder',
		
		bind: function(exp, fragment)
		{
			console.log('Fragment:', fragment);
			
			if(false)
			{
				var regex = _routeToRegExp(exp);
				return _extractParameters(regex, fragment);
			}
			
			var groups = [];
			exp = exp.replace(simple , function(match, name, offset, input){
				groups.push({name: name});
				if(input.endsWith(match))
				{
					return replacement;
				}
				else
				{
					return replacement + '\\';
				}
			});
			
			var params = new RegExp(exp).exec(fragment);
			if(!params)
			{
				return null;
			}
			
			params = params.slice(1);
	        $.each(params, function(idx, param) {
	        	var group = groups[idx];
	        	group.value = param ? decodeURIComponent(param) : null; 
	        });
			
			return params;
		}
	};
});