define(function (require) {
	
	var _isConnected = false;
	
	var _xhr = null;
	
	var result = {

		create: function(push) {

			_xhr = new XMLHttpRequest();
			_xhr.multipart = true; 
			_xhr.open('GET', "http://" + push.url + "/lp/connect/multipart", true /* async */);
			_xhr.onreadystatechange = function () {
				//console.log(this.status + "/" + this.statusText + " " + this.readyState);
				if (this.status == 200 && this.readyState == 4 /* 0: Uninitialized, 1: Open, 2: Sent, 3: Receiving, 4: Loaded */)
				{
					console.log("< '" + this.responseText + "'");
				}
			};
			
			_xhr.send();
			
			return result;
		},
		
		isConnected: function() {
			return _xhr != null;
		},
		
		close: function() {
			if(_xhr)
			{
				_xhr.abort();
				_xhr = null;
			}
		},

		write: function(message) {
			_xhr.send(message);
		}
	};
	
	return result;
	
});
