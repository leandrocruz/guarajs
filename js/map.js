define(function (require) {

	var _createMap = function() {
		
		var _size = 0,
			_items = {};
	
		var _has = function(key) {
			return _items.hasOwnProperty(key);
		};
		
		return {
			
			import: function(list) {
				if ($.isArray(list))
				{
					for(var i = 0; i < list.length; i++)
					{
						this.put(list[i].key, list[i].value);
					}
				}
			},
			
		    size: function() {
				return _size;
			},

		    clear: function()
		    {
		        _items = {};
		        _size = 0;
		    },
		    
			put: function(key, value) {
		        if(!_has(key))
		        {
		        	_size++;
		        }
		        _items[key] = value;
			},

			remove: function(key) {
		        if(_has(key))
		        {
		        	_size--;
		        	delete _items[key];
		        }
			},
			
			get: function(key) {
				return _has(key) ? _items[key] : undefined;							
			},
			
			keys: function() {
				var result = [];
		        for (var k in _items) {
		            if (_has(k)) {
		            	result.push(k);
		            }
		        }
		        return result;
			},
			
			values: function() {
				var result = [];
		        for (var k in _items) {
		            if (_has(k)) {
		            	result.push(_items[k]);
		            }
		        }
		        return result;
			}						
		};
		

	};

	
	var result = {
		module_name: 'guara/map',
		
		create: function() {
			return _createMap();
		}
			
    };
	
	return result;
});