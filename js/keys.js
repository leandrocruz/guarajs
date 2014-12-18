/*
 * Keyboard Manager
 * See http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * See https://github.com/RobertWHurst/KeyboardJS
 */

define(function(require) {

	return {
		
		module_name: 'guara/keys',

		add: function(sequence, callback) {
			KeyboardJS.on(sequence, callback);
		}
	};
});
