define(function (require) {

	var $map   = require("gl!guara/map");
	var $types = require("gl!guara/types");
	var $utils = require("gl!guara/utils");
	
	var _required = {
		
		name: '@required',
		
		message: function() {
			return "Campo obrigatório";
		},
		
		validate: function(value) {
			return !!value;
		} 
	};

	var _number = {
			
		name: '@number',
		
		message: function() {
			return "Não é um número";
		},
		
		validate: function(value) {
			var num = $utils.parseInt(value);
			return !isNaN(num);
		} 
	};

	var _minValue = {
			
		param : 0,
		name  : '@minValue',
		
		message: function() {
			return "Valor mínimo: " + this.param;
		},

		validate: function(value) {
			
			if(this.param && value)
			{
				var min    = $types.toInt(this.param);
				var num    = $types.toInt(value);
				var result = num >= min;
				return result;
			}
			
			return false;
		}
	};

	var _maxValue = {
			
		param : 0,
		name  : '@maxValue',
		
		message: function() {
			return "Valor máximo: " + this.param;
		},

		validate: function(value) {
			
			if(this.param && value)
			{
				var max    = $types.toInt(this.param);
				var num    = $types.toInt(value);
				var result = num <= max;
				return result;
			}
			
			return false;
		}
	};

	var _len = {
			
		param : 0,
		name  : '@len',
		
		message: function() {
			return "Tamanho exato: " + this.param;
		},

		validate: function(value) {
			
			if(this.param && value)
			{
				var len    = $types.toInt(this.param);
				var result = value.length == len;
				return result;
			}
			
			return false;
		}
	};

	var _minLength = {
		
		param : 0,
		name  : '@minLength',
		
		message: function() {
			return "Tamanho mínimo: " + this.param;
		},

		validate: function(value) {
			
			if(this.param && value)
			{
				var min    = $types.toInt(this.param);
				var result = value.length >= min;
				return result;
			}
			
			return false;
		}
	};

	var _maxLength = {
			
		param : 0,
		name  : '@maxLength',
		
		message: function() {
			return "Tamanho máximo: " + this.param;
		},

		validate: function(value) {
			
			if(this.param && value)
			{
				var max    = $types.toInt(this.param);
				var result = value.length <= max;
				return result;
			}
			
			return false;
		}
	};

	var _regexp = {
			
			param : 0,
			name  : '@regexp',
			
			message: function() {
				return "No Match: " + this.param;
			},

			validate: function(value) {
				if(!value)
				{
					return true;
				}
				
				if(this.param && value)
				{
					return this.param.test(value);
				}
				
				return false;
			}
		};

	var _fixed = {
			
		param : [],
		name  : '@fixed',
		
		message: function() {
			return "Valor desconhecido";
		},

		validate: function(value) {
			
			if(!value)
			{
				return true;
			}

			var result = false;
			if(this.param && this.param.length > 0 && value)
			{
				$.each(this.param, function(idx, param){
					result = result || param == value;
				});
			}
			return result;
			
		}
	};

	var _date = {
			
			regex : /\d{2}\/\d{2}\/\d{4}/,
			name  : '@date',
			
			message: function() {
				return "Data Inválida. Use o formato dd/mm/aaaa";
			},

			validate: function(value) {
				if(!value)
				{
					return true;
				}
				var match = this.regex.test(value);
				if(!match)
				{
					return false;
				}

				var array = value.split('/');
				var day   = parseInt(array[0]);
				var month = parseInt(array[1]);
				var year  = parseInt(array[2]);
				return day >= 1 && day <= 31 
						&& month >= 1 && month <= 12 
						&& year > 0;
			}
		};

	
	var _validatorByName = $map.create();
	_validatorByName.put(_required.name,	_required);
	_validatorByName.put(_number.name,		_number);
	_validatorByName.put(_len.name,			_len);
	_validatorByName.put(_minLength.name,	_minLength);
	_validatorByName.put(_maxLength.name, 	_maxLength);
	_validatorByName.put(_minValue.name, 	_minValue);
	_validatorByName.put(_maxValue.name, 	_maxValue);
	_validatorByName.put(_fixed.name,		_fixed);
	_validatorByName.put(_regexp.name,		_regexp);
	_validatorByName.put(_date.name,		_date);
	
	var result = {

		module_name: 'guara/validator',
		
		validateValue: function(value, validators) 
		{
			var result = {isValid: true, issues: []};
			
			if(!validators)
			{
				return result;
			}
			
			if(!Array.isArray(validators))
			{
				validators = validators.validators;
				if(!validators)
				{
					throw "No validtors provided";	
				}
			}
			
			for(var i = 0; i < validators.length; i++)
			{
				var validator = validators[i];
				if(typeof validator === 'string')
				{
					validator = this.get(validator);
				}
				
				var isValid = false;
				
				try
				{
					isValid	= validator.validate(value);
				}
				catch(err)
				{
					console.log("Error validating '"+value+"'", err);
				}
				
				if(!isValid)
				{
					result.isValid = false;
					result.issues.push({
						validator 	: validator.name,
						message 	: validator.message()
					});
				}					
			}
			return result;
		},
		
		validateObject: function(obj, validators)
		{
			var issues = [];
			var keys   = Object.keys(validators);
			for(var i = 0; i < keys.length; i++)
			{
				var key	= keys[i];
				var set = validators[key];
				if(set)
				{
					var value   = obj[key];
					var partial = this.validateValue(value, set);
					if(!partial.isValid)
					{
						$.each(partial.issues, function(idx, issue){
							issues.push({
								field     : key,
								validator : issue.validator,
								message   : issue.message,
							});
						});
					}
				}
			}
			return issues;
		},	
		
		get: function(name, param, message) {
			var validator = _validatorByName.get(name);
			if(validator)
			{
				if(!param)
				{
					return validator;
				}
				else
				{
					//clone
					var fn = validator.message;
					if(message)
					{
						fn = function(){
							return message
						};
					}
					return {message: fn, validate: validator.validate, param: param};
				}
			}
			else
			{
				throw "Can't find validator named '"+name+"'"; 
			}
		}
	};
	
	return result;
});