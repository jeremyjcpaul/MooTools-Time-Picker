
var TimeUtil = new Class({

	Implements: Options,

	currentTimeElem: null, // the current time option div that is in the dropdown
	elements: [], // array of Elements that the picker is being attached to
	timeUtil: null, // TimeUtil Element created by the initialize method
	timeHolder: null, // The dropdown Element of times created by the initialize method
	timeOptions: [], // array of time option divs that make up the dropdown

	options: {
		onShow: $empty,
		onClose: $empty,
		onSelect: $empty,
		step: 30,
		timeFormat: 'H:i',
		timeUtilClass: 'timeutil-selector',
		timeUtilOptionClass: 'timeutil-elem',
		timeUtilSelectorClass: 'times'
	},

	initialize: function(els, options) {
		var self = this;

		// set the passed in options
		self.setOptions(options);

		// set the passed in elements
		self.elements = $$(els);
		if (!self.elements.length) return;

		// add the events to each time util element
		$$(self.elements).addEvents({
			'focus': function() {
				self.currentInput = this;
				self.focusTimeUtil(this);
			},
			'keydown': function(ev) {
				self.navigateTimeUtil(ev);
			},
			'keyup': function(ev) {
				self.navigateTimeUtil(ev);
			}
		});

		// build the time util dropdown element
		self.timeUtil = new Element('div', {
			'class': self.options.timeUtilClass
		}).set('tween', {
			'duration': 100
		}).inject(document.body).fade('hide');

		self.timeHolder = new Element('div', {
			'class': self.options.timeUtilSelectorClass
		}).inject(self.timeUtil);

		self.getTimeValues().each(function(time) {
			self.timeHolder.adopt(
				new Element('div', {
					'class': self.options.timeUtilOptionClass,
					'events': {
						'click': function(e) {
							self.selectTime(this);
						},
						'mouseout': function(e) {
							self.hightlightTime(this, false);
						},
						'mouseover': function(e) {
							self.hightlightTime(this, true);
						}
					},
					'text': time
				})
			);
		});

		self.timeOptions = self.timeHolder.getChildren();

		// hide on click off the control
		$(document.body).addEvent('click',function(e) {
			if (self.currentInput &&
				(!e.target || !$(e.target).getParents().contains(self.currentInput)) &&
				self.currentInput != e.target) {
				self.blurTimeUtil(self.currentInput);
			}
		}.bind(self));
	},

	// blurs the focused time option in the dropdown list
	blurTime: function() {
		var self = this;

		if (self.currentTimeElem) {
			self.currentTimeElem.removeClass(self.options.timeUtilOptionClass + '-focused');
			self.currentTimeElem = null;
		}
	},

	// blurs the whole time util
	blurTimeUtil: function(el) {
		var self = this;

		// blur the time util
		self.blurTime();
		self.timeUtil.fade('out');

		// ensure the time is formatted correctly for the input
		var newTime = self.currentInput.get('value');
		if (newTime != '') newTime = self.formatTime(newTime);

		if (newTime != null) {
			// valid time input given
			self.currentInput.removeClass('error');
			self.currentInput.set('value', newTime);
		} else {
			// invalid time input given
			self.currentInput.addClass('error');
		}

		// call custom callback
		self.options.onClose();
	},

	// focuses the first time option in the dropdown list
	focusFirstTime: function() {
		return this.focusTime(this.timeOptions[0]);
	},

	// focuses the last time option in the dropdown list
	focusLastTime: function() {
		return this.focusTime(this.timeOptions.getLast());
	},

	// focuses the next/previous time option in the dropdown list
	focusRelativeTime: function(dir) {
		var self = this;

		if (!self.currentTimeElem) return self;

		var newTime = self.currentTimeElem['get' + dir.capitalize()]();
		if (newTime) {
			return self.focusTime(newTime);
		} else if (dir == 'previous') {
			return self.focusLastTime();
		} else if (dir == 'next') {
			return self.focusFirstTime();
		}
	},

	// focuses a time option in the dropdown list
	focusTime: function(element) {
		var self = this;

		if (!element) return self;
		self.blurTime();
		self.currentTimeElem = element.addClass(self.options.timeUtilOptionClass + '-focused');
		self.scrollToTime(element.get('text'));
	},

	// focuses the whole time util
	focusTimeUtil: function(el) {
		var self = this;

		// show the dropdown list of times
		self.timeUtil.fade('in');

		// set the position of the dropdown list of times
		var coords = self.currentInput.getCoordinates();
		self.timeUtil.setStyles({
			'left': coords.left,
			'top': coords.top+coords.height
		});

		// initially scroll to the relevant time element
		self.scrollToTime();

		// call custom callback
		self.options.onShow();
	},

	// formats the given time string to match the time format for this util
	// returns null if invalid time is given
	formatTime: function(time) {
		var self = this;

		// validate the given time value
		var dtToCheck = Date.parse('01/01/1990 '+time);
		if (dtToCheck.format('%s').toInt() > 0) {
			// the time has been parsed correctly so return the formatted time
			return self.format(dtToCheck, self.options.timeFormat);
		}

		// invalid time given - return null
		return null;
	},

	// returns an array of times in the day, incremented by the desired step
	getTimeValues: function() {
		var self = this;

		var currentTime = new Date().clearTime();
		var times = [];

		var initialDate = currentTime.format('%Y-%m-%d');
		while (initialDate == currentTime.format('%Y-%m-%d')) {
			times.push(self.format(currentTime, self.options.timeFormat));
			currentTime.increment('minute', self.options.step);
		}

		return times;
	}.protect(),

	// highlight a time option
	hightlightTime: function(el, highlight) {
		var self = this;

		if (!self.currentTimeElem || self.currentTimeElem != el) {
			if (highlight) {
				el.addClass(self.options.timeUtilOptionClass + '-focused');
			} else {
				el.removeClass(self.options.timeUtilOptionClass + '-focused');
			}
		}
	},

	// navigates the time option dropdown list with keyboard actions
	navigateTimeUtil: function(ev) {
		var self = this;

		switch (ev.code) {
			case 9: // esc
			case 27: // esc
				ev.stop();
				self.currentInput.blur();
				self.blurTimeUtil(self.currentInput);
				break;
			case 38: // up
				ev.stop();
				self.currentTimeElem && self.currentTimeElem == self.timeOptions.getFirst() ? self.blurTime() : self.focusRelativeTime('previous');
				break;
			case 40: // down
				ev.stop();
				self.currentTimeElem ? self.focusRelativeTime('next') : self.focusFirstTime();
				break;
			case 13: // enter
				ev.stop();
				if (self.currentTimeElem) self.selectTime(self.currentTimeElem);
				break;
			default:
				// format the inputted time
				var newTime = self.formatTime(self.currentInput.get('value'));
				if (newTime != null) {
					// valid time input given

					self.currentInput.removeClass('error');
					// unfocus the currently focused time
					self.blurTime();
					// scroll to the best match for the inputted time
					self.scrollToTime(newTime);
				} else {
					// invalid time input given
					self.currentInput.addClass('error');
				}
		}
	},

	// scrolls the time option dropdown list to a time
	scrollToTime: function(timeToScrollTo) {
		var self = this;

		// either scroll to a given time, the current time value or the nearest time to now
		if (timeToScrollTo == null || timeToScrollTo == '') {
			var currentValue = self.currentInput.get('value');

			if (currentValue == null || currentValue == '')  {
				// scroll to now
				timeToScrollTo = new Date().format('%H:%M');
			} else {
				// scroll to the current value
				timeToScrollTo = currentValue;
			}
		}
		// turn into a date object for arithmetic checks
		var dtToScrollTo = Date.parse('01/01/1990 '+timeToScrollTo);

		// find the time element to scroll to
		var foundNextTime = false; var nextTimeIndex = 0;
		self.timeOptions.each(function(timeItem) {
			var dtToCheck = Date.parse('01/01/1990 '+timeItem.get('text'));

			if (!foundNextTime && dtToCheck >= dtToScrollTo) {
				// we've found the right time element
				foundNextTime = true;

				// scroll to the time element
				var coords = timeItem.getCoordinates();
				self.timeHolder.scrollTo(0, nextTimeIndex*coords.height);

				// focus the time element if there isn't a focused element already
				if (!self.currentTimeElem) self.focusTime(timeItem);
			}
			nextTimeIndex++;
		});
	},

	// selects a time
	selectTime: function(el) {
		var self = this;

		// set the input to the selected time
		var newTime = el.get('text');
		self.currentInput.set('value', newTime);
		self.blurTimeUtil(self.currentInput);

		// call custom callback
		self.options.onSelect(newTime, self);
	},

	leadZero: function(v) {
		return v < 10 ? '0'+v : v;
	},

	format: function(t, format) {
		var f = '';
		var h = t.getHours();
		var m = t.getMonth();
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var dayShort = 2;
		var monthShort = 3;

		for (var i = 0; i < format.length; i++) {
			switch(format.charAt(i)) {
				case '\\': i++; f+= format.charAt(i); break;
				case 'y': f += (t.getFullYear() + '').substring(2); break;
				case 'Y': f += t.getFullYear(); break;
				case 'm': f += this.leadZero(m + 1); break;
				case 'n': f += (m + 1); break;
				case 'M': f += months[m].substring(0, monthShort); break;
				case 'F': f += months[m]; break;
				case 'd': f += this.leadZero(t.getDate()); break;
				case 'j': f += t.getDate(); break;
				case 'D': f += days[t.getDay()].substring(0, dayShort); break;
				case 'l': f += days[t.getDay()]; break;
				case 'G': f += h; break;
				case 'H': f += this.leadZero(h); break;
				case 'g': f += (h % 12 ? h % 12 : 12); break;
				case 'h': f += this.leadZero(h % 12 ? h % 12 : 12); break;
				case 'a': f += (h > 11 ? 'pm' : 'am'); break;
				case 'A': f += (h > 11 ? 'PM' : 'AM'); break;
				case 'i': f += this.leadZero(t.getMinutes()); break;
				case 's': f += this.leadZero(t.getSeconds()); break;
				case 'U': f += Math.floor(t.valueOf() / 1000); break;
				default:  f += format.charAt(i);
			}
		}
		return f;
	}

});
