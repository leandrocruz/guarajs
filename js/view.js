define(function (require) {

	var $template = require('gl!guara/template');
	var $utils    = require('gl!guara/utils');
	var $types    = require('gl!guara/types');
	var $map      = require('gl!guara/map');
	
	$template.registerHandler('view', function(options) {
		var inner = options.fn(this);
		var id    = options.hash.id;
		console.log(options);
		console.log(inner);
		
		var on = {
			attach: function(view) {
				console.log("view handler: TODO");
				//var x = view.closest("[data-view-id]").data('view-id');
				//console.log(x);
			}
		};

		var viewOptions = {templateId: id, on: on};
		var view = _createView(viewOptions);
		
		var html = view.render(options.hash);
		view.attach(html);
		view.on.attach(view);
		return html;
	});
	
	var _viewById = $map.create();
	
	var _getAttachPoint = function(parentView, attachTo)
	{
		var target = $types.valueOf(attachTo);
		if(!target)
		{
			target = "div[role='attach-point']";
		}
		
		if($types.isString(target))
		{
			if(parentView)
			{
				target = $(target, "#" + parentView.domId);
			}
			else
			{
				target = $(target);
			}
		}
		
		return target;
	};

	var _normalize = function(options)
	{
		var id = $utils.uniqueId("v");
		
		if($types.isString(options))
		{
			options = {templateId: options};
		}

		if(options.id === undefined)
		{
			options.id = id;
		}

		if(options.domId === undefined)
		{
			options.domId = id;
		}
		
		return options;
	};
	
	var _createView = function(options)
	{
		options = _normalize(options);
		
		var _subViews = [];
		
		var result = {
			id         : options.id,
			domId      : options.domId,
			template   : options.template,
			templateId : options.templateId,
			element    : options.element,
			attachTo   : options.attachTo,
			on         : options.on,
			parentView : null,
			el         : null,
			
			select: function(selector) {
				return $(selector, "#" + this.domId);
			},
			
			detach: function() {
				this.el.empty();
			},
			
			attach: function(html, append) {
				var domId = $types.valueOf(this.domId);
				var label = $('<span class="label">id: #'+this.domId+', view: '+this.id+', template: '+this.templateId+'</span>');
				var div   = $('<div id="' + domId  + '"></div>');
				div.data('guara-view-id', this.id);
				div.addClass('guara-view');
				div.html(html);
				div.prepend(label);
				
				this.attachPoint = _getAttachPoint(this.parentView, this.attachTo);
				if(!append)
				{
					this.attachPoint.empty();
				}
				this.attachPoint.append(div);
				this.el = div;
			},

			render: function(model) {
				var data = model;
				if(model && model.unwrap)
				{
					data = model.unwrap();
				}
				if(this.template)
				{
					var t = $template.compile(this.template);
					return t(data);
				}
				else if(this.templateId)
				{
					try
					{
						var template = $types.valueOf(this.templateId);
						return $template.render(template, data);
					}
					catch(err)
					{
						throw "Error rendering template: " + this.templateId;
					}
				}
				else if(this.element)
				{
					return '<' + this.element + '></' + this.element + '>';
				}
				else
				{
					throw "No Template Given";
				}
			},
			
			set: function(subView) {
				_subViews = [];
				if(subView)
				{
					this.add(subView);
				}
			},
			
			add: function(subView) {
				subView.parentView = this;
				_subViews.push(subView);
				
			},
			
			children: function() {
				return _subViews;
			},
			
			click: function(fn) {
				this.attachPoint.click(fn);
			},

			highlight: function(color) {
				if(this.el)
				{
					this.el.addClass('active');
				}
			},

			dim: function(color) {
				if(this.el)
				{
					this.el.removeClass('active');
				}
			},

			wire: function(callbacks) {
				$utils.wire(callbacks, this.el, this);				
			},

			toString: function() {
				return '(view id:' + this.id + ', domId:' + this.domId + ')'; 
			}
			
		};
		
		_viewById.put(options.id, result);
		return result;

	};

	var _forEach = function(fn)
	{
		var ids = _viewById.keys();
		$.each(ids, function(idx, id){
			var view = result.byId(id);
			fn(view);
		});
		
	};
	
	
	var result = {
		
		module_name: 'guara/view',

		create: function(options) {
			return _createView(options);
		},
		
		byId: function(view_id) {
			return _viewById.get(view_id);
		},
		
		highlight: function() {
			_forEach(function(view){
				view.highlight();
			});
		},

		dim: function() {
			_forEach(function(view){
				view.dim();
			});
		}

	};

	return result;
});