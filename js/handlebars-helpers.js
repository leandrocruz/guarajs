Handlebars.registerHelper('dateFormat', function(context, block) {
	if (window.moment)
	{
		var f = block.hash.format || "DD/MM/YYYY HH:mm:ss";
		return moment(context).format(f);
	}
	else
	{
		return context;
	};
});

Handlebars.registerHelper('keyValue', function(object, key) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'keyValue' needs 2 parameters");

    return object[key];
});

Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
        '==':       function(l,r) { return l == r; },
        '===':      function(l,r) { return l === r; },
        '!=':       function(l,r) { return l != r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l == r; }
    };

    if(!operators[operator])
    {
    	throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
    }

    var result = operators[operator](lvalue,rvalue);

    if(result)
    {
        return options.fn(this);
    }
    else
    {
        return options.inverse(this);
    }
});