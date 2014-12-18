define(function (require) {

	var $utils     = require("gl!guara/utils");
	var $types     = require("gl!guara/types");
	var $validator = require("gl!guara/validator");
	
	var _highlight = function(item) {
		var group = item.element.closest(".form-group");
		if(item.isValid)
		{
			group.removeClass("has-error");
		}
		else
		{
			group.addClass("has-error");
		}

		$.each(item.errors, function(index, error) {
			//console.log(item.element.attr('name'), error);
		});
	};
	
	var _createForm = function(el) {
		
		var data = {};

		el.find(':input').each(function(index, input) {
			var name = input.name;
			if(!$utils.isEmpty(name))
			{
				var validators       = [];
				var element          = $(input);
				var inlineValidators = element.data('validate');
				if(inlineValidators)
				{
					$.each(inlineValidators, function(validatorName, param) {
						var validator = $validator.get(validatorName, param);
						validators.push(validator);
					});
				}
				
				data[name] = {
						errors: [],
						element: element, 
						isValid: true, 
						validators: validators
				};
			}
		});

		var form = {
			el: el,
			data: data, //$utils.formToBean(el),
			
			isValid: function() {
				var isAllValid = true;
				$.each(data, function(name, item) {
					item.errors    = [];
					var validators = item.validators;
					var value      = item.element.val();
					$.each(validators, function(index, validator) {
						var isValid   = validator.validate(value);
						//console.log(name, isValid, isValid ? 'ok' : validator.message());
						if(!isValid)
						{
							item.isValid = false;
							isAllValid   = false;
							item.errors.push(validator.message());
						}
					});
				});
				return isAllValid;
			},
			
			highlight: function() {
				$.each(data, function(index, item) {
					_highlight(item);
				});
			},
			
			populate: function(bean) {
				console.log("TODO: populating form");
			},
			
			enable: function() {
				console.log("TODO: enabling form");
			},
			
			disable: function() {
				console.log("TODO: disabling form");
			},
			
			asBean: function() {
				var result = {};
				$.each(this.data, function(name, item) {
					var el    = item.element;
					var value = el.val();
					var type  = el.data('type');
					result[name] = $types.convert(value, type);
				});
				return result;
			}
		};
		
		
		return form;
	};
	
	var result = {

		module_name: 'guara/forms',

		toForm: function(el) {
			return _createForm(el);
		}
	};
	
	return result;
});