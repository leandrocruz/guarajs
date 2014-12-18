define(function (require) {

	function _show(key)
	{
		var url = "http://" + window.location.host + window.location.pathname + key + "?layout=Body";
		//alert(url);
		$.ajax({dataType: "html", url: url}).done(function(data) {
			var screen = $("#screen"); 
			var oldWidget = screen.html();
			screen.html(data);
		});
	}
	
	return {

		module_name: 'guara/render',
		
		show: function(params) {
			if(params)
			{
				var key = params.keys()[0]; /* the first param is the user email */
				_show(key);
			}
			else
			{
				alert(ErrorCodes.NoData);
			}
		}
	};
});
