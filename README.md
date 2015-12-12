# MooTools-Time-Picker
A lightweight time picker for MooTools

##Usage

```js
new TimeUtil(selector, {
	step: 30, // time in minutes separating the time suggestions shown to the user
	timeFormat: 'H:i', // format that the times are shown
	timeUtilClass: 'timeutil-selector', // CSS class of the picker
	timeUtilSelectorClass: 'times', // CSS class of the times suggestion dropdown
	timeUtilOptionClass: 'timeutil-elem', // CSS class of the time options in the selector
	onShow: function() {
	  // do something when user focuses on the picker
	},
	onClose: function(selectedTime, timeUtil) {
	  // do something when the picker loses focus
	},
	onSelect: function(selectedTime, timeUtil) {
	  // do something when user selects a time
	},
});
```
