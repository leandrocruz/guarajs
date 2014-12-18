define(function(require) {
		
	var $utils    = require("gl!guara/utils");
	var $template = require("gl!guara/template");
	
	var _templateId = "#alert-factory";
	
	var _time = 7000;
	
	var _container = null;
	
	var _topEL = document.getElementById("spinner");
	
	var _spinnerOpts = {
			lines : 9, // The number of lines to draw
			length : 2, // The length of each line
			width : 2, // The line thickness
			radius : 3, // The radius of the inner circle
			rotate : 0, // The rotation offset
			color : '#fff', // #rgb or #rrggbb
			speed : 1, // Rounds per second
			trail : 60, // Afterglow percentage
			shadow : false, // Whether to render a shadow
			hwaccel : false, // Whether to use hardware acceleration
			className : 'spinner', // The CSS class to assign to the spinner
			zIndex : 2e9, // The z-index (defaults to 2000000000)
			top : 'auto', // Top position relative to parent in px
			left : 'auto' // Left position relative to parent in px
	};
	
	var _spinner = new Spinner(_spinnerOpts);
	
	var _create = function (type, message, scheduleForRemoval)
	{
		if(scheduleForRemoval === undefined)
		{
			scheduleForRemoval = true;
		}

		var id = $utils.uniqueId();
		var html = $template.render(_templateId, {id: id, type: type, body: message});
		_container.append(html);

		var result = {

				remove: false,
				
				el: $("#"+id),
			
				show: function(toRemove) {
					this.remove = toRemove;
					var el = this.el;
					el.css({'position':'relative','display':'none'}).animate({'opacity':'show','height':'show'}, 'fast');
					
					if(toRemove)
					{
						setTimeout(function() {
							var keep = el.data('keep');
							if(!keep)
							{
								result.hide();
							}
						}, _time);
					}
				},
			
				hide: function() {
					var el = this.el;
					el.remove();
				}
			};

		result.show(scheduleForRemoval);
		return result;
	}
	
	var _top = {
		el: $(_topEL),
		
		show: function(message) {
			var hasMessage = !$utils.isEmpty(message);
			if(hasMessage)
			{
				this.el.addClass("withText");
				this.el.html(message);
			}
			else
			{
				this.el.removeClass("withText");
				this.el.empty();
			}

			var w = Math.round(($(window).outerWidth() / 2) - (this.el.outerWidth() / 2));
			this.el.css({'position': 'absolute', 'top': 0, 'left': w});
			
			this.el.show();
			if (!hasMessage) {
				_spinner.spin(_topEL);
			}
		},
		
		hide: function() {
			_spinner.stop();
			this.el.empty();
			this.el.hide();
		}
	};
	
	var result = {
			
			module_name: 'guara/notify',
			
			init: function() {
				_container = $("#notifications");
				_container.on('mouseover', ".alert", function(evt) {
					var notification = $(this);
					notification.data('keep',true);
				});
			},

			success: function(message, scheduleForRemoval) {
				return _create("alert-success", message, scheduleForRemoval);
			},

			warn: function(message, scheduleForRemoval) {
				return _create("", message, scheduleForRemoval);
			},
			
			error: function(message, scheduleForRemoval) {
				return _create("alert-error", message, scheduleForRemoval);
			},
			
			startSpin: function(message) {
				_top.show(message);
			},
			
			stopSpin: function() {
				_top.hide();
			},
	};
	
	return result;
	
});