define(function (require) {

	var $utils = require('gl!guara/utils');
	
	var xls = {
		read: function(data, options) {
			return XLS.read(data, options);
		},
		toJson: function(sheet) {
			return XLS.utils.sheet_to_json(sheet);
		},
	};
	
	var xlsx = {
		read: function(data, options) {
			return XLSX.read(data, options);
		},
		toJson: function(sheet) {
			return XLSX.utils.sheet_to_json(sheet);
		},
			
	};
	
	function _getPrototype(sheet) {
		var cols      = _getCols(sheet);
		var prototype = {};
		for(var i = 0; i < cols.length; i++)
		{
			var cell = cols.charAt(i) + "1";
			var value = sheet[cell].v;
			prototype[cell] = value;
		}
		return prototype;
	}
	
	function _endOfSheet(sheet) {
		return sheet["!range"].e.r;
	}
			
	function _read(file, callback) {
		
		var name = file.name;
		var handler = null;
		
		if(name.endsWith('.xls'))
		{
			handler = xls.read;
		}
		else if(name.endsWith('.xlsx'))
		{
			handler = xlsx.read;
		}
		
		if(handler)
		{
			$utils.read(file, function(e){
				var data = e.target.result;
				var wb   = handler(data, {type:'binary'});
				if(callback != undefined)
				{
					callback(wb);
				}
			});
		}
		else
		{
			throw "Can't find parser for: " + name;
		}
		
	}
	
	function _getCols(sheet) {
		var size = sheet["!range"].e.c;
		var cols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		return cols.substring(0, size);
	}

	function to_json(workbook) {
		var result = {};
		workbook.SheetNames.forEach(function(name) {
			var sheet = workbook.Sheets[name];
			var data = XLS.utils.sheet_to_row_object_array(sheet);
			if(data.length > 0)
			{
				result[name] = data;
			}
		});
		return result;
	}
	
	var _sniff = function(obj) {
		if(obj['!range'] !== undefined)
		{
			return xls;
		}
		
		if(obj['!ref'] !== undefined)
		{
			return xlsx;
		}
	};

	var result = {
		module_name: 'guara/excel',

		toJson: function(sheet) {
			return _sniff(sheet).toJson(sheet);
		},

		sheetByIndex : function(file, index, callback) {
			_read(file, function(wb){
				var sheet = null;
				if(wb != undefined)
				{
					var name  = wb.SheetNames[index];
					sheet = wb.Sheets[name];
				}
				if(callback != undefined)
				{
					callback(sheet);
				}
			});
		},
		
		toArray: function(sheet) {
			var type = _getPrototype(sheet);
			var len  = _endOfSheet(sheet);
			var cols = _getCols(sheet);
			
			if(cols === "")
			{
				throw "Sheet has no columns";
			}
			
			var list = [];
			
			for(var i = 1; i <= len; i++)
			{
				var obj = {};
				var undef = true;
				for(var j = 0; j < cols.length; j++)
				{
					var refName		= cols.charAt(j) + "1";
					var fieldName 	= type[refName];
					var refValue	= cols.charAt(j) + i;
					var cell		= sheet[refValue];
					var value		= null;
					if(cell != undefined)
					{
						value = cell.w;
						undef = false;
					}
					obj[fieldName]	= value;
				}
				if(!undef)
				{
					list.push(obj);
				}
			}
			return list;
		}
	};
	
	return result;
});