define(function (require) {

	var $utils    = require('gl!guara/utils');
	var $types    = require('gl!guara/types');
	var $template = require('gl!guara/template');

	var _curr = null; //modals currently on screen; 
	
	var _hideFooter = function(mod)
	{
		var footer = $('.modal-footer', mod.el);
		if(mod.options.footer == 'hidden' && footer.is(':visible'))
		{
			footer.slideUp('slow', function() {});
		}
	};

	var _showFooter = function(mod)
	{
		var footer = $('.modal-footer', mod.el);
		if(mod.options.footer == 'hidden' && !footer.is(':visible'))
		{
			footer.slideDown('slow', function() {});
		}
	};

	var _normalize = function(options)
	{
		if($types.isString(options))
		{
			options = {template: options};
		}
		
		if(options.showOnCreate === undefined)
		{
			options.showOnCreate = true;
		}
		
		if(options.keyboard === undefined)
		{
			options.keyboard = false;
		}

		if(options.backdrop === undefined)
		{
			options.backdrop = "static";
		}

		if(options.classes === undefined)
		{
			options.classes = [];
		}

		if(options.on === undefined)
		{
			options.on = {};
		}
		
		if(options.on.confirm === undefined)
		{
			options.on.confirm = function(evt, modal)
			{
				modal.hide();
			};
		}
		
		if(options.on.cancel === undefined)
		{
			options.on.cancel = function(evt, modal)
			{
				modal.hide();
			};
		}
	
		return options;
	};

	var result = {
		
		module_name: 'guara/modal',

		create: function(options, data, callback) {

			options = _normalize(options);

			var dataKeyboard = 'data-keyboard="'+options.keyboard+'"';
			var dataBackdrop = 'data-backdrop="'+options.backdrop+'"';
			var html         = $template.render(options.template, data);
			var id           = $utils.uniqueId();
			var div          = $('<div id="' + id + '" class="modal fade" role="dialog" '+dataKeyboard+' '+dataBackdrop+'><div class="modal-dialog"><div class="modal-content"></div>');
			var content      = $('.modal-content', div);
			content.html(html);

			for(var i = 0; i < options.classes.length; i++)
			{
				var classToAdd = options.classes[i];
				div.addClass(classToAdd);
			}

			if(options.style)
			{
				$.each(options.style, function( key, value ) {
					content.css(key, value);
				});
			}
			
			var container = $(options.container || '#tmp');
			container.append(div);

			var el = div;
			el.id  = id;

			var mod = {
				el: el,
				id: id,
				options: options,
				data: data,
				
				hide: function(){
					_curr = null;
					this.el.modal('hide');
				},
				
				show: function(){
					if(_curr)
					{
						_curr.hide();
					}
					_curr = this;
					this.el.modal('show');
				},
				
				info: function(msg, focus) {
					this.setMessage('info', msg, focus);
				},
				
				success: function(msg, focus) {
					this.setMessage('success', msg, focus);
				},
				
				warning: function(msg, focus) {
					this.setMessage('warning', msg, focus);
				},
				
				error: function(msg, focus) {
					this.setMessage('error', msg, focus);
				},
				
				setMessage: function(type, msg, focus) {
					
					var labelText    = '';
					var labelClass   = '';
					var messageClass = '';
					switch(type)
					{
						case 'info':
							labelText    = 'Info';
							labelClass   = 'label-inverse';
							messageClass = 'message-info';
							break;
							
						case 'error':
							labelText    = 'Erro';
							labelClass   = 'label-danger';
							messageClass = 'message-error';
							break;

						case 'success':
							labelText    = 'Sucesso';
							labelClass   = 'label-success';
							messageClass = 'message-success';
							break;
						
						case 'warning':
							labelText    = 'Aviso';
							labelClass   = 'label-warning';
							messageClass = 'message-warning';
							break;
						
						default:
						    alert("Message '" + type + "' not found");
					}
					
					var alert = this.select(".modal-alert");
					
					var message = $(".msg", alert);
					message.attr('class', 'msg'); //clear
					message.html(msg);
					message.addClass(messageClass);

					var label = $('.label', alert);
					label.attr('class', 'label'); //clear
					label.text(labelText);
					label.addClass(labelClass);
					
					alert.removeClass('hidden');
					
					if(focus)
					{
						this.focus(true);
					}

					_showFooter(mod);

				},
				
				clearMessage: function(focus) {
					var alert = this.select(".modal-alert");
					alert.addClass('hidden');
					
					var message = $(".msg", alert);
					message.html('');
					message.attr('class', 'msg');
					
					var label = $('.label', alert);
					label.text('');
					label.attr('class', 'label');
					
					_hideFooter(mod);
					
					if(focus)
					{
						this.focus(true);
					}
				},
				
				select: function(selector){
					return $(selector, this.el);
				},
				
				getInput: function(name) {
					return this.select("input[name='"+name+"']");
				},
				
				focus: function(select){
					var target = this.options.focus;
					if(!target)
					{
						target = "[data-focus]";
					}			if(!options.on)
					{
						options.on = {};
					}

					if(target)
					{
						var toFocus = this.select(target);
						toFocus.focus();
						if(select)
						{
							toFocus.select();
						}
					}
				},
				
				html: function(html, callback) {
					mod.el.slideUp('slow', function(){
						mod.el.html(html);
						mod.el.slideDown('slow', function(){
							if(callback)
							{
								callback(mod);
							}
						});
					});
				},
			};
			
			$utils.wire(options.on, mod.el, mod);

			el.on('shown.bs.modal',  function() {
				mod.focus();
				if(callback)
				{
					callback();
				}
			});

			el.on('hidden.bs.modal', function() {
				el.remove();
			});

			if(options.showOnCreate)
			{
				mod.show();
			}
			return mod;
		},

		message: function(message, title, classes) {
        	var options =  {
            	template : "#modal-message"
            };
			var data = {message: message, classes: classes, title: title};

			return this.create(options, data);
		},

	    confirm: function(id, msg, callback)
		{
	    	var options =  {
	        		template: 	"#message-prompt-modal",
	        		classes: 	["block-url-modal-dialog"],
	        		focus: 		".confirm",
	        		onConfirm: 	callback
	        	};

			var data  = {
					id: id,
					title: "Atenção!",
					message: msg,
					cancelButtonText: "Não",
					confirmButtonText: "Sim"
				};

			return this.create(options, data);
		}
	};

	return result;
});