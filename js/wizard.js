define(function (require) {

	var $template = require('gl!guara/template');
	
	function _move(wizard, fnName, increment)
	{
		var step = wizard.step;
		var wep  = wizard.weps[step];
		var fn   = wep[fnName];
		var type = typeof fn; 
		//console.log('wizard.js _move(): ', fnName, '->', type);
		
		if(type !== 'undefined')
		{
			if(type === 'function')
			{
				var move = fn();
				if(!move)
				{
					return false;
				}
			}
			else if(type === 'boolean')
			{
				if(!fn)
				{
					return false;
				}
			}
			else
			{
				throw new Error('unknown function type "' + type + '"');
			}
		}
		
		wizard.goTo(step + increment);
		return true;
	}
	
	var result = {

		module_name: 'guara/wizard',
		
		create: function(options)
		{
			var wizard = {
				
				weps: [],
				
				step: 0,
				
				options: options,
				
				_onFinish: null,
				
				register: function(step, wep /* Wizard stEP */)
				{
					wizard.weps[step] = wep;
					return wizard;
				},
				
				start: function()
				{
					wizard.goTo(0);
				},
				
				next: function()
				{
					return _move(wizard, 'beforeNext', 1);
				},
				
				prev: function()
				{
					return _move(wizard, 'beforePrev', -1);
				},
				
				onFinish: function(fn)
				{
					this._onFinish = fn;
					return this;
				},

				goTo: function(step)
				{
					wizard.step  = step;
					var modal    = this.options.modal;
					var wep      = wizard.weps[step];
					if(!wep)
					{
						//WIZARD END?
						if(modal)
						{
							if(this._onFinish)
							{
								this._onFinish(modal);
							}
							else
							{
								modal.hide();
							}
						}
						else
						{
							alert("TODO");
						}
						return;
					}

					var template = wep.template;
					var data     = wep.data || null;
					var html     = $template.render(template, data);
					
					var onShow   = wep.onShow;
					if(modal)
					{
						/* We already have a modal running, replace it's contents */
						modal.html(html, function(modal) {
							modal.onConfirm = wizard.next;
							modal.onCancel  = wizard.prev;
							if(onShow)
							{
								onShow();
							}
						});
					}
					else
					{
						alert('TODO: I can\'t create wizards outside modals');
					}
				}
			};
			return wizard;
		}
		
	};

	return result;
});