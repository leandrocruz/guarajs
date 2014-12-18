define(function (require) {

	var $map = require("gl!guara/map");

	/*
	 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
	 */
	if(!String.prototype.endsWith)
	{
	    Object.defineProperty(String.prototype, 'endsWith', {
	        enumerable: false,
	        configurable: false,
	        writable: false,
	        value: function (searchString, position) {
	            position = position || this.length;
	            position = position - searchString.length;
	            var lastIndex = this.lastIndexOf(searchString);
	            return lastIndex !== -1 && lastIndex === position;
	        }
	    });
	}
	if (!String.prototype.startsWith)
	{
		Object.defineProperty(String.prototype, 'startsWith', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: function (searchString, position) {
				position = position || 0;
				return this.lastIndexOf(searchString, position) === position;
			}
		});
	}

	if(!String.prototype.firstLetterToUpperCase)
	{
	    Object.defineProperty(String.prototype, 'firstLetterToUpperCase', {
	        enumerable: false,
	        configurable: false,
	        writable: false,
	        value: function (input) {
	        	return this.charAt(0).toUpperCase() + this.slice(1);
	        }
	    });
	}
	
	var utils = {
			module_name: 'guara/utils',
			
			/*
			 * See
			 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
			 */
			parseInt: function (value) {
				if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
				{
					return Number(value);
				}
				return NaN;
			},			
			
			toQueryString: function(string) {
				var result = $map.create();
				var vars = string.split("&");
				for (var i = 0; i < vars.length; i++)
				{
					var pair = vars[i].split("=");
					var name = pair[0];
					var value = unescape(pair[1]);
					//console.log(name + " = '" + value + "'");
					result.put(name, value);
				}
				return result;
			},
			
			toPathString: function(string) {
				if(!string)
				{
					return null;
				}
				var vars = string.split("/");
				return vars;
			},
			
			isEmpty: function() {
				var len = arguments.length;
				if(len == 0)
				{
					return true;
				}
				if(len == 1)
				{
					var str = arguments[0];
					return !str || str.length == 0 || $.trim(str) === "";
				}

				for (var i = 0; i < len; i++)
				{
					var str   = arguments[i];
					var empty = this.isEmpty(str);
					if(empty)
					{
						return true;
					}
				}
				return false;
			},
			
			isValidChar : function (keyCode) {
		        var c = String.fromCharCode(keyCode);
		        var isWordcharacter = c.match(/[\w\d]/);
		        var res = isWordcharacter != null || keyCode == 32 /* space */ || keyCode == 8 /*backspace*/ || 
		        		keyCode == 46 /*del*/ || keyCode == 27 /*esc*/ || keyCode == 189 /*dash*/ || keyCode == 190 /*dot*/ ||
		        		keyCode == 188 /*comma*/ || keyCode == 187 /*equal*/ || keyCode == 219 /*open bracket*/ ||
		        		keyCode == 221 /*close bracket*/ || keyCode == 220 /*backslash*/ || keyCode == 191 /*slash*/;
		        return res;
			},
			
			areEquals: function(str, str1) {
			    return str.localeCompare(str1) == 0;			    
			},
			
			randomString: function(size) {
			    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
			    var str = '';
			    for (var i = 0; i < size; i++) 
			    {
			        str += chars[Math.floor(Math.random() * chars.length)];
			    }
			    return str;
			},
			
			uniqueId: function(prefix) {
				prefix = prefix || "rnd_";
				do
				{
					var id = prefix + this.randomString(4);
					var el = document.getElementById(id)
				}
				while(el != null);
				return id;
			},
			
			center: function(obj) {
				var top  = (obj.outerHeight() / 2);
				var left = (obj.outerWidth() / 2) * -1;
				obj.css('margin-top',top).css('margin-left',left);				
			},

            filename: {

                fromUrl: function(url) {
                    var regex = /^(?:(?:http)|(?:ftp)):\/\/[^/]+(?:\.[^/]+)*(?:\/[^?#/]+)*(?:\/([^?#/]+(?:\.[^?#/]+)?))(?:[#?].*)?$/i;
                    var matches = regex.exec(url);
                    if(matches) {
                        return matches[1];
                    }
                },

                extension: function(filename) {
                    var regex = /^[^.]+(?:\.([^.]+))*$/i;
                    var matches = regex.exec(filename);
                    if(matches) {
                        return matches[1];
                    }
                }

            },

    		read: function(file, callback) {
    			var reader  = new FileReader();
    			if(file == undefined)
    			{
    				callback(null);
    			}
    			else
    			{
    				reader.onload = function(e)
    				{
    					callback(e);
    				};		
    				reader.readAsBinaryString(file);
    			}
    		},

            goTo: function(url) {
				window.location.hash = url;
			},
			
			metaFrom: function(el) {
				var owner  = $(el).closest("[data-id]");
				var id     = $(owner).attr("data-id");
				return {id: id};
			},
			
			toObject: function(array) {
				var result = {};
				$.each(array, function() {
					if (result[this.name] !== undefined)
					{
						if (!result[this.name].push)
						{
							result[this.name] = [result[this.name]];
						}
						result[this.name].push(this.value || '');
					} 
					else
					{
						result[this.name] = this.value || '';
					}
				});
				return result;
			},
			
			formToBean: function(form) {
				var array = form.serializeArray();
				return this.toObject(array);
			},
			
			by: function(value, property, array) {
				var len = array.length;
				for (var i = 0; i < len; i++)
				{
					var item = array[i];
					if(value === item[property])
					{
						return item;
					}
				}
			},
			
			/*
			 * Maps a click on 'el' to a callback defined in 'map' using 'target' as parameter 
			 */
			wire: function(map, el, target) {
				if(!map || !el)
				{
					return;
				}
				
				$.each(map, function(action, handler) {
					var origin = $("[data-on-"+action+"]", el);
					var name   = "on" + action.firstLetterToUpperCase();
					origin.click(function(evt) {
						var event = {event: evt, name: name, param: origin.data("param"), preventDefault: function(){evt.preventDefault();}};
						try
						{
							handler(event, target);
						}
						catch(err)
						{
							console.error("Error on event handler: ", err, err.stack);
						}
					});
				});
			},
			
			apply: function(handler, params) {
				if(handler)
				{
					var type = typeof handler;
					if(type == 'function')
					{
						handler.apply(null, params);
					}
					else if(type == 'object' && handler.fn)
					{
						handler.fn.apply(handler.ctx, params);
					}
					else
					{
						throw 'Unknown type: ' + type;
					}
				}
				
			},
    };
	
	return utils;
});