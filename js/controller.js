define(function (require) {

	var _render = function(view, model)
	{
		var html = view.render(model);
		view.attach(html);
		if(view.on)
		{
			if (view.on.attach)
			{
				view.on.attach(view);
			}
		}
		
		var children = view.children();
		for (var i in children)
		{
			var child = children[i];
			_render(child, model);
		}
	};
	
	var _createController = function(view, model)
	{
		var _model = model;
		
		var result = {
			render: function() {
				_render(view, _model);
			},
			
			setModel: function(model) {
				_model = model;
			}
		};

		if(_model)
		{
			_model.plug(result);
		}
		
		return result;
	};

	var result = {
		
		module_name: 'guara/controller',

		create: function(view, model) {
			return _createController(view, model);
		}
	};

	return result;
});