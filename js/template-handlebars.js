define(function (require) {

	var _cache = {};
	
	function _template(templateId)
	{
		var template = _cache[templateId];
		if(!template)
		{
			var source = $(templateId).html();
			template = result.compile(source);
			_cache[templateId] = template;
		}
		return template;
	}
	
	var result = {

		module_name: 'guara/template',
		
		compile: function(html) {
			return Handlebars.compile(html);
		},

		render: function(templateId, data, noComments) {
			var template = _template(templateId);
			var html     = template(data);
			if(noComments)
			{
				return html;
			}
			return '<!-- START: ' + templateId + ' -->\n' + html + '\n<!-- END: ' + templateId + ' -->';
		},
		
		registerHandler: function(name, fn) {
			Handlebars.registerHelper(name, function(options) {
				return fn(options);
			});
		}
	};
	
	return result;
});