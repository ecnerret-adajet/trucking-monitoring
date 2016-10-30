/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function($, undefined){

	var $window = $(window);

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function alias(method){
		return function(){
			return this[method].apply(this, arguments);
		};
	}

	var DateArray = (function(){
		var extras = {
			get: function(i){
				return this.slice(i)[0];
			},
			contains: function(d){
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i=0, l=this.length; i < l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i){
				this.splice(i,1);
			},
			replace: function(new_array){
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function(){
				this.splice(0);
			},
			copy: function(){
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function(){
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();


	// Picker object

	var Datepicker = function(element, options){
		this.dates = new DateArray();
		this.viewDate = UTCToday();
		this.focusDate = null;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if (this.isInline){
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		}
		else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('datepicker-rtl');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.today')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if (this.isInline){
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]){
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch (o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode){
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true){
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
				else
					o.multidate = 1;
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity){
				if (!!o.startDate){
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				}
				else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity){
				if (!!o.endDate){
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				}
				else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d){
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch (plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ch, ev; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function(){
			if (this.isInput){ // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput){ // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else if (this.element.is('div')){  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e){
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)){
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format){
					if (arguments.length === 0){
						ix = this.dates.length - 1;
						format = this.o.format;
					}
					else if (typeof ix === 'string'){
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(){
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.place();
			this._attachSecondaryEvents();
			this._trigger('show');
		},

		hide: function(){
			if (this.isInline)
				return;
			if (!this.picker.is(':visible'))
				return;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
		},

		remove: function(){
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput){
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc){
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function(){
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function(){
			return $.map(this.dates, function(d){
				return new Date(d);
			});
		},

		getDate: function(){
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function(){
			return new Date(this.dates.get(-1));
		},

		setDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
		},

		setUTCDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, $.map(args, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function(){
			var formatted = this.getFormattedDate();
			if (!this.isInput){
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			}
			else {
				this.element.val(formatted).change();
			}
		},

		getFormattedDate: function(format){
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			return $.map(this.dates, function(d){
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
			if (this.isInline)
				return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var zIndex = parseInt(this.element.parents().filter(function(){
					return $(this).css('z-index') !== 'auto';
				}).first().css('z-index'))+10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom '+
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto'){
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto'){
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update)
				return;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length){
				$.each(arguments, $.proxy(function(i, date){
					if (date instanceof Date)
						date = this._local_to_utc(date);
					dates.push(date);
				}, this));
				fromArgs = true;
			}
			else {
				dates = this.isInput
						? this.element.val()
						: this.element.data('date') || this.element.find('input').val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date){
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date){
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs){
				// setting date by clicking
				this.setValue();
			}
			else if (dates.length){
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
				html = '<tr>';
			if (this.o.calendarWeeks){
				var cell = '<th class="cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7){
				html += '<th class="dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12){
				html += '<span class="month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)){
				cls.push('old');
			}
			else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)){
				cls.push('new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() === today.getFullYear() &&
				date.getUTCMonth() === today.getMonth() &&
				date.getUTCDate() === today.getDate()){
				cls.push('today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1){
				cls.push('disabled');
			}
			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) !== -1){
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function(){
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				tooltip;
			this.picker.find('.datepicker-days thead th.datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot th.today')
						.text(todaytxt)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.clear')
						.text(cleartxt)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth){
				if (prevMonth.getUTCDay() === this.o.weekStart){
					html.push('<tr>');
					if (this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() === this.o.weekEnd){
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');

			$.each(this.dates, function(i, d){
				if (d.getUTCFullYear() === year)
					months.eq(d.getUTCMonth()).addClass('active');
			});

			if (year < startYear || year > endYear){
				months.addClass('disabled');
			}
			if (year === startYear){
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year === endYear){
				months.slice(endMonth+1).addClass('disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d){
					return d.getUTCFullYear();
				}),
				classes;
			for (var i = -1; i < 11; i++){
				classes = ['year'];
				if (i === -1)
					classes.push('old');
				else if (i === 10)
					classes.push('new');
				if ($.inArray(year, years) !== -1)
					classes.push('active');
				if (year < startYear || year > endYear)
					classes.push('disabled');
				html += '<span class="' + classes.join(' ') + '">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function(){
			if (!this._allow_update)
				return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode){
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e){
			e.preventDefault();
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length === 1){
				switch (target[0].nodeName.toLowerCase()){
					case 'th':
						switch (target[0].className){
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
								switch (this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn === 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this.update();
								this._trigger('changeDate');
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')){
							this.viewDate.setUTCDate(1);
							if (target.is('.month')){
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1){
									this._setDate(UTCDate(year, month, day));
								}
							}
							else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2){
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							day = parseInt(target.text(), 10)||1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.is('.old')){
								if (month === 0){
									month = 11;
									year -= 1;
								}
								else {
									month -= 1;
								}
							}
							else if (target.is('.new')){
								if (month === 11){
									month = 0;
									year += 1;
								}
								else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from){
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function(date){
			var ix = this.dates.contains(date);
			if (!date){
				this.dates.clear();
			}
			else if (ix !== -1){
				this.dates.remove(ix);
			}
			else {
				this.dates.push(date);
			}
			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which){
			if (!which || which === 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which  === 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput){
				element = this.element;
			}
			else if (this.component){
				element = this.element.find('input');
			}
			if (element){
				element.change();
			}
			if (this.o.autoclose && (!which || which === 'date')){
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!date)
				return undefined;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1){
				test = dir === -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){
						return new_date.getUTCMonth() === month;
					}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){
						return new_date.getUTCMonth() !== new_month;
					};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			}
			else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode === 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode){
				case 27: // escape
					if (this.focusDate){
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					this._toggle_multidate(focusDate);
					dateChanged = true;
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')){
						e.preventDefault();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged){
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				var element;
				if (this.isInput){
					element = this.element;
				}
				else if (this.component){
					element = this.element.find('input');
				}
				if (element){
					element.change();
				}
			}
		},

		showMode: function(dir){
			if (dir){
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker
				.find('>div')
				.hide()
				.filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName)
					.css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){
			return i.jquery ? i[0] : i;
		});
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){
			return $(i).data('datepicker');
		});
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){
				return i.getUTCDate();
			});
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){
				return d.valueOf();
			});
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i === -1)
				return;

			$.each(this.pickers, function(i, p){
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			if (new_date < this.dates[i]){
				// Date being moved earlier/left
				while (i >= 0 && new_date < this.dates[i]){
					this.pickers[i--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[i]){
				// Date being moved later/right
				while (i < l && new_date > this.dates[i]){
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());
		function re_lower(_,a){
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]){
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function(option){
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function(){
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data){
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else {
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option === 'string' && typeof data[option] === 'function'){
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function(year){
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month){
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language){
			if (!date)
				return undefined;
			if (date instanceof Date)
				return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var part_re = /([\-+]\d+)([dmwy])/,
				parts = date.match(/([\-+]\d+)([dmwy])/g),
				part, dir, i;
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
				date = new Date();
				for (i=0; i < parts.length; i++){
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			parts = date && date.match(this.nonpunctuation) || [];
			date = new Date();
			var parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){
						return d.setUTCFullYear(v);
					},
					yy: function(d,v){
						return d.setUTCFullYear(2000+v);
					},
					m: function(d,v){
						if (isNaN(d))
							return d;
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() !== v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){
						return d.setUTCDate(v);
					}
				},
				val, filtered;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length !== fparts.length){
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			function match_part(){
				var m = this.slice(0, parts[i].length),
					p = parts[i].slice(0, m.length);
				return m === p;
			}
			if (parts.length === fparts.length){
				var cnt;
				for (i=0, cnt = fparts.length; i < cnt; i++){
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)){
						switch (part){
							case 'MM':
								filtered = $(dates[language].months).filter(match_part);
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(match_part);
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				var _date, s;
				for (i=0; i < setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++){
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&laquo;</th>'+
								'<th colspan="5" class="datepicker-switch"></th>'+
								'<th class="next">&raquo;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>'+
							'<tr>'+
								'<th colspan="7" class="today"></th>'+
							'</tr>'+
							'<tr>'+
								'<th colspan="7" class="clear"></th>'+
							'</tr>'+
						'</tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">'+
							'<div class="datepicker-days">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function(){
		$('[data-provide="datepicker-inline"]').datepicker();
	});

}(window.jQuery));

(function($){var nextId=0;var Filestyle=function(element,options){this.options=options;this.$elementFilestyle=[];this.$element=$(element)};Filestyle.prototype={clear:function(){this.$element.val("");this.$elementFilestyle.find(":text").val("");this.$elementFilestyle.find(".badge").remove()},destroy:function(){this.$element.removeAttr("style").removeData("filestyle");this.$elementFilestyle.remove()},disabled:function(value){if(value===true){if(!this.options.disabled){this.$element.attr("disabled","true");this.$elementFilestyle.find("label").attr("disabled","true");this.options.disabled=true}}else{if(value===false){if(this.options.disabled){this.$element.removeAttr("disabled");this.$elementFilestyle.find("label").removeAttr("disabled");this.options.disabled=false}}else{return this.options.disabled}}},buttonBefore:function(value){if(value===true){if(!this.options.buttonBefore){this.options.buttonBefore=true;if(this.options.input){this.$elementFilestyle.remove();this.constructor();this.pushNameFiles()}}}else{if(value===false){if(this.options.buttonBefore){this.options.buttonBefore=false;if(this.options.input){this.$elementFilestyle.remove();this.constructor();this.pushNameFiles()}}}else{return this.options.buttonBefore}}},icon:function(value){if(value===true){if(!this.options.icon){this.options.icon=true;this.$elementFilestyle.find("label").prepend(this.htmlIcon())}}else{if(value===false){if(this.options.icon){this.options.icon=false;this.$elementFilestyle.find(".icon-span-filestyle").remove()}}else{return this.options.icon}}},input:function(value){if(value===true){if(!this.options.input){this.options.input=true;if(this.options.buttonBefore){this.$elementFilestyle.append(this.htmlInput())}else{this.$elementFilestyle.prepend(this.htmlInput())}this.$elementFilestyle.find(".badge").remove();this.pushNameFiles();this.$elementFilestyle.find(".group-span-filestyle").addClass("input-group-btn")}}else{if(value===false){if(this.options.input){this.options.input=false;this.$elementFilestyle.find(":text").remove();var files=this.pushNameFiles();if(files.length>0&&this.options.badge){this.$elementFilestyle.find("label").append(' <span class="badge">'+files.length+"</span>")}this.$elementFilestyle.find(".group-span-filestyle").removeClass("input-group-btn")}}else{return this.options.input}}},size:function(value){if(value!==undefined){var btn=this.$elementFilestyle.find("label"),input=this.$elementFilestyle.find("input");btn.removeClass("btn-lg btn-sm");input.removeClass("input-lg input-sm");if(value!="nr"){btn.addClass("btn-"+value);input.addClass("input-"+value)}}else{return this.options.size}},placeholder:function(value){if(value!==undefined){this.options.placeholder=value;this.$elementFilestyle.find("input").attr("placeholder",value)}else{return this.options.placeholder}},buttonText:function(value){if(value!==undefined){this.options.buttonText=value;this.$elementFilestyle.find("label .buttonText").html(this.options.buttonText)}else{return this.options.buttonText}},buttonName:function(value){if(value!==undefined){this.options.buttonName=value;this.$elementFilestyle.find("label").attr({"class":"btn "+this.options.buttonName})}else{return this.options.buttonName}},iconName:function(value){if(value!==undefined){this.$elementFilestyle.find(".icon-span-filestyle").attr({"class":"icon-span-filestyle "+this.options.iconName})}else{return this.options.iconName}},htmlIcon:function(){if(this.options.icon){return'<span class="icon-span-filestyle '+this.options.iconName+'"></span> '}else{return""}},htmlInput:function(){if(this.options.input){return'<input type="text" class="form-control '+(this.options.size=="nr"?"":"input-"+this.options.size)+'" placeholder="'+this.options.placeholder+'" disabled> '}else{return""}},pushNameFiles:function(){var content="",files=[];if(this.$element[0].files===undefined){files[0]={name:this.$element[0]&&this.$element[0].value}}else{files=this.$element[0].files}for(var i=0;i<files.length;i++){content+=files[i].name.split("\\").pop()+", "}if(content!==""){this.$elementFilestyle.find(":text").val(content.replace(/\, $/g,""))}else{this.$elementFilestyle.find(":text").val("")}return files},constructor:function(){var _self=this,html="",id=_self.$element.attr("id"),files=[],btn="",$label;if(id===""||!id){id="filestyle-"+nextId;_self.$element.attr({id:id});nextId++}btn='<span class="group-span-filestyle '+(_self.options.input?"input-group-btn":"")+'"><label for="'+id+'" class="btn '+_self.options.buttonName+" "+(_self.options.size=="nr"?"":"btn-"+_self.options.size)+'" '+(_self.options.disabled?'disabled="true"':"")+">"+_self.htmlIcon()+'<span class="buttonText">'+_self.options.buttonText+"</span></label></span>";html=_self.options.buttonBefore?btn+_self.htmlInput():_self.htmlInput()+btn;_self.$elementFilestyle=$('<div class="bootstrap-filestyle input-group">'+html+"</div>");_self.$elementFilestyle.find(".group-span-filestyle").attr("tabindex","0").keypress(function(e){if(e.keyCode===13||e.charCode===32){_self.$elementFilestyle.find("label").click();return false}});_self.$element.css({position:"absolute",clip:"rect(0px 0px 0px 0px)"}).attr("tabindex","-1").after(_self.$elementFilestyle);if(_self.options.disabled){_self.$element.attr("disabled","true")}_self.$element.change(function(){var files=_self.pushNameFiles();if(_self.options.input==false&&_self.options.badge){if(_self.$elementFilestyle.find(".badge").length==0){_self.$elementFilestyle.find("label").append(' <span class="badge">'+files.length+"</span>")}else{if(files.length==0){_self.$elementFilestyle.find(".badge").remove()}else{_self.$elementFilestyle.find(".badge").html(files.length)}}}else{_self.$elementFilestyle.find(".badge").remove()}});if(window.navigator.userAgent.search(/firefox/i)>-1){_self.$elementFilestyle.find("label").click(function(){_self.$element.click();return false})}}};var old=$.fn.filestyle;$.fn.filestyle=function(option,value){var get="",element=this.each(function(){if($(this).attr("type")==="file"){var $this=$(this),data=$this.data("filestyle"),options=$.extend({},$.fn.filestyle.defaults,option,typeof option==="object"&&option);if(!data){$this.data("filestyle",(data=new Filestyle(this,options)));data.constructor()}if(typeof option==="string"){get=data[option](value)}}});if(typeof get!==undefined){return get}else{return element}};$.fn.filestyle.defaults={buttonText:"Choose file",iconName:"glyphicon glyphicon-folder-open",buttonName:"btn-default",size:"nr",input:true,badge:true,icon:true,buttonBefore:false,disabled:false,placeholder:""};$.fn.filestyle.noConflict=function(){$.fn.filestyle=old;return this};$(function(){$(".filestyle").each(function(){var $this=$(this),options={input:$this.attr("data-input")==="false"?false:true,icon:$this.attr("data-icon")==="false"?false:true,buttonBefore:$this.attr("data-buttonBefore")==="true"?true:false,disabled:$this.attr("data-disabled")==="true"?true:false,size:$this.attr("data-size"),buttonText:$this.attr("data-buttonText"),buttonName:$this.attr("data-buttonName"),iconName:$this.attr("data-iconName"),badge:$this.attr("data-badge")==="false"?false:true,placeholder:$this.attr("data-placeholder")};$this.filestyle(options)})})})(window.jQuery);
/*
 Highcharts JS v5.0.2 (2016-10-26)
 Data module

 (c) 2012-2016 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(p){"object"===typeof module&&module.exports?module.exports=p:p(Highcharts)})(function(p){(function(g){var p=g.win.document,m=g.each,z=g.pick,w=g.inArray,x=g.isNumber,A=g.splat,n,u=function(b,a){this.init(b,a)};g.extend(u.prototype,{init:function(b,a){this.options=b;this.chartOptions=a;this.columns=b.columns||this.rowsToColumns(b.rows)||[];this.firstRowAsNames=z(b.firstRowAsNames,!0);this.decimalRegex=b.decimalPoint&&new RegExp("^(-?[0-9]+)"+b.decimalPoint+"([0-9]+)$");this.rawColumns=[];
this.columns.length?this.dataFound():(this.parseCSV(),this.parseTable(),this.parseGoogleSpreadsheet())},getColumnDistribution:function(){var b=this.chartOptions,a=this.options,d=[],f=function(b){return(g.seriesTypes[b||"line"].prototype.pointArrayMap||[0]).length},e=b&&b.chart&&b.chart.type,c=[],k=[],t=0,h;m(b&&b.series||[],function(b){c.push(f(b.type||e))});m(a&&a.seriesMapping||[],function(b){d.push(b.x||0)});0===d.length&&d.push(0);m(a&&a.seriesMapping||[],function(a){var d=new n,r,v=c[t]||f(e),
q=g.seriesTypes[((b&&b.series||[])[t]||{}).type||e||"line"].prototype.pointArrayMap||["y"];d.addColumnReader(a.x,"x");for(r in a)a.hasOwnProperty(r)&&"x"!==r&&d.addColumnReader(a[r],r);for(h=0;h<v;h++)d.hasReader(q[h])||d.addColumnReader(void 0,q[h]);k.push(d);t++});a=g.seriesTypes[e||"line"].prototype.pointArrayMap;void 0===a&&(a=["y"]);this.valueCount={global:f(e),xColumns:d,individual:c,seriesBuilders:k,globalPointArrayMap:a}},dataFound:function(){this.options.switchRowsAndColumns&&(this.columns=
this.rowsToColumns(this.columns));this.getColumnDistribution();this.parseTypes();!1!==this.parsed()&&this.complete()},parseCSV:function(){var b=this,a=this.options,d=a.csv,f=this.columns,e=a.startRow||0,c=a.endRow||Number.MAX_VALUE,k=a.startColumn||0,t=a.endColumn||Number.MAX_VALUE,h,g,y=0;d&&(g=d.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split(a.lineDelimiter||"\n"),h=a.itemDelimiter||(-1!==d.indexOf("\t")?"\t":","),m(g,function(a,d){var g=b.trim(a),r=0===g.indexOf("#");d>=e&&d<=c&&!r&&""!==g&&(a=
a.split(h),m(a,function(b,a){a>=k&&a<=t&&(f[a-k]||(f[a-k]=[]),f[a-k][y]=b)}),y+=1)}),this.dataFound())},parseTable:function(){var b=this.options,a=b.table,d=this.columns,f=b.startRow||0,e=b.endRow||Number.MAX_VALUE,c=b.startColumn||0,k=b.endColumn||Number.MAX_VALUE;a&&("string"===typeof a&&(a=p.getElementById(a)),m(a.getElementsByTagName("tr"),function(b,a){a>=f&&a<=e&&m(b.children,function(b,e){("TD"===b.tagName||"TH"===b.tagName)&&e>=c&&e<=k&&(d[e-c]||(d[e-c]=[]),d[e-c][a-f]=b.innerHTML)})}),this.dataFound())},
parseGoogleSpreadsheet:function(){var b=this,a=this.options,d=a.googleSpreadsheetKey,f=this.columns,e=a.startRow||0,c=a.endRow||Number.MAX_VALUE,k=a.startColumn||0,g=a.endColumn||Number.MAX_VALUE,h,v;d&&jQuery.ajax({dataType:"json",url:"https://spreadsheets.google.com/feeds/cells/"+d+"/"+(a.googleSpreadsheetWorksheet||"od6")+"/public/values?alt\x3djson-in-script\x26callback\x3d?",error:a.error,success:function(a){a=a.feed.entry;var d,t=a.length,q=0,n=0,l;for(l=0;l<t;l++)d=a[l],q=Math.max(q,d.gs$cell.col),
n=Math.max(n,d.gs$cell.row);for(l=0;l<q;l++)l>=k&&l<=g&&(f[l-k]=[],f[l-k].length=Math.min(n,c-e));for(l=0;l<t;l++)d=a[l],h=d.gs$cell.row-1,v=d.gs$cell.col-1,v>=k&&v<=g&&h>=e&&h<=c&&(f[v-k][h-e]=d.content.$t);m(f,function(a){for(l=0;l<a.length;l++)void 0===a[l]&&(a[l]=null)});b.dataFound()}})},trim:function(b,a){"string"===typeof b&&(b=b.replace(/^\s+|\s+$/g,""),a&&/^[0-9\s]+$/.test(b)&&(b=b.replace(/\s/g,"")),this.decimalRegex&&(b=b.replace(this.decimalRegex,"$1.$2")));return b},parseTypes:function(){for(var b=
this.columns,a=b.length;a--;)this.parseColumn(b[a],a)},parseColumn:function(b,a){var d=this.rawColumns,f=this.columns,e=b.length,c,k,g,h,n=this.firstRowAsNames,m=-1!==w(a,this.valueCount.xColumns),r=[],p=this.chartOptions,q,u=(this.options.columnTypes||[])[a],p=m&&(p&&p.xAxis&&"category"===A(p.xAxis)[0].type||"string"===u);for(d[a]||(d[a]=[]);e--;)c=r[e]||b[e],g=this.trim(c),h=this.trim(c,!0),k=parseFloat(h),void 0===d[a][e]&&(d[a][e]=g),p||0===e&&n?b[e]=g:+h===k?(b[e]=k,31536E6<k&&"float"!==u?b.isDatetime=
!0:b.isNumeric=!0,void 0!==b[e+1]&&(q=k>b[e+1])):(k=this.parseDate(c),m&&x(k)&&"float"!==u?(r[e]=c,b[e]=k,b.isDatetime=!0,void 0!==b[e+1]&&(c=k>b[e+1],c!==q&&void 0!==q&&(this.alternativeFormat?(this.dateFormat=this.alternativeFormat,e=b.length,this.alternativeFormat=this.dateFormats[this.dateFormat].alternative):b.unsorted=!0),q=c)):(b[e]=""===g?null:g,0!==e&&(b.isDatetime||b.isNumeric)&&(b.mixed=!0)));m&&b.mixed&&(f[a]=d[a]);if(m&&q&&this.options.sort)for(a=0;a<f.length;a++)f[a].reverse(),n&&f[a].unshift(f[a].pop())},
dateFormats:{"YYYY-mm-dd":{regex:/^([0-9]{4})[\-\/\.]([0-9]{2})[\-\/\.]([0-9]{2})$/,parser:function(b){return Date.UTC(+b[1],b[2]-1,+b[3])}},"dd/mm/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(b){return Date.UTC(+b[3],b[2]-1,+b[1])},alternative:"mm/dd/YYYY"},"mm/dd/YYYY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,parser:function(b){return Date.UTC(+b[3],b[1]-1,+b[2])}},"dd/mm/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
parser:function(b){return Date.UTC(+b[3]+2E3,b[2]-1,+b[1])},alternative:"mm/dd/YY"},"mm/dd/YY":{regex:/^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,parser:function(b){return Date.UTC(+b[3]+2E3,b[1]-1,+b[2])}}},parseDate:function(b){var a=this.options.parseDate,d,f,e=this.options.dateFormat||this.dateFormat,c;if(a)d=a(b);else if("string"===typeof b){if(e)a=this.dateFormats[e],(c=b.match(a.regex))&&(d=a.parser(c));else for(f in this.dateFormats)if(a=this.dateFormats[f],c=b.match(a.regex)){this.dateFormat=
f;this.alternativeFormat=a.alternative;d=a.parser(c);break}c||(c=Date.parse(b),"object"===typeof c&&null!==c&&c.getTime?d=c.getTime()-6E4*c.getTimezoneOffset():x(c)&&(d=c-6E4*(new Date(c)).getTimezoneOffset()))}return d},rowsToColumns:function(b){var a,d,f,e,c;if(b)for(c=[],d=b.length,a=0;a<d;a++)for(e=b[a].length,f=0;f<e;f++)c[f]||(c[f]=[]),c[f][a]=b[a][f];return c},parsed:function(){if(this.options.parsed)return this.options.parsed.call(this,this.columns)},getFreeIndexes:function(b,a){var d,f=[],
e=[],c;for(d=0;d<b;d+=1)f.push(!0);for(b=0;b<a.length;b+=1)for(c=a[b].getReferencedColumnIndexes(),d=0;d<c.length;d+=1)f[c[d]]=!1;for(d=0;d<f.length;d+=1)f[d]&&e.push(d);return e},complete:function(){var b=this.columns,a,d=this.options,f,e,c,k,g=[],h;if(d.complete||d.afterComplete){for(c=0;c<b.length;c++)this.firstRowAsNames&&(b[c].name=b[c].shift());f=[];e=this.getFreeIndexes(b.length,this.valueCount.seriesBuilders);for(c=0;c<this.valueCount.seriesBuilders.length;c++)h=this.valueCount.seriesBuilders[c],
h.populateColumns(e)&&g.push(h);for(;0<e.length;){h=new n;h.addColumnReader(0,"x");c=w(0,e);-1!==c&&e.splice(c,1);for(c=0;c<this.valueCount.global;c++)h.addColumnReader(void 0,this.valueCount.globalPointArrayMap[c]);h.populateColumns(e)&&g.push(h)}0<g.length&&0<g[0].readers.length&&(h=b[g[0].readers[0].columnIndex],void 0!==h&&(h.isDatetime?a="datetime":h.isNumeric||(a="category")));if("category"===a)for(c=0;c<g.length;c++)for(h=g[c],e=0;e<h.readers.length;e++)"x"===h.readers[e].configName&&(h.readers[e].configName=
"name");for(c=0;c<g.length;c++){h=g[c];e=[];for(k=0;k<b[0].length;k++)e[k]=h.read(b,k);f[c]={data:e};h.name&&(f[c].name=h.name);"category"===a&&(f[c].turboThreshold=0)}b={series:f};a&&(b.xAxis={type:a},"category"===a&&(b.xAxis.uniqueNames=!1));d.complete&&d.complete(b);d.afterComplete&&d.afterComplete(b)}}});g.Data=u;g.data=function(b,a){return new u(b,a)};g.wrap(g.Chart.prototype,"init",function(b,a,d){var f=this;a&&a.data?g.data(g.extend(a.data,{afterComplete:function(e){var c,k;if(a.hasOwnProperty("series"))if("object"===
typeof a.series)for(c=Math.max(a.series.length,e.series.length);c--;)k=a.series[c]||{},a.series[c]=g.merge(k,e.series[c]);else delete a.series;a=g.merge(e,a);b.call(f,a,d)}}),a):b.call(f,a,d)});n=function(){this.readers=[];this.pointIsArray=!0};n.prototype.populateColumns=function(b){var a=!0;m(this.readers,function(a){void 0===a.columnIndex&&(a.columnIndex=b.shift())});m(this.readers,function(b){void 0===b.columnIndex&&(a=!1)});return a};n.prototype.read=function(b,a){var d=this.pointIsArray,f=d?
[]:{},e;m(this.readers,function(c){var e=b[c.columnIndex][a];d?f.push(e):f[c.configName]=e});void 0===this.name&&2<=this.readers.length&&(e=this.getReferencedColumnIndexes(),2<=e.length&&(e.shift(),e.sort(),this.name=b[e.shift()].name));return f};n.prototype.addColumnReader=function(b,a){this.readers.push({columnIndex:b,configName:a});"x"!==a&&"y"!==a&&void 0!==a&&(this.pointIsArray=!1)};n.prototype.getReferencedColumnIndexes=function(){var b,a=[],d;for(b=0;b<this.readers.length;b+=1)d=this.readers[b],
void 0!==d.columnIndex&&a.push(d.columnIndex);return a};n.prototype.hasReader=function(b){var a,d;for(a=0;a<this.readers.length;a+=1)if(d=this.readers[a],d.configName===b)return!0}})(p)});
/**
* @version: 1.3.21
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2015 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: https://www.improvely.com/
*/

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['moment', 'jquery', 'exports'], function(momentjs, $, exports) {
      root.daterangepicker = factory(root, exports, momentjs, $);
    });

  } else if (typeof exports !== 'undefined') {
    var momentjs = require('moment');
    var jQuery;
    try {
      jQuery = require('jquery');
    } catch (err) {
      jQuery = window.jQuery;
      if (!jQuery) throw new Error('jQuery dependency not found');
    }

    factory(root, exports, momentjs, jQuery);

  // Finally, as a browser global.
  } else {
    root.daterangepicker = factory(root, {}, root.moment, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, daterangepicker, moment, $) {

    var DateRangePicker = function (element, options, cb) {

        // by default, the daterangepicker element is placed at the bottom of HTML body
        this.parentEl = 'body';

        //element that triggered the date range picker
        this.element = $(element);

        //tracks visible state
        this.isShowing = false;

        //create the picker HTML object
        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar first left"></div>' +
                '<div class="calendar second right"></div>' +
                '<div class="ranges">' +
                  '<div class="range_inputs">' +
                    '<div class="daterangepicker_start_input">' +
                      '<label for="daterangepicker_start"></label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
                    '</div>' +
                    '<div class="daterangepicker_end_input">' +
                      '<label for="daterangepicker_end"></label>' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
                    '</div>' +
                    '<button class="applyBtn" disabled="disabled"></button>&nbsp;' +
                    '<button class="cancelBtn"></button>' +
                  '</div>' +
                '</div>' +
              '</div>';

        //custom options
        if (typeof options !== 'object' || options === null)
            options = {};

        this.parentEl = (typeof options === 'object' && options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(DRPTemplate).appendTo(this.parentEl);

        this.setOptions(options, cb);

        //event listeners
        this.container.find('.calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.updateMonthYear, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.updateMonthYear, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.updateTime, this));

        this.container.find('.ranges')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.showCalendars, this))
            .on('change.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsChanged, this))
            .on('keydown.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsKeydown, this))
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter.daterangepicker', 'li', $.proxy(this.enterRange, this))
            .on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

        if (this.element.is('input')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.updateFromControl, this),
                'keydown.daterangepicker': $.proxy(this.keydown, this)
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
        }

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setOptions: function(options, callback) {

            this.startDate = moment().startOf('day');
            this.endDate = moment().endOf('day');
            this.timeZone = moment().utcOffset();
            this.minDate = false;
            this.maxDate = false;
            this.dateLimit = false;

            this.showDropdowns = false;
            this.showWeekNumbers = false;
            this.timePicker = false;
            this.timePickerSeconds = false;
            this.timePickerIncrement = 30;
            this.timePicker12Hour = true;
            this.singleDatePicker = false;
            this.ranges = {};

            this.opens = 'right';
            if (this.element.hasClass('pull-right'))
                this.opens = 'left';

            this.drops = 'down';
            if (this.element.hasClass('dropup'))
                this.drops = 'up';

            this.buttonClasses = ['btn', 'btn-small btn-sm'];
            this.applyClass = 'btn-success';
            this.cancelClass = 'btn-default';

            this.format = 'MM/DD/YYYY';
            this.separator = ' - ';

            this.locale = {
                applyLabel: 'Apply',
                cancelLabel: 'Cancel',
                fromLabel: 'From',
                toLabel: 'To',
                weekLabel: 'W',
                customRangeLabel: 'Custom Range',
                daysOfWeek: moment.weekdaysMin(),
                monthNames: moment.monthsShort(),
                firstDay: moment.localeData()._week.dow
            };

            this.cb = function () { };

            if (typeof options.format === 'string')
                this.format = options.format;

            if (typeof options.separator === 'string')
                this.separator = options.separator;

            if (typeof options.startDate === 'string')
                this.startDate = moment(options.startDate, this.format);

            if (typeof options.endDate === 'string')
                this.endDate = moment(options.endDate, this.format);

            if (typeof options.minDate === 'string')
                this.minDate = moment(options.minDate, this.format);

            if (typeof options.maxDate === 'string')
                this.maxDate = moment(options.maxDate, this.format);

            if (typeof options.startDate === 'object')
                this.startDate = moment(options.startDate);

            if (typeof options.endDate === 'object')
                this.endDate = moment(options.endDate);

            if (typeof options.minDate === 'object')
                this.minDate = moment(options.minDate);

            if (typeof options.maxDate === 'object')
                this.maxDate = moment(options.maxDate);

            if (typeof options.applyClass === 'string')
                this.applyClass = options.applyClass;

            if (typeof options.cancelClass === 'string')
                this.cancelClass = options.cancelClass;

            if (typeof options.dateLimit === 'object')
                this.dateLimit = options.dateLimit;

            if (typeof options.locale === 'object') {

                if (typeof options.locale.daysOfWeek === 'object') {
                    // Create a copy of daysOfWeek to avoid modification of original
                    // options object for reusability in multiple daterangepicker instances
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }

                if (typeof options.locale.monthNames === 'object') {
                  this.locale.monthNames = options.locale.monthNames.slice();
                }

                if (typeof options.locale.firstDay === 'number') {
                  this.locale.firstDay = options.locale.firstDay;
                }

                if (typeof options.locale.applyLabel === 'string') {
                  this.locale.applyLabel = options.locale.applyLabel;
                }

                if (typeof options.locale.cancelLabel === 'string') {
                  this.locale.cancelLabel = options.locale.cancelLabel;
                }

                if (typeof options.locale.fromLabel === 'string') {
                  this.locale.fromLabel = options.locale.fromLabel;
                }

                if (typeof options.locale.toLabel === 'string') {
                  this.locale.toLabel = options.locale.toLabel;
                }

                if (typeof options.locale.weekLabel === 'string') {
                  this.locale.weekLabel = options.locale.weekLabel;
                }

                if (typeof options.locale.customRangeLabel === 'string') {
                  this.locale.customRangeLabel = options.locale.customRangeLabel;
                }
            }

            if (typeof options.opens === 'string')
                this.opens = options.opens;

            if (typeof options.drops === 'string')
                this.drops = options.drops;

            if (typeof options.showWeekNumbers === 'boolean') {
                this.showWeekNumbers = options.showWeekNumbers;
            }

            if (typeof options.buttonClasses === 'string') {
                this.buttonClasses = [options.buttonClasses];
            }

            if (typeof options.buttonClasses === 'object') {
                this.buttonClasses = options.buttonClasses;
            }

            if (typeof options.showDropdowns === 'boolean') {
                this.showDropdowns = options.showDropdowns;
            }

            if (typeof options.singleDatePicker === 'boolean') {
                this.singleDatePicker = options.singleDatePicker;
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                }
            }

            if (typeof options.timePicker === 'boolean') {
                this.timePicker = options.timePicker;
            }

            if (typeof options.timePickerSeconds === 'boolean') {
                this.timePickerSeconds = options.timePickerSeconds;
            }

            if (typeof options.timePickerIncrement === 'number') {
                this.timePickerIncrement = options.timePickerIncrement;
            }

            if (typeof options.timePicker12Hour === 'boolean') {
                this.timePicker12Hour = options.timePicker12Hour;
            }

            // update day names order to firstDay
            if (this.locale.firstDay != 0) {
                var iterator = this.locale.firstDay;
                while (iterator > 0) {
                    this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                    iterator--;
                }
            }

            var start, end, range;

            //if no start/end dates set, check if an input element contains initial values
            if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
                if ($(this.element).is('input[type=text]')) {
                    var val = $(this.element).val(),
                        split = val.split(this.separator);

                    start = end = null;

                    if (split.length == 2) {
                        start = moment(split[0], this.format);
                        end = moment(split[1], this.format);
                    } else if (this.singleDatePicker && val !== "") {
                        start = moment(val, this.format);
                        end = moment(val, this.format);
                    }
                    if (start !== null && end !== null) {
                        this.startDate = start;
                        this.endDate = end;
                    }
                }
            }

            // bind the time zone used to build the calendar to either the timeZone passed in through the options or the zone of the startDate (which will be the local time zone by default)
            if (typeof options.timeZone === 'string' || typeof options.timeZone === 'number') {
            	if (typeof options.timeZone === 'string' && typeof moment.tz !== 'undefined') {
            		this.timeZone = moment.tz.zone(options.timeZone).parse(new Date) * -1;	// Offset is positive if the timezone is behind UTC and negative if it is ahead.
            	} else {
            		this.timeZone = options.timeZone;
            	}
              this.startDate.utcOffset(this.timeZone);
              this.endDate.utcOffset(this.timeZone);
            } else {
                this.timeZone = moment(this.startDate).utcOffset();
            }

            if (typeof options.ranges === 'object') {
                for (range in options.ranges) {

                    if (typeof options.ranges[range][0] === 'string')
                        start = moment(options.ranges[range][0], this.format);
                    else
                        start = moment(options.ranges[range][0]);

                    if (typeof options.ranges[range][1] === 'string')
                        end = moment(options.ranges[range][1], this.format);
                    else
                        end = moment(options.ranges[range][1]);

                    // If we have a min/max date set, bound this range
                    // to it, but only if it would otherwise fall
                    // outside of the min/max.
                    if (this.minDate && start.isBefore(this.minDate))
                        start = moment(this.minDate);

                    if (this.maxDate && end.isAfter(this.maxDate))
                        end = moment(this.maxDate);

                    // If the end of the range is before the minimum (if min is set) OR
                    // the start of the range is after the max (also if set) don't display this
                    // range option.
                    if ((this.minDate && end.isBefore(this.minDate)) || (this.maxDate && start.isAfter(this.maxDate))) {
                        continue;
                    }

                    this.ranges[range] = [start, end];
                }

                var list = '<ul>';
                for (range in this.ranges) {
                    list += '<li>' + range + '</li>';
                }
                list += '<li>' + this.locale.customRangeLabel + '</li>';
                list += '</ul>';
                this.container.find('.ranges ul').remove();
                this.container.find('.ranges').prepend(list);
            }

            if (typeof callback === 'function') {
                this.cb = callback;
            }

            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }

            if (this.singleDatePicker) {
                this.opens = 'right';
                this.container.addClass('single');
                this.container.find('.calendar.right').show();
                this.container.find('.calendar.left').hide();
                if (!this.timePicker) {
                    this.container.find('.ranges').hide();
                } else {
                    this.container.find('.ranges .daterangepicker_start_input, .ranges .daterangepicker_end_input').hide();
                }
                if (!this.container.find('.calendar.right').hasClass('single'))
                    this.container.find('.calendar.right').addClass('single');
            } else {
                this.container.removeClass('single');
                this.container.find('.calendar.right').removeClass('single');
                this.container.find('.ranges').show();
            }

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.oldChosenLabel = this.chosenLabel;

            this.leftCalendar = {
                month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute(), this.startDate.second()]),
                calendar: []
            };

            this.rightCalendar = {
                month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute(), this.endDate.second()]),
                calendar: []
            };

            if (this.opens == 'right' || this.opens == 'center') {
                //swap calendar positions
                var first = this.container.find('.calendar.first');
                var second = this.container.find('.calendar.second');

                if (second.hasClass('single')) {
                    second.removeClass('single');
                    first.addClass('single');
                }

                first.removeClass('left').addClass('right');
                second.removeClass('right').addClass('left');

                if (this.singleDatePicker) {
                    first.show();
                    second.hide();
                }
            }

            if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
                this.container.addClass('show-calendar');
            }

            this.container.removeClass('opensleft opensright').addClass('opens' + this.opens);

            this.updateView();
            this.updateCalendars();

            //apply CSS classes and labels to buttons
            var c = this.container;
            $.each(this.buttonClasses, function (idx, val) {
                c.find('button').addClass(val);
            });
            this.container.find('.daterangepicker_start_input label').html(this.locale.fromLabel);
            this.container.find('.daterangepicker_end_input label').html(this.locale.toLabel);
            if (this.applyClass.length)
                this.container.find('.applyBtn').addClass(this.applyClass);
            if (this.cancelClass.length)
                this.container.find('.cancelBtn').addClass(this.cancelClass);
            this.container.find('.applyBtn').html(this.locale.applyLabel);
            this.container.find('.cancelBtn').html(this.locale.cancelLabel);
        },

        setStartDate: function(startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.format).utcOffset(this.timeZone);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            this.oldStartDate = this.startDate.clone();

            this.updateView();
            this.updateCalendars();
            this.updateInputText();
        },

        setEndDate: function(endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.format).utcOffset(this.timeZone);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            this.oldEndDate = this.endDate.clone();

            this.updateView();
            this.updateCalendars();
            this.updateInputText();
        },

        updateView: function () {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
            this.updateFormInputs();
        },

        updateFormInputs: function () {
            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
            this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }
        },

        updateFromControl: function () {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.separator),
                start = null,
                end = null;

            if(dateString.length === 2) {
                start = moment(dateString[0], this.format).utcOffset(this.timeZone);
                end = moment(dateString[1], this.format).utcOffset(this.timeZone);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.format).utcOffset(this.timeZone);
                end = start;
            }

            if (end.isBefore(start)) return;

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.startDate = start;
            this.endDate = end;

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.updateCalendars();
        },
        
        keydown: function (e) {
            //hide on tab or enter
        	if ((e.keyCode === 9) || (e.keyCode === 13)) {
        		this.hide();
        	}
        },

        notify: function () {
            this.updateView();
            this.cb(this.startDate, this.endDate, this.chosenLabel);
        },

        move: function () {
            var parentOffset = { top: 0, left: 0 },
            	containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }
            
            if (this.drops == 'up')
            	containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            else
            	containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        toggle: function (e) {
            if (this.element.hasClass('active')) {
                this.hide();
            } else {
                this.show();
            }
        },

        show: function (e) {
            if (this.isShowing) return;

            this.element.addClass('active');
            this.container.show();
            this.move();

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function (e) { this.outsideClick(e); }, this);
            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.daterangepicker', this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.daterangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.daterangepicker', this._outsideClickProxy);

            this.isShowing = true;
            this.element.trigger('show.daterangepicker', this);
        },

        outsideClick: function (e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-date').length
                ) return;
            this.hide();
        },

        hide: function (e) {
            if (!this.isShowing) return;

            $(document)
              .off('.daterangepicker');

            this.element.removeClass('active');
            this.container.hide();

            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.notify();

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.isShowing = false;
            this.element.trigger('hide.daterangepicker', this);
        },

        enterRange: function (e) {
            // mouse pointer has entered a range label
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
            }
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        // when a date is typed into the start to end date textboxes
        inputsChanged: function (e) {
            var el = $(e.target);
            var date = moment(el.val(), this.format);
            if (!date.isValid()) return;

            var startDate, endDate;
            if (el.attr('name') === 'daterangepicker_start') {
                startDate = (false !== this.minDate && date.isBefore(this.minDate)) ? this.minDate : date;
                endDate = this.endDate;
            } else {
                startDate = this.startDate;
                endDate = (false !== this.maxDate && date.isAfter(this.maxDate)) ? this.maxDate : date;
            }
            this.setCustomDates(startDate, endDate);
        },

        inputsKeydown: function(e) {
            if (e.keyCode === 13) {
                this.inputsChanged(e);
                this.notify();
            }
        },

        updateInputText: function() {
            if (this.element.is('input') && !this.singleDatePicker) {
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
                this.element.trigger('change');
            } else if (this.element.is('input')) {
                this.element.val(this.endDate.format(this.format));
                this.element.trigger('change');
            }
        },

        clickRange: function (e) {
            var label = e.target.innerHTML;
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];

                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();

                this.updateInputText();

                this.hideCalendars();
                this.hide();
                this.element.trigger('apply.daterangepicker', this);
            }
        },

        clickPrev: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function (e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            if (cal.hasClass('left')) {
                this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
            }
        },

        setCustomDates: function(startDate, endDate) {
            this.chosenLabel = this.locale.customRangeLabel;
            if (startDate.isAfter(endDate)) {
                var difference = this.endDate.diff(this.startDate);
                endDate = moment(startDate).add(difference, 'ms');
                if (this.maxDate && endDate.isAfter(this.maxDate)) {
                  endDate = this.maxDate.clone();
                }
            }
            this.startDate = startDate;
            this.endDate = endDate;

            this.updateView();
            this.updateCalendars();
        },

        clickDate: function (e) {
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');

            var startDate, endDate;
            if (cal.hasClass('left')) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
                if (typeof this.dateLimit === 'object') {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf('day');
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit === 'object') {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }

            if (this.singleDatePicker && cal.hasClass('left')) {
                endDate = startDate.clone();
            } else if (this.singleDatePicker && cal.hasClass('right')) {
                startDate = endDate.clone();
            }

            cal.find('td').removeClass('active');

            $(e.target).addClass('active');

            this.setCustomDates(startDate, endDate);

            if (!this.timePicker)
                endDate.endOf('day');

            if (this.singleDatePicker && !this.timePicker)
                this.clickApply();
        },

        clickApply: function (e) {
            this.updateInputText();
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function (e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.chosenLabel = this.oldChosenLabel;
            this.updateView();
            this.updateCalendars();
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        updateMonthYear: function (e) {
            var isLeft = $(e.target).closest('.calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft && !this.singleDatePicker) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }


            this[leftOrRight+'Calendar'].month.month(month).year(year);
            this.updateCalendars();
        },

        updateTime: function(e) {

            var cal = $(e.target).closest('.calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('.hourselect').val(), 10);
            var minute = parseInt(cal.find('.minuteselect').val(), 10);
            var second = 0;

            if (this.timePickerSeconds) {
                second = parseInt(cal.find('.secondselect').val(), 10);
            }

            if (this.timePicker12Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                if (this.singleDatePicker)
                    this.endDate = start.clone();
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.endDate = end;
                if (this.singleDatePicker)
                    this.startDate = end.clone();
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.updateView();
            this.updateCalendars();
        },

        updateCalendars: function () {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), this.leftCalendar.month.second(), 'left');
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), this.rightCalendar.month.second(), 'right');
            this.container.find('.calendar.left').empty().html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate, 'left'));
            this.container.find('.calendar.right').empty().html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.singleDatePicker ? this.minDate : this.startDate, this.maxDate, 'right'));

            this.container.find('.ranges li').removeClass('active');
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
                            .addClass('active').html();
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
                            .addClass('active').html();
                    }
                }
                i++;
            }
            if (customRange) {
                this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
                this.showCalendars();
            }
        },

        buildCalendar: function (month, year, hour, minute, second, side) {
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();

            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();

            var dayOfWeek = firstDay.day();

            var i;

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]).utcOffset(this.timeZone);

            var col, row;
            for (i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            return calendar;
        },

        renderDropdowns: function (selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var currentYear = selected.year();
            var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            var minYear = (minDate && minDate.year()) || (currentYear - 50);

            var monthHtml = '<select class="monthselect">';
            var inMinYear = currentYear == minYear;
            var inMaxYear = currentYear == maxYear;

            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" +
                        (m === currentMonth ? " selected='selected'" : "") +
                        ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";

            var yearHtml = '<select class="yearselect">';

            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' +
                    (y === currentYear ? ' selected="selected"' : '') +
                    '>' + y + '</option>';
            }

            yearHtml += '</select>';

            return monthHtml + yearHtml;
        },

        renderCalendar: function (calendar, selected, minDate, maxDate, side) {

            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if (!minDate || minDate.isBefore(calendar.firstDay)) {
                html += '<th class="prev available"><i class="fa fa-arrow-left icon icon-arrow-left glyphicon glyphicon-arrow-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if (!maxDate || maxDate.isAfter(calendar.lastDay)) {
                html += '<th class="next available"><i class="fa fa-arrow-right icon icon-arrow-right glyphicon glyphicon-arrow-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function (index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {
                    var cname = 'available ';
                    cname += (calendar[row][col].month() == calendar[1][1].month()) ? '' : 'off';

                    if ((minDate && calendar[row][col].isBefore(minDate, 'day')) || (maxDate && calendar[row][col].isAfter(maxDate, 'day'))) {
                        cname = ' off disabled ';
                    } else if (calendar[row][col].format('YYYY-MM-DD') == selected.format('YYYY-MM-DD')) {
                        cname += ' active ';
                        if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
                            cname += ' start-date ';
                        }
                        if (calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
                            cname += ' end-date ';
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += ' in-range ';
                        if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
                        if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
                    }

                    var title = 'r' + row + 'c' + col;
                    html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';
            html += '</div>';

            var i;
            if (this.timePicker) {

                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';

                // Disallow selections before the minDate or after the maxDate
                var min_hour = 0;
                var max_hour = 23;

                if (minDate && (side == 'left' || this.singleDatePicker) && selected.format('YYYY-MM-DD') == minDate.format('YYYY-MM-DD')) {
                    min_hour = minDate.hour();
                    if (selected.hour() < min_hour)
                        selected.hour(min_hour);
                    if (this.timePicker12Hour && min_hour >= 12 && selected.hour() >= 12)
                        min_hour -= 12;
                    if (this.timePicker12Hour && min_hour == 12)
                        min_hour = 1;
                }

                if (maxDate && (side == 'right' || this.singleDatePicker) && selected.format('YYYY-MM-DD') == maxDate.format('YYYY-MM-DD')) {
                    max_hour = maxDate.hour();
                    if (selected.hour() > max_hour)
                        selected.hour(max_hour);
                    if (this.timePicker12Hour && max_hour >= 12 && selected.hour() >= 12)
                        max_hour -= 12;
                }

                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12)
                        selected_hour -= 12;
                    if (selected_hour === 0)
                        selected_hour = 12;
                }

                for (i = start; i <= end; i++) {

                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                    } else if (i < min_hour || i > max_hour) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + i + '</option>';
                    }
                }

                html += '</select> : ';

                html += '<select class="minuteselect">';

                // Disallow selections before the minDate or after the maxDate
                var min_minute = 0;
                var max_minute = 59;

                if (minDate && (side == 'left' || this.singleDatePicker) && selected.format('YYYY-MM-DD h A') == minDate.format('YYYY-MM-DD h A')) {
                    min_minute = minDate.minute();
                    if (selected.minute() < min_minute)
                        selected.minute(min_minute);
                }

                if (maxDate && (side == 'right' || this.singleDatePicker) && selected.format('YYYY-MM-DD h A') == maxDate.format('YYYY-MM-DD h A')) {
                    max_minute = maxDate.minute();
                    if (selected.minute() > max_minute)
                        selected.minute(max_minute);
                }

                for (i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10)
                        num = '0' + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                    } else if (i < min_minute || i > max_minute) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + num + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + num + '</option>';
                    }
                }

                html += '</select> ';

                if (this.timePickerSeconds) {
                    html += ': <select class="secondselect">';

                    for (i = 0; i < 60; i += this.timePickerIncrement) {
                        var num = i;
                        if (num < 10)
                            num = '0' + num;
                        if (i == selected.second()) {
                            html += '<option value="' + i + '" selected="selected">' + num + '</option>';
                        } else {
                            html += '<option value="' + i + '">' + num + '</option>';
                        }
                    }

                    html += '</select>';
                }

                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';

                    // Disallow selection before the minDate or after the maxDate
                    var am_html = '';
                    var pm_html = '';

                    if (minDate && (side == 'left' || this.singleDatePicker) && selected.format('YYYY-MM-DD') == minDate.format('YYYY-MM-DD') && minDate.hour() >= 12) {
                        am_html = ' disabled="disabled" class="disabled"';
                    }

                    if (maxDate && (side == 'right' || this.singleDatePicker) && selected.format('YYYY-MM-DD') == maxDate.format('YYYY-MM-DD') && maxDate.hour() < 12) {
                        pm_html = ' disabled="disabled" class="disabled"';
                    }

                    if (selected.hour() >= 12) {
                        html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                    }
                    html += '</select>';
                }

                html += '</div>';

            }

            return html;

        },

        remove: function() {

            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData('daterangepicker');

        }

    };

    $.fn.daterangepicker = function (options, cb) {
        this.each(function () {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, options, cb));
        });
        return this;
    };

}));

/**
 * A Highcharts plugin for exporting data from a rendered chart as CSV, XLS or HTML table
 *
 * Author:   Torstein Honsi
 * Licence:  MIT
 * Version:  1.4.2
 */
/*global Highcharts, window, document, Blob */
(function (factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    } else {
        factory(Highcharts);
    }
})(function (Highcharts) {

    'use strict';

    var each = Highcharts.each,
        pick = Highcharts.pick,
        seriesTypes = Highcharts.seriesTypes,
        downloadAttrSupported = document.createElement('a').download !== undefined;

    Highcharts.setOptions({
        lang: {
            downloadCSV: 'Download CSV',
            downloadXLS: 'Download XLS',
            viewData: 'View data table'
        }
    });


    /**
     * Get the data rows as a two dimensional array
     */
    Highcharts.Chart.prototype.getDataRows = function () {
        var options = (this.options.exporting || {}).csv || {},
            xAxis = this.xAxis[0],
            rows = {},
            rowArr = [],
            dataRows,
            names = [],
            i,
            x,
            xTitle = xAxis.options.title && xAxis.options.title.text,

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            columnHeaderFormatter = options.columnHeaderFormatter || function (series, key, keyLength) {
                return series.name + (keyLength > 1 ? ' ('+ key + ')' : '');
            };

        // Loop the series and index values
        i = 0;
        each(this.series, function (series) {
            var keys = series.options.keys,
                pointArrayMap = keys || series.pointArrayMap || ['y'],
                valueCount = pointArrayMap.length,
                requireSorting = series.requireSorting,
                categoryMap = {},
                j;

            // Map the categories for value axes
            each(pointArrayMap, function (prop) {
                categoryMap[prop] = (series[prop + 'Axis'] && series[prop + 'Axis'].categories) || [];
            });

            if (series.options.includeInCSVExport !== false && series.visible !== false) { // #55
                j = 0;
                while (j < valueCount) {
                    names.push(columnHeaderFormatter(series, pointArrayMap[j], pointArrayMap.length));
                    j = j + 1;
                }

                each(series.points, function (point, pIdx) {
                    var key = requireSorting ? point.x : pIdx,
                        prop,
                        val;

                    j = 0;

                    if (!rows[key]) {
                        rows[key] = [];
                    }
                    rows[key].x = point.x;

                    // Pies, funnels, geo maps etc. use point name in X row
                    if (!series.xAxis || series.exportKey === 'name') {
                        rows[key].name = point.name;
                    }

                    while (j < valueCount) {
                        prop = pointArrayMap[j]; // y, z etc
                        val = point[prop];
                        rows[key][i + j] = pick(categoryMap[prop][val], val); // Pick a Y axis category if present
                        j = j + 1;
                    }

                });
                i = i + j;
            }
        });

        // Make a sortable array
        for (x in rows) {
            if (rows.hasOwnProperty(x)) {
                rowArr.push(rows[x]);
            }
        }
        // Sort it by X values
        rowArr.sort(function (a, b) {
            return a.x - b.x;
        });

        // Add header row
        if (!xTitle) {
            xTitle = xAxis.isDatetimeAxis ? 'DateTime' : 'Category';
        }
        dataRows = [[xTitle].concat(names)];

        // Add the category column
        each(rowArr, function (row) {

            var category = row.name;
            if (!category) {
                if (xAxis.isDatetimeAxis) {
                    if (row.x instanceof Date) {
                        row.x = row.x.getTime();
                    }
                    category = Highcharts.dateFormat(dateFormat, row.x);
                } else if (xAxis.categories) {
                    category = pick(xAxis.names[row.x], xAxis.categories[row.x], row.x)
                } else {
                    category = row.x;
                }
            }

            // Add the X/date/category
            row.unshift(category);
            dataRows.push(row);
        });

        return dataRows;
    };

    /**
     * Get a CSV string
     */
    Highcharts.Chart.prototype.getCSV = function (useLocalDecimalPoint) {
        var csv = '',
            rows = this.getDataRows(),
            options = (this.options.exporting || {}).csv || {},
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            lineDelimiter = options.lineDelimiter || '\n'; // '\n' isn't working with the js csv data extraction

        // Transform the rows to CSV
        each(rows, function (row, i) {
            var val = '',
                j = row.length,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
            while (j--) {
                val = row[j];
                if (typeof val === "string") {
                    val = '"' + val + '"';
                }
                if (typeof val === 'number') {
                    if (n === ',') {
                        val = val.toString().replace(".", ",");
                    }
                }
                row[j] = val;
            }
            // Add the values
            csv += row.join(itemDelimiter);

            // Add the line delimiter
            if (i < rows.length - 1) {
                csv += lineDelimiter;
            }
        });
        return csv;
    };

    /**
     * Build a HTML table with the data
     */
    Highcharts.Chart.prototype.getTable = function (useLocalDecimalPoint) {
        var html = '<table>',
            rows = this.getDataRows();

        // Transform the rows to HTML
        each(rows, function (row, i) {
            var tag = i ? 'td' : 'th',
                val,
                j,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';

            html += '<tr>';
            for (j = 0; j < row.length; j = j + 1) {
                val = row[j];
                // Add the cell
                if (typeof val === 'number') {
                    val = val.toString();
                    if (n === ',') {
                        val = val.replace('.', n);
                    }
                    html += '<' + tag + ' class="number">' + val + '</' + tag + '>';

                } else {
                    html += '<' + tag + '>' + (val === undefined ? '' : val) + '</' + tag + '>';
                }
            }

            html += '</tr>';
        });
        html += '</table>';
        return html;
    };

    function getContent(chart, href, extension, content, MIME) {
        var a,
            blobObject,
            name,
            options = (chart.options.exporting || {}).csv || {},
            url = options.url || 'http://www.highcharts.com/studies/csv-export/download.php';

        if (chart.options.exporting.filename) {
            name = chart.options.exporting.filename;
        } else if (chart.title) {
            name = chart.title.textStr.replace(/ /g, '-').toLowerCase();
        } else {
            name = 'chart';
        }

        // MS specific. Check this first because of bug with Edge (#76)
        if (window.Blob && window.navigator.msSaveOrOpenBlob) {
            // Falls to msSaveOrOpenBlob if download attribute is not supported
            blobObject = new Blob([content]);
            window.navigator.msSaveOrOpenBlob(blobObject, name + '.' + extension);

        // Download attribute supported
        } else if (downloadAttrSupported) {
            a = document.createElement('a');
            a.href = href;
            a.target = '_blank';
            a.download = name + '.' + extension;
            document.body.appendChild(a);
            a.click();
            a.remove();

        } else {
            // Fall back to server side handling
            Highcharts.post(url, {
                data: content,
                type: MIME,
                extension: extension
            });
        }
    }

    /**
     * Call this on click of 'Download CSV' button
     */
    Highcharts.Chart.prototype.downloadCSV = function () {
        var csv = this.getCSV(true);
        getContent(
            this,
            'data:text/csv,\uFEFF' + csv.replace(/\n/g, '%0A'),
            'csv',
            csv,
            'text/csv'
        );
    };

    /**
     * Call this on click of 'Download XLS' button
     */
    Highcharts.Chart.prototype.downloadXLS = function () {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
                '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
                '<x:Name>Ark1</x:Name>' +
                '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
                '<style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";}</style>' +
                '<meta name=ProgId content=Excel.Sheet>' +
                '<meta charset=UTF-8>' +
                '</head><body>' +
                this.getTable(true) +
                '</body></html>',
            base64 = function (s) { 
                return window.btoa(unescape(encodeURIComponent(s))); // #50
            };
        getContent(
            this,
            uri + base64(template),
            'xls',
            template,
            'application/vnd.ms-excel'
        );
    };

    /**
     * View the data in a table below the chart
     */
    Highcharts.Chart.prototype.viewData = function () {
        if (!this.insertedTable) {
            var div = document.createElement('div');
            div.className = 'highcharts-data-table';
            // Insert after the chart container
            this.renderTo.parentNode.insertBefore(div, this.renderTo.nextSibling);
            div.innerHTML = this.getTable();
            this.insertedTable = true;
        }
    };


    // Add "Download CSV" to the exporting menu. Use download attribute if supported, else
    // run a simple PHP script that returns a file. The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            textKey: 'downloadCSV',
            onclick: function () { this.downloadCSV(); }
        }, {
            textKey: 'downloadXLS',
            onclick: function () { this.downloadXLS(); }
        }, {
            textKey: 'viewData',
            onclick: function () { this.viewData(); }
        });
    }

    // Series specific
    if (seriesTypes.map) {
        seriesTypes.map.prototype.exportKey = 'name';
    }

});
/*
 Highcharts JS v5.0.2 (2016-10-26)
 Exporting module

 (c) 2010-2016 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(m){"object"===typeof module&&module.exports?module.exports=m:m(Highcharts)})(function(m){(function(f){var m=f.defaultOptions,n=f.doc,u=f.Chart,v=f.addEvent,D=f.removeEvent,E=f.fireEvent,r=f.createElement,B=f.discardElement,w=f.css,q=f.merge,C=f.pick,h=f.each,t=f.extend,G=f.splat,H=f.isTouchDevice,F=f.win,I=f.Renderer.prototype.symbols;t(m.lang,{printChart:"Print chart",downloadPNG:"Download PNG image",downloadJPEG:"Download JPEG image",downloadPDF:"Download PDF document",downloadSVG:"Download SVG vector image",
contextButtonTitle:"Chart context menu"});m.navigation={buttonOptions:{theme:{},symbolSize:14,symbolX:12.5,symbolY:10.5,align:"right",buttonSpacing:3,height:22,verticalAlign:"top",width:24}};q(!0,m.navigation,{menuStyle:{border:"1px solid #999999",background:"#ffffff",padding:"5px 0"},menuItemStyle:{padding:"0.5em 1em",background:"none",color:"#333333",fontSize:H?"14px":"11px",transition:"background 250ms, color 250ms"},menuItemHoverStyle:{background:"#335cad",color:"#ffffff"},buttonOptions:{symbolFill:"#666666",
symbolStroke:"#666666",symbolStrokeWidth:3,theme:{fill:"#ffffff",stroke:"none",padding:5}}});m.exporting={type:"image/png",url:"https://export.highcharts.com/",printMaxWidth:780,scale:2,buttons:{contextButton:{className:"highcharts-contextbutton",menuClassName:"highcharts-contextmenu",symbol:"menu",_titleKey:"contextButtonTitle",menuItems:[{textKey:"printChart",onclick:function(){this.print()}},{separator:!0},{textKey:"downloadPNG",onclick:function(){this.exportChart()}},{textKey:"downloadJPEG",onclick:function(){this.exportChart({type:"image/jpeg"})}},
{textKey:"downloadPDF",onclick:function(){this.exportChart({type:"application/pdf"})}},{textKey:"downloadSVG",onclick:function(){this.exportChart({type:"image/svg+xml"})}}]}}};f.post=function(a,b,e){var c;a=r("form",q({method:"post",action:a,enctype:"multipart/form-data"},e),{display:"none"},n.body);for(c in b)r("input",{type:"hidden",name:c,value:b[c]},null,a);a.submit();B(a)};t(u.prototype,{sanitizeSVG:function(a){a=a.replace(/zIndex="[^"]+"/g,"").replace(/isShadow="[^"]+"/g,"").replace(/symbolName="[^"]+"/g,
"").replace(/jQuery[0-9]+="[^"]+"/g,"").replace(/url\(("|&quot;)(\S+)("|&quot;)\)/g,"url($2)").replace(/url\([^#]+#/g,"url(#").replace(/<svg /,'\x3csvg xmlns:xlink\x3d"http://www.w3.org/1999/xlink" ').replace(/ (NS[0-9]+\:)?href=/g," xlink:href\x3d").replace(/\n/," ").replace(/<\/svg>.*?$/,"\x3c/svg\x3e").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g,'$1\x3d"rgb($2)" $1-opacity\x3d"$3"').replace(/&nbsp;/g,"\u00a0").replace(/&shy;/g,"\u00ad");return a=a.replace(/<IMG /g,
"\x3cimage ").replace(/<(\/?)TITLE>/g,"\x3c$1title\x3e").replace(/height=([^" ]+)/g,'height\x3d"$1"').replace(/width=([^" ]+)/g,'width\x3d"$1"').replace(/hc-svg-href="([^"]+)">/g,'xlink:href\x3d"$1"/\x3e').replace(/ id=([^" >]+)/g,' id\x3d"$1"').replace(/class=([^" >]+)/g,'class\x3d"$1"').replace(/ transform /g," ").replace(/:(path|rect)/g,"$1").replace(/style="([^"]+)"/g,function(a){return a.toLowerCase()})},getChartHTML:function(){return this.container.innerHTML},getSVG:function(a){var b=this,e,
c,g,x,k,d=q(b.options,a),p=d.exporting.allowHTML;n.createElementNS||(n.createElementNS=function(a,b){return n.createElement(b)});c=r("div",null,{position:"absolute",top:"-9999em",width:b.chartWidth+"px",height:b.chartHeight+"px"},n.body);g=b.renderTo.style.width;k=b.renderTo.style.height;g=d.exporting.sourceWidth||d.chart.width||/px$/.test(g)&&parseInt(g,10)||600;k=d.exporting.sourceHeight||d.chart.height||/px$/.test(k)&&parseInt(k,10)||400;t(d.chart,{animation:!1,renderTo:c,forExport:!0,renderer:"SVGRenderer",
width:g,height:k});d.exporting.enabled=!1;delete d.data;d.series=[];h(b.series,function(a){x=q(a.userOptions,{animation:!1,enableMouseTracking:!1,showCheckbox:!1,visible:a.visible});x.isInternal||d.series.push(x)});a&&h(["xAxis","yAxis"],function(b){h(G(a[b]),function(a,c){d[b][c]=q(d[b][c],a)})});e=new f.Chart(d,b.callback);h(["xAxis","yAxis"],function(a){h(b[a],function(b,c){c=e[a][c];var d=b.getExtremes();b=d.userMin;d=d.userMax;!c||void 0===b&&void 0===d||c.setExtremes(b,d,!0,!1)})});g=e.getChartHTML();
d=null;e.destroy();B(c);p&&(c=g.match(/<\/svg>(.*?$)/))&&(c='\x3cforeignObject x\x3d"0" y\x3d"0" width\x3d"200" height\x3d"200"\x3e\x3cbody xmlns\x3d"http://www.w3.org/1999/xhtml"\x3e'+c[1]+"\x3c/body\x3e\x3c/foreignObject\x3e",g=g.replace("\x3c/svg\x3e",c+"\x3c/svg\x3e"));g=this.sanitizeSVG(g);return g=g.replace(/(url\(#highcharts-[0-9]+)&quot;/g,"$1").replace(/&quot;/g,"'")},getSVGForExport:function(a,b){var e=this.options.exporting;return this.getSVG(q({chart:{borderRadius:0}},e.chartOptions,b,
{exporting:{sourceWidth:a&&a.sourceWidth||e.sourceWidth,sourceHeight:a&&a.sourceHeight||e.sourceHeight}}))},exportChart:function(a,b){b=this.getSVGForExport(a,b);a=q(this.options.exporting,a);f.post(a.url,{filename:a.filename||"chart",type:a.type,width:a.width||0,scale:a.scale,svg:b},a.formAttributes)},print:function(){var a=this,b=a.container,e=[],c=b.parentNode,g=n.body,f=g.childNodes,k=a.options.exporting.printMaxWidth,d,p;if(!a.isPrinting){a.isPrinting=!0;a.pointer.reset(null,0);E(a,"beforePrint");
if(p=k&&a.chartWidth>k)d=[a.options.chart.width,void 0,!1],a.setSize(k,void 0,!1);h(f,function(a,b){1===a.nodeType&&(e[b]=a.style.display,a.style.display="none")});g.appendChild(b);F.focus();F.print();setTimeout(function(){c.appendChild(b);h(f,function(a,b){1===a.nodeType&&(a.style.display=e[b])});a.isPrinting=!1;p&&a.setSize.apply(a,d);E(a,"afterPrint")},1E3)}},contextMenu:function(a,b,e,c,g,f,k){var d=this,p=d.options.navigation,m=d.chartWidth,q=d.chartHeight,x="cache-"+a,l=d[x],y=Math.max(g,f),
z,A,u=function(b){d.pointer.inClass(b.target,a)||A()};l||(d[x]=l=r("div",{className:a},{position:"absolute",zIndex:1E3,padding:y+"px"},d.container),z=r("div",{className:"highcharts-menu"},null,l),w(z,t({MozBoxShadow:"3px 3px 10px #888",WebkitBoxShadow:"3px 3px 10px #888",boxShadow:"3px 3px 10px #888"},p.menuStyle)),A=function(){w(l,{display:"none"});k&&k.setState(0);d.openMenu=!1},v(l,"mouseleave",function(){l.hideTimer=setTimeout(A,500)}),v(l,"mouseenter",function(){clearTimeout(l.hideTimer)}),v(n,
"mouseup",u),v(d,"destroy",function(){D(n,"mouseup",u)}),h(b,function(a){if(a){var b;a.separator?b=r("hr",null,null,z):(b=r("div",{className:"highcharts-menu-item",onclick:function(b){b&&b.stopPropagation();A();a.onclick&&a.onclick.apply(d,arguments)},innerHTML:a.text||d.options.lang[a.textKey]},null,z),b.onmouseover=function(){w(this,p.menuItemHoverStyle)},b.onmouseout=function(){w(this,p.menuItemStyle)},w(b,t({cursor:"pointer"},p.menuItemStyle)));d.exportDivElements.push(b)}}),d.exportDivElements.push(z,
l),d.exportMenuWidth=l.offsetWidth,d.exportMenuHeight=l.offsetHeight);b={display:"block"};e+d.exportMenuWidth>m?b.right=m-e-g-y+"px":b.left=e-y+"px";c+f+d.exportMenuHeight>q&&"top"!==k.alignOptions.verticalAlign?b.bottom=q-c-y+"px":b.top=c+f-y+"px";w(l,b);d.openMenu=!0},addButton:function(a){var b=this,e=b.renderer,c=q(b.options.navigation.buttonOptions,a),f=c.onclick,m=c.menuItems,k,d,p=c.symbolSize||12;b.btnCount||(b.btnCount=0);b.exportDivElements||(b.exportDivElements=[],b.exportSVGElements=[]);
if(!1!==c.enabled){var h=c.theme,n=h.states,r=n&&n.hover,n=n&&n.select,l;delete h.states;f?l=function(a){a.stopPropagation();f.call(b,a)}:m&&(l=function(){b.contextMenu(d.menuClassName,m,d.translateX,d.translateY,d.width,d.height,d);d.setState(2)});c.text&&c.symbol?h.paddingLeft=C(h.paddingLeft,25):c.text||t(h,{width:c.width,height:c.height,padding:0});d=e.button(c.text,0,0,l,h,r,n).addClass(a.className).attr({"stroke-linecap":"round",title:b.options.lang[c._titleKey],zIndex:3});d.menuClassName=a.menuClassName||
"highcharts-menu-"+b.btnCount++;c.symbol&&(k=e.symbol(c.symbol,c.symbolX-p/2,c.symbolY-p/2,p,p).addClass("highcharts-button-symbol").attr({zIndex:1}).add(d),k.attr({stroke:c.symbolStroke,fill:c.symbolFill,"stroke-width":c.symbolStrokeWidth||1}));d.add().align(t(c,{width:d.width,x:C(c.x,b.buttonOffset)}),!0,"spacingBox");b.buttonOffset+=(d.width+c.buttonSpacing)*("right"===c.align?-1:1);b.exportSVGElements.push(d,k)}},destroyExport:function(a){var b=a?a.target:this;a=b.exportSVGElements;var e=b.exportDivElements;
a&&(h(a,function(a,e){a&&(a.onclick=a.ontouchstart=null,b.exportSVGElements[e]=a.destroy())}),a.length=0);e&&(h(e,function(a,e){clearTimeout(a.hideTimer);D(a,"mouseleave");b.exportDivElements[e]=a.onmouseout=a.onmouseover=a.ontouchstart=a.onclick=null;B(a)}),e.length=0)}});I.menu=function(a,b,e,c){return["M",a,b+2.5,"L",a+e,b+2.5,"M",a,b+c/2+.5,"L",a+e,b+c/2+.5,"M",a,b+c-1.5,"L",a+e,b+c-1.5]};u.prototype.renderExporting=function(){var a,b=this.options.exporting,e=b.buttons,c=this.isDirtyExporting||
!this.exportSVGElements;this.buttonOffset=0;this.isDirtyExporting&&this.destroyExport();if(c&&!1!==b.enabled){for(a in e)this.addButton(e[a]);this.isDirtyExporting=!1}v(this,"destroy",this.destroyExport)};u.prototype.callbacks.push(function(a){a.renderExporting();v(a,"redraw",a.renderExporting);h(["exporting","navigation"],function(b){a[b]={update:function(e,c){a.isDirtyExporting=!0;q(!0,a.options[b],e);C(c,!0)&&a.redraw()}}})})})(m)});
!function e(t,n,r){function i(s,a){if(!n[s]){if(!t[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(o)return o(s,!0);var l=new Error("Cannot find module '"+s+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[s]={exports:{}};t[s][0].call(u.exports,function(e){var n=t[s][1][e];return i(n?n:e)},u,u.exports,e,t,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s]);return i}({1:[function(e,t){!function(){"use strict";function e(t,n){function i(e,t){return function(){return e.apply(t,arguments)}}var o;if(n=n||{},this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=n.touchBoundary||10,this.layer=t,this.tapDelay=n.tapDelay||200,this.tapTimeout=n.tapTimeout||700,!e.notNeeded(t)){for(var s=["onMouse","onClick","onTouchStart","onTouchMove","onTouchEnd","onTouchCancel"],a=this,c=0,l=s.length;l>c;c++)a[s[c]]=i(a[s[c]],a);r&&(t.addEventListener("mouseover",this.onMouse,!0),t.addEventListener("mousedown",this.onMouse,!0),t.addEventListener("mouseup",this.onMouse,!0)),t.addEventListener("click",this.onClick,!0),t.addEventListener("touchstart",this.onTouchStart,!1),t.addEventListener("touchmove",this.onTouchMove,!1),t.addEventListener("touchend",this.onTouchEnd,!1),t.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(t.removeEventListener=function(e,n,r){var i=Node.prototype.removeEventListener;"click"===e?i.call(t,e,n.hijacked||n,r):i.call(t,e,n,r)},t.addEventListener=function(e,n,r){var i=Node.prototype.addEventListener;"click"===e?i.call(t,e,n.hijacked||(n.hijacked=function(e){e.propagationStopped||n(e)}),r):i.call(t,e,n,r)}),"function"==typeof t.onclick&&(o=t.onclick,t.addEventListener("click",function(e){o(e)},!1),t.onclick=null)}}var n=navigator.userAgent.indexOf("Windows Phone")>=0,r=navigator.userAgent.indexOf("Android")>0&&!n,i=/iP(ad|hone|od)/.test(navigator.userAgent)&&!n,o=i&&/OS 4_\d(_\d)?/.test(navigator.userAgent),s=i&&/OS [6-7]_\d/.test(navigator.userAgent),a=navigator.userAgent.indexOf("BB10")>0;e.prototype.needsClick=function(e){switch(e.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(e.disabled)return!0;break;case"input":if(i&&"file"===e.type||e.disabled)return!0;break;case"label":case"iframe":case"video":return!0}return/\bneedsclick\b/.test(e.className)},e.prototype.needsFocus=function(e){switch(e.nodeName.toLowerCase()){case"textarea":return!0;case"select":return!r;case"input":switch(e.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!e.disabled&&!e.readOnly;default:return/\bneedsfocus\b/.test(e.className)}},e.prototype.sendClick=function(e,t){var n,r;document.activeElement&&document.activeElement!==e&&document.activeElement.blur(),r=t.changedTouches[0],n=document.createEvent("MouseEvents"),n.initMouseEvent(this.determineEventType(e),!0,!0,window,1,r.screenX,r.screenY,r.clientX,r.clientY,!1,!1,!1,!1,0,null),n.forwardedTouchEvent=!0,e.dispatchEvent(n)},e.prototype.determineEventType=function(e){return r&&"select"===e.tagName.toLowerCase()?"mousedown":"click"},e.prototype.focus=function(e){var t;i&&e.setSelectionRange&&0!==e.type.indexOf("date")&&"time"!==e.type&&"month"!==e.type?(t=e.value.length,e.setSelectionRange(t,t)):e.focus()},e.prototype.updateScrollParent=function(e){var t,n;if(t=e.fastClickScrollParent,!t||!t.contains(e)){n=e;do{if(n.scrollHeight>n.offsetHeight){t=n,e.fastClickScrollParent=n;break}n=n.parentElement}while(n)}t&&(t.fastClickLastScrollTop=t.scrollTop)},e.prototype.getTargetElementFromEventTarget=function(e){return e.nodeType===Node.TEXT_NODE?e.parentNode:e},e.prototype.onTouchStart=function(e){var t,n,r;if(e.targetTouches.length>1)return!0;if(t=this.getTargetElementFromEventTarget(e.target),n=e.targetTouches[0],i){if(r=window.getSelection(),r.rangeCount&&!r.isCollapsed)return!0;if(!o){if(n.identifier&&n.identifier===this.lastTouchIdentifier)return e.preventDefault(),!1;this.lastTouchIdentifier=n.identifier,this.updateScrollParent(t)}}return this.trackingClick=!0,this.trackingClickStart=e.timeStamp,this.targetElement=t,this.touchStartX=n.pageX,this.touchStartY=n.pageY,e.timeStamp-this.lastClickTime<this.tapDelay&&e.preventDefault(),!0},e.prototype.touchHasMoved=function(e){var t=e.changedTouches[0],n=this.touchBoundary;return Math.abs(t.pageX-this.touchStartX)>n||Math.abs(t.pageY-this.touchStartY)>n?!0:!1},e.prototype.onTouchMove=function(e){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(e.target)||this.touchHasMoved(e))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},e.prototype.findControl=function(e){return void 0!==e.control?e.control:e.htmlFor?document.getElementById(e.htmlFor):e.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},e.prototype.onTouchEnd=function(e){var t,n,a,c,l,u=this.targetElement;if(!this.trackingClick)return!0;if(e.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0,!0;if(e.timeStamp-this.trackingClickStart>this.tapTimeout)return!0;if(this.cancelNextClick=!1,this.lastClickTime=e.timeStamp,n=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,s&&(l=e.changedTouches[0],u=document.elementFromPoint(l.pageX-window.pageXOffset,l.pageY-window.pageYOffset)||u,u.fastClickScrollParent=this.targetElement.fastClickScrollParent),a=u.tagName.toLowerCase(),"label"===a){if(t=this.findControl(u)){if(this.focus(u),r)return!1;u=t}}else if(this.needsFocus(u))return e.timeStamp-n>100||i&&window.top!==window&&"input"===a?(this.targetElement=null,!1):(this.focus(u),this.sendClick(u,e),i&&"select"===a||(this.targetElement=null,e.preventDefault()),!1);return i&&!o&&(c=u.fastClickScrollParent,c&&c.fastClickLastScrollTop!==c.scrollTop)?!0:(this.needsClick(u)||(e.preventDefault(),this.sendClick(u,e)),!1)},e.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},e.prototype.onMouse=function(e){return this.targetElement?e.forwardedTouchEvent?!0:e.cancelable&&(!this.needsClick(this.targetElement)||this.cancelNextClick)?(e.stopImmediatePropagation?e.stopImmediatePropagation():e.propagationStopped=!0,e.stopPropagation(),e.preventDefault(),!1):!0:!0},e.prototype.onClick=function(e){var t;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===e.target.type&&0===e.detail?!0:(t=this.onMouse(e),t||(this.targetElement=null),t)},e.prototype.destroy=function(){var e=this.layer;r&&(e.removeEventListener("mouseover",this.onMouse,!0),e.removeEventListener("mousedown",this.onMouse,!0),e.removeEventListener("mouseup",this.onMouse,!0)),e.removeEventListener("click",this.onClick,!0),e.removeEventListener("touchstart",this.onTouchStart,!1),e.removeEventListener("touchmove",this.onTouchMove,!1),e.removeEventListener("touchend",this.onTouchEnd,!1),e.removeEventListener("touchcancel",this.onTouchCancel,!1)},e.notNeeded=function(e){var t,n,i,o;if("undefined"==typeof window.ontouchstart)return!0;if(n=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1]){if(!r)return!0;if(t=document.querySelector("meta[name=viewport]")){if(-1!==t.content.indexOf("user-scalable=no"))return!0;if(n>31&&document.documentElement.scrollWidth<=window.outerWidth)return!0}}if(a&&(i=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/),i[1]>=10&&i[2]>=3&&(t=document.querySelector("meta[name=viewport]")))){if(-1!==t.content.indexOf("user-scalable=no"))return!0;if(document.documentElement.scrollWidth<=window.outerWidth)return!0}return"none"===e.style.msTouchAction||"manipulation"===e.style.touchAction?!0:(o=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1],o>=27&&(t=document.querySelector("meta[name=viewport]"),t&&(-1!==t.content.indexOf("user-scalable=no")||document.documentElement.scrollWidth<=window.outerWidth))?!0:"none"===e.style.touchAction||"manipulation"===e.style.touchAction?!0:!1)},e.attach=function(t,n){return new e(t,n)},"function"==typeof define&&"object"==typeof define.amd&&define.amd?define(function(){return e}):"undefined"!=typeof t&&t.exports?(t.exports=e.attach,t.exports.FastClick=e):window.FastClick=e}()},{}],2:[function(e){window.Origami={fastclick:e("./bower_components/fastclick/lib/fastclick.js")}},{"./bower_components/fastclick/lib/fastclick.js":1}]},{},[2]);;(function() {function trigger(){document.dispatchEvent(new CustomEvent('o.load'))};document.addEventListener('load',trigger);if (document.readyState==='ready') trigger();}());(function() {function trigger(){document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'))};document.addEventListener('DOMContentLoaded',trigger);if (document.readyState==='interactive') trigger();}())
/*
 Highcharts JS v5.0.2 (2016-10-26)

 (c) 2009-2016 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(M,a){"object"===typeof module&&module.exports?module.exports=M.document?a(M):a:M.Highcharts=a(M)})("undefined"!==typeof window?window:this,function(M){M=function(){var a=window,D=a.document,z=a.navigator&&a.navigator.userAgent||"",F=D&&D.createElementNS&&!!D.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,J=/(edge|msie|trident)/i.test(z)&&!window.opera,m=!F,f=/Firefox/.test(z),h=f&&4>parseInt(z.split("Firefox/")[1],10);return a.Highcharts?a.Highcharts.error(16,!0):{product:"Highcharts",
version:"5.0.2",deg2rad:2*Math.PI/360,doc:D,hasBidiBug:h,hasTouch:D&&void 0!==D.documentElement.ontouchstart,isMS:J,isWebKit:/AppleWebKit/.test(z),isFirefox:f,isTouchDevice:/(Mobile|Android|Windows Phone)/.test(z),SVG_NS:"http://www.w3.org/2000/svg",idCounter:0,chartCount:0,seriesTypes:{},symbolSizes:{},svg:F,vml:m,win:a,charts:[],marginNames:["plotTop","marginRight","marginBottom","plotLeft"],noop:function(){}}}();(function(a){var D=[],z=a.charts,F=a.doc,J=a.win;a.error=function(a,f){a="Highcharts error #"+
a+": www.highcharts.com/errors/"+a;if(f)throw Error(a);J.console&&console.log(a)};a.Fx=function(a,f,h){this.options=f;this.elem=a;this.prop=h};a.Fx.prototype={dSetter:function(){var a=this.paths[0],f=this.paths[1],h=[],q=this.now,n=a.length,k;if(1===q)h=this.toD;else if(n===f.length&&1>q)for(;n--;)k=parseFloat(a[n]),h[n]=isNaN(k)?a[n]:q*parseFloat(f[n]-k)+k;else h=f;this.elem.attr("d",h)},update:function(){var a=this.elem,f=this.prop,h=this.now,q=this.options.step;if(this[f+"Setter"])this[f+"Setter"]();
else a.attr?a.element&&a.attr(f,h):a.style[f]=h+this.unit;q&&q.call(a,h,this)},run:function(a,f,h){var m=this,n=function(a){return n.stopped?!1:m.step(a)},k;this.startTime=+new Date;this.start=a;this.end=f;this.unit=h;this.now=this.start;this.pos=0;n.elem=this.elem;n()&&1===D.push(n)&&(n.timerId=setInterval(function(){for(k=0;k<D.length;k++)D[k]()||D.splice(k--,1);D.length||clearInterval(n.timerId)},13))},step:function(a){var f=+new Date,h,m=this.options;h=this.elem;var n=m.complete,k=m.duration,
v=m.curAnim,d;if(h.attr&&!h.element)h=!1;else if(a||f>=k+this.startTime){this.now=this.end;this.pos=1;this.update();a=v[this.prop]=!0;for(d in v)!0!==v[d]&&(a=!1);a&&n&&n.call(h);h=!1}else this.pos=m.easing((f-this.startTime)/k),this.now=this.start+(this.end-this.start)*this.pos,this.update(),h=!0;return h},initPath:function(m,f,h){function q(a){for(l=a.length;l--;)"M"!==a[l]&&"L"!==a[l]||a.splice(l+1,0,a[l+1],a[l+2],a[l+1],a[l+2])}function n(a,b){for(;a.length<c;){a[0]=b[c-a.length];var e=a.slice(0,
B);[].splice.apply(a,[0,0].concat(e));u&&(e=a.slice(a.length-B),[].splice.apply(a,[a.length,0].concat(e)),l--)}a[0]="M"}function k(a,b){for(var t=(c-a.length)/B;0<t&&t--;)e=a.slice().splice(a.length/L-B,B*L),e[0]=b[c-B-t*B],w&&(e[B-6]=e[B-2],e[B-5]=e[B-1]),[].splice.apply(a,[a.length/L,0].concat(e)),u&&t--}f=f||"";var v,d=m.startX,g=m.endX,w=-1<f.indexOf("C"),B=w?7:3,c,e,l;f=f.split(" ");h=h.slice();var u=m.isArea,L=u?2:1,b;w&&(q(f),q(h));if(d&&g){for(l=0;l<d.length;l++)if(d[l]===g[0]){v=l;break}else if(d[0]===
g[g.length-d.length+l]){v=l;b=!0;break}void 0===v&&(f=[])}f.length&&a.isNumber(v)&&(c=h.length+v*L*B,b?(n(f,h),k(h,f)):(n(h,f),k(f,h)));return[f,h]}};a.extend=function(a,f){var h;a||(a={});for(h in f)a[h]=f[h];return a};a.merge=function(){var m,f=arguments,h,q={},n=function(k,f){var d,g;"object"!==typeof k&&(k={});for(g in f)f.hasOwnProperty(g)&&(d=f[g],a.isObject(d,!0)&&"renderTo"!==g&&"number"!==typeof d.nodeType?k[g]=n(k[g]||{},d):k[g]=f[g]);return k};!0===f[0]&&(q=f[1],f=Array.prototype.slice.call(f,
2));h=f.length;for(m=0;m<h;m++)q=n(q,f[m]);return q};a.pInt=function(a,f){return parseInt(a,f||10)};a.isString=function(a){return"string"===typeof a};a.isArray=function(a){a=Object.prototype.toString.call(a);return"[object Array]"===a||"[object Array Iterator]"===a};a.isObject=function(m,f){return m&&"object"===typeof m&&(!f||!a.isArray(m))};a.isNumber=function(a){return"number"===typeof a&&!isNaN(a)};a.erase=function(a,f){for(var h=a.length;h--;)if(a[h]===f){a.splice(h,1);break}};a.defined=function(a){return void 0!==
a&&null!==a};a.attr=function(m,f,h){var q,n;if(a.isString(f))a.defined(h)?m.setAttribute(f,h):m&&m.getAttribute&&(n=m.getAttribute(f));else if(a.defined(f)&&a.isObject(f))for(q in f)m.setAttribute(q,f[q]);return n};a.splat=function(m){return a.isArray(m)?m:[m]};a.syncTimeout=function(a,f,h){if(f)return setTimeout(a,f,h);a.call(0,h)};a.pick=function(){var a=arguments,f,h,q=a.length;for(f=0;f<q;f++)if(h=a[f],void 0!==h&&null!==h)return h};a.css=function(m,f){a.isMS&&!a.svg&&f&&void 0!==f.opacity&&(f.filter=
"alpha(opacity\x3d"+100*f.opacity+")");a.extend(m.style,f)};a.createElement=function(m,f,h,q,n){m=F.createElement(m);var k=a.css;f&&a.extend(m,f);n&&k(m,{padding:0,border:"none",margin:0});h&&k(m,h);q&&q.appendChild(m);return m};a.extendClass=function(m,f){var h=function(){};h.prototype=new m;a.extend(h.prototype,f);return h};a.pad=function(a,f,h){return Array((f||2)+1-String(a).length).join(h||0)+a};a.relativeLength=function(a,f){return/%$/.test(a)?f*parseFloat(a)/100:parseFloat(a)};a.wrap=function(a,
f,h){var m=a[f];a[f]=function(){var a=Array.prototype.slice.call(arguments);a.unshift(m);return h.apply(this,a)}};a.getTZOffset=function(m){var f=a.Date;return 6E4*(f.hcGetTimezoneOffset&&f.hcGetTimezoneOffset(m)||f.hcTimezoneOffset||0)};a.dateFormat=function(m,f,h){if(!a.defined(f)||isNaN(f))return a.defaultOptions.lang.invalidDate||"";m=a.pick(m,"%Y-%m-%d %H:%M:%S");var q=a.Date,n=new q(f-a.getTZOffset(f)),k,v=n[q.hcGetHours](),d=n[q.hcGetDay](),g=n[q.hcGetDate](),w=n[q.hcGetMonth](),B=n[q.hcGetFullYear](),
c=a.defaultOptions.lang,e=c.weekdays,l=c.shortWeekdays,u=a.pad,q=a.extend({a:l?l[d]:e[d].substr(0,3),A:e[d],d:u(g),e:u(g,2," "),w:d,b:c.shortMonths[w],B:c.months[w],m:u(w+1),y:B.toString().substr(2,2),Y:B,H:u(v),k:v,I:u(v%12||12),l:v%12||12,M:u(n[q.hcGetMinutes]()),p:12>v?"AM":"PM",P:12>v?"am":"pm",S:u(n.getSeconds()),L:u(Math.round(f%1E3),3)},a.dateFormats);for(k in q)for(;-1!==m.indexOf("%"+k);)m=m.replace("%"+k,"function"===typeof q[k]?q[k](f):q[k]);return h?m.substr(0,1).toUpperCase()+m.substr(1):
m};a.formatSingle=function(m,f){var h=/\.([0-9])/,q=a.defaultOptions.lang;/f$/.test(m)?(h=(h=m.match(h))?h[1]:-1,null!==f&&(f=a.numberFormat(f,h,q.decimalPoint,-1<m.indexOf(",")?q.thousandsSep:""))):f=a.dateFormat(m,f);return f};a.format=function(m,f){for(var h="{",q=!1,n,k,v,d,g=[],w;m;){h=m.indexOf(h);if(-1===h)break;n=m.slice(0,h);if(q){n=n.split(":");k=n.shift().split(".");d=k.length;w=f;for(v=0;v<d;v++)w=w[k[v]];n.length&&(w=a.formatSingle(n.join(":"),w));g.push(w)}else g.push(n);m=m.slice(h+
1);h=(q=!q)?"}":"{"}g.push(m);return g.join("")};a.getMagnitude=function(a){return Math.pow(10,Math.floor(Math.log(a)/Math.LN10))};a.normalizeTickInterval=function(m,f,h,q,n){var k,v=m;h=a.pick(h,1);k=m/h;f||(f=[1,2,2.5,5,10],!1===q&&(1===h?f=[1,2,5,10]:.1>=h&&(f=[1/h])));for(q=0;q<f.length&&!(v=f[q],n&&v*h>=m||!n&&k<=(f[q]+(f[q+1]||f[q]))/2);q++);return v*h};a.stableSort=function(a,f){var h=a.length,m,n;for(n=0;n<h;n++)a[n].safeI=n;a.sort(function(a,n){m=f(a,n);return 0===m?a.safeI-n.safeI:m});for(n=
0;n<h;n++)delete a[n].safeI};a.arrayMin=function(a){for(var f=a.length,h=a[0];f--;)a[f]<h&&(h=a[f]);return h};a.arrayMax=function(a){for(var f=a.length,h=a[0];f--;)a[f]>h&&(h=a[f]);return h};a.destroyObjectProperties=function(a,f){for(var h in a)a[h]&&a[h]!==f&&a[h].destroy&&a[h].destroy(),delete a[h]};a.discardElement=function(m){var f=a.garbageBin;f||(f=a.createElement("div"));m&&f.appendChild(m);f.innerHTML=""};a.correctFloat=function(a,f){return parseFloat(a.toPrecision(f||14))};a.setAnimation=
function(m,f){f.renderer.globalAnimation=a.pick(m,f.options.chart.animation,!0)};a.animObject=function(m){return a.isObject(m)?a.merge(m):{duration:m?500:0}};a.timeUnits={millisecond:1,second:1E3,minute:6E4,hour:36E5,day:864E5,week:6048E5,month:24192E5,year:314496E5};a.numberFormat=function(m,f,h,q){m=+m||0;f=+f;var n=a.defaultOptions.lang,k=(m.toString().split(".")[1]||"").length,v,d,g=Math.abs(m);-1===f?f=Math.min(k,20):a.isNumber(f)||(f=2);v=String(a.pInt(g.toFixed(f)));d=3<v.length?v.length%3:
0;h=a.pick(h,n.decimalPoint);q=a.pick(q,n.thousandsSep);m=(0>m?"-":"")+(d?v.substr(0,d)+q:"");m+=v.substr(d).replace(/(\d{3})(?=\d)/g,"$1"+q);f&&(q=Math.abs(g-v+Math.pow(10,-Math.max(f,k)-1)),m+=h+q.toFixed(f).slice(2));return m};Math.easeInOutSine=function(a){return-.5*(Math.cos(Math.PI*a)-1)};a.getStyle=function(m,f){return"width"===f?Math.min(m.offsetWidth,m.scrollWidth)-a.getStyle(m,"padding-left")-a.getStyle(m,"padding-right"):"height"===f?Math.min(m.offsetHeight,m.scrollHeight)-a.getStyle(m,
"padding-top")-a.getStyle(m,"padding-bottom"):(m=J.getComputedStyle(m,void 0))&&a.pInt(m.getPropertyValue(f))};a.inArray=function(a,f){return f.indexOf?f.indexOf(a):[].indexOf.call(f,a)};a.grep=function(a,f){return[].filter.call(a,f)};a.map=function(a,f){for(var h=[],q=0,n=a.length;q<n;q++)h[q]=f.call(a[q],a[q],q,a);return h};a.offset=function(a){var f=F.documentElement;a=a.getBoundingClientRect();return{top:a.top+(J.pageYOffset||f.scrollTop)-(f.clientTop||0),left:a.left+(J.pageXOffset||f.scrollLeft)-
(f.clientLeft||0)}};a.stop=function(a){for(var f=D.length;f--;)D[f].elem===a&&(D[f].stopped=!0)};a.each=function(a,f,h){return Array.prototype.forEach.call(a,f,h)};a.addEvent=function(a,f,h){function q(k){k.target=k.srcElement||J;h.call(a,k)}var n=a.hcEvents=a.hcEvents||{};a.addEventListener?a.addEventListener(f,h,!1):a.attachEvent&&(a.hcEventsIE||(a.hcEventsIE={}),a.hcEventsIE[h.toString()]=q,a.attachEvent("on"+f,q));n[f]||(n[f]=[]);n[f].push(h)};a.removeEvent=function(m,f,h){function q(a,d){m.removeEventListener?
m.removeEventListener(a,d,!1):m.attachEvent&&(d=m.hcEventsIE[d.toString()],m.detachEvent("on"+a,d))}function n(){var a,d;if(m.nodeName)for(d in f?(a={},a[f]=!0):a=v,a)if(v[d])for(a=v[d].length;a--;)q(d,v[d][a])}var k,v=m.hcEvents,d;v&&(f?(k=v[f]||[],h?(d=a.inArray(h,k),-1<d&&(k.splice(d,1),v[f]=k),q(f,h)):(n(),v[f]=[])):(n(),m.hcEvents={}))};a.fireEvent=function(m,f,h,q){var n;n=m.hcEvents;var k,v;h=h||{};if(F.createEvent&&(m.dispatchEvent||m.fireEvent))n=F.createEvent("Events"),n.initEvent(f,!0,
!0),a.extend(n,h),m.dispatchEvent?m.dispatchEvent(n):m.fireEvent(f,n);else if(n)for(n=n[f]||[],k=n.length,h.target||a.extend(h,{preventDefault:function(){h.defaultPrevented=!0},target:m,type:f}),f=0;f<k;f++)(v=n[f])&&!1===v.call(m,h)&&h.preventDefault();q&&!h.defaultPrevented&&q(h)};a.animate=function(m,f,h){var q,n="",k,v,d;a.isObject(h)||(q=arguments,h={duration:q[2],easing:q[3],complete:q[4]});a.isNumber(h.duration)||(h.duration=400);h.easing="function"===typeof h.easing?h.easing:Math[h.easing]||
Math.easeInOutSine;h.curAnim=a.merge(f);for(d in f)v=new a.Fx(m,h,d),k=null,"d"===d?(v.paths=v.initPath(m,m.d,f.d),v.toD=f.d,q=0,k=1):m.attr?q=m.attr(d):(q=parseFloat(a.getStyle(m,d))||0,"opacity"!==d&&(n="px")),k||(k=f[d]),k.match&&k.match("px")&&(k=k.replace(/px/g,"")),v.run(q,k,n)};a.seriesType=function(m,f,h,q,n){var k=a.getOptions(),v=a.seriesTypes;k.plotOptions[m]=a.merge(k.plotOptions[f],h);v[m]=a.extendClass(v[f]||function(){},q);v[m].prototype.type=m;n&&(v[m].prototype.pointClass=a.extendClass(a.Point,
n));return v[m]};J.jQuery&&(J.jQuery.fn.highcharts=function(){var m=[].slice.call(arguments);if(this[0])return m[0]?(new (a[a.isString(m[0])?m.shift():"Chart"])(this[0],m[0],m[1]),this):z[a.attr(this[0],"data-highcharts-chart")]});F&&!F.defaultView&&(a.getStyle=function(m,f){var h={width:"clientWidth",height:"clientHeight"}[f];if(m.style[f])return a.pInt(m.style[f]);"opacity"===f&&(f="filter");if(h)return m.style.zoom=1,Math.max(m[h]-2*a.getStyle(m,"padding"),0);m=m.currentStyle[f.replace(/\-(\w)/g,
function(a,n){return n.toUpperCase()})];"filter"===f&&(m=m.replace(/alpha\(opacity=([0-9]+)\)/,function(a,n){return n/100}));return""===m?1:a.pInt(m)});Array.prototype.forEach||(a.each=function(a,f,h){for(var q=0,n=a.length;q<n;q++)if(!1===f.call(h,a[q],q,a))return q});Array.prototype.indexOf||(a.inArray=function(a,f){var h,q=0;if(f)for(h=f.length;q<h;q++)if(f[q]===a)return q;return-1});Array.prototype.filter||(a.grep=function(a,f){for(var h=[],q=0,n=a.length;q<n;q++)f(a[q],q)&&h.push(a[q]);return h})})(M);
(function(a){var D=a.each,z=a.isNumber,F=a.map,J=a.merge,m=a.pInt;a.Color=function(f){if(!(this instanceof a.Color))return new a.Color(f);this.init(f)};a.Color.prototype={parsers:[{regex:/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,parse:function(a){return[m(a[1]),m(a[2]),m(a[3]),parseFloat(a[4],10)]}},{regex:/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,parse:function(a){return[m(a[1],16),m(a[2],16),m(a[3],16),1]}},{regex:/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
parse:function(a){return[m(a[1]),m(a[2]),m(a[3]),1]}}],names:{white:"#ffffff",black:"#000000"},init:function(f){var h,q,n,k;if((this.input=f=this.names[f]||f)&&f.stops)this.stops=F(f.stops,function(k){return new a.Color(k[1])});else for(n=this.parsers.length;n--&&!q;)k=this.parsers[n],(h=k.regex.exec(f))&&(q=k.parse(h));this.rgba=q||[]},get:function(a){var h=this.input,f=this.rgba,n;this.stops?(n=J(h),n.stops=[].concat(n.stops),D(this.stops,function(k,f){n.stops[f]=[n.stops[f][0],k.get(a)]})):n=f&&
z(f[0])?"rgb"===a||!a&&1===f[3]?"rgb("+f[0]+","+f[1]+","+f[2]+")":"a"===a?f[3]:"rgba("+f.join(",")+")":h;return n},brighten:function(a){var h,f=this.rgba;if(this.stops)D(this.stops,function(n){n.brighten(a)});else if(z(a)&&0!==a)for(h=0;3>h;h++)f[h]+=m(255*a),0>f[h]&&(f[h]=0),255<f[h]&&(f[h]=255);return this},setOpacity:function(a){this.rgba[3]=a;return this}};a.color=function(f){return new a.Color(f)}})(M);(function(a){var D,z,F=a.addEvent,J=a.animate,m=a.attr,f=a.charts,h=a.color,q=a.css,n=a.createElement,
k=a.defined,v=a.deg2rad,d=a.destroyObjectProperties,g=a.doc,w=a.each,B=a.extend,c=a.erase,e=a.grep,l=a.hasTouch,u=a.isArray,L=a.isFirefox,b=a.isMS,t=a.isObject,y=a.isString,K=a.isWebKit,x=a.merge,I=a.noop,r=a.pick,G=a.pInt,H=a.removeEvent,N=a.stop,p=a.svg,A=a.SVG_NS,P=a.symbolSizes,O=a.win;D=a.SVGElement=function(){return this};D.prototype={opacity:1,SVG_NS:A,textProps:"direction fontSize fontWeight fontFamily fontStyle color lineHeight width textDecoration textOverflow textShadow".split(" "),init:function(a,
b){this.element="span"===b?n(b):g.createElementNS(this.SVG_NS,b);this.renderer=a},animate:function(a,b,p){b=r(b,this.renderer.globalAnimation,!0);N(this);b?(p&&(b.complete=p),J(this,a,b)):this.attr(a,null,p);return this},colorGradient:function(b,E,p){var C=this.renderer,e,A,c,d,t,S,l,g,y,r,n,H=[],G;b.linearGradient?A="linearGradient":b.radialGradient&&(A="radialGradient");if(A){c=b[A];t=C.gradients;l=b.stops;r=p.radialReference;u(c)&&(b[A]=c={x1:c[0],y1:c[1],x2:c[2],y2:c[3],gradientUnits:"userSpaceOnUse"});
"radialGradient"===A&&r&&!k(c.gradientUnits)&&(d=c,c=x(c,C.getRadialAttr(r,d),{gradientUnits:"userSpaceOnUse"}));for(n in c)"id"!==n&&H.push(n,c[n]);for(n in l)H.push(l[n]);H=H.join(",");t[H]?r=t[H].attr("id"):(c.id=r="highcharts-"+a.idCounter++,t[H]=S=C.createElement(A).attr(c).add(C.defs),S.radAttr=d,S.stops=[],w(l,function(b){0===b[1].indexOf("rgba")?(e=a.color(b[1]),g=e.get("rgb"),y=e.get("a")):(g=b[1],y=1);b=C.createElement("stop").attr({offset:b[0],"stop-color":g,"stop-opacity":y}).add(S);S.stops.push(b)}));
G="url("+C.url+"#"+r+")";p.setAttribute(E,G);p.gradient=H;b.toString=function(){return G}}},applyTextShadow:function(a){var C=this.element,p,e=-1!==a.indexOf("contrast"),c={},A=this.renderer.forExport,d=this.renderer.forExport||void 0!==C.style.textShadow&&!b;e&&(c.textShadow=a=a.replace(/contrast/g,this.renderer.getContrast(C.style.fill)));if(K||A)c.textRendering="geometricPrecision";d?this.css(c):(this.fakeTS=!0,this.ySetter=this.xSetter,p=[].slice.call(C.getElementsByTagName("tspan")),w(a.split(/\s?,\s?/g),
function(a){var b=C.firstChild,E,e;a=a.split(" ");E=a[a.length-1];(e=a[a.length-2])&&w(p,function(a,p){0===p&&(a.setAttribute("x",C.getAttribute("x")),p=C.getAttribute("y"),a.setAttribute("y",p||0),null===p&&C.setAttribute("y",0));a=a.cloneNode(1);m(a,{"class":"highcharts-text-shadow",fill:E,stroke:E,"stroke-opacity":1/Math.max(G(e),3),"stroke-width":e,"stroke-linejoin":"round"});C.insertBefore(a,b)})}))},attr:function(a,b,p){var C,E=this.element,e,c=this,A;"string"===typeof a&&void 0!==b&&(C=a,a=
{},a[C]=b);if("string"===typeof a)c=(this[a+"Getter"]||this._defaultGetter).call(this,a,E);else{for(C in a)b=a[C],A=!1,this.symbolName&&/^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)/.test(C)&&(e||(this.symbolAttr(a),e=!0),A=!0),!this.rotation||"x"!==C&&"y"!==C||(this.doTransform=!0),A||(A=this[C+"Setter"]||this._defaultSetter,A.call(this,b,C,E),this.shadows&&/^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(C)&&this.updateShadows(C,b,A));this.doTransform&&(this.updateTransform(),
this.doTransform=!1)}p&&p();return c},updateShadows:function(a,b,p){for(var C=this.shadows,E=C.length;E--;)p.call(C[E],"height"===a?Math.max(b-(C[E].cutHeight||0),0):"d"===a?this.d:b,a,C[E])},addClass:function(a,b){var C=this.attr("class")||"";-1===C.indexOf(a)&&(b||(a=(C+(C?" ":"")+a).replace("  "," ")),this.attr("class",a));return this},hasClass:function(a){return-1!==m(this.element,"class").indexOf(a)},removeClass:function(a){m(this.element,"class",(m(this.element,"class")||"").replace(a,""));
return this},symbolAttr:function(a){var b=this;w("x y r start end width height innerR anchorX anchorY".split(" "),function(C){b[C]=r(a[C],b[C])});b.attr({d:b.renderer.symbols[b.symbolName](b.x,b.y,b.width,b.height,b)})},clip:function(a){return this.attr("clip-path",a?"url("+this.renderer.url+"#"+a.id+")":"none")},crisp:function(a,b){var C,p={},E;b=b||a.strokeWidth||0;E=Math.round(b)%2/2;a.x=Math.floor(a.x||this.x||0)+E;a.y=Math.floor(a.y||this.y||0)+E;a.width=Math.floor((a.width||this.width||0)-2*
E);a.height=Math.floor((a.height||this.height||0)-2*E);k(a.strokeWidth)&&(a.strokeWidth=b);for(C in a)this[C]!==a[C]&&(this[C]=p[C]=a[C]);return p},css:function(a){var C=this.styles,e={},A=this.element,c,d,t="";c=!C;a&&a.color&&(a.fill=a.color);if(C)for(d in a)a[d]!==C[d]&&(e[d]=a[d],c=!0);if(c){c=this.textWidth=a&&a.width&&"text"===A.nodeName.toLowerCase()&&G(a.width)||this.textWidth;C&&(a=B(C,e));this.styles=a;c&&!p&&this.renderer.forExport&&delete a.width;if(b&&!p)q(this.element,a);else{C=function(a,
b){return"-"+b.toLowerCase()};for(d in a)t+=d.replace(/([A-Z])/g,C)+":"+a[d]+";";m(A,"style",t)}this.added&&c&&this.renderer.buildText(this)}return this},strokeWidth:function(){return this["stroke-width"]||0},on:function(a,b){var C=this,p=C.element;l&&"click"===a?(p.ontouchstart=function(a){C.touchEventFired=Date.now();a.preventDefault();b.call(p,a)},p.onclick=function(a){(-1===O.navigator.userAgent.indexOf("Android")||1100<Date.now()-(C.touchEventFired||0))&&b.call(p,a)}):p["on"+a]=b;return this},
setRadialReference:function(a){var b=this.renderer.gradients[this.element.gradient];this.element.radialReference=a;b&&b.radAttr&&b.animate(this.renderer.getRadialAttr(a,b.radAttr));return this},translate:function(a,b){return this.attr({translateX:a,translateY:b})},invert:function(a){this.inverted=a;this.updateTransform();return this},updateTransform:function(){var a=this.translateX||0,b=this.translateY||0,p=this.scaleX,e=this.scaleY,c=this.inverted,A=this.rotation,d=this.element;c&&(a+=this.attr("width"),
b+=this.attr("height"));a=["translate("+a+","+b+")"];c?a.push("rotate(90) scale(-1,1)"):A&&a.push("rotate("+A+" "+(d.getAttribute("x")||0)+" "+(d.getAttribute("y")||0)+")");(k(p)||k(e))&&a.push("scale("+r(p,1)+" "+r(e,1)+")");a.length&&d.setAttribute("transform",a.join(" "))},toFront:function(){var a=this.element;a.parentNode.appendChild(a);return this},align:function(a,b,p){var C,E,e,A,d={};E=this.renderer;e=E.alignedObjects;var t,l;if(a){if(this.alignOptions=a,this.alignByTranslate=b,!p||y(p))this.alignTo=
C=p||"renderer",c(e,this),e.push(this),p=null}else a=this.alignOptions,b=this.alignByTranslate,C=this.alignTo;p=r(p,E[C],E);C=a.align;E=a.verticalAlign;e=(p.x||0)+(a.x||0);A=(p.y||0)+(a.y||0);"right"===C?t=1:"center"===C&&(t=2);t&&(e+=(p.width-(a.width||0))/t);d[b?"translateX":"x"]=Math.round(e);"bottom"===E?l=1:"middle"===E&&(l=2);l&&(A+=(p.height-(a.height||0))/l);d[b?"translateY":"y"]=Math.round(A);this[this.placed?"animate":"attr"](d);this.placed=!0;this.alignAttr=d;return this},getBBox:function(a,
p){var C,E=this.renderer,e,A=this.element,c=this.styles,d,t=this.textStr,l,g=A.style,y,u=E.cache,x=E.cacheKeys,k;p=r(p,this.rotation);e=p*v;d=c&&c.fontSize;void 0!==t&&(k=t.toString().replace(/[0-9]/g,"0")+["",p||0,d,A.style.width].join());k&&!a&&(C=u[k]);if(!C){if(A.namespaceURI===this.SVG_NS||E.forExport){try{y=this.fakeTS&&function(a){w(A.querySelectorAll(".highcharts-text-shadow"),function(b){b.style.display=a})},L&&g.textShadow?(l=g.textShadow,g.textShadow=""):y&&y("none"),C=A.getBBox?B({},A.getBBox()):
{width:A.offsetWidth,height:A.offsetHeight},l?g.textShadow=l:y&&y("")}catch(V){}if(!C||0>C.width)C={width:0,height:0}}else C=this.htmlGetBBox();E.isSVG&&(a=C.width,E=C.height,b&&c&&"11px"===c.fontSize&&"16.9"===E.toPrecision(3)&&(C.height=E=14),p&&(C.width=Math.abs(E*Math.sin(e))+Math.abs(a*Math.cos(e)),C.height=Math.abs(E*Math.cos(e))+Math.abs(a*Math.sin(e))));if(k&&0<C.height){for(;250<x.length;)delete u[x.shift()];u[k]||x.push(k);u[k]=C}}return C},show:function(a){return this.attr({visibility:a?
"inherit":"visible"})},hide:function(){return this.attr({visibility:"hidden"})},fadeOut:function(a){var b=this;b.animate({opacity:0},{duration:a||150,complete:function(){b.attr({y:-9999})}})},add:function(a){var b=this.renderer,p=this.element,C;a&&(this.parentGroup=a);this.parentInverted=a&&a.inverted;void 0!==this.textStr&&b.buildText(this);this.added=!0;if(!a||a.handleZ||this.zIndex)C=this.zIndexSetter();C||(a?a.element:b.box).appendChild(p);if(this.onAdd)this.onAdd();return this},safeRemoveChild:function(a){var b=
a.parentNode;b&&b.removeChild(a)},destroy:function(){var a=this.element||{},b=this.renderer.isSVG&&"SPAN"===a.nodeName&&this.parentGroup,p,e;a.onclick=a.onmouseout=a.onmouseover=a.onmousemove=a.point=null;N(this);this.clipPath&&(this.clipPath=this.clipPath.destroy());if(this.stops){for(e=0;e<this.stops.length;e++)this.stops[e]=this.stops[e].destroy();this.stops=null}this.safeRemoveChild(a);for(this.destroyShadows();b&&b.div&&0===b.div.childNodes.length;)a=b.parentGroup,this.safeRemoveChild(b.div),
delete b.div,b=a;this.alignTo&&c(this.renderer.alignedObjects,this);for(p in this)delete this[p];return null},shadow:function(a,b,p){var C=[],e,E,A=this.element,c,d,t,l;if(!a)this.destroyShadows();else if(!this.shadows){d=r(a.width,3);t=(a.opacity||.15)/d;l=this.parentInverted?"(-1,-1)":"("+r(a.offsetX,1)+", "+r(a.offsetY,1)+")";for(e=1;e<=d;e++)E=A.cloneNode(0),c=2*d+1-2*e,m(E,{isShadow:"true",stroke:a.color||"#000000","stroke-opacity":t*e,"stroke-width":c,transform:"translate"+l,fill:"none"}),p&&
(m(E,"height",Math.max(m(E,"height")-c,0)),E.cutHeight=c),b?b.element.appendChild(E):A.parentNode.insertBefore(E,A),C.push(E);this.shadows=C}return this},destroyShadows:function(){w(this.shadows||[],function(a){this.safeRemoveChild(a)},this);this.shadows=void 0},xGetter:function(a){"circle"===this.element.nodeName&&("x"===a?a="cx":"y"===a&&(a="cy"));return this._defaultGetter(a)},_defaultGetter:function(a){a=r(this[a],this.element?this.element.getAttribute(a):null,0);/^[\-0-9\.]+$/.test(a)&&(a=parseFloat(a));
return a},dSetter:function(a,b,p){a&&a.join&&(a=a.join(" "));/(NaN| {2}|^$)/.test(a)&&(a="M 0 0");p.setAttribute(b,a);this[b]=a},dashstyleSetter:function(a){var b,p=this["stroke-width"];"inherit"===p&&(p=1);if(a=a&&a.toLowerCase()){a=a.replace("shortdashdotdot","3,1,1,1,1,1,").replace("shortdashdot","3,1,1,1").replace("shortdot","1,1,").replace("shortdash","3,1,").replace("longdash","8,3,").replace(/dot/g,"1,3,").replace("dash","4,3,").replace(/,$/,"").split(",");for(b=a.length;b--;)a[b]=G(a[b])*
p;a=a.join(",").replace(/NaN/g,"none");this.element.setAttribute("stroke-dasharray",a)}},alignSetter:function(a){this.element.setAttribute("text-anchor",{left:"start",center:"middle",right:"end"}[a])},opacitySetter:function(a,b,p){this[b]=a;p.setAttribute(b,a)},titleSetter:function(a){var b=this.element.getElementsByTagName("title")[0];b||(b=g.createElementNS(this.SVG_NS,"title"),this.element.appendChild(b));b.firstChild&&b.removeChild(b.firstChild);b.appendChild(g.createTextNode(String(r(a),"").replace(/<[^>]*>/g,
"")))},textSetter:function(a){a!==this.textStr&&(delete this.bBox,this.textStr=a,this.added&&this.renderer.buildText(this))},fillSetter:function(a,b,p){"string"===typeof a?p.setAttribute(b,a):a&&this.colorGradient(a,b,p)},visibilitySetter:function(a,b,p){"inherit"===a?p.removeAttribute(b):p.setAttribute(b,a)},zIndexSetter:function(a,b){var p=this.renderer,e=this.parentGroup,C=(e||p).element||p.box,E,A=this.element,c;E=this.added;var d;k(a)&&(A.zIndex=a,a=+a,this[b]===a&&(E=!1),this[b]=a);if(E){(a=
this.zIndex)&&e&&(e.handleZ=!0);b=C.childNodes;for(d=0;d<b.length&&!c;d++)e=b[d],E=e.zIndex,e!==A&&(G(E)>a||!k(a)&&k(E)||0>a&&!k(E)&&C!==p.box)&&(C.insertBefore(A,e),c=!0);c||C.appendChild(A)}return c},_defaultSetter:function(a,b,p){p.setAttribute(b,a)}};D.prototype.yGetter=D.prototype.xGetter;D.prototype.translateXSetter=D.prototype.translateYSetter=D.prototype.rotationSetter=D.prototype.verticalAlignSetter=D.prototype.scaleXSetter=D.prototype.scaleYSetter=function(a,b){this[b]=a;this.doTransform=
!0};D.prototype["stroke-widthSetter"]=D.prototype.strokeSetter=function(a,b,p){this[b]=a;this.stroke&&this["stroke-width"]?(D.prototype.fillSetter.call(this,this.stroke,"stroke",p),p.setAttribute("stroke-width",this["stroke-width"]),this.hasStroke=!0):"stroke-width"===b&&0===a&&this.hasStroke&&(p.removeAttribute("stroke"),this.hasStroke=!1)};z=a.SVGRenderer=function(){this.init.apply(this,arguments)};z.prototype={Element:D,SVG_NS:A,init:function(a,b,p,e,A,c){var E;e=this.createElement("svg").attr({version:"1.1",
"class":"highcharts-root"}).css(this.getStyle(e));E=e.element;a.appendChild(E);-1===a.innerHTML.indexOf("xmlns")&&m(E,"xmlns",this.SVG_NS);this.isSVG=!0;this.box=E;this.boxWrapper=e;this.alignedObjects=[];this.url=(L||K)&&g.getElementsByTagName("base").length?O.location.href.replace(/#.*?$/,"").replace(/([\('\)])/g,"\\$1").replace(/ /g,"%20"):"";this.createElement("desc").add().element.appendChild(g.createTextNode("Created with Highcharts 5.0.2"));this.defs=this.createElement("defs").add();this.allowHTML=
c;this.forExport=A;this.gradients={};this.cache={};this.cacheKeys=[];this.imgCount=0;this.setSize(b,p,!1);var C;L&&a.getBoundingClientRect&&(this.subPixelFix=b=function(){q(a,{left:0,top:0});C=a.getBoundingClientRect();q(a,{left:Math.ceil(C.left)-C.left+"px",top:Math.ceil(C.top)-C.top+"px"})},b(),F(O,"resize",b))},getStyle:function(a){return this.style=B({fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',fontSize:"12px"},a)},setStyle:function(a){this.boxWrapper.css(this.getStyle(a))},
isHidden:function(){return!this.boxWrapper.getBBox().width},destroy:function(){var a=this.defs;this.box=null;this.boxWrapper=this.boxWrapper.destroy();d(this.gradients||{});this.gradients=null;a&&(this.defs=a.destroy());this.subPixelFix&&H(O,"resize",this.subPixelFix);return this.alignedObjects=null},createElement:function(a){var b=new this.Element;b.init(this,a);return b},draw:I,getRadialAttr:function(a,b){return{cx:a[0]-a[2]/2+b.cx*a[2],cy:a[1]-a[2]/2+b.cy*a[2],r:b.r*a[2]}},buildText:function(a){for(var b=
a.element,c=this,d=c.forExport,C=r(a.textStr,"").toString(),t=-1!==C.indexOf("\x3c"),l=b.childNodes,y,u,x,k,n=m(b,"x"),H=a.styles,f=a.textWidth,K=H&&H.lineHeight,h=H&&H.textShadow,v=H&&"ellipsis"===H.textOverflow,O=l.length,B=f&&!a.added&&this.box,P=function(a){var b;b=/(px|em)$/.test(a&&a.style.fontSize)?a.style.fontSize:H&&H.fontSize||c.style.fontSize||12;return K?G(K):c.fontMetrics(b,a).h};O--;)b.removeChild(l[O]);t||h||v||f||-1!==C.indexOf(" ")?(y=/<.*class="([^"]+)".*>/,u=/<.*style="([^"]+)".*>/,
x=/<.*href="(http[^"]+)".*>/,B&&B.appendChild(b),C=t?C.replace(/<(b|strong)>/g,'\x3cspan style\x3d"font-weight:bold"\x3e').replace(/<(i|em)>/g,'\x3cspan style\x3d"font-style:italic"\x3e').replace(/<a/g,"\x3cspan").replace(/<\/(b|strong|i|em|a)>/g,"\x3c/span\x3e").split(/<br.*?>/g):[C],C=e(C,function(a){return""!==a}),w(C,function(e,E){var C,t=0;e=e.replace(/^\s+|\s+$/g,"").replace(/<span/g,"|||\x3cspan").replace(/<\/span>/g,"\x3c/span\x3e|||");C=e.split("|||");w(C,function(e){if(""!==e||1===C.length){var l=
{},r=g.createElementNS(c.SVG_NS,"tspan"),w,S;y.test(e)&&(w=e.match(y)[1],m(r,"class",w));u.test(e)&&(S=e.match(u)[1].replace(/(;| |^)color([ :])/,"$1fill$2"),m(r,"style",S));x.test(e)&&!d&&(m(r,"onclick",'location.href\x3d"'+e.match(x)[1]+'"'),q(r,{cursor:"pointer"}));e=(e.replace(/<(.|\n)*?>/g,"")||" ").replace(/&lt;/g,"\x3c").replace(/&gt;/g,"\x3e");if(" "!==e){r.appendChild(g.createTextNode(e));t?l.dx=0:E&&null!==n&&(l.x=n);m(r,l);b.appendChild(r);!t&&E&&(!p&&d&&q(r,{display:"block"}),m(r,"dy",
P(r)));if(f){l=e.replace(/([^\^])-/g,"$1- ").split(" ");w="nowrap"===H.whiteSpace;for(var G=1<C.length||E||1<l.length&&!w,K,h,O=[],B=P(r),R=a.rotation,I=e,Q=I.length;(G||v)&&(l.length||O.length);)a.rotation=0,K=a.getBBox(!0),h=K.width,!p&&c.forExport&&(h=c.measureSpanWidth(r.firstChild.data,a.styles)),K=h>f,void 0===k&&(k=K),v&&k?(Q/=2,""===I||!K&&.5>Q?l=[]:(I=e.substring(0,I.length+(K?-1:1)*Math.ceil(Q)),l=[I+(3<f?"\u2026":"")],r.removeChild(r.firstChild))):K&&1!==l.length?(r.removeChild(r.firstChild),
O.unshift(l.pop())):(l=O,O=[],l.length&&!w&&(r=g.createElementNS(A,"tspan"),m(r,{dy:B,x:n}),S&&m(r,"style",S),b.appendChild(r)),h>f&&(f=h)),l.length&&r.appendChild(g.createTextNode(l.join(" ").replace(/- /g,"-")));a.rotation=R}t++}}})}),k&&a.attr("title",a.textStr),B&&B.removeChild(b),h&&a.applyTextShadow&&a.applyTextShadow(h)):b.appendChild(g.createTextNode(C.replace(/&lt;/g,"\x3c").replace(/&gt;/g,"\x3e")))},getContrast:function(a){a=h(a).rgba;return 510<a[0]+a[1]+a[2]?"#000000":"#FFFFFF"},button:function(a,
p,e,c,A,d,t,l,g){var E=this.label(a,p,e,g,null,null,null,null,"button"),C=0;E.attr(x({padding:8,r:2},A));var r,y,u,k;A=x({fill:"#f7f7f7",stroke:"#cccccc","stroke-width":1,style:{color:"#333333",cursor:"pointer",fontWeight:"normal"}},A);r=A.style;delete A.style;d=x(A,{fill:"#e6e6e6"},d);y=d.style;delete d.style;t=x(A,{fill:"#e6ebf5",style:{color:"#000000",fontWeight:"bold"}},t);u=t.style;delete t.style;l=x(A,{style:{color:"#cccccc"}},l);k=l.style;delete l.style;F(E.element,b?"mouseover":"mouseenter",
function(){3!==C&&E.setState(1)});F(E.element,b?"mouseout":"mouseleave",function(){3!==C&&E.setState(C)});E.setState=function(a){1!==a&&(E.state=C=a);E.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-"+["normal","hover","pressed","disabled"][a||0]);E.attr([A,d,t,l][a||0]).css([r,y,u,k][a||0])};E.attr(A).css(B({cursor:"default"},r));return E.on("click",function(a){3!==C&&c.call(E,a)})},crispLine:function(a,b){a[1]===a[4]&&(a[1]=a[4]=Math.round(a[1])-b%2/
2);a[2]===a[5]&&(a[2]=a[5]=Math.round(a[2])+b%2/2);return a},path:function(a){var b={fill:"none"};u(a)?b.d=a:t(a)&&B(b,a);return this.createElement("path").attr(b)},circle:function(a,b,p){a=t(a)?a:{x:a,y:b,r:p};b=this.createElement("circle");b.xSetter=b.ySetter=function(a,b,p){p.setAttribute("c"+b,a)};return b.attr(a)},arc:function(a,b,p,e,A,c){t(a)&&(b=a.y,p=a.r,e=a.innerR,A=a.start,c=a.end,a=a.x);a=this.symbol("arc",a||0,b||0,p||0,p||0,{innerR:e||0,start:A||0,end:c||0});a.r=p;return a},rect:function(a,
b,p,e,A,c){A=t(a)?a.r:A;var d=this.createElement("rect");a=t(a)?a:void 0===a?{}:{x:a,y:b,width:Math.max(p,0),height:Math.max(e,0)};void 0!==c&&(a.strokeWidth=c,a=d.crisp(a));a.fill="none";A&&(a.r=A);d.rSetter=function(a,b,p){m(p,{rx:a,ry:a})};return d.attr(a)},setSize:function(a,b,p){var e=this.alignedObjects,A=e.length;this.width=a;this.height=b;for(this.boxWrapper.animate({width:a,height:b},{step:function(){this.attr({viewBox:"0 0 "+this.attr("width")+" "+this.attr("height")})},duration:r(p,!0)?
void 0:0});A--;)e[A].align()},g:function(a){var b=this.createElement("g");return a?b.attr({"class":"highcharts-"+a}):b},image:function(a,b,p,e,A){var c={preserveAspectRatio:"none"};1<arguments.length&&B(c,{x:b,y:p,width:e,height:A});c=this.createElement("image").attr(c);c.element.setAttributeNS?c.element.setAttributeNS("http://www.w3.org/1999/xlink","href",a):c.element.setAttribute("hc-svg-href",a);return c},symbol:function(a,b,p,e,A,c){var d=this,E,t=this.symbols[a],l=k(b)&&t&&t(Math.round(b),Math.round(p),
e,A,c),C=/^url\((.*?)\)$/,y,u;t?(E=this.path(l),E.attr("fill","none"),B(E,{symbolName:a,x:b,y:p,width:e,height:A}),c&&B(E,c)):C.test(a)&&(y=a.match(C)[1],E=this.image(y),E.imgwidth=r(P[y]&&P[y].width,c&&c.width),E.imgheight=r(P[y]&&P[y].height,c&&c.height),u=function(){E.attr({width:E.width,height:E.height})},w(["width","height"],function(a){E[a+"Setter"]=function(a,b){var p={},e=this["img"+b],c="width"===b?"translateX":"translateY";this[b]=a;k(e)&&(this.element&&this.element.setAttribute(b,e),this.alignByTranslate||
(p[c]=((this[b]||0)-e)/2,this.attr(p)))}}),k(b)&&E.attr({x:b,y:p}),E.isImg=!0,k(E.imgwidth)&&k(E.imgheight)?u():(E.attr({width:0,height:0}),n("img",{onload:function(){var a=f[d.chartIndex];0===this.width&&(q(this,{position:"absolute",top:"-999em"}),g.body.appendChild(this));P[y]={width:this.width,height:this.height};E.imgwidth=this.width;E.imgheight=this.height;E.element&&u();this.parentNode&&this.parentNode.removeChild(this);d.imgCount--;if(!d.imgCount&&a&&a.onload)a.onload()},src:y}),this.imgCount++));
return E},symbols:{circle:function(a,b,p,e){var c=.166*p;return["M",a+p/2,b,"C",a+p+c,b,a+p+c,b+e,a+p/2,b+e,"C",a-c,b+e,a-c,b,a+p/2,b,"Z"]},square:function(a,b,p,e){return["M",a,b,"L",a+p,b,a+p,b+e,a,b+e,"Z"]},triangle:function(a,b,p,e){return["M",a+p/2,b,"L",a+p,b+e,a,b+e,"Z"]},"triangle-down":function(a,b,p,e){return["M",a,b,"L",a+p,b,a+p/2,b+e,"Z"]},diamond:function(a,b,p,e){return["M",a+p/2,b,"L",a+p,b+e/2,a+p/2,b+e,a,b+e/2,"Z"]},arc:function(a,b,p,e,c){var A=c.start;p=c.r||p||e;var d=c.end-.001;
e=c.innerR;var t=c.open,E=Math.cos(A),l=Math.sin(A),y=Math.cos(d),d=Math.sin(d);c=c.end-A<Math.PI?0:1;return["M",a+p*E,b+p*l,"A",p,p,0,c,1,a+p*y,b+p*d,t?"M":"L",a+e*y,b+e*d,"A",e,e,0,c,0,a+e*E,b+e*l,t?"":"Z"]},callout:function(a,b,p,e,c){var A=Math.min(c&&c.r||0,p,e),d=A+6,t=c&&c.anchorX;c=c&&c.anchorY;var l;l=["M",a+A,b,"L",a+p-A,b,"C",a+p,b,a+p,b,a+p,b+A,"L",a+p,b+e-A,"C",a+p,b+e,a+p,b+e,a+p-A,b+e,"L",a+A,b+e,"C",a,b+e,a,b+e,a,b+e-A,"L",a,b+A,"C",a,b,a,b,a+A,b];t&&t>p&&c>b+d&&c<b+e-d?l.splice(13,
3,"L",a+p,c-6,a+p+6,c,a+p,c+6,a+p,b+e-A):t&&0>t&&c>b+d&&c<b+e-d?l.splice(33,3,"L",a,c+6,a-6,c,a,c-6,a,b+A):c&&c>e&&t>a+d&&t<a+p-d?l.splice(23,3,"L",t+6,b+e,t,b+e+6,t-6,b+e,a+A,b+e):c&&0>c&&t>a+d&&t<a+p-d&&l.splice(3,3,"L",t-6,b,t,b-6,t+6,b,p-A,b);return l}},clipRect:function(b,p,e,c){var A="highcharts-"+a.idCounter++,d=this.createElement("clipPath").attr({id:A}).add(this.defs);b=this.rect(b,p,e,c,0).add(d);b.id=A;b.clipPath=d;b.count=0;return b},text:function(a,b,e,c){var A=!p&&this.forExport,d={};
if(c&&(this.allowHTML||!this.forExport))return this.html(a,b,e);d.x=Math.round(b||0);e&&(d.y=Math.round(e));if(a||0===a)d.text=a;a=this.createElement("text").attr(d);A&&a.css({position:"absolute"});c||(a.xSetter=function(a,b,p){var e=p.getElementsByTagName("tspan"),c,A=p.getAttribute(b),d;for(d=0;d<e.length;d++)c=e[d],c.getAttribute(b)===A&&c.setAttribute(b,a);p.setAttribute(b,a)});return a},fontMetrics:function(a,b){a=a||this.style&&this.style.fontSize;a=/px/.test(a)?G(a):/em/.test(a)?12*parseFloat(a):
12;b=24>a?a+3:Math.round(1.2*a);return{h:b,b:Math.round(.8*b),f:a}},rotCorr:function(a,b,p){var e=a;b&&p&&(e=Math.max(e*Math.cos(b*v),4));return{x:-a/3*Math.sin(b*v),y:e}},label:function(a,b,p,e,c,A,d,t,l){var y=this,r=y.g("button"!==l&&"label"),g=r.text=y.text("",0,0,d).attr({zIndex:1}),E,u,n=0,K=3,G=0,C,f,h,O,v,I={},P,S,q=/^url\((.*?)\)$/.test(e),N=q,L,m,R,Q;l&&r.addClass("highcharts-"+l);N=q;L=function(){return(P||0)%2/2};m=function(){var a=g.element.style,b={};u=(void 0===C||void 0===f||v)&&k(g.textStr)&&
g.getBBox();r.width=(C||u.width||0)+2*K+G;r.height=(f||u.height||0)+2*K;S=K+y.fontMetrics(a&&a.fontSize,g).b;N&&(E||(r.box=E=y.symbols[e]||q?y.symbol(e):y.rect(),E.addClass(("button"===l?"":"highcharts-label-box")+(l?" highcharts-"+l+"-box":"")),E.add(r),a=L(),b.x=a,b.y=(t?-S:0)+a),b.width=Math.round(r.width),b.height=Math.round(r.height),E.attr(B(b,I)),I={})};R=function(){var a=G+K,b;b=t?0:S;k(C)&&u&&("center"===v||"right"===v)&&(a+={center:.5,right:1}[v]*(C-u.width));if(a!==g.x||b!==g.y)g.attr("x",
a),void 0!==b&&g.attr("y",b);g.x=a;g.y=b};Q=function(a,b){E?E.attr(a,b):I[a]=b};r.onAdd=function(){g.add(r);r.attr({text:a||0===a?a:"",x:b,y:p});E&&k(c)&&r.attr({anchorX:c,anchorY:A})};r.widthSetter=function(a){C=a};r.heightSetter=function(a){f=a};r["text-alignSetter"]=function(a){v=a};r.paddingSetter=function(a){k(a)&&a!==K&&(K=r.padding=a,R())};r.paddingLeftSetter=function(a){k(a)&&a!==G&&(G=a,R())};r.alignSetter=function(a){a={left:0,center:.5,right:1}[a];a!==n&&(n=a,u&&r.attr({x:h}))};r.textSetter=
function(a){void 0!==a&&g.textSetter(a);m();R()};r["stroke-widthSetter"]=function(a,b){a&&(N=!0);P=this["stroke-width"]=a;Q(b,a)};r.strokeSetter=r.fillSetter=r.rSetter=function(a,b){"fill"===b&&a&&(N=!0);Q(b,a)};r.anchorXSetter=function(a,b){c=a;Q(b,Math.round(a)-L()-h)};r.anchorYSetter=function(a,b){A=a;Q(b,a-O)};r.xSetter=function(a){r.x=a;n&&(a-=n*((C||u.width)+2*K));h=Math.round(a);r.attr("translateX",h)};r.ySetter=function(a){O=r.y=Math.round(a);r.attr("translateY",O)};var T=r.css;return B(r,
{css:function(a){if(a){var b={};a=x(a);w(r.textProps,function(p){void 0!==a[p]&&(b[p]=a[p],delete a[p])});g.css(b)}return T.call(r,a)},getBBox:function(){return{width:u.width+2*K,height:u.height+2*K,x:u.x-K,y:u.y-K}},shadow:function(a){a&&(m(),E&&E.shadow(a));return r},destroy:function(){H(r.element,"mouseenter");H(r.element,"mouseleave");g&&(g=g.destroy());E&&(E=E.destroy());D.prototype.destroy.call(r);r=y=m=R=Q=null}})}};a.Renderer=z})(M);(function(a){var D=a.attr,z=a.createElement,F=a.css,J=a.defined,
m=a.each,f=a.extend,h=a.isFirefox,q=a.isMS,n=a.isWebKit,k=a.pInt,v=a.SVGRenderer,d=a.win,g=a.wrap;f(a.SVGElement.prototype,{htmlCss:function(a){var d=this.element;if(d=a&&"SPAN"===d.tagName&&a.width)delete a.width,this.textWidth=d,this.updateTransform();a&&"ellipsis"===a.textOverflow&&(a.whiteSpace="nowrap",a.overflow="hidden");this.styles=f(this.styles,a);F(this.element,a);return this},htmlGetBBox:function(){var a=this.element;"text"===a.nodeName&&(a.style.position="absolute");return{x:a.offsetLeft,
y:a.offsetTop,width:a.offsetWidth,height:a.offsetHeight}},htmlUpdateTransform:function(){if(this.added){var a=this.renderer,d=this.element,c=this.translateX||0,e=this.translateY||0,l=this.x||0,g=this.y||0,f=this.textAlign||"left",b={left:0,center:.5,right:1}[f],t=this.styles;F(d,{marginLeft:c,marginTop:e});this.shadows&&m(this.shadows,function(a){F(a,{marginLeft:c+1,marginTop:e+1})});this.inverted&&m(d.childNodes,function(b){a.invertChild(b,d)});if("SPAN"===d.tagName){var y=this.rotation,K=k(this.textWidth),
x=t&&t.whiteSpace,h=[y,f,d.innerHTML,this.textWidth,this.textAlign].join();h!==this.cTT&&(t=a.fontMetrics(d.style.fontSize).b,J(y)&&this.setSpanRotation(y,b,t),F(d,{width:"",whiteSpace:x||"nowrap"}),d.offsetWidth>K&&/[ \-]/.test(d.textContent||d.innerText)&&F(d,{width:K+"px",display:"block",whiteSpace:x||"normal"}),this.getSpanCorrection(d.offsetWidth,t,b,y,f));F(d,{left:l+(this.xCorr||0)+"px",top:g+(this.yCorr||0)+"px"});n&&(t=d.offsetHeight);this.cTT=h}}else this.alignOnAdd=!0},setSpanRotation:function(a,
g,c){var e={},l=q?"-ms-transform":n?"-webkit-transform":h?"MozTransform":d.opera?"-o-transform":"";e[l]=e.transform="rotate("+a+"deg)";e[l+(h?"Origin":"-origin")]=e.transformOrigin=100*g+"% "+c+"px";F(this.element,e)},getSpanCorrection:function(a,d,c){this.xCorr=-a*c;this.yCorr=-d}});f(v.prototype,{html:function(a,d,c){var e=this.createElement("span"),l=e.element,u=e.renderer,k=u.isSVG,b=function(a,b){m(["opacity","visibility"],function(e){g(a,e+"Setter",function(a,e,c,d){a.call(this,e,c,d);b[c]=
e})})};e.textSetter=function(a){a!==l.innerHTML&&delete this.bBox;l.innerHTML=this.textStr=a;e.htmlUpdateTransform()};k&&b(e,e.element.style);e.xSetter=e.ySetter=e.alignSetter=e.rotationSetter=function(a,b){"align"===b&&(b="textAlign");e[b]=a;e.htmlUpdateTransform()};e.attr({text:a,x:Math.round(d),y:Math.round(c)}).css({fontFamily:this.style.fontFamily,fontSize:this.style.fontSize,position:"absolute"});l.style.whiteSpace="nowrap";e.css=e.htmlCss;k&&(e.add=function(a){var c,d=u.box.parentNode,t=[];
if(this.parentGroup=a){if(c=a.div,!c){for(;a;)t.push(a),a=a.parentGroup;m(t.reverse(),function(a){var e,t=D(a.element,"class");t&&(t={className:t});c=a.div=a.div||z("div",t,{position:"absolute",left:(a.translateX||0)+"px",top:(a.translateY||0)+"px",display:a.display,opacity:a.opacity,pointerEvents:a.styles&&a.styles.pointerEvents},c||d);e=c.style;f(a,{translateXSetter:function(b,c){e.left=b+"px";a[c]=b;a.doTransform=!0},translateYSetter:function(b,c){e.top=b+"px";a[c]=b;a.doTransform=!0}});b(a,e)})}}else c=
d;c.appendChild(l);e.added=!0;e.alignOnAdd&&e.htmlUpdateTransform();return e});return e}})})(M);(function(a){var D,z,F=a.createElement,J=a.css,m=a.defined,f=a.deg2rad,h=a.discardElement,q=a.doc,n=a.each,k=a.erase,v=a.extend;D=a.extendClass;var d=a.isArray,g=a.isNumber,w=a.isObject,B=a.merge;z=a.noop;var c=a.pick,e=a.pInt,l=a.SVGElement,u=a.SVGRenderer,L=a.win;a.svg||(z={docMode8:q&&8===q.documentMode,init:function(a,e){var b=["\x3c",e,' filled\x3d"f" stroked\x3d"f"'],c=["position: ","absolute",";"],
d="div"===e;("shape"===e||d)&&c.push("left:0;top:0;width:1px;height:1px;");c.push("visibility: ",d?"hidden":"visible");b.push(' style\x3d"',c.join(""),'"/\x3e');e&&(b=d||"span"===e||"img"===e?b.join(""):a.prepVML(b),this.element=F(b));this.renderer=a},add:function(a){var b=this.renderer,e=this.element,c=b.box,d=a&&a.inverted,c=a?a.element||a:c;a&&(this.parentGroup=a);d&&b.invertChild(e,c);c.appendChild(e);this.added=!0;this.alignOnAdd&&!this.deferUpdateTransform&&this.updateTransform();if(this.onAdd)this.onAdd();
this.className&&this.attr("class",this.className);return this},updateTransform:l.prototype.htmlUpdateTransform,setSpanRotation:function(){var a=this.rotation,e=Math.cos(a*f),c=Math.sin(a*f);J(this.element,{filter:a?["progid:DXImageTransform.Microsoft.Matrix(M11\x3d",e,", M12\x3d",-c,", M21\x3d",c,", M22\x3d",e,", sizingMethod\x3d'auto expand')"].join(""):"none"})},getSpanCorrection:function(a,e,d,l,g){var b=l?Math.cos(l*f):1,t=l?Math.sin(l*f):0,y=c(this.elemHeight,this.element.offsetHeight),u;this.xCorr=
0>b&&-a;this.yCorr=0>t&&-y;u=0>b*t;this.xCorr+=t*e*(u?1-d:d);this.yCorr-=b*e*(l?u?d:1-d:1);g&&"left"!==g&&(this.xCorr-=a*d*(0>b?-1:1),l&&(this.yCorr-=y*d*(0>t?-1:1)),J(this.element,{textAlign:g}))},pathToVML:function(a){for(var b=a.length,e=[];b--;)g(a[b])?e[b]=Math.round(10*a[b])-5:"Z"===a[b]?e[b]="x":(e[b]=a[b],!a.isArc||"wa"!==a[b]&&"at"!==a[b]||(e[b+5]===e[b+7]&&(e[b+7]+=a[b+7]>a[b+5]?1:-1),e[b+6]===e[b+8]&&(e[b+8]+=a[b+8]>a[b+6]?1:-1)));return e.join(" ")||"x"},clip:function(a){var b=this,e;
a?(e=a.members,k(e,b),e.push(b),b.destroyClip=function(){k(e,b)},a=a.getCSS(b)):(b.destroyClip&&b.destroyClip(),a={clip:b.docMode8?"inherit":"rect(auto)"});return b.css(a)},css:l.prototype.htmlCss,safeRemoveChild:function(a){a.parentNode&&h(a)},destroy:function(){this.destroyClip&&this.destroyClip();return l.prototype.destroy.apply(this)},on:function(a,e){this.element["on"+a]=function(){var a=L.event;a.target=a.srcElement;e(a)};return this},cutOffPath:function(a,c){var b;a=a.split(/[ ,]/);b=a.length;
if(9===b||11===b)a[b-4]=a[b-2]=e(a[b-2])-10*c;return a.join(" ")},shadow:function(a,d,l){var b=[],g,t=this.element,r=this.renderer,u,y=t.style,k,p=t.path,A,n,f,C;p&&"string"!==typeof p.value&&(p="x");n=p;if(a){f=c(a.width,3);C=(a.opacity||.15)/f;for(g=1;3>=g;g++)A=2*f+1-2*g,l&&(n=this.cutOffPath(p.value,A+.5)),k=['\x3cshape isShadow\x3d"true" strokeweight\x3d"',A,'" filled\x3d"false" path\x3d"',n,'" coordsize\x3d"10 10" style\x3d"',t.style.cssText,'" /\x3e'],u=F(r.prepVML(k),null,{left:e(y.left)+
c(a.offsetX,1),top:e(y.top)+c(a.offsetY,1)}),l&&(u.cutOff=A+1),k=['\x3cstroke color\x3d"',a.color||"#000000",'" opacity\x3d"',C*g,'"/\x3e'],F(r.prepVML(k),null,null,u),d?d.element.appendChild(u):t.parentNode.insertBefore(u,t),b.push(u);this.shadows=b}return this},updateShadows:z,setAttr:function(a,e){this.docMode8?this.element[a]=e:this.element.setAttribute(a,e)},classSetter:function(a){(this.added?this.element:this).className=a},dashstyleSetter:function(a,e,c){(c.getElementsByTagName("stroke")[0]||
F(this.renderer.prepVML(["\x3cstroke/\x3e"]),null,null,c))[e]=a||"solid";this[e]=a},dSetter:function(a,e,c){var b=this.shadows;a=a||[];this.d=a.join&&a.join(" ");c.path=a=this.pathToVML(a);if(b)for(c=b.length;c--;)b[c].path=b[c].cutOff?this.cutOffPath(a,b[c].cutOff):a;this.setAttr(e,a)},fillSetter:function(a,e,c){var b=c.nodeName;"SPAN"===b?c.style.color=a:"IMG"!==b&&(c.filled="none"!==a,this.setAttr("fillcolor",this.renderer.color(a,c,e,this)))},"fill-opacitySetter":function(a,e,c){F(this.renderer.prepVML(["\x3c",
e.split("-")[0],' opacity\x3d"',a,'"/\x3e']),null,null,c)},opacitySetter:z,rotationSetter:function(a,e,c){c=c.style;this[e]=c[e]=a;c.left=-Math.round(Math.sin(a*f)+1)+"px";c.top=Math.round(Math.cos(a*f))+"px"},strokeSetter:function(a,e,c){this.setAttr("strokecolor",this.renderer.color(a,c,e,this))},"stroke-widthSetter":function(a,e,c){c.stroked=!!a;this[e]=a;g(a)&&(a+="px");this.setAttr("strokeweight",a)},titleSetter:function(a,e){this.setAttr(e,a)},visibilitySetter:function(a,e,c){"inherit"===a&&
(a="visible");this.shadows&&n(this.shadows,function(b){b.style[e]=a});"DIV"===c.nodeName&&(a="hidden"===a?"-999em":0,this.docMode8||(c.style[e]=a?"visible":"hidden"),e="top");c.style[e]=a},xSetter:function(a,e,c){this[e]=a;"x"===e?e="left":"y"===e&&(e="top");this.updateClipping?(this[e]=a,this.updateClipping()):c.style[e]=a},zIndexSetter:function(a,e,c){c.style[e]=a}},z["stroke-opacitySetter"]=z["fill-opacitySetter"],a.VMLElement=z=D(l,z),z.prototype.ySetter=z.prototype.widthSetter=z.prototype.heightSetter=
z.prototype.xSetter,z={Element:z,isIE8:-1<L.navigator.userAgent.indexOf("MSIE 8.0"),init:function(a,e,c){var b,d;this.alignedObjects=[];b=this.createElement("div").css({position:"relative"});d=b.element;a.appendChild(b.element);this.isVML=!0;this.box=d;this.boxWrapper=b;this.gradients={};this.cache={};this.cacheKeys=[];this.imgCount=0;this.setSize(e,c,!1);if(!q.namespaces.hcv){q.namespaces.add("hcv","urn:schemas-microsoft-com:vml");try{q.createStyleSheet().cssText="hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } "}catch(I){q.styleSheets[0].cssText+=
"hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } "}}},isHidden:function(){return!this.box.offsetWidth},clipRect:function(a,e,c,d){var b=this.createElement(),l=w(a);return v(b,{members:[],count:0,left:(l?a.x:a)+1,top:(l?a.y:e)+1,width:(l?a.width:c)-1,height:(l?a.height:d)-1,getCSS:function(a){var b=a.element,e=b.nodeName,c=a.inverted,p=this.top-("shape"===e?b.offsetTop:0),d=this.left,b=d+this.width,l=p+this.height,p={clip:"rect("+Math.round(c?
d:p)+"px,"+Math.round(c?l:b)+"px,"+Math.round(c?b:l)+"px,"+Math.round(c?p:d)+"px)"};!c&&a.docMode8&&"DIV"===e&&v(p,{width:b+"px",height:l+"px"});return p},updateClipping:function(){n(b.members,function(a){a.element&&a.css(b.getCSS(a))})}})},color:function(b,e,c,d){var l=this,g,r=/^rgba/,u,t,k="none";b&&b.linearGradient?t="gradient":b&&b.radialGradient&&(t="pattern");if(t){var p,A,f=b.linearGradient||b.radialGradient,h,C,E,y,w,v="";b=b.stops;var K,B=[],q=function(){u=['\x3cfill colors\x3d"'+B.join(",")+
'" opacity\x3d"',E,'" o:opacity2\x3d"',C,'" type\x3d"',t,'" ',v,'focus\x3d"100%" method\x3d"any" /\x3e'];F(l.prepVML(u),null,null,e)};h=b[0];K=b[b.length-1];0<h[0]&&b.unshift([0,h[1]]);1>K[0]&&b.push([1,K[1]]);n(b,function(b,e){r.test(b[1])?(g=a.color(b[1]),p=g.get("rgb"),A=g.get("a")):(p=b[1],A=1);B.push(100*b[0]+"% "+p);e?(E=A,y=p):(C=A,w=p)});if("fill"===c)if("gradient"===t)c=f.x1||f[0]||0,b=f.y1||f[1]||0,h=f.x2||f[2]||0,f=f.y2||f[3]||0,v='angle\x3d"'+(90-180*Math.atan((f-b)/(h-c))/Math.PI)+'"',
q();else{var k=f.r,L=2*k,m=2*k,z=f.cx,D=f.cy,J=e.radialReference,U,k=function(){J&&(U=d.getBBox(),z+=(J[0]-U.x)/U.width-.5,D+=(J[1]-U.y)/U.height-.5,L*=J[2]/U.width,m*=J[2]/U.height);v='src\x3d"'+a.getOptions().global.VMLRadialGradientURL+'" size\x3d"'+L+","+m+'" origin\x3d"0.5,0.5" position\x3d"'+z+","+D+'" color2\x3d"'+w+'" ';q()};d.added?k():d.onAdd=k;k=y}else k=p}else r.test(b)&&"IMG"!==e.tagName?(g=a.color(b),d[c+"-opacitySetter"](g.get("a"),c,e),k=g.get("rgb")):(k=e.getElementsByTagName(c),
k.length&&(k[0].opacity=1,k[0].type="solid"),k=b);return k},prepVML:function(a){var b=this.isIE8;a=a.join("");b?(a=a.replace("/\x3e",' xmlns\x3d"urn:schemas-microsoft-com:vml" /\x3e'),a=-1===a.indexOf('style\x3d"')?a.replace("/\x3e",' style\x3d"display:inline-block;behavior:url(#default#VML);" /\x3e'):a.replace('style\x3d"','style\x3d"display:inline-block;behavior:url(#default#VML);')):a=a.replace("\x3c","\x3chcv:");return a},text:u.prototype.html,path:function(a){var b={coordsize:"10 10"};d(a)?b.d=
a:w(a)&&v(b,a);return this.createElement("shape").attr(b)},circle:function(a,e,c){var b=this.symbol("circle");w(a)&&(c=a.r,e=a.y,a=a.x);b.isCircle=!0;b.r=c;return b.attr({x:a,y:e})},g:function(a){var b;a&&(b={className:"highcharts-"+a,"class":"highcharts-"+a});return this.createElement("div").attr(b)},image:function(a,e,c,d,l){var b=this.createElement("img").attr({src:a});1<arguments.length&&b.attr({x:e,y:c,width:d,height:l});return b},createElement:function(a){return"rect"===a?this.symbol(a):u.prototype.createElement.call(this,
a)},invertChild:function(a,c){var b=this;c=c.style;var d="IMG"===a.tagName&&a.style;J(a,{flip:"x",left:e(c.width)-(d?e(d.top):1),top:e(c.height)-(d?e(d.left):1),rotation:-90});n(a.childNodes,function(e){b.invertChild(e,a)})},symbols:{arc:function(a,e,c,d,l){var b=l.start,g=l.end,u=l.r||c||d;c=l.innerR;d=Math.cos(b);var k=Math.sin(b),t=Math.cos(g),p=Math.sin(g);if(0===g-b)return["x"];b=["wa",a-u,e-u,a+u,e+u,a+u*d,e+u*k,a+u*t,e+u*p];l.open&&!c&&b.push("e","M",a,e);b.push("at",a-c,e-c,a+c,e+c,a+c*t,
e+c*p,a+c*d,e+c*k,"x","e");b.isArc=!0;return b},circle:function(a,e,c,d,l){l&&m(l.r)&&(c=d=2*l.r);l&&l.isCircle&&(a-=c/2,e-=d/2);return["wa",a,e,a+c,e+d,a+c,e+d/2,a+c,e+d/2,"e"]},rect:function(a,e,c,d,l){return u.prototype.symbols[m(l)&&l.r?"callout":"square"].call(0,a,e,c,d,l)}}},a.VMLRenderer=D=function(){this.init.apply(this,arguments)},D.prototype=B(u.prototype,z),a.Renderer=D);u.prototype.measureSpanWidth=function(a,e){var b=q.createElement("span");a=q.createTextNode(a);b.appendChild(a);J(b,
e);this.box.appendChild(b);e=b.offsetWidth;h(b);return e}})(M);(function(a){function D(){var q=a.defaultOptions.global,n,k=q.useUTC,v=k?"getUTC":"get",d=k?"setUTC":"set";a.Date=n=q.Date||h.Date;n.hcTimezoneOffset=k&&q.timezoneOffset;n.hcGetTimezoneOffset=k&&q.getTimezoneOffset;n.hcMakeTime=function(a,d,h,c,e,l){var g;k?(g=n.UTC.apply(0,arguments),g+=J(g)):g=(new n(a,d,f(h,1),f(c,0),f(e,0),f(l,0))).getTime();return g};F("Minutes Hours Day Date Month FullYear".split(" "),function(a){n["hcGet"+a]=v+
a});F("Milliseconds Seconds Minutes Hours Date Month FullYear".split(" "),function(a){n["hcSet"+a]=d+a})}var z=a.color,F=a.each,J=a.getTZOffset,m=a.merge,f=a.pick,h=a.win;a.defaultOptions={colors:"#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(" "),symbols:["circle","diamond","square","triangle","triangle-down"],lang:{loading:"Loading...",months:"January February March April May June July August September October November December".split(" "),shortMonths:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
weekdays:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),decimalPoint:".",numericSymbols:"kMGTPE".split(""),resetZoom:"Reset zoom",resetZoomTitle:"Reset zoom level 1:1",thousandsSep:" "},global:{useUTC:!0,VMLRadialGradientURL:"http://code.highcharts.com/5.0.2/gfx/vml-radial-gradient.png"},chart:{borderRadius:0,defaultSeriesType:"line",ignoreHiddenSeries:!0,spacing:[10,10,15,10],resetZoomButton:{theme:{zIndex:20},position:{align:"right",x:-10,y:10}},width:null,height:null,borderColor:"#335cad",
backgroundColor:"#ffffff",plotBorderColor:"#cccccc"},title:{text:"Chart title",align:"center",margin:15,style:{color:"#333333",fontSize:"18px"},widthAdjust:-44},subtitle:{text:"",align:"center",style:{color:"#666666"},widthAdjust:-44},plotOptions:{},labels:{style:{position:"absolute",color:"#333333"}},legend:{enabled:!0,align:"center",layout:"horizontal",labelFormatter:function(){return this.name},borderColor:"#999999",borderRadius:0,navigation:{activeColor:"#003399",inactiveColor:"#cccccc"},itemStyle:{color:"#333333",
fontSize:"12px",fontWeight:"bold"},itemHoverStyle:{color:"#000000"},itemHiddenStyle:{color:"#cccccc"},shadow:!1,itemCheckboxStyle:{position:"absolute",width:"13px",height:"13px"},squareSymbol:!0,symbolPadding:5,verticalAlign:"bottom",x:0,y:0,title:{style:{fontWeight:"bold"}}},loading:{labelStyle:{fontWeight:"bold",position:"relative",top:"45%"},style:{position:"absolute",backgroundColor:"#ffffff",opacity:.5,textAlign:"center"}},tooltip:{enabled:!0,animation:a.svg,borderRadius:3,dateTimeLabelFormats:{millisecond:"%A, %b %e, %H:%M:%S.%L",
second:"%A, %b %e, %H:%M:%S",minute:"%A, %b %e, %H:%M",hour:"%A, %b %e, %H:%M",day:"%A, %b %e, %Y",week:"Week from %A, %b %e, %Y",month:"%B %Y",year:"%Y"},footerFormat:"",padding:8,snap:a.isTouchDevice?25:10,backgroundColor:z("#f7f7f7").setOpacity(.85).get(),borderWidth:1,headerFormat:'\x3cspan style\x3d"font-size: 10px"\x3e{point.key}\x3c/span\x3e\x3cbr/\x3e',pointFormat:'\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e {series.name}: \x3cb\x3e{point.y}\x3c/b\x3e\x3cbr/\x3e',shadow:!0,
style:{color:"#333333",cursor:"default",fontSize:"12px",pointerEvents:"none",whiteSpace:"nowrap"}},credits:{enabled:!0,href:"http://www.highcharts.com",position:{align:"right",x:-10,verticalAlign:"bottom",y:-5},style:{cursor:"pointer",color:"#999999",fontSize:"9px"},text:"Highcharts.com"}};a.setOptions=function(f){a.defaultOptions=m(!0,a.defaultOptions,f);D();return a.defaultOptions};a.getOptions=function(){return a.defaultOptions};a.defaultPlotOptions=a.defaultOptions.plotOptions;D()})(M);(function(a){var D=
a.arrayMax,z=a.arrayMin,F=a.defined,J=a.destroyObjectProperties,m=a.each,f=a.erase,h=a.merge,q=a.pick;a.PlotLineOrBand=function(a,k){this.axis=a;k&&(this.options=k,this.id=k.id)};a.PlotLineOrBand.prototype={render:function(){var a=this,k=a.axis,f=k.horiz,d=a.options,g=d.label,w=a.label,B=d.to,c=d.from,e=d.value,l=F(c)&&F(B),u=F(e),L=a.svgElem,b=!L,t=[],y,K=d.color,x=q(d.zIndex,0),m=d.events,t={"class":"highcharts-plot-"+(l?"band ":"line ")+(d.className||"")},r={},G=k.chart.renderer,H=l?"bands":"lines",
N=k.log2lin;k.isLog&&(c=N(c),B=N(B),e=N(e));u?(t={stroke:K,"stroke-width":d.width},d.dashStyle&&(t.dashstyle=d.dashStyle)):l&&(K&&(t.fill=K),d.borderWidth&&(t.stroke=d.borderColor,t["stroke-width"]=d.borderWidth));r.zIndex=x;H+="-"+x;(K=k[H])||(k[H]=K=G.g("plot-"+H).attr(r).add());b&&(a.svgElem=L=G.path().attr(t).add(K));if(u)t=k.getPlotLinePath(e,L.strokeWidth());else if(l)t=k.getPlotBandPath(c,B,d);else return;if(b&&t&&t.length){if(L.attr({d:t}),m)for(y in d=function(b){L.on(b,function(e){m[b].apply(a,
[e])})},m)d(y)}else L&&(t?(L.show(),L.animate({d:t})):(L.hide(),w&&(a.label=w=w.destroy())));g&&F(g.text)&&t&&t.length&&0<k.width&&0<k.height&&!t.flat?(g=h({align:f&&l&&"center",x:f?!l&&4:10,verticalAlign:!f&&l&&"middle",y:f?l?16:10:l?6:-4,rotation:f&&!l&&90},g),this.renderLabel(g,t,l,x)):w&&w.hide();return a},renderLabel:function(a,k,f,d){var g=this.label,h=this.axis.chart.renderer;g||(g={align:a.textAlign||a.align,rotation:a.rotation,"class":"highcharts-plot-"+(f?"band":"line")+"-label "+(a.className||
"")},g.zIndex=d,this.label=g=h.text(a.text,0,0,a.useHTML).attr(g).add(),g.css(a.style));d=[k[1],k[4],f?k[6]:k[1]];k=[k[2],k[5],f?k[7]:k[2]];f=z(d);h=z(k);g.align(a,!1,{x:f,y:h,width:D(d)-f,height:D(k)-h});g.show()},destroy:function(){f(this.axis.plotLinesAndBands,this);delete this.axis;J(this)}};a.AxisPlotLineOrBandExtension={getPlotBandPath:function(a,k){k=this.getPlotLinePath(k,null,null,!0);(a=this.getPlotLinePath(a,null,null,!0))&&k?(a.flat=a.toString()===k.toString(),a.push(k[4],k[5],k[1],k[2])):
a=null;return a},addPlotBand:function(a){return this.addPlotBandOrLine(a,"plotBands")},addPlotLine:function(a){return this.addPlotBandOrLine(a,"plotLines")},addPlotBandOrLine:function(f,k){var h=(new a.PlotLineOrBand(this,f)).render(),d=this.userOptions;h&&(k&&(d[k]=d[k]||[],d[k].push(f)),this.plotLinesAndBands.push(h));return h},removePlotBandOrLine:function(a){for(var k=this.plotLinesAndBands,h=this.options,d=this.userOptions,g=k.length;g--;)k[g].id===a&&k[g].destroy();m([h.plotLines||[],d.plotLines||
[],h.plotBands||[],d.plotBands||[]],function(d){for(g=d.length;g--;)d[g].id===a&&f(d,d[g])})}}})(M);(function(a){var D=a.correctFloat,z=a.defined,F=a.destroyObjectProperties,J=a.isNumber,m=a.merge,f=a.pick,h=a.stop,q=a.deg2rad;a.Tick=function(a,k,f,d){this.axis=a;this.pos=k;this.type=f||"";this.isNew=!0;f||d||this.addLabel()};a.Tick.prototype={addLabel:function(){var a=this.axis,k=a.options,h=a.chart,d=a.categories,g=a.names,w=this.pos,B=k.labels,c=a.tickPositions,e=w===c[0],l=w===c[c.length-1],g=
d?f(d[w],g[w],w):w,d=this.label,c=c.info,u;a.isDatetimeAxis&&c&&(u=k.dateTimeLabelFormats[c.higherRanks[w]||c.unitName]);this.isFirst=e;this.isLast=l;k=a.labelFormatter.call({axis:a,chart:h,isFirst:e,isLast:l,dateTimeLabelFormat:u,value:a.isLog?D(a.lin2log(g)):g});z(d)?d&&d.attr({text:k}):(this.labelLength=(this.label=d=z(k)&&B.enabled?h.renderer.text(k,0,0,B.useHTML).css(m(B.style)).add(a.labelGroup):null)&&d.getBBox().width,this.rotation=0)},getLabelSize:function(){return this.label?this.label.getBBox()[this.axis.horiz?
"height":"width"]:0},handleOverflow:function(a){var k=this.axis,h=a.x,d=k.chart.chartWidth,g=k.chart.spacing,w=f(k.labelLeft,Math.min(k.pos,g[3])),g=f(k.labelRight,Math.max(k.pos+k.len,d-g[1])),n=this.label,c=this.rotation,e={left:0,center:.5,right:1}[k.labelAlign],l=n.getBBox().width,u=k.getSlotWidth(),m=u,b=1,t,y={};if(c)0>c&&h-e*l<w?t=Math.round(h/Math.cos(c*q)-w):0<c&&h+e*l>g&&(t=Math.round((d-h)/Math.cos(c*q)));else if(d=h+(1-e)*l,h-e*l<w?m=a.x+m*(1-e)-w:d>g&&(m=g-a.x+m*e,b=-1),m=Math.min(u,
m),m<u&&"center"===k.labelAlign&&(a.x+=b*(u-m-e*(u-Math.min(l,m)))),l>m||k.autoRotation&&(n.styles||{}).width)t=m;t&&(y.width=t,(k.options.labels.style||{}).textOverflow||(y.textOverflow="ellipsis"),n.css(y))},getPosition:function(a,k,f,d){var g=this.axis,h=g.chart,n=d&&h.oldChartHeight||h.chartHeight;return{x:a?g.translate(k+f,null,null,d)+g.transB:g.left+g.offset+(g.opposite?(d&&h.oldChartWidth||h.chartWidth)-g.right-g.left:0),y:a?n-g.bottom+g.offset-(g.opposite?g.height:0):n-g.translate(k+f,null,
null,d)-g.transB}},getLabelPosition:function(a,k,f,d,g,h,B,c){var e=this.axis,l=e.transA,u=e.reversed,w=e.staggerLines,b=e.tickRotCorr||{x:0,y:0},t=g.y;z(t)||(t=0===e.side?f.rotation?-8:-f.getBBox().height:2===e.side?b.y+8:Math.cos(f.rotation*q)*(b.y-f.getBBox(!1,0).height/2));a=a+g.x+b.x-(h&&d?h*l*(u?-1:1):0);k=k+t-(h&&!d?h*l*(u?1:-1):0);w&&(f=B/(c||1)%w,e.opposite&&(f=w-f-1),k+=e.labelOffset/w*f);return{x:a,y:Math.round(k)}},getMarkPath:function(a,f,h,d,g,w){return w.crispLine(["M",a,f,"L",a+(g?
0:-h),f+(g?h:0)],d)},render:function(a,k,v){var d=this.axis,g=d.options,w=d.chart.renderer,n=d.horiz,c=this.type,e=this.label,l=this.pos,u=g.labels,q=this.gridLine,b=c?c+"Tick":"tick",t=d.tickSize(b),y=this.mark,K=!y,x=u.step,m={},r=!0,G=d.tickmarkOffset,H=this.getPosition(n,l,G,k),N=H.x,H=H.y,p=n&&N===d.pos+d.len||!n&&H===d.pos?-1:1,A=c?c+"Grid":"grid",P=g[A+"LineWidth"],O=g[A+"LineColor"],C=g[A+"LineDashStyle"],A=f(g[b+"Width"],!c&&d.isXAxis?1:0),b=g[b+"Color"];v=f(v,1);this.isActive=!0;q||(m.stroke=
O,m["stroke-width"]=P,C&&(m.dashstyle=C),c||(m.zIndex=1),k&&(m.opacity=0),this.gridLine=q=w.path().attr(m).addClass("highcharts-"+(c?c+"-":"")+"grid-line").add(d.gridGroup));if(!k&&q&&(l=d.getPlotLinePath(l+G,q.strokeWidth()*p,k,!0)))q[this.isNew?"attr":"animate"]({d:l,opacity:v});t&&(d.opposite&&(t[0]=-t[0]),K&&(this.mark=y=w.path().addClass("highcharts-"+(c?c+"-":"")+"tick").add(d.axisGroup),y.attr({stroke:b,"stroke-width":A})),y[K?"attr":"animate"]({d:this.getMarkPath(N,H,t[0],y.strokeWidth()*
p,n,w),opacity:v}));e&&J(N)&&(e.xy=H=this.getLabelPosition(N,H,e,n,u,G,a,x),this.isFirst&&!this.isLast&&!f(g.showFirstLabel,1)||this.isLast&&!this.isFirst&&!f(g.showLastLabel,1)?r=!1:!n||d.isRadial||u.step||u.rotation||k||0===v||this.handleOverflow(H),x&&a%x&&(r=!1),r&&J(H.y)?(H.opacity=v,e[this.isNew?"attr":"animate"](H)):(h(e),e.attr("y",-9999)),this.isNew=!1)},destroy:function(){F(this,this.axis)}}})(M);(function(a){var D=a.addEvent,z=a.animObject,F=a.arrayMax,J=a.arrayMin,m=a.AxisPlotLineOrBandExtension,
f=a.color,h=a.correctFloat,q=a.defaultOptions,n=a.defined,k=a.deg2rad,v=a.destroyObjectProperties,d=a.each,g=a.error,w=a.extend,B=a.fireEvent,c=a.format,e=a.getMagnitude,l=a.grep,u=a.inArray,L=a.isArray,b=a.isNumber,t=a.isString,y=a.merge,K=a.normalizeTickInterval,x=a.pick,I=a.PlotLineOrBand,r=a.removeEvent,G=a.splat,H=a.syncTimeout,N=a.Tick;a.Axis=function(){this.init.apply(this,arguments)};a.Axis.prototype={defaultOptions:{dateTimeLabelFormats:{millisecond:"%H:%M:%S.%L",second:"%H:%M:%S",minute:"%H:%M",
hour:"%H:%M",day:"%e. %b",week:"%e. %b",month:"%b '%y",year:"%Y"},endOnTick:!1,labels:{enabled:!0,style:{color:"#666666",cursor:"default",fontSize:"11px"},x:0},minPadding:.01,maxPadding:.01,minorTickLength:2,minorTickPosition:"outside",startOfWeek:1,startOnTick:!1,tickLength:10,tickmarkPlacement:"between",tickPixelInterval:100,tickPosition:"outside",title:{align:"middle",style:{color:"#666666"}},type:"linear",minorGridLineColor:"#f2f2f2",minorGridLineWidth:1,minorTickColor:"#999999",lineColor:"#ccd6eb",
lineWidth:1,gridLineColor:"#e6e6e6",tickColor:"#ccd6eb"},defaultYAxisOptions:{endOnTick:!0,tickPixelInterval:72,showLastLabel:!0,labels:{x:-8},maxPadding:.05,minPadding:.05,startOnTick:!0,title:{rotation:270,text:"Values"},stackLabels:{enabled:!1,formatter:function(){return a.numberFormat(this.total,-1)},style:{fontSize:"11px",fontWeight:"bold",color:"#000000",textShadow:"1px 1px contrast, -1px -1px contrast, -1px 1px contrast, 1px -1px contrast"}},gridLineWidth:1,lineWidth:0},defaultLeftAxisOptions:{labels:{x:-15},
title:{rotation:270}},defaultRightAxisOptions:{labels:{x:15},title:{rotation:90}},defaultBottomAxisOptions:{labels:{autoRotation:[-45],x:0},title:{rotation:0}},defaultTopAxisOptions:{labels:{autoRotation:[-45],x:0},title:{rotation:0}},init:function(a,b){var e=b.isX;this.chart=a;this.horiz=a.inverted?!e:e;this.isXAxis=e;this.coll=this.coll||(e?"xAxis":"yAxis");this.opposite=b.opposite;this.side=b.side||(this.horiz?this.opposite?0:2:this.opposite?1:3);this.setOptions(b);var c=this.options,p=c.type;
this.labelFormatter=c.labels.formatter||this.defaultLabelFormatter;this.userOptions=b;this.minPixelPadding=0;this.reversed=c.reversed;this.visible=!1!==c.visible;this.zoomEnabled=!1!==c.zoomEnabled;this.hasNames="category"===p||!0===c.categories;this.categories=c.categories||this.hasNames;this.names=this.names||[];this.isLog="logarithmic"===p;this.isDatetimeAxis="datetime"===p;this.isLinked=n(c.linkedTo);this.ticks={};this.labelEdge=[];this.minorTicks={};this.plotLinesAndBands=[];this.alternateBands=
{};this.len=0;this.minRange=this.userMinRange=c.minRange||c.maxZoom;this.range=c.range;this.offset=c.offset||0;this.stacks={};this.oldStacks={};this.stacksTouched=0;this.min=this.max=null;this.crosshair=x(c.crosshair,G(a.options.tooltip.crosshairs)[e?0:1],!1);var d;b=this.options.events;-1===u(this,a.axes)&&(e?a.axes.splice(a.xAxis.length,0,this):a.axes.push(this),a[this.coll].push(this));this.series=this.series||[];a.inverted&&e&&void 0===this.reversed&&(this.reversed=!0);this.removePlotLine=this.removePlotBand=
this.removePlotBandOrLine;for(d in b)D(this,d,b[d]);this.isLog&&(this.val2lin=this.log2lin,this.lin2val=this.lin2log)},setOptions:function(a){this.options=y(this.defaultOptions,"yAxis"===this.coll&&this.defaultYAxisOptions,[this.defaultTopAxisOptions,this.defaultRightAxisOptions,this.defaultBottomAxisOptions,this.defaultLeftAxisOptions][this.side],y(q[this.coll],a))},defaultLabelFormatter:function(){var b=this.axis,e=this.value,d=b.categories,l=this.dateTimeLabelFormat,g=q.lang.numericSymbols,r=g&&
g.length,u,f=b.options.labels.format,b=b.isLog?e:b.tickInterval;if(f)u=c(f,this);else if(d)u=e;else if(l)u=a.dateFormat(l,e);else if(r&&1E3<=b)for(;r--&&void 0===u;)d=Math.pow(1E3,r+1),b>=d&&0===10*e%d&&null!==g[r]&&0!==e&&(u=a.numberFormat(e/d,-1)+g[r]);void 0===u&&(u=1E4<=Math.abs(e)?a.numberFormat(e,-1):a.numberFormat(e,-1,void 0,""));return u},getSeriesExtremes:function(){var a=this,e=a.chart;a.hasVisibleSeries=!1;a.dataMin=a.dataMax=a.threshold=null;a.softThreshold=!a.isXAxis;a.buildStacks&&
a.buildStacks();d(a.series,function(c){if(c.visible||!e.options.chart.ignoreHiddenSeries){var p=c.options,d=p.threshold,A;a.hasVisibleSeries=!0;a.isLog&&0>=d&&(d=null);if(a.isXAxis)p=c.xData,p.length&&(c=J(p),b(c)||c instanceof Date||(p=l(p,function(a){return b(a)}),c=J(p)),a.dataMin=Math.min(x(a.dataMin,p[0]),c),a.dataMax=Math.max(x(a.dataMax,p[0]),F(p)));else if(c.getExtremes(),A=c.dataMax,c=c.dataMin,n(c)&&n(A)&&(a.dataMin=Math.min(x(a.dataMin,c),c),a.dataMax=Math.max(x(a.dataMax,A),A)),n(d)&&
(a.threshold=d),!p.softThreshold||a.isLog)a.softThreshold=!1}})},translate:function(a,e,c,d,l,g){var p=this.linkedParent||this,A=1,r=0,u=d?p.oldTransA:p.transA;d=d?p.oldMin:p.min;var E=p.minPixelPadding;l=(p.isOrdinal||p.isBroken||p.isLog&&l)&&p.lin2val;u||(u=p.transA);c&&(A*=-1,r=p.len);p.reversed&&(A*=-1,r-=A*(p.sector||p.len));e?(a=(a*A+r-E)/u+d,l&&(a=p.lin2val(a))):(l&&(a=p.val2lin(a)),"between"===g&&(g=.5),a=A*(a-d)*u+r+A*E+(b(g)?u*g*p.pointRange:0));return a},toPixels:function(a,b){return this.translate(a,
!1,!this.horiz,null,!0)+(b?0:this.pos)},toValue:function(a,b){return this.translate(a-(b?0:this.pos),!0,!this.horiz,null,!0)},getPlotLinePath:function(a,e,c,d,l){var p=this.chart,A=this.left,g=this.top,r,u,f=c&&p.oldChartHeight||p.chartHeight,k=c&&p.oldChartWidth||p.chartWidth,h;r=this.transB;var t=function(a,b,e){if(a<b||a>e)d?a=Math.min(Math.max(b,a),e):h=!0;return a};l=x(l,this.translate(a,null,null,c));a=c=Math.round(l+r);r=u=Math.round(f-l-r);b(l)?this.horiz?(r=g,u=f-this.bottom,a=c=t(a,A,A+
this.width)):(a=A,c=k-this.right,r=u=t(r,g,g+this.height)):h=!0;return h&&!d?null:p.renderer.crispLine(["M",a,r,"L",c,u],e||1)},getLinearTickPositions:function(a,e,c){var p,d=h(Math.floor(e/a)*a),A=h(Math.ceil(c/a)*a),l=[];if(e===c&&b(e))return[e];for(e=d;e<=A;){l.push(e);e=h(e+a);if(e===p)break;p=e}return l},getMinorTickPositions:function(){var a=this.options,b=this.tickPositions,e=this.minorTickInterval,c=[],d,l=this.pointRangePadding||0;d=this.min-l;var l=this.max+l,g=l-d;if(g&&g/e<this.len/3)if(this.isLog)for(l=
b.length,d=1;d<l;d++)c=c.concat(this.getLogTickPositions(e,b[d-1],b[d],!0));else if(this.isDatetimeAxis&&"auto"===a.minorTickInterval)c=c.concat(this.getTimeTicks(this.normalizeTimeTickInterval(e),d,l,a.startOfWeek));else for(b=d+(b[0]-d)%e;b<=l;b+=e)c.push(b);0!==c.length&&this.trimTicks(c,a.startOnTick,a.endOnTick);return c},adjustForMinRange:function(){var a=this.options,b=this.min,e=this.max,c,l=this.dataMax-this.dataMin>=this.minRange,g,r,u,f,k,h;this.isXAxis&&void 0===this.minRange&&!this.isLog&&
(n(a.min)||n(a.max)?this.minRange=null:(d(this.series,function(a){f=a.xData;for(r=k=a.xIncrement?1:f.length-1;0<r;r--)if(u=f[r]-f[r-1],void 0===g||u<g)g=u}),this.minRange=Math.min(5*g,this.dataMax-this.dataMin)));e-b<this.minRange&&(h=this.minRange,c=(h-e+b)/2,c=[b-c,x(a.min,b-c)],l&&(c[2]=this.isLog?this.log2lin(this.dataMin):this.dataMin),b=F(c),e=[b+h,x(a.max,b+h)],l&&(e[2]=this.isLog?this.log2lin(this.dataMax):this.dataMax),e=J(e),e-b<h&&(c[0]=e-h,c[1]=x(a.min,e-h),b=F(c)));this.min=b;this.max=
e},getClosest:function(){var a;this.categories?a=1:d(this.series,function(b){var e=b.closestPointRange;!b.noSharedTooltip&&n(e)&&(a=n(a)?Math.min(a,e):e)});return a},nameToX:function(a){var b=L(this.categories),e=b?this.categories:this.names,c=a.options.x,p;a.series.requireSorting=!1;n(c)||(c=!1===this.options.uniqueNames?a.series.autoIncrement():u(a.name,e));-1===c?b||(p=e.length):p=c;this.names[p]=a.name;return p},updateNames:function(){var a=this;0<this.names.length&&(this.names.length=0,this.minRange=
void 0,d(this.series||[],function(b){if(!b.points||b.isDirtyData)b.processData(),b.generatePoints();d(b.points,function(e,c){var p;e.options&&void 0===e.options.x&&(p=a.nameToX(e),p!==e.x&&(e.x=p,b.xData[c]=p))})}))},setAxisTranslation:function(a){var b=this,e=b.max-b.min,c=b.axisPointRange||0,p,l=0,g=0,r=b.linkedParent,u=!!b.categories,f=b.transA,h=b.isXAxis;if(h||u||c)r?(l=r.minPointOffset,g=r.pointRangePadding):(p=b.getClosest(),d(b.series,function(a){var e=u?1:h?x(a.options.pointRange,p,0):b.axisPointRange||
0;a=a.options.pointPlacement;c=Math.max(c,e);b.single||(l=Math.max(l,t(a)?0:e/2),g=Math.max(g,"on"===a?0:e))})),r=b.ordinalSlope&&p?b.ordinalSlope/p:1,b.minPointOffset=l*=r,b.pointRangePadding=g*=r,b.pointRange=Math.min(c,e),h&&(b.closestPointRange=p);a&&(b.oldTransA=f);b.translationSlope=b.transA=f=b.len/(e+g||1);b.transB=b.horiz?b.left:b.bottom;b.minPixelPadding=f*l},minFromRange:function(){return this.max-this.range},setTickInterval:function(a){var c=this,p=c.chart,l=c.options,r=c.isLog,u=c.log2lin,
f=c.isDatetimeAxis,k=c.isXAxis,t=c.isLinked,H=l.maxPadding,w=l.minPadding,y=l.tickInterval,G=l.tickPixelInterval,v=c.categories,q=c.threshold,m=c.softThreshold,I,L,N,z;f||v||t||this.getTickAmount();N=x(c.userMin,l.min);z=x(c.userMax,l.max);t?(c.linkedParent=p[c.coll][l.linkedTo],p=c.linkedParent.getExtremes(),c.min=x(p.min,p.dataMin),c.max=x(p.max,p.dataMax),l.type!==c.linkedParent.options.type&&g(11,1)):(!m&&n(q)&&(c.dataMin>=q?(I=q,w=0):c.dataMax<=q&&(L=q,H=0)),c.min=x(N,I,c.dataMin),c.max=x(z,
L,c.dataMax));r&&(!a&&0>=Math.min(c.min,x(c.dataMin,c.min))&&g(10,1),c.min=h(u(c.min),15),c.max=h(u(c.max),15));c.range&&n(c.max)&&(c.userMin=c.min=N=Math.max(c.min,c.minFromRange()),c.userMax=z=c.max,c.range=null);B(c,"foundExtremes");c.beforePadding&&c.beforePadding();c.adjustForMinRange();!(v||c.axisPointRange||c.usePercentage||t)&&n(c.min)&&n(c.max)&&(u=c.max-c.min)&&(!n(N)&&w&&(c.min-=u*w),!n(z)&&H&&(c.max+=u*H));b(l.floor)?c.min=Math.max(c.min,l.floor):b(l.softMin)&&(c.min=Math.min(c.min,l.softMin));
b(l.ceiling)?c.max=Math.min(c.max,l.ceiling):b(l.softMax)&&(c.max=Math.max(c.max,l.softMax));m&&n(c.dataMin)&&(q=q||0,!n(N)&&c.min<q&&c.dataMin>=q?c.min=q:!n(z)&&c.max>q&&c.dataMax<=q&&(c.max=q));c.tickInterval=c.min===c.max||void 0===c.min||void 0===c.max?1:t&&!y&&G===c.linkedParent.options.tickPixelInterval?y=c.linkedParent.tickInterval:x(y,this.tickAmount?(c.max-c.min)/Math.max(this.tickAmount-1,1):void 0,v?1:(c.max-c.min)*G/Math.max(c.len,G));k&&!a&&d(c.series,function(a){a.processData(c.min!==
c.oldMin||c.max!==c.oldMax)});c.setAxisTranslation(!0);c.beforeSetTickPositions&&c.beforeSetTickPositions();c.postProcessTickInterval&&(c.tickInterval=c.postProcessTickInterval(c.tickInterval));c.pointRange&&!y&&(c.tickInterval=Math.max(c.pointRange,c.tickInterval));a=x(l.minTickInterval,c.isDatetimeAxis&&c.closestPointRange);!y&&c.tickInterval<a&&(c.tickInterval=a);f||r||y||(c.tickInterval=K(c.tickInterval,null,e(c.tickInterval),x(l.allowDecimals,!(.5<c.tickInterval&&5>c.tickInterval&&1E3<c.max&&
9999>c.max)),!!this.tickAmount));this.tickAmount||(c.tickInterval=c.unsquish());this.setTickPositions()},setTickPositions:function(){var a=this.options,b,c=a.tickPositions,e=a.tickPositioner,d=a.startOnTick,l=a.endOnTick,g;this.tickmarkOffset=this.categories&&"between"===a.tickmarkPlacement&&1===this.tickInterval?.5:0;this.minorTickInterval="auto"===a.minorTickInterval&&this.tickInterval?this.tickInterval/5:a.minorTickInterval;this.tickPositions=b=c&&c.slice();!b&&(b=this.isDatetimeAxis?this.getTimeTicks(this.normalizeTimeTickInterval(this.tickInterval,
a.units),this.min,this.max,a.startOfWeek,this.ordinalPositions,this.closestPointRange,!0):this.isLog?this.getLogTickPositions(this.tickInterval,this.min,this.max):this.getLinearTickPositions(this.tickInterval,this.min,this.max),b.length>this.len&&(b=[b[0],b.pop()]),this.tickPositions=b,e&&(e=e.apply(this,[this.min,this.max])))&&(this.tickPositions=b=e);this.isLinked||(this.trimTicks(b,d,l),this.min===this.max&&n(this.min)&&!this.tickAmount&&(g=!0,this.min-=.5,this.max+=.5),this.single=g,c||e||this.adjustTickAmount())},
trimTicks:function(a,b,c){var e=a[0],d=a[a.length-1],p=this.minPointOffset||0;if(b)this.min=e;else for(;this.min-p>a[0];)a.shift();if(c)this.max=d;else for(;this.max+p<a[a.length-1];)a.pop();0===a.length&&n(e)&&a.push((d+e)/2)},alignToOthers:function(){var a={},b,c=this.options;!1!==this.chart.options.chart.alignTicks&&!1!==c.alignTicks&&d(this.chart[this.coll],function(c){var e=c.options,e=[c.horiz?e.left:e.top,e.width,e.height,e.pane].join();c.series.length&&(a[e]?b=!0:a[e]=1)});return b},getTickAmount:function(){var a=
this.options,b=a.tickAmount,c=a.tickPixelInterval;!n(a.tickInterval)&&this.len<c&&!this.isRadial&&!this.isLog&&a.startOnTick&&a.endOnTick&&(b=2);!b&&this.alignToOthers()&&(b=Math.ceil(this.len/c)+1);4>b&&(this.finalTickAmt=b,b=5);this.tickAmount=b},adjustTickAmount:function(){var a=this.tickInterval,b=this.tickPositions,c=this.tickAmount,e=this.finalTickAmt,d=b&&b.length;if(d<c){for(;b.length<c;)b.push(h(b[b.length-1]+a));this.transA*=(d-1)/(c-1);this.max=b[b.length-1]}else d>c&&(this.tickInterval*=
2,this.setTickPositions());if(n(e)){for(a=c=b.length;a--;)(3===e&&1===a%2||2>=e&&0<a&&a<c-1)&&b.splice(a,1);this.finalTickAmt=void 0}},setScale:function(){var a,b;this.oldMin=this.min;this.oldMax=this.max;this.oldAxisLength=this.len;this.setAxisSize();b=this.len!==this.oldAxisLength;d(this.series,function(b){if(b.isDirtyData||b.isDirty||b.xAxis.isDirty)a=!0});b||a||this.isLinked||this.forceRedraw||this.userMin!==this.oldUserMin||this.userMax!==this.oldUserMax||this.alignToOthers()?(this.resetStacks&&
this.resetStacks(),this.forceRedraw=!1,this.getSeriesExtremes(),this.setTickInterval(),this.oldUserMin=this.userMin,this.oldUserMax=this.userMax,this.isDirty||(this.isDirty=b||this.min!==this.oldMin||this.max!==this.oldMax)):this.cleanStacks&&this.cleanStacks()},setExtremes:function(a,b,c,e,l){var p=this,g=p.chart;c=x(c,!0);d(p.series,function(a){delete a.kdTree});l=w(l,{min:a,max:b});B(p,"setExtremes",l,function(){p.userMin=a;p.userMax=b;p.eventArgs=l;c&&g.redraw(e)})},zoom:function(a,b){var c=this.dataMin,
e=this.dataMax,d=this.options,p=Math.min(c,x(d.min,c)),d=Math.max(e,x(d.max,e));if(a!==this.min||b!==this.max)this.allowZoomOutside||(n(c)&&a<=p&&(a=p),n(e)&&b>=d&&(b=d)),this.displayBtn=void 0!==a||void 0!==b,this.setExtremes(a,b,!1,void 0,{trigger:"zoom"});return!0},setAxisSize:function(){var a=this.chart,b=this.options,c=b.offsetLeft||0,e=this.horiz,d=x(b.width,a.plotWidth-c+(b.offsetRight||0)),l=x(b.height,a.plotHeight),g=x(b.top,a.plotTop),b=x(b.left,a.plotLeft+c),c=/%$/;c.test(l)&&(l=Math.round(parseFloat(l)/
100*a.plotHeight));c.test(g)&&(g=Math.round(parseFloat(g)/100*a.plotHeight+a.plotTop));this.left=b;this.top=g;this.width=d;this.height=l;this.bottom=a.chartHeight-l-g;this.right=a.chartWidth-d-b;this.len=Math.max(e?d:l,0);this.pos=e?b:g},getExtremes:function(){var a=this.isLog,b=this.lin2log;return{min:a?h(b(this.min)):this.min,max:a?h(b(this.max)):this.max,dataMin:this.dataMin,dataMax:this.dataMax,userMin:this.userMin,userMax:this.userMax}},getThreshold:function(a){var b=this.isLog,c=this.lin2log,
e=b?c(this.min):this.min,b=b?c(this.max):this.max;null===a?a=e:e>a?a=e:b<a&&(a=b);return this.translate(a,0,1,0,1)},autoLabelAlign:function(a){a=(x(a,0)-90*this.side+720)%360;return 15<a&&165>a?"right":195<a&&345>a?"left":"center"},tickSize:function(a){var b=this.options,c=b[a+"Length"],e=x(b[a+"Width"],"tick"===a&&this.isXAxis?1:0);if(e&&c)return"inside"===b[a+"Position"]&&(c=-c),[c,e]},labelMetrics:function(){return this.chart.renderer.fontMetrics(this.options.labels.style&&this.options.labels.style.fontSize,
this.ticks[0]&&this.ticks[0].label)},unsquish:function(){var a=this.options.labels,b=this.horiz,c=this.tickInterval,e=c,l=this.len/(((this.categories?1:0)+this.max-this.min)/c),g,r=a.rotation,u=this.labelMetrics(),f,h=Number.MAX_VALUE,t,H=function(a){a/=l||1;a=1<a?Math.ceil(a):1;return a*c};b?(t=!a.staggerLines&&!a.step&&(n(r)?[r]:l<x(a.autoRotationLimit,80)&&a.autoRotation))&&d(t,function(a){var b;if(a===r||a&&-90<=a&&90>=a)f=H(Math.abs(u.h/Math.sin(k*a))),b=f+Math.abs(a/360),b<h&&(h=b,g=a,e=f)}):
a.step||(e=H(u.h));this.autoRotation=t;this.labelRotation=x(g,r);return e},getSlotWidth:function(){var a=this.chart,b=this.horiz,c=this.options.labels,e=Math.max(this.tickPositions.length-(this.categories?0:1),1),d=a.margin[3];return b&&2>(c.step||0)&&!c.rotation&&(this.staggerLines||1)*a.plotWidth/e||!b&&(d&&d-a.spacing[3]||.33*a.chartWidth)},renderUnsquish:function(){var a=this.chart,b=a.renderer,c=this.tickPositions,e=this.ticks,l=this.options.labels,g=this.horiz,r=this.getSlotWidth(),u=Math.max(1,
Math.round(r-2*(l.padding||5))),f={},h=this.labelMetrics(),k=l.style&&l.style.textOverflow,H,w=0,x,G;t(l.rotation)||(f.rotation=l.rotation||0);d(c,function(a){(a=e[a])&&a.labelLength>w&&(w=a.labelLength)});this.maxLabelLength=w;if(this.autoRotation)w>u&&w>h.h?f.rotation=this.labelRotation:this.labelRotation=0;else if(r&&(H={width:u+"px"},!k))for(H.textOverflow="clip",x=c.length;!g&&x--;)if(G=c[x],u=e[G].label)u.styles&&"ellipsis"===u.styles.textOverflow?u.css({textOverflow:"clip"}):e[G].labelLength>
r&&u.css({width:r+"px"}),u.getBBox().height>this.len/c.length-(h.h-h.f)&&(u.specCss={textOverflow:"ellipsis"});f.rotation&&(H={width:(w>.5*a.chartHeight?.33*a.chartHeight:a.chartHeight)+"px"},k||(H.textOverflow="ellipsis"));if(this.labelAlign=l.align||this.autoLabelAlign(this.labelRotation))f.align=this.labelAlign;d(c,function(a){var b=(a=e[a])&&a.label;b&&(b.attr(f),H&&b.css(y(H,b.specCss)),delete b.specCss,a.rotation=f.rotation)});this.tickRotCorr=b.rotCorr(h.b,this.labelRotation||0,0!==this.side)},
hasData:function(){return this.hasVisibleSeries||n(this.min)&&n(this.max)&&!!this.tickPositions},getOffset:function(){var a=this,b=a.chart,c=b.renderer,e=a.options,l=a.tickPositions,g=a.ticks,r=a.horiz,u=a.side,f=b.inverted?[1,0,3,2][u]:u,h,k,t=0,H,w=0,y=e.title,G=e.labels,K=0,v=a.opposite,q=b.axisOffset,b=b.clipOffset,m=[-1,1,1,-1][u],B,I=e.className,L=a.axisParent,z=this.tickSize("tick");h=a.hasData();a.showAxis=k=h||x(e.showEmpty,!0);a.staggerLines=a.horiz&&G.staggerLines;a.axisGroup||(a.gridGroup=
c.g("grid").attr({zIndex:e.gridZIndex||1}).addClass("highcharts-"+this.coll.toLowerCase()+"-grid "+(I||"")).add(L),a.axisGroup=c.g("axis").attr({zIndex:e.zIndex||2}).addClass("highcharts-"+this.coll.toLowerCase()+" "+(I||"")).add(L),a.labelGroup=c.g("axis-labels").attr({zIndex:G.zIndex||7}).addClass("highcharts-"+a.coll.toLowerCase()+"-labels "+(I||"")).add(L));if(h||a.isLinked)d(l,function(b){g[b]?g[b].addLabel():g[b]=new N(a,b)}),a.renderUnsquish(),!1===G.reserveSpace||0!==u&&2!==u&&{1:"left",3:"right"}[u]!==
a.labelAlign&&"center"!==a.labelAlign||d(l,function(a){K=Math.max(g[a].getLabelSize(),K)}),a.staggerLines&&(K*=a.staggerLines,a.labelOffset=K*(a.opposite?-1:1));else for(B in g)g[B].destroy(),delete g[B];y&&y.text&&!1!==y.enabled&&(a.axisTitle||((B=y.textAlign)||(B=(r?{low:"left",middle:"center",high:"right"}:{low:v?"right":"left",middle:"center",high:v?"left":"right"})[y.align]),a.axisTitle=c.text(y.text,0,0,y.useHTML).attr({zIndex:7,rotation:y.rotation||0,align:B}).addClass("highcharts-axis-title").css(y.style).add(a.axisGroup),
a.axisTitle.isNew=!0),k&&(t=a.axisTitle.getBBox()[r?"height":"width"],H=y.offset,w=n(H)?0:x(y.margin,r?5:10)),a.axisTitle[k?"show":"hide"](!0));a.renderLine();a.offset=m*x(e.offset,q[u]);a.tickRotCorr=a.tickRotCorr||{x:0,y:0};c=0===u?-a.labelMetrics().h:2===u?a.tickRotCorr.y:0;w=Math.abs(K)+w;K&&(w=w-c+m*(r?x(G.y,a.tickRotCorr.y+8*m):G.x));a.axisTitleMargin=x(H,w);q[u]=Math.max(q[u],a.axisTitleMargin+t+m*a.offset,w,h&&l.length&&z?z[0]:0);e=e.offset?0:2*Math.floor(a.axisLine.strokeWidth()/2);b[f]=
Math.max(b[f],e)},getLinePath:function(a){var b=this.chart,c=this.opposite,e=this.offset,d=this.horiz,l=this.left+(c?this.width:0)+e,e=b.chartHeight-this.bottom-(c?this.height:0)+e;c&&(a*=-1);return b.renderer.crispLine(["M",d?this.left:l,d?e:this.top,"L",d?b.chartWidth-this.right:l,d?e:b.chartHeight-this.bottom],a)},renderLine:function(){this.axisLine||(this.axisLine=this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup),this.axisLine.attr({stroke:this.options.lineColor,
"stroke-width":this.options.lineWidth,zIndex:7}))},getTitlePosition:function(){var a=this.horiz,b=this.left,c=this.top,e=this.len,d=this.options.title,l=a?b:c,g=this.opposite,r=this.offset,u=d.x||0,f=d.y||0,h=this.chart.renderer.fontMetrics(d.style&&d.style.fontSize,this.axisTitle).f,e={low:l+(a?0:e),middle:l+e/2,high:l+(a?e:0)}[d.align],b=(a?c+this.height:b)+(a?1:-1)*(g?-1:1)*this.axisTitleMargin+(2===this.side?h:0);return{x:a?e+u:b+(g?this.width:0)+r+u,y:a?b+f-(g?this.height:0)+r:e+f}},render:function(){var a=
this,c=a.chart,e=c.renderer,l=a.options,g=a.isLog,r=a.lin2log,u=a.isLinked,f=a.tickPositions,h=a.axisTitle,k=a.ticks,t=a.minorTicks,w=a.alternateBands,y=l.stackLabels,x=l.alternateGridColor,G=a.tickmarkOffset,n=a.axisLine,K=c.hasRendered&&b(a.oldMin),v=a.showAxis,q=z(e.globalAnimation),m,B;a.labelEdge.length=0;a.overlap=!1;d([k,t,w],function(a){for(var b in a)a[b].isActive=!1});if(a.hasData()||u)a.minorTickInterval&&!a.categories&&d(a.getMinorTickPositions(),function(b){t[b]||(t[b]=new N(a,b,"minor"));
K&&t[b].isNew&&t[b].render(null,!0);t[b].render(null,!1,1)}),f.length&&(d(f,function(b,c){if(!u||b>=a.min&&b<=a.max)k[b]||(k[b]=new N(a,b)),K&&k[b].isNew&&k[b].render(c,!0,.1),k[b].render(c)}),G&&(0===a.min||a.single)&&(k[-1]||(k[-1]=new N(a,-1,null,!0)),k[-1].render(-1))),x&&d(f,function(b,e){B=void 0!==f[e+1]?f[e+1]+G:a.max-G;0===e%2&&b<a.max&&B<=a.max+(c.polar?-G:G)&&(w[b]||(w[b]=new I(a)),m=b+G,w[b].options={from:g?r(m):m,to:g?r(B):B,color:x},w[b].render(),w[b].isActive=!0)}),a._addedPlotLB||
(d((l.plotLines||[]).concat(l.plotBands||[]),function(b){a.addPlotBandOrLine(b)}),a._addedPlotLB=!0);d([k,t,w],function(a){var b,e,d=[],l=q.duration;for(b in a)a[b].isActive||(a[b].render(b,!1,0),a[b].isActive=!1,d.push(b));H(function(){for(e=d.length;e--;)a[d[e]]&&!a[d[e]].isActive&&(a[d[e]].destroy(),delete a[d[e]])},a!==w&&c.hasRendered&&l?l:0)});n&&(n[n.isPlaced?"animate":"attr"]({d:this.getLinePath(n.strokeWidth())}),n.isPlaced=!0,n[v?"show":"hide"](!0));h&&v&&(h[h.isNew?"attr":"animate"](a.getTitlePosition()),
h.isNew=!1);y&&y.enabled&&a.renderStackTotals();a.isDirty=!1},redraw:function(){this.visible&&(this.render(),d(this.plotLinesAndBands,function(a){a.render()}));d(this.series,function(a){a.isDirty=!0})},destroy:function(a){var b=this,c=b.stacks,e,l=b.plotLinesAndBands,g;a||r(b);for(e in c)v(c[e]),c[e]=null;d([b.ticks,b.minorTicks,b.alternateBands],function(a){v(a)});if(l)for(a=l.length;a--;)l[a].destroy();d("stackTotalGroup axisLine axisTitle axisGroup gridGroup labelGroup cross".split(" "),function(a){b[a]&&
(b[a]=b[a].destroy())});l="extKey hcEvents names series userMax userMin".split(" ");for(g in b)b.hasOwnProperty(g)&&-1===u(g,l)&&delete b[g]},drawCrosshair:function(a,b){var c,e=this.crosshair,d=x(e.snap,!0),l,g=this.cross;a||(a=this.cross&&this.cross.e);this.crosshair&&!1!==(n(b)||!d)?(d?n(b)&&(l=this.isXAxis?b.plotX:this.len-b.plotY):l=a&&(this.horiz?a.chartX-this.pos:this.len-a.chartY+this.pos),n(l)&&(c=this.getPlotLinePath(b&&(this.isXAxis?b.x:x(b.stackY,b.y)),null,null,null,l)||null),n(c)?(b=
this.categories&&!this.isRadial,g||(this.cross=g=this.chart.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-"+(b?"category ":"thin ")+e.className).attr({zIndex:x(e.zIndex,2)}).add(),g.attr({stroke:e.color||(b?f("#ccd6eb").setOpacity(.25).get():"#cccccc"),"stroke-width":x(e.width,1)}),e.dashStyle&&g.attr({dashstyle:e.dashStyle})),g.show().attr({d:c}),b&&!e.width&&g.attr({"stroke-width":this.transA}),this.cross.e=a):this.hideCrosshair()):this.hideCrosshair()},hideCrosshair:function(){this.cross&&
this.cross.hide()}};w(a.Axis.prototype,m)})(M);(function(a){var D=a.Axis,z=a.Date,F=a.dateFormat,J=a.defaultOptions,m=a.defined,f=a.each,h=a.extend,q=a.getMagnitude,n=a.getTZOffset,k=a.normalizeTickInterval,v=a.pick,d=a.timeUnits;D.prototype.getTimeTicks=function(a,k,q,c){var e=[],l={},g=J.global.useUTC,w,b=new z(k-n(k)),t,y=z.hcMakeTime,K=a.unitRange,x=a.count,B;if(m(k)){b[z.hcSetMilliseconds](K>=d.second?0:x*Math.floor(b.getMilliseconds()/x));if(K>=d.second)b[z.hcSetSeconds](K>=d.minute?0:x*Math.floor(b.getSeconds()/
x));if(K>=d.minute)b[z.hcSetMinutes](K>=d.hour?0:x*Math.floor(b[z.hcGetMinutes]()/x));K>=d.hour&&(b[z.hcSetHours](K>=d.day?0:x*Math.floor(b[z.hcGetHours]()/x)),t=b[z.hcGetHours]());if(K>=d.day)b[z.hcSetDate](K>=d.month?1:x*Math.floor(b[z.hcGetDate]()/x));K>=d.month&&(b[z.hcSetMonth](K>=d.year?0:x*Math.floor(b[z.hcGetMonth]()/x)),w=b[z.hcGetFullYear]());if(K>=d.year)b[z.hcSetFullYear](w-w%x);if(K===d.week)b[z.hcSetDate](b[z.hcGetDate]()-b[z.hcGetDay]()+v(c,1));c=1;if(z.hcTimezoneOffset||z.hcGetTimezoneOffset)B=
(!g||!!z.hcGetTimezoneOffset)&&(q-k>4*d.month||n(k)!==n(q)),b=b.getTime(),b=new z(b+n(b));w=b[z.hcGetFullYear]();k=b.getTime();g=b[z.hcGetMonth]();for(b=b[z.hcGetDate]();k<q;)e.push(k),k=K===d.year?y(w+c*x,0):K===d.month?y(w,g+c*x):!B||K!==d.day&&K!==d.week?B&&K===d.hour?y(w,g,b,t+c*x):k+K*x:y(w,g,b+c*x*(K===d.day?1:7)),c++;e.push(k);K<=d.hour&&f(e,function(a){"000000000"===F("%H%M%S%L",a)&&(l[a]="day")})}e.info=h(a,{higherRanks:l,totalRange:K*x});return e};D.prototype.normalizeTimeTickInterval=function(a,
f){var g=f||[["millisecond",[1,2,5,10,20,25,50,100,200,500]],["second",[1,2,5,10,15,30]],["minute",[1,2,5,10,15,30]],["hour",[1,2,3,4,6,8,12]],["day",[1,2]],["week",[1,2]],["month",[1,2,3,4,6]],["year",null]];f=g[g.length-1];var c=d[f[0]],e=f[1],l;for(l=0;l<g.length&&!(f=g[l],c=d[f[0]],e=f[1],g[l+1]&&a<=(c*e[e.length-1]+d[g[l+1][0]])/2);l++);c===d.year&&a<5*c&&(e=[1,2,5]);a=k(a/c,e,"year"===f[0]?Math.max(q(a/c),1):1);return{unitRange:c,count:a,unitName:f[0]}}})(M);(function(a){var D=a.Axis,z=a.getMagnitude,
F=a.map,J=a.normalizeTickInterval,m=a.pick;D.prototype.getLogTickPositions=function(a,h,q,n){var f=this.options,v=this.len,d=this.lin2log,g=this.log2lin,w=[];n||(this._minorAutoInterval=null);if(.5<=a)a=Math.round(a),w=this.getLinearTickPositions(a,h,q);else if(.08<=a)for(var v=Math.floor(h),B,c,e,l,u,f=.3<a?[1,2,4]:.15<a?[1,2,4,6,8]:[1,2,3,4,5,6,7,8,9];v<q+1&&!u;v++)for(c=f.length,B=0;B<c&&!u;B++)e=g(d(v)*f[B]),e>h&&(!n||l<=q)&&void 0!==l&&w.push(l),l>q&&(u=!0),l=e;else h=d(h),q=d(q),a=f[n?"minorTickInterval":
"tickInterval"],a=m("auto"===a?null:a,this._minorAutoInterval,f.tickPixelInterval/(n?5:1)*(q-h)/((n?v/this.tickPositions.length:v)||1)),a=J(a,null,z(a)),w=F(this.getLinearTickPositions(a,h,q),g),n||(this._minorAutoInterval=a/5);n||(this.tickInterval=a);return w};D.prototype.log2lin=function(a){return Math.log(a)/Math.LN10};D.prototype.lin2log=function(a){return Math.pow(10,a)}})(M);(function(a){var D=a.dateFormat,z=a.each,F=a.extend,J=a.format,m=a.isNumber,f=a.map,h=a.merge,q=a.pick,n=a.splat,k=a.stop,
v=a.syncTimeout,d=a.timeUnits;a.Tooltip=function(){this.init.apply(this,arguments)};a.Tooltip.prototype={init:function(a,d){this.chart=a;this.options=d;this.crosshairs=[];this.now={x:0,y:0};this.isHidden=!0;this.split=d.split&&!a.inverted;this.shared=d.shared||this.split},cleanSplit:function(a){z(this.chart.series,function(d){var g=d&&d.tt;g&&(!g.isActive||a?d.tt=g.destroy():g.isActive=!1)})},getLabel:function(){var a=this.chart.renderer,d=this.options;this.label||(this.split?this.label=a.g("tooltip"):
(this.label=a.label("",0,0,d.shape||"callout",null,null,d.useHTML,null,"tooltip").attr({padding:d.padding,r:d.borderRadius}),this.label.attr({fill:d.backgroundColor,"stroke-width":d.borderWidth}).css(d.style).shadow(d.shadow)),this.label.attr({zIndex:8}).add());return this.label},update:function(a){this.destroy();this.init(this.chart,h(!0,this.options,a))},destroy:function(){this.label&&(this.label=this.label.destroy());this.split&&this.tt&&(this.cleanSplit(this.chart,!0),this.tt=this.tt.destroy());
clearTimeout(this.hideTimer);clearTimeout(this.tooltipTimeout)},move:function(a,d,f,c){var e=this,l=e.now,g=!1!==e.options.animation&&!e.isHidden&&(1<Math.abs(a-l.x)||1<Math.abs(d-l.y)),h=e.followPointer||1<e.len;F(l,{x:g?(2*l.x+a)/3:a,y:g?(l.y+d)/2:d,anchorX:h?void 0:g?(2*l.anchorX+f)/3:f,anchorY:h?void 0:g?(l.anchorY+c)/2:c});e.getLabel().attr(l);g&&(clearTimeout(this.tooltipTimeout),this.tooltipTimeout=setTimeout(function(){e&&e.move(a,d,f,c)},32))},hide:function(a){var d=this;clearTimeout(this.hideTimer);
a=q(a,this.options.hideDelay,500);this.isHidden||(this.hideTimer=v(function(){d.getLabel()[a?"fadeOut":"hide"]();d.isHidden=!0},a))},getAnchor:function(a,d){var g,c=this.chart,e=c.inverted,l=c.plotTop,u=c.plotLeft,h=0,b=0,k,y;a=n(a);g=a[0].tooltipPos;this.followPointer&&d&&(void 0===d.chartX&&(d=c.pointer.normalize(d)),g=[d.chartX-c.plotLeft,d.chartY-l]);g||(z(a,function(a){k=a.series.yAxis;y=a.series.xAxis;h+=a.plotX+(!e&&y?y.left-u:0);b+=(a.plotLow?(a.plotLow+a.plotHigh)/2:a.plotY)+(!e&&k?k.top-
l:0)}),h/=a.length,b/=a.length,g=[e?c.plotWidth-b:h,this.shared&&!e&&1<a.length&&d?d.chartY-l:e?c.plotHeight-h:b]);return f(g,Math.round)},getPosition:function(a,d,f){var c=this.chart,e=this.distance,l={},g=f.h||0,h,b=["y",c.chartHeight,d,f.plotY+c.plotTop,c.plotTop,c.plotTop+c.plotHeight],k=["x",c.chartWidth,a,f.plotX+c.plotLeft,c.plotLeft,c.plotLeft+c.plotWidth],y=!this.followPointer&&q(f.ttBelow,!c.inverted===!!f.negative),n=function(a,b,c,d,r,u){var p=c<d-e,f=d+e+c<b,h=d-e-c;d+=e;if(y&&f)l[a]=
d;else if(!y&&p)l[a]=h;else if(p)l[a]=Math.min(u-c,0>h-g?h:h-g);else if(f)l[a]=Math.max(r,d+g+c>b?d:d+g);else return!1},x=function(a,b,c,d){var g;d<e||d>b-e?g=!1:l[a]=d<c/2?1:d>b-c/2?b-c-2:d-c/2;return g},w=function(a){var c=b;b=k;k=c;h=a},r=function(){!1!==n.apply(0,b)?!1!==x.apply(0,k)||h||(w(!0),r()):h?l.x=l.y=0:(w(!0),r())};(c.inverted||1<this.len)&&w();r();return l},defaultFormatter:function(a){var d=this.points||n(this),g;g=[a.tooltipFooterHeaderFormatter(d[0])];g=g.concat(a.bodyFormatter(d));
g.push(a.tooltipFooterHeaderFormatter(d[0],!0));return g},refresh:function(a,d){var g=this.chart,c=this.getLabel(),e=this.options,l,u,f={},b,h=[];b=e.formatter||this.defaultFormatter;var f=g.hoverPoints,y=this.shared;clearTimeout(this.hideTimer);this.followPointer=n(a)[0].series.tooltipOptions.followPointer;u=this.getAnchor(a,d);d=u[0];l=u[1];!y||a.series&&a.series.noSharedTooltip?f=a.getLabelConfig():(g.hoverPoints=a,f&&z(f,function(a){a.setState()}),z(a,function(a){a.setState("hover");h.push(a.getLabelConfig())}),
f={x:a[0].category,y:a[0].y},f.points=h,this.len=h.length,a=a[0]);b=b.call(f,this);f=a.series;this.distance=q(f.tooltipOptions.distance,16);!1===b?this.hide():(this.isHidden&&(k(c),c.attr({opacity:1}).show()),this.split?this.renderSplit(b,g.hoverPoints):(c.attr({text:b.join?b.join(""):b}),c.removeClass(/highcharts-color-[\d]+/g).addClass("highcharts-color-"+q(a.colorIndex,f.colorIndex)),c.attr({stroke:e.borderColor||a.color||f.color||"#666666"}),this.updatePosition({plotX:d,plotY:l,negative:a.negative,
ttBelow:a.ttBelow,h:u[2]||0})),this.isHidden=!1)},renderSplit:function(d,f){var g=this,c=[],e=this.chart,l=e.renderer,u=!0,h=this.options,b,k=this.getLabel();z(d.slice(0,d.length-1),function(a,d){d=f[d-1]||{isHeader:!0,plotX:f[0].plotX};var t=d.series||g,y=t.tt,r=d.series||{},G="highcharts-color-"+q(d.colorIndex,r.colorIndex,"none");y||(t.tt=y=l.label(null,null,null,d.isHeader&&"callout").addClass("highcharts-tooltip-box "+G).attr({padding:h.padding,r:h.borderRadius,fill:h.backgroundColor,stroke:d.color||
r.color||"#333333","stroke-width":h.borderWidth}).add(k),d.series&&(y.connector=l.path().addClass("highcharts-tooltip-connector "+G).attr({"stroke-width":r.options.lineWidth||2,stroke:d.color||r.color||"#666666"}).add(y)));y.isActive=!0;y.attr({text:a});a=y.getBBox();r=a.width+y.strokeWidth();d.isHeader?(b=a.height,r=Math.max(0,Math.min(d.plotX+e.plotLeft-r/2,e.chartWidth-r))):r=d.plotX+e.plotLeft-q(h.distance,16)-r;0>r&&(u=!1);a=(d.series&&d.series.yAxis&&d.series.yAxis.pos)+(d.plotY||0);a-=e.plotTop;
c.push({target:d.isHeader?e.plotHeight+b:a,rank:d.isHeader?1:0,size:t.tt.getBBox().height+1,point:d,x:r,tt:y})});this.cleanSplit();a.distribute(c,e.plotHeight+b);z(c,function(a){var b=a.point,c=a.tt,d;d={visibility:void 0===a.pos?"hidden":"inherit",x:u||b.isHeader?a.x:b.plotX+e.plotLeft+q(h.distance,16),y:a.pos+e.plotTop};b.isHeader&&(d.anchorX=b.plotX+e.plotLeft,d.anchorY=d.y-100);c.attr(d);b.isHeader||c.connector.attr({d:["M",b.plotX+e.plotLeft-d.x,b.plotY+b.series.yAxis.pos-d.y,"L",(u?-1:1)*q(h.distance,
16)+b.plotX+e.plotLeft-d.x,a.pos+e.plotTop+c.getBBox().height/2-d.y]})})},updatePosition:function(a){var d=this.chart,g=this.getLabel(),g=(this.options.positioner||this.getPosition).call(this,g.width,g.height,a);this.move(Math.round(g.x),Math.round(g.y||0),a.plotX+d.plotLeft,a.plotY+d.plotTop)},getXDateFormat:function(a,f,h){var c;f=f.dateTimeLabelFormats;var e=h&&h.closestPointRange,l,g={millisecond:15,second:12,minute:9,hour:6,day:3},k,b="millisecond";if(e){k=D("%m-%d %H:%M:%S.%L",a.x);for(l in d){if(e===
d.week&&+D("%w",a.x)===h.options.startOfWeek&&"00:00:00.000"===k.substr(6)){l="week";break}if(d[l]>e){l=b;break}if(g[l]&&k.substr(g[l])!=="01-01 00:00:00.000".substr(g[l]))break;"week"!==l&&(b=l)}l&&(c=f[l])}else c=f.day;return c||f.year},tooltipFooterHeaderFormatter:function(a,d){var g=d?"footer":"header";d=a.series;var c=d.tooltipOptions,e=c.xDateFormat,l=d.xAxis,u=l&&"datetime"===l.options.type&&m(a.key),g=c[g+"Format"];u&&!e&&(e=this.getXDateFormat(a,c,l));u&&e&&(g=g.replace("{point.key}","{point.key:"+
e+"}"));return J(g,{point:a,series:d})},bodyFormatter:function(a){return f(a,function(a){var d=a.series.tooltipOptions;return(d.pointFormatter||a.point.tooltipFormatter).call(a.point,d.pointFormat)})}}})(M);(function(a){var D=a.addEvent,z=a.attr,F=a.charts,J=a.color,m=a.css,f=a.defined,h=a.doc,q=a.each,n=a.extend,k=a.fireEvent,v=a.offset,d=a.pick,g=a.removeEvent,w=a.splat,B=a.Tooltip,c=a.win;a.Pointer=function(a,c){this.init(a,c)};a.Pointer.prototype={init:function(a,c){this.options=c;this.chart=
a;this.runChartClick=c.chart.events&&!!c.chart.events.click;this.pinchDown=[];this.lastValidTouch={};B&&c.tooltip.enabled&&(a.tooltip=new B(a,c.tooltip),this.followTouchMove=d(c.tooltip.followTouchMove,!0));this.setDOMEvents()},zoomOption:function(){var a=this.chart,c=a.options.chart.zoomType,d=/x/.test(c),c=/y/.test(c),a=a.inverted;this.zoomX=d;this.zoomY=c;this.zoomHor=d&&!a||c&&a;this.zoomVert=c&&!a||d&&a;this.hasZoom=d||c},normalize:function(a,d){var e,l;a=a||c.event;a.target||(a.target=a.srcElement);
l=a.touches?a.touches.length?a.touches.item(0):a.changedTouches[0]:a;d||(this.chartPosition=d=v(this.chart.container));void 0===l.pageX?(e=Math.max(a.x,a.clientX-d.left),d=a.y):(e=l.pageX-d.left,d=l.pageY-d.top);return n(a,{chartX:Math.round(e),chartY:Math.round(d)})},getCoordinates:function(a){var c={xAxis:[],yAxis:[]};q(this.chart.axes,function(e){c[e.isXAxis?"xAxis":"yAxis"].push({axis:e,value:e.toValue(a[e.horiz?"chartX":"chartY"])})});return c},runPointActions:function(c){var e=this.chart,g=
e.series,f=e.tooltip,b=f?f.shared:!1,k=!0,y=e.hoverPoint,n=e.hoverSeries,x,v,r,G=[],H;if(!b&&!n)for(x=0;x<g.length;x++)if(g[x].directTouch||!g[x].options.stickyTracking)g=[];n&&(b?n.noSharedTooltip:n.directTouch)&&y?G=[y]:(b||!n||n.options.stickyTracking||(g=[n]),q(g,function(a){v=a.noSharedTooltip&&b;r=!b&&a.directTouch;a.visible&&!v&&!r&&d(a.options.enableMouseTracking,!0)&&(H=a.searchPoint(c,!v&&1===a.kdDimensions))&&H.series&&G.push(H)}),G.sort(function(a,c){var e=a.distX-c.distX,d=a.dist-c.dist;
return 0!==e&&b?e:0!==d?d:a.series.group.zIndex>c.series.group.zIndex?-1:1}));if(b)for(x=G.length;x--;)(G[x].x!==G[0].x||G[x].series.noSharedTooltip)&&G.splice(x,1);if(G[0]&&(G[0]!==this.prevKDPoint||f&&f.isHidden)){if(b&&!G[0].series.noSharedTooltip){for(x=0;x<G.length;x++)G[x].onMouseOver(c,G[x]!==(n&&n.directTouch&&y||G[0]));G.length&&f&&f.refresh(G.sort(function(a,b){return a.series.index-b.series.index}),c)}else if(f&&f.refresh(G[0],c),!n||!n.directTouch)G[0].onMouseOver(c);this.prevKDPoint=
G[0];k=!1}k&&(g=n&&n.tooltipOptions.followPointer,f&&g&&!f.isHidden&&(g=f.getAnchor([{}],c),f.updatePosition({plotX:g[0],plotY:g[1]})));this._onDocumentMouseMove||(this._onDocumentMouseMove=function(b){if(F[a.hoverChartIndex])F[a.hoverChartIndex].pointer.onDocumentMouseMove(b)},D(h,"mousemove",this._onDocumentMouseMove));q(b?G:[d(y,G[0])],function(a){q(e.axes,function(b){(!a||a.series&&a.series[b.coll]===b)&&b.drawCrosshair(c,a)})})},reset:function(a,c){var e=this.chart,d=e.hoverSeries,b=e.hoverPoint,
l=e.hoverPoints,f=e.tooltip,k=f&&f.shared?l:b;a&&k&&q(w(k),function(b){b.series.isCartesian&&void 0===b.plotX&&(a=!1)});if(a)f&&k&&(f.refresh(k),b&&(b.setState(b.state,!0),q(e.axes,function(a){a.crosshair&&a.drawCrosshair(null,b)})));else{if(b)b.onMouseOut();l&&q(l,function(a){a.setState()});if(d)d.onMouseOut();f&&f.hide(c);this._onDocumentMouseMove&&(g(h,"mousemove",this._onDocumentMouseMove),this._onDocumentMouseMove=null);q(e.axes,function(a){a.hideCrosshair()});this.hoverX=this.prevKDPoint=e.hoverPoints=
e.hoverPoint=null}},scaleGroups:function(a,c){var e=this.chart,d;q(e.series,function(b){d=a||b.getPlotBox();b.xAxis&&b.xAxis.zoomEnabled&&b.group&&(b.group.attr(d),b.markerGroup&&(b.markerGroup.attr(d),b.markerGroup.clip(c?e.clipRect:null)),b.dataLabelsGroup&&b.dataLabelsGroup.attr(d))});e.clipRect.attr(c||e.clipBox)},dragStart:function(a){var c=this.chart;c.mouseIsDown=a.type;c.cancelClick=!1;c.mouseDownX=this.mouseDownX=a.chartX;c.mouseDownY=this.mouseDownY=a.chartY},drag:function(a){var c=this.chart,
e=c.options.chart,d=a.chartX,b=a.chartY,g=this.zoomHor,f=this.zoomVert,h=c.plotLeft,k=c.plotTop,n=c.plotWidth,r=c.plotHeight,G,H=this.selectionMarker,v=this.mouseDownX,p=this.mouseDownY,q=e.panKey&&a[e.panKey+"Key"];H&&H.touch||(d<h?d=h:d>h+n&&(d=h+n),b<k?b=k:b>k+r&&(b=k+r),this.hasDragged=Math.sqrt(Math.pow(v-d,2)+Math.pow(p-b,2)),10<this.hasDragged&&(G=c.isInsidePlot(v-h,p-k),c.hasCartesianSeries&&(this.zoomX||this.zoomY)&&G&&!q&&!H&&(this.selectionMarker=H=c.renderer.rect(h,k,g?1:n,f?1:r,0).attr({fill:e.selectionMarkerFill||
J("#335cad").setOpacity(.25).get(),"class":"highcharts-selection-marker",zIndex:7}).add()),H&&g&&(d-=v,H.attr({width:Math.abs(d),x:(0<d?0:d)+v})),H&&f&&(d=b-p,H.attr({height:Math.abs(d),y:(0<d?0:d)+p})),G&&!H&&e.panning&&c.pan(a,e.panning)))},drop:function(a){var c=this,e=this.chart,d=this.hasPinched;if(this.selectionMarker){var b={originalEvent:a,xAxis:[],yAxis:[]},g=this.selectionMarker,h=g.attr?g.attr("x"):g.x,v=g.attr?g.attr("y"):g.y,x=g.attr?g.attr("width"):g.width,w=g.attr?g.attr("height"):
g.height,r;if(this.hasDragged||d)q(e.axes,function(e){if(e.zoomEnabled&&f(e.min)&&(d||c[{xAxis:"zoomX",yAxis:"zoomY"}[e.coll]])){var l=e.horiz,g="touchend"===a.type?e.minPixelPadding:0,p=e.toValue((l?h:v)+g),l=e.toValue((l?h+x:v+w)-g);b[e.coll].push({axis:e,min:Math.min(p,l),max:Math.max(p,l)});r=!0}}),r&&k(e,"selection",b,function(a){e.zoom(n(a,d?{animation:!1}:null))});this.selectionMarker=this.selectionMarker.destroy();d&&this.scaleGroups()}e&&(m(e.container,{cursor:e._cursor}),e.cancelClick=10<
this.hasDragged,e.mouseIsDown=this.hasDragged=this.hasPinched=!1,this.pinchDown=[])},onContainerMouseDown:function(a){a=this.normalize(a);this.zoomOption();a.preventDefault&&a.preventDefault();this.dragStart(a)},onDocumentMouseUp:function(c){F[a.hoverChartIndex]&&F[a.hoverChartIndex].pointer.drop(c)},onDocumentMouseMove:function(a){var c=this.chart,e=this.chartPosition;a=this.normalize(a,e);!e||this.inClass(a.target,"highcharts-tracker")||c.isInsidePlot(a.chartX-c.plotLeft,a.chartY-c.plotTop)||this.reset()},
onContainerMouseLeave:function(c){var e=F[a.hoverChartIndex];e&&(c.relatedTarget||c.toElement)&&(e.pointer.reset(),e.pointer.chartPosition=null)},onContainerMouseMove:function(c){var e=this.chart;f(a.hoverChartIndex)&&F[a.hoverChartIndex]&&F[a.hoverChartIndex].mouseIsDown||(a.hoverChartIndex=e.index);c=this.normalize(c);c.returnValue=!1;"mousedown"===e.mouseIsDown&&this.drag(c);!this.inClass(c.target,"highcharts-tracker")&&!e.isInsidePlot(c.chartX-e.plotLeft,c.chartY-e.plotTop)||e.openMenu||this.runPointActions(c)},
inClass:function(a,c){for(var e;a;){if(e=z(a,"class")){if(-1!==e.indexOf(c))return!0;if(-1!==e.indexOf("highcharts-container"))return!1}a=a.parentNode}},onTrackerMouseOut:function(a){var c=this.chart.hoverSeries;a=a.relatedTarget||a.toElement;if(!(!c||!a||c.options.stickyTracking||this.inClass(a,"highcharts-tooltip")||this.inClass(a,"highcharts-series-"+c.index)&&this.inClass(a,"highcharts-tracker")))c.onMouseOut()},onContainerClick:function(a){var c=this.chart,e=c.hoverPoint,d=c.plotLeft,b=c.plotTop;
a=this.normalize(a);c.cancelClick||(e&&this.inClass(a.target,"highcharts-tracker")?(k(e.series,"click",n(a,{point:e})),c.hoverPoint&&e.firePointEvent("click",a)):(n(a,this.getCoordinates(a)),c.isInsidePlot(a.chartX-d,a.chartY-b)&&k(c,"click",a)))},setDOMEvents:function(){var c=this,d=c.chart.container;d.onmousedown=function(a){c.onContainerMouseDown(a)};d.onmousemove=function(a){c.onContainerMouseMove(a)};d.onclick=function(a){c.onContainerClick(a)};D(d,"mouseleave",c.onContainerMouseLeave);1===a.chartCount&&
D(h,"mouseup",c.onDocumentMouseUp);a.hasTouch&&(d.ontouchstart=function(a){c.onContainerTouchStart(a)},d.ontouchmove=function(a){c.onContainerTouchMove(a)},1===a.chartCount&&D(h,"touchend",c.onDocumentTouchEnd))},destroy:function(){var c;g(this.chart.container,"mouseleave",this.onContainerMouseLeave);a.chartCount||(g(h,"mouseup",this.onDocumentMouseUp),g(h,"touchend",this.onDocumentTouchEnd));clearInterval(this.tooltipTimeout);for(c in this)this[c]=null}}})(M);(function(a){var D=a.charts,z=a.each,
F=a.extend,J=a.map,m=a.noop,f=a.pick;F(a.Pointer.prototype,{pinchTranslate:function(a,f,n,k,v,d){(this.zoomHor||this.pinchHor)&&this.pinchTranslateDirection(!0,a,f,n,k,v,d);(this.zoomVert||this.pinchVert)&&this.pinchTranslateDirection(!1,a,f,n,k,v,d)},pinchTranslateDirection:function(a,f,n,k,v,d,g,w){var h=this.chart,c=a?"x":"y",e=a?"X":"Y",l="chart"+e,u=a?"width":"height",q=h["plot"+(a?"Left":"Top")],b,t,y=w||1,m=h.inverted,x=h.bounds[a?"h":"v"],I=1===f.length,r=f[0][l],G=n[0][l],H=!I&&f[1][l],N=
!I&&n[1][l],p;n=function(){!I&&20<Math.abs(r-H)&&(y=w||Math.abs(G-N)/Math.abs(r-H));t=(q-G)/y+r;b=h["plot"+(a?"Width":"Height")]/y};n();f=t;f<x.min?(f=x.min,p=!0):f+b>x.max&&(f=x.max-b,p=!0);p?(G-=.8*(G-g[c][0]),I||(N-=.8*(N-g[c][1])),n()):g[c]=[G,N];m||(d[c]=t-q,d[u]=b);d=m?1/y:y;v[u]=b;v[c]=f;k[m?a?"scaleY":"scaleX":"scale"+e]=y;k["translate"+e]=d*q+(G-d*r)},pinch:function(a){var h=this,n=h.chart,k=h.pinchDown,v=a.touches,d=v.length,g=h.lastValidTouch,w=h.hasZoom,B=h.selectionMarker,c={},e=1===
d&&(h.inClass(a.target,"highcharts-tracker")&&n.runTrackerClick||h.runChartClick),l={};1<d&&(h.initiated=!0);w&&h.initiated&&!e&&a.preventDefault();J(v,function(a){return h.normalize(a)});"touchstart"===a.type?(z(v,function(a,c){k[c]={chartX:a.chartX,chartY:a.chartY}}),g.x=[k[0].chartX,k[1]&&k[1].chartX],g.y=[k[0].chartY,k[1]&&k[1].chartY],z(n.axes,function(a){if(a.zoomEnabled){var c=n.bounds[a.horiz?"h":"v"],b=a.minPixelPadding,e=a.toPixels(f(a.options.min,a.dataMin)),d=a.toPixels(f(a.options.max,
a.dataMax)),g=Math.max(e,d);c.min=Math.min(a.pos,Math.min(e,d)-b);c.max=Math.max(a.pos+a.len,g+b)}}),h.res=!0):k.length&&(B||(h.selectionMarker=B=F({destroy:m,touch:!0},n.plotBox)),h.pinchTranslate(k,v,c,B,l,g),h.hasPinched=w,h.scaleGroups(c,l),!w&&h.followTouchMove&&1===d?this.runPointActions(h.normalize(a)):h.res&&(h.res=!1,this.reset(!1,0)))},touch:function(h,m){var n=this.chart,k;a.hoverChartIndex=n.index;1===h.touches.length?(h=this.normalize(h),n.isInsidePlot(h.chartX-n.plotLeft,h.chartY-n.plotTop)&&
!n.openMenu?(m&&this.runPointActions(h),"touchmove"===h.type&&(m=this.pinchDown,k=m[0]?4<=Math.sqrt(Math.pow(m[0].chartX-h.chartX,2)+Math.pow(m[0].chartY-h.chartY,2)):!1),f(k,!0)&&this.pinch(h)):m&&this.reset()):2===h.touches.length&&this.pinch(h)},onContainerTouchStart:function(a){this.zoomOption();this.touch(a,!0)},onContainerTouchMove:function(a){this.touch(a)},onDocumentTouchEnd:function(f){D[a.hoverChartIndex]&&D[a.hoverChartIndex].pointer.drop(f)}})})(M);(function(a){var D=a.addEvent,z=a.charts,
F=a.css,J=a.doc,m=a.extend,f=a.noop,h=a.Pointer,q=a.removeEvent,n=a.win,k=a.wrap;if(n.PointerEvent||n.MSPointerEvent){var v={},d=!!n.PointerEvent,g=function(){var a,c=[];c.item=function(a){return this[a]};for(a in v)v.hasOwnProperty(a)&&c.push({pageX:v[a].pageX,pageY:v[a].pageY,target:v[a].target});return c},w=function(d,c,e,l){"touch"!==d.pointerType&&d.pointerType!==d.MSPOINTER_TYPE_TOUCH||!z[a.hoverChartIndex]||(l(d),l=z[a.hoverChartIndex].pointer,l[c]({type:e,target:d.currentTarget,preventDefault:f,
touches:g()}))};m(h.prototype,{onContainerPointerDown:function(a){w(a,"onContainerTouchStart","touchstart",function(a){v[a.pointerId]={pageX:a.pageX,pageY:a.pageY,target:a.currentTarget}})},onContainerPointerMove:function(a){w(a,"onContainerTouchMove","touchmove",function(a){v[a.pointerId]={pageX:a.pageX,pageY:a.pageY};v[a.pointerId].target||(v[a.pointerId].target=a.currentTarget)})},onDocumentPointerUp:function(a){w(a,"onDocumentTouchEnd","touchend",function(a){delete v[a.pointerId]})},batchMSEvents:function(a){a(this.chart.container,
d?"pointerdown":"MSPointerDown",this.onContainerPointerDown);a(this.chart.container,d?"pointermove":"MSPointerMove",this.onContainerPointerMove);a(J,d?"pointerup":"MSPointerUp",this.onDocumentPointerUp)}});k(h.prototype,"init",function(a,c,e){a.call(this,c,e);this.hasZoom&&F(c.container,{"-ms-touch-action":"none","touch-action":"none"})});k(h.prototype,"setDOMEvents",function(a){a.apply(this);(this.hasZoom||this.followTouchMove)&&this.batchMSEvents(D)});k(h.prototype,"destroy",function(a){this.batchMSEvents(q);
a.call(this)})}})(M);(function(a){var D,z=a.addEvent,F=a.css,J=a.discardElement,m=a.defined,f=a.each,h=a.extend,q=a.isFirefox,n=a.marginNames,k=a.merge,v=a.pick,d=a.setAnimation,g=a.stableSort,w=a.win,B=a.wrap;D=a.Legend=function(a,e){this.init(a,e)};D.prototype={init:function(a,e){this.chart=a;this.setOptions(e);e.enabled&&(this.render(),z(this.chart,"endResize",function(){this.legend.positionCheckboxes()}))},setOptions:function(a){var c=v(a.padding,8);this.options=a;this.itemStyle=a.itemStyle;this.itemHiddenStyle=
k(this.itemStyle,a.itemHiddenStyle);this.itemMarginTop=a.itemMarginTop||0;this.initialItemX=this.padding=c;this.initialItemY=c-5;this.itemHeight=this.maxItemWidth=0;this.symbolWidth=v(a.symbolWidth,16);this.pages=[]},update:function(a,e){var c=this.chart;this.setOptions(k(!0,this.options,a));this.destroy();c.isDirtyLegend=c.isDirtyBox=!0;v(e,!0)&&c.redraw()},colorizeItem:function(a,e){a.legendGroup[e?"removeClass":"addClass"]("highcharts-legend-item-hidden");var c=this.options,d=a.legendItem,g=a.legendLine,
b=a.legendSymbol,f=this.itemHiddenStyle.color,c=e?c.itemStyle.color:f,h=e?a.color||f:f,k=a.options&&a.options.marker,n={fill:h},v;d&&d.css({fill:c,color:c});g&&g.attr({stroke:h});if(b){if(k&&b.isMarker&&(n=a.pointAttribs(),!e))for(v in n)n[v]=f;b.attr(n)}},positionItem:function(a){var c=this.options,d=c.symbolPadding,c=!c.rtl,g=a._legendItemPos,f=g[0],g=g[1],b=a.checkbox;(a=a.legendGroup)&&a.element&&a.translate(c?f:this.legendWidth-f-2*d-4,g);b&&(b.x=f,b.y=g)},destroyItem:function(a){var c=a.checkbox;
f(["legendItem","legendLine","legendSymbol","legendGroup"],function(c){a[c]&&(a[c]=a[c].destroy())});c&&J(a.checkbox)},destroy:function(){var a=this.group,e=this.box;e&&(this.box=e.destroy());f(this.getAllItems(),function(a){f(["legendItem","legendGroup"],function(c){a[c]&&(a[c]=a[c].destroy())})});a&&(this.group=a.destroy())},positionCheckboxes:function(a){var c=this.group.alignAttr,d,g=this.clipHeight||this.legendHeight,h=this.titleHeight;c&&(d=c.translateY,f(this.allItems,function(b){var e=b.checkbox,
l;e&&(l=d+h+e.y+(a||0)+3,F(e,{left:c.translateX+b.checkboxOffset+e.x-20+"px",top:l+"px",display:l>d-6&&l<d+g-6?"":"none"}))}))},renderTitle:function(){var a=this.padding,e=this.options.title,d=0;e.text&&(this.title||(this.title=this.chart.renderer.label(e.text,a-3,a-4,null,null,null,null,null,"legend-title").attr({zIndex:1}).css(e.style).add(this.group)),a=this.title.getBBox(),d=a.height,this.offsetWidth=a.width,this.contentGroup.attr({translateY:d}));this.titleHeight=d},setText:function(c){var e=
this.options;c.legendItem.attr({text:e.labelFormat?a.format(e.labelFormat,c):e.labelFormatter.call(c)})},renderItem:function(a){var c=this.chart,d=c.renderer,g=this.options,f="horizontal"===g.layout,b=this.symbolWidth,h=g.symbolPadding,n=this.itemStyle,m=this.itemHiddenStyle,x=this.padding,w=f?v(g.itemDistance,20):0,r=!g.rtl,G=g.width,H=g.itemMarginBottom||0,q=this.itemMarginTop,p=this.initialItemX,A=a.legendItem,B=!a.series,O=!B&&a.series.drawLegendSymbol?a.series:a,C=O.options,C=this.createCheckboxForItem&&
C&&C.showCheckbox,E=g.useHTML;A||(a.legendGroup=d.g("legend-item").addClass("highcharts-"+O.type+"-series highcharts-color-"+a.colorIndex+" "+(a.options.className||"")+(B?"highcharts-series-"+a.index:"")).attr({zIndex:1}).add(this.scrollGroup),a.legendItem=A=d.text("",r?b+h:-h,this.baseline||0,E).css(k(a.visible?n:m)).attr({align:r?"left":"right",zIndex:2}).add(a.legendGroup),this.baseline||(n=n.fontSize,this.fontMetrics=d.fontMetrics(n,A),this.baseline=this.fontMetrics.f+3+q,A.attr("y",this.baseline)),
O.drawLegendSymbol(this,a),this.setItemEvents&&this.setItemEvents(a,A,E),C&&this.createCheckboxForItem(a));this.colorizeItem(a,a.visible);this.setText(a);d=A.getBBox();b=a.checkboxOffset=g.itemWidth||a.legendItemWidth||b+h+d.width+w+(C?20:0);this.itemHeight=h=Math.round(a.legendItemHeight||d.height);f&&this.itemX-p+b>(G||c.chartWidth-2*x-p-g.x)&&(this.itemX=p,this.itemY+=q+this.lastLineHeight+H,this.lastLineHeight=0);this.maxItemWidth=Math.max(this.maxItemWidth,b);this.lastItemY=q+this.itemY+H;this.lastLineHeight=
Math.max(h,this.lastLineHeight);a._legendItemPos=[this.itemX,this.itemY];f?this.itemX+=b:(this.itemY+=q+h+H,this.lastLineHeight=h);this.offsetWidth=G||Math.max((f?this.itemX-p-w:b)+x,this.offsetWidth)},getAllItems:function(){var a=[];f(this.chart.series,function(c){var e=c&&c.options;c&&v(e.showInLegend,m(e.linkedTo)?!1:void 0,!0)&&(a=a.concat(c.legendItems||("point"===e.legendType?c.data:c)))});return a},adjustMargins:function(a,e){var c=this.chart,d=this.options,g=d.align.charAt(0)+d.verticalAlign.charAt(0)+
d.layout.charAt(0);d.floating||f([/(lth|ct|rth)/,/(rtv|rm|rbv)/,/(rbh|cb|lbh)/,/(lbv|lm|ltv)/],function(b,f){b.test(g)&&!m(a[f])&&(c[n[f]]=Math.max(c[n[f]],c.legend[(f+1)%2?"legendHeight":"legendWidth"]+[1,-1,-1,1][f]*d[f%2?"x":"y"]+v(d.margin,12)+e[f]))})},render:function(){var a=this,e=a.chart,d=e.renderer,k=a.group,n,b,t,v,m=a.box,x=a.options,w=a.padding;a.itemX=a.initialItemX;a.itemY=a.initialItemY;a.offsetWidth=0;a.lastItemY=0;k||(a.group=k=d.g("legend").attr({zIndex:7}).add(),a.contentGroup=
d.g().attr({zIndex:1}).add(k),a.scrollGroup=d.g().add(a.contentGroup));a.renderTitle();n=a.getAllItems();g(n,function(a,b){return(a.options&&a.options.legendIndex||0)-(b.options&&b.options.legendIndex||0)});x.reversed&&n.reverse();a.allItems=n;a.display=b=!!n.length;a.lastLineHeight=0;f(n,function(b){a.renderItem(b)});t=(x.width||a.offsetWidth)+w;v=a.lastItemY+a.lastLineHeight+a.titleHeight;v=a.handleOverflow(v);v+=w;m||(a.box=m=d.rect().addClass("highcharts-legend-box").attr({r:x.borderRadius}).add(k),
m.isNew=!0);m.attr({stroke:x.borderColor,"stroke-width":x.borderWidth||0,fill:x.backgroundColor||"none"}).shadow(x.shadow);0<t&&0<v&&(m[m.isNew?"attr":"animate"](m.crisp({x:0,y:0,width:t,height:v},m.strokeWidth())),m.isNew=!1);m[b?"show":"hide"]();a.legendWidth=t;a.legendHeight=v;f(n,function(b){a.positionItem(b)});b&&k.align(h({width:t,height:v},x),!0,"spacingBox");e.isResizing||this.positionCheckboxes()},handleOverflow:function(a){var c=this,d=this.chart,g=d.renderer,h=this.options,b=h.y,b=d.spacingBox.height+
("top"===h.verticalAlign?-b:b)-this.padding,k=h.maxHeight,n,m=this.clipRect,x=h.navigation,w=v(x.animation,!0),r=x.arrowSize||12,G=this.nav,H=this.pages,q=this.padding,p,A=this.allItems,B=function(a){m.attr({height:a});c.contentGroup.div&&(c.contentGroup.div.style.clip="rect("+q+"px,9999px,"+(q+a)+"px,0)")};"horizontal"===h.layout&&(b/=2);k&&(b=Math.min(b,k));H.length=0;a>b&&!1!==x.enabled?(this.clipHeight=n=Math.max(b-20-this.titleHeight-q,0),this.currentPage=v(this.currentPage,1),this.fullHeight=
a,f(A,function(a,b){var c=a._legendItemPos[1];a=Math.round(a.legendItem.getBBox().height);var d=H.length;if(!d||c-H[d-1]>n&&(p||c)!==H[d-1])H.push(p||c),d++;b===A.length-1&&c+a-H[d-1]>n&&H.push(c);c!==p&&(p=c)}),m||(m=c.clipRect=g.clipRect(0,q,9999,0),c.contentGroup.clip(m)),B(n),G||(this.nav=G=g.g().attr({zIndex:1}).add(this.group),this.up=g.symbol("triangle",0,0,r,r).on("click",function(){c.scroll(-1,w)}).add(G),this.pager=g.text("",15,10).addClass("highcharts-legend-navigation").css(x.style).add(G),
this.down=g.symbol("triangle-down",0,0,r,r).on("click",function(){c.scroll(1,w)}).add(G)),c.scroll(0),a=b):G&&(B(d.chartHeight),G.hide(),this.scrollGroup.attr({translateY:1}),this.clipHeight=0);return a},scroll:function(a,e){var c=this.pages,g=c.length;a=this.currentPage+a;var f=this.clipHeight,b=this.options.navigation,h=this.pager,k=this.padding;a>g&&(a=g);0<a&&(void 0!==e&&d(e,this.chart),this.nav.attr({translateX:k,translateY:f+this.padding+7+this.titleHeight,visibility:"visible"}),this.up.attr({"class":1===
a?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"}),h.attr({text:a+"/"+g}),this.down.attr({x:18+this.pager.getBBox().width,"class":a===g?"highcharts-legend-nav-inactive":"highcharts-legend-nav-active"}),this.up.attr({fill:1===a?b.inactiveColor:b.activeColor}).css({cursor:1===a?"default":"pointer"}),this.down.attr({fill:a===g?b.inactiveColor:b.activeColor}).css({cursor:a===g?"default":"pointer"}),e=-c[a-1]+this.initialItemY,this.scrollGroup.animate({translateY:e}),this.currentPage=
a,this.positionCheckboxes(e))}};a.LegendSymbolMixin={drawRectangle:function(a,d){var c=a.options,e=c.symbolHeight||a.fontMetrics.f,c=c.squareSymbol;d.legendSymbol=this.chart.renderer.rect(c?(a.symbolWidth-e)/2:0,a.baseline-e+1,c?e:a.symbolWidth,e,v(a.options.symbolRadius,e/2)).addClass("highcharts-point").attr({zIndex:3}).add(d.legendGroup)},drawLineMarker:function(a){var c=this.options,d=c.marker,g=a.symbolWidth,f=this.chart.renderer,b=this.legendGroup;a=a.baseline-Math.round(.3*a.fontMetrics.b);
var h;h={"stroke-width":c.lineWidth||0};c.dashStyle&&(h.dashstyle=c.dashStyle);this.legendLine=f.path(["M",0,a,"L",g,a]).addClass("highcharts-graph").attr(h).add(b);d&&!1!==d.enabled&&(c=0===this.symbol.indexOf("url")?0:d.radius,this.legendSymbol=d=f.symbol(this.symbol,g/2-c,a-c,2*c,2*c,d).addClass("highcharts-point").add(b),d.isMarker=!0)}};(/Trident\/7\.0/.test(w.navigator.userAgent)||q)&&B(D.prototype,"positionItem",function(a,d){var c=this,e=function(){d._legendItemPos&&a.call(c,d)};e();setTimeout(e)})})(M);
(function(a){var D=a.addEvent,z=a.animate,F=a.animObject,J=a.attr,m=a.doc,f=a.Axis,h=a.createElement,q=a.defaultOptions,n=a.discardElement,k=a.charts,v=a.css,d=a.defined,g=a.each,w=a.error,B=a.extend,c=a.fireEvent,e=a.getStyle,l=a.grep,u=a.isNumber,L=a.isObject,b=a.isString,t=a.Legend,y=a.marginNames,K=a.merge,x=a.Pointer,I=a.pick,r=a.pInt,G=a.removeEvent,H=a.seriesTypes,N=a.splat,p=a.svg,A=a.syncTimeout,P=a.win,O=a.Renderer,C=a.Chart=function(){this.getArgs.apply(this,arguments)};a.chart=function(a,
b,c){return new C(a,b,c)};C.prototype={callbacks:[],getArgs:function(){var a=[].slice.call(arguments);if(b(a[0])||a[0].nodeName)this.renderTo=a.shift();this.init(a[0],a[1])},init:function(b,c){var d,e=b.series;b.series=null;d=K(q,b);d.series=b.series=e;this.userOptions=b;this.respRules=[];b=d.chart;e=b.events;this.margin=[];this.spacing=[];this.bounds={h:{},v:{}};this.callback=c;this.isResizing=0;this.options=d;this.axes=[];this.series=[];this.hasCartesianSeries=b.showAxes;var g;this.index=k.length;
k.push(this);a.chartCount++;if(e)for(g in e)D(this,g,e[g]);this.xAxis=[];this.yAxis=[];this.pointCount=this.colorCounter=this.symbolCounter=0;this.firstRender()},initSeries:function(a){var b=this.options.chart;(b=H[a.type||b.type||b.defaultSeriesType])||w(17,!0);b=new b;b.init(this,a);return b},isInsidePlot:function(a,b,c){var d=c?b:a;a=c?a:b;return 0<=d&&d<=this.plotWidth&&0<=a&&a<=this.plotHeight},redraw:function(b){var d=this.axes,e=this.series,f=this.pointer,r=this.legend,h=this.isDirtyLegend,
l,p,k=this.hasCartesianSeries,n=this.isDirtyBox,H=e.length,t=H,u=this.renderer,v=u.isHidden(),G=[];a.setAnimation(b,this);v&&this.cloneRenderTo();for(this.layOutTitles();t--;)if(b=e[t],b.options.stacking&&(l=!0,b.isDirty)){p=!0;break}if(p)for(t=H;t--;)b=e[t],b.options.stacking&&(b.isDirty=!0);g(e,function(a){a.isDirty&&"point"===a.options.legendType&&(a.updateTotals&&a.updateTotals(),h=!0);a.isDirtyData&&c(a,"updatedData")});h&&r.options.enabled&&(r.render(),this.isDirtyLegend=!1);l&&this.getStacks();
k&&g(d,function(a){a.updateNames();a.setScale()});this.getMargins();k&&(g(d,function(a){a.isDirty&&(n=!0)}),g(d,function(a){var b=a.min+","+a.max;a.extKey!==b&&(a.extKey=b,G.push(function(){c(a,"afterSetExtremes",B(a.eventArgs,a.getExtremes()));delete a.eventArgs}));(n||l)&&a.redraw()}));n&&this.drawChartBox();g(e,function(a){(n||a.isDirty)&&a.visible&&a.redraw()});f&&f.reset(!0);u.draw();c(this,"redraw");v&&this.cloneRenderTo(!0);g(G,function(a){a.call()})},get:function(a){var b=this.axes,c=this.series,
d,e;for(d=0;d<b.length;d++)if(b[d].options.id===a)return b[d];for(d=0;d<c.length;d++)if(c[d].options.id===a)return c[d];for(d=0;d<c.length;d++)for(e=c[d].points||[],b=0;b<e.length;b++)if(e[b].id===a)return e[b];return null},getAxes:function(){var a=this,b=this.options,c=b.xAxis=N(b.xAxis||{}),b=b.yAxis=N(b.yAxis||{});g(c,function(a,b){a.index=b;a.isX=!0});g(b,function(a,b){a.index=b});c=c.concat(b);g(c,function(b){new f(a,b)})},getSelectedPoints:function(){var a=[];g(this.series,function(b){a=a.concat(l(b.points||
[],function(a){return a.selected}))});return a},getSelectedSeries:function(){return l(this.series,function(a){return a.selected})},setTitle:function(a,b,c){var d=this,e=d.options,f;f=e.title=K(e.title,a);e=e.subtitle=K(e.subtitle,b);g([["title",a,f],["subtitle",b,e]],function(a,b){var c=a[0],e=d[c],g=a[1];a=a[2];e&&g&&(d[c]=e=e.destroy());a&&a.text&&!e&&(d[c]=d.renderer.text(a.text,0,0,a.useHTML).attr({align:a.align,"class":"highcharts-"+c,zIndex:a.zIndex||4}).add(),d[c].update=function(a){d.setTitle(!b&&
a,b&&a)},d[c].css(a.style))});d.layOutTitles(c)},layOutTitles:function(a){var b=0,c,d=this.renderer,e=this.spacingBox;g(["title","subtitle"],function(a){var c=this[a],g=this.options[a],f;c&&(f=g.style.fontSize,f=d.fontMetrics(f,c).b,c.css({width:(g.width||e.width+g.widthAdjust)+"px"}).align(B({y:b+f+("title"===a?-3:2)},g),!1,"spacingBox"),g.floating||g.verticalAlign||(b=Math.ceil(b+c.getBBox().height)))},this);c=this.titleOffset!==b;this.titleOffset=b;!this.isDirtyBox&&c&&(this.isDirtyBox=c,this.hasRendered&&
I(a,!0)&&this.isDirtyBox&&this.redraw())},getChartSize:function(){var a=this.options.chart,b=a.width,a=a.height,c=this.renderToClone||this.renderTo;d(b)||(this.containerWidth=e(c,"width"));d(a)||(this.containerHeight=e(c,"height"));this.chartWidth=Math.max(0,b||this.containerWidth||600);this.chartHeight=Math.max(0,I(a,19<this.containerHeight?this.containerHeight:400))},cloneRenderTo:function(a){var b=this.renderToClone,c=this.container;if(a){if(b){for(;b.childNodes.length;)this.renderTo.appendChild(b.firstChild);
n(b);delete this.renderToClone}}else c&&c.parentNode===this.renderTo&&this.renderTo.removeChild(c),this.renderToClone=b=this.renderTo.cloneNode(0),v(b,{position:"absolute",top:"-9999px",display:"block"}),b.style.setProperty&&b.style.setProperty("display","block","important"),m.body.appendChild(b),c&&b.appendChild(c)},setClassName:function(a){this.container.className="highcharts-container "+(a||"")},getContainer:function(){var c,d=this.options,e=d.chart,g,f;c=this.renderTo;var l="highcharts-"+a.idCounter++,
p;c||(this.renderTo=c=e.renderTo);b(c)&&(this.renderTo=c=m.getElementById(c));c||w(13,!0);g=r(J(c,"data-highcharts-chart"));u(g)&&k[g]&&k[g].hasRendered&&k[g].destroy();J(c,"data-highcharts-chart",this.index);c.innerHTML="";e.skipClone||c.offsetWidth||this.cloneRenderTo();this.getChartSize();g=this.chartWidth;f=this.chartHeight;p=B({position:"relative",overflow:"hidden",width:g+"px",height:f+"px",textAlign:"left",lineHeight:"normal",zIndex:0,"-webkit-tap-highlight-color":"rgba(0,0,0,0)"},e.style);
this.container=c=h("div",{id:l},p,this.renderToClone||c);this._cursor=c.style.cursor;this.renderer=new (a[e.renderer]||O)(c,g,f,null,e.forExport,d.exporting&&d.exporting.allowHTML);this.setClassName(e.className);this.renderer.setStyle(e.style);this.renderer.chartIndex=this.index},getMargins:function(a){var b=this.spacing,c=this.margin,e=this.titleOffset;this.resetMargins();e&&!d(c[0])&&(this.plotTop=Math.max(this.plotTop,e+this.options.title.margin+b[0]));this.legend.display&&this.legend.adjustMargins(c,
b);this.extraBottomMargin&&(this.marginBottom+=this.extraBottomMargin);this.extraTopMargin&&(this.plotTop+=this.extraTopMargin);a||this.getAxisMargins()},getAxisMargins:function(){var a=this,b=a.axisOffset=[0,0,0,0],c=a.margin;a.hasCartesianSeries&&g(a.axes,function(a){a.visible&&a.getOffset()});g(y,function(e,g){d(c[g])||(a[e]+=b[g])});a.setChartSize()},reflow:function(a){var b=this,c=b.options.chart,g=b.renderTo,f=d(c.width),r=c.width||e(g,"width"),c=c.height||e(g,"height"),g=a?a.target:P;if(!f&&
!b.isPrinting&&r&&c&&(g===P||g===m)){if(r!==b.containerWidth||c!==b.containerHeight)clearTimeout(b.reflowTimeout),b.reflowTimeout=A(function(){b.container&&b.setSize(void 0,void 0,!1)},a?100:0);b.containerWidth=r;b.containerHeight=c}},initReflow:function(){var a=this,b=function(b){a.reflow(b)};D(P,"resize",b);D(a,"destroy",function(){G(P,"resize",b)})},setSize:function(b,d,e){var f=this,r=f.renderer;f.isResizing+=1;a.setAnimation(e,f);f.oldChartHeight=f.chartHeight;f.oldChartWidth=f.chartWidth;void 0!==
b&&(f.options.chart.width=b);void 0!==d&&(f.options.chart.height=d);f.getChartSize();b=r.globalAnimation;(b?z:v)(f.container,{width:f.chartWidth+"px",height:f.chartHeight+"px"},b);f.setChartSize(!0);r.setSize(f.chartWidth,f.chartHeight,e);g(f.axes,function(a){a.isDirty=!0;a.setScale()});f.isDirtyLegend=!0;f.isDirtyBox=!0;f.layOutTitles();f.getMargins();f.setResponsive&&f.setResponsive(!1);f.redraw(e);f.oldChartHeight=null;c(f,"resize");A(function(){f&&c(f,"endResize",null,function(){--f.isResizing})},
F(b).duration)},setChartSize:function(a){var b=this.inverted,c=this.renderer,d=this.chartWidth,e=this.chartHeight,f=this.options.chart,r=this.spacing,h=this.clipOffset,l,p,k,n;this.plotLeft=l=Math.round(this.plotLeft);this.plotTop=p=Math.round(this.plotTop);this.plotWidth=k=Math.max(0,Math.round(d-l-this.marginRight));this.plotHeight=n=Math.max(0,Math.round(e-p-this.marginBottom));this.plotSizeX=b?n:k;this.plotSizeY=b?k:n;this.plotBorderWidth=f.plotBorderWidth||0;this.spacingBox=c.spacingBox={x:r[3],
y:r[0],width:d-r[3]-r[1],height:e-r[0]-r[2]};this.plotBox=c.plotBox={x:l,y:p,width:k,height:n};d=2*Math.floor(this.plotBorderWidth/2);b=Math.ceil(Math.max(d,h[3])/2);c=Math.ceil(Math.max(d,h[0])/2);this.clipBox={x:b,y:c,width:Math.floor(this.plotSizeX-Math.max(d,h[1])/2-b),height:Math.max(0,Math.floor(this.plotSizeY-Math.max(d,h[2])/2-c))};a||g(this.axes,function(a){a.setAxisSize();a.setAxisTranslation()})},resetMargins:function(){var a=this,b=a.options.chart;g(["margin","spacing"],function(c){var d=
b[c],e=L(d)?d:[d,d,d,d];g(["Top","Right","Bottom","Left"],function(d,g){a[c][g]=I(b[c+d],e[g])})});g(y,function(b,c){a[b]=I(a.margin[c],a.spacing[c])});a.axisOffset=[0,0,0,0];a.clipOffset=[0,0,0,0]},drawChartBox:function(){var a=this.options.chart,b=this.renderer,c=this.chartWidth,d=this.chartHeight,e=this.chartBackground,g=this.plotBackground,f=this.plotBorder,r,h=this.plotBGImage,l=a.backgroundColor,p=a.plotBackgroundColor,k=a.plotBackgroundImage,n,t=this.plotLeft,H=this.plotTop,u=this.plotWidth,
v=this.plotHeight,G=this.plotBox,m=this.clipRect,x=this.clipBox,y="animate";e||(this.chartBackground=e=b.rect().addClass("highcharts-background").add(),y="attr");r=a.borderWidth||0;n=r+(a.shadow?8:0);l={fill:l||"none"};if(r||e["stroke-width"])l.stroke=a.borderColor,l["stroke-width"]=r;e.attr(l).shadow(a.shadow);e[y]({x:n/2,y:n/2,width:c-n-r%2,height:d-n-r%2,r:a.borderRadius});y="animate";g||(y="attr",this.plotBackground=g=b.rect().addClass("highcharts-plot-background").add());g[y](G);g.attr({fill:p||
"none"}).shadow(a.plotShadow);k&&(h?h.animate(G):this.plotBGImage=b.image(k,t,H,u,v).add());m?m.animate({width:x.width,height:x.height}):this.clipRect=b.clipRect(x);y="animate";f||(y="attr",this.plotBorder=f=b.rect().addClass("highcharts-plot-border").attr({zIndex:1}).add());f.attr({stroke:a.plotBorderColor,"stroke-width":a.plotBorderWidth||0,fill:"none"});f[y](f.crisp({x:t,y:H,width:u,height:v},-f.strokeWidth()));this.isDirtyBox=!1},propFromSeries:function(){var a=this,b=a.options.chart,c,d=a.options.series,
e,f;g(["inverted","angular","polar"],function(g){c=H[b.type||b.defaultSeriesType];f=b[g]||c&&c.prototype[g];for(e=d&&d.length;!f&&e--;)(c=H[d[e].type])&&c.prototype[g]&&(f=!0);a[g]=f})},linkSeries:function(){var a=this,c=a.series;g(c,function(a){a.linkedSeries.length=0});g(c,function(c){var d=c.options.linkedTo;b(d)&&(d=":previous"===d?a.series[c.index-1]:a.get(d))&&d.linkedParent!==c&&(d.linkedSeries.push(c),c.linkedParent=d,c.visible=I(c.options.visible,d.options.visible,c.visible))})},renderSeries:function(){g(this.series,
function(a){a.translate();a.render()})},renderLabels:function(){var a=this,b=a.options.labels;b.items&&g(b.items,function(c){var d=B(b.style,c.style),e=r(d.left)+a.plotLeft,g=r(d.top)+a.plotTop+12;delete d.left;delete d.top;a.renderer.text(c.html,e,g).attr({zIndex:2}).css(d).add()})},render:function(){var a=this.axes,b=this.renderer,c=this.options,d,e,f;this.setTitle();this.legend=new t(this,c.legend);this.getStacks&&this.getStacks();this.getMargins(!0);this.setChartSize();c=this.plotWidth;d=this.plotHeight-=
21;g(a,function(a){a.setScale()});this.getAxisMargins();e=1.1<c/this.plotWidth;f=1.05<d/this.plotHeight;if(e||f)g(a,function(a){(a.horiz&&e||!a.horiz&&f)&&a.setTickInterval(!0)}),this.getMargins();this.drawChartBox();this.hasCartesianSeries&&g(a,function(a){a.visible&&a.render()});this.seriesGroup||(this.seriesGroup=b.g("series-group").attr({zIndex:3}).add());this.renderSeries();this.renderLabels();this.addCredits();this.setResponsive&&this.setResponsive();this.hasRendered=!0},addCredits:function(a){var b=
this;a=K(!0,this.options.credits,a);a.enabled&&!this.credits&&(this.credits=this.renderer.text(a.text+(this.mapCredits||""),0,0).addClass("highcharts-credits").on("click",function(){a.href&&(P.location.href=a.href)}).attr({align:a.position.align,zIndex:8}).css(a.style).add().align(a.position),this.credits.update=function(a){b.credits=b.credits.destroy();b.addCredits(a)})},destroy:function(){var b=this,d=b.axes,e=b.series,f=b.container,r,h=f&&f.parentNode;c(b,"destroy");k[b.index]=void 0;a.chartCount--;
b.renderTo.removeAttribute("data-highcharts-chart");G(b);for(r=d.length;r--;)d[r]=d[r].destroy();this.scroller&&this.scroller.destroy&&this.scroller.destroy();for(r=e.length;r--;)e[r]=e[r].destroy();g("title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer rangeSelector legend resetZoomButton tooltip renderer".split(" "),function(a){var c=b[a];c&&c.destroy&&(b[a]=c.destroy())});f&&(f.innerHTML="",G(f),h&&n(f));for(r in b)delete b[r]},isReadyToRender:function(){var a=
this;return p||P!=P.top||"complete"===m.readyState?!0:(m.attachEvent("onreadystatechange",function(){m.detachEvent("onreadystatechange",a.firstRender);"complete"===m.readyState&&a.firstRender()}),!1)},firstRender:function(){var a=this,b=a.options;if(a.isReadyToRender()){a.getContainer();c(a,"init");a.resetMargins();a.setChartSize();a.propFromSeries();a.getAxes();g(b.series||[],function(b){a.initSeries(b)});a.linkSeries();c(a,"beforeRender");x&&(a.pointer=new x(a,b));a.render();a.renderer.draw();if(!a.renderer.imgCount&&
a.onload)a.onload();a.cloneRenderTo(!0)}},onload:function(){g([this.callback].concat(this.callbacks),function(a){a&&void 0!==this.index&&a.apply(this,[this])},this);c(this,"load");!1!==this.options.chart.reflow&&this.initReflow();this.onload=null}}})(M);(function(a){var D,z=a.each,F=a.extend,J=a.erase,m=a.fireEvent,f=a.format,h=a.isArray,q=a.isNumber,n=a.pick,k=a.removeEvent;D=a.Point=function(){};D.prototype={init:function(a,d,g){this.series=a;this.color=a.color;this.applyOptions(d,g);a.options.colorByPoint?
(d=a.options.colors||a.chart.options.colors,this.color=this.color||d[a.colorCounter],d=d.length,g=a.colorCounter,a.colorCounter++,a.colorCounter===d&&(a.colorCounter=0)):g=a.colorIndex;this.colorIndex=n(this.colorIndex,g);a.chart.pointCount++;return this},applyOptions:function(a,d){var g=this.series,f=g.options.pointValKey||g.pointValKey;a=D.prototype.optionsToObject.call(this,a);F(this,a);this.options=this.options?F(this.options,a):a;a.group&&delete this.group;f&&(this.y=this[f]);this.isNull=n(this.isValid&&
!this.isValid(),null===this.x||!q(this.y,!0));this.selected&&(this.state="select");"name"in this&&void 0===d&&g.xAxis&&g.xAxis.hasNames&&(this.x=g.xAxis.nameToX(this));void 0===this.x&&g&&(this.x=void 0===d?g.autoIncrement(this):d);return this},optionsToObject:function(a){var d={},g=this.series,f=g.options.keys,k=f||g.pointArrayMap||["y"],c=k.length,e=0,l=0;if(q(a)||null===a)d[k[0]]=a;else if(h(a))for(!f&&a.length>c&&(g=typeof a[0],"string"===g?d.name=a[0]:"number"===g&&(d.x=a[0]),e++);l<c;)f&&void 0===
a[e]||(d[k[l]]=a[e]),e++,l++;else"object"===typeof a&&(d=a,a.dataLabels&&(g._hasPointLabels=!0),a.marker&&(g._hasPointMarkers=!0));return d},getClassName:function(){return"highcharts-point"+(this.selected?" highcharts-point-select":"")+(this.negative?" highcharts-negative":"")+(this.isNull?" highcharts-null-point":"")+(void 0!==this.colorIndex?" highcharts-color-"+this.colorIndex:"")+(this.options.className?" "+this.options.className:"")},getZone:function(){var a=this.series,d=a.zones,a=a.zoneAxis||
"y",g=0,f;for(f=d[g];this[a]>=f.value;)f=d[++g];f&&f.color&&!this.options.color&&(this.color=f.color);return f},destroy:function(){var a=this.series.chart,d=a.hoverPoints,g;a.pointCount--;d&&(this.setState(),J(d,this),d.length||(a.hoverPoints=null));if(this===a.hoverPoint)this.onMouseOut();if(this.graphic||this.dataLabel)k(this),this.destroyElements();this.legendItem&&a.legend.destroyItem(this);for(g in this)this[g]=null},destroyElements:function(){for(var a=["graphic","dataLabel","dataLabelUpper",
"connector","shadowGroup"],d,g=6;g--;)d=a[g],this[d]&&(this[d]=this[d].destroy())},getLabelConfig:function(){return{x:this.category,y:this.y,color:this.color,key:this.name||this.category,series:this.series,point:this,percentage:this.percentage,total:this.total||this.stackTotal}},tooltipFormatter:function(a){var d=this.series,g=d.tooltipOptions,h=n(g.valueDecimals,""),k=g.valuePrefix||"",c=g.valueSuffix||"";z(d.pointArrayMap||["y"],function(d){d="{point."+d;if(k||c)a=a.replace(d+"}",k+d+"}"+c);a=a.replace(d+
"}",d+":,."+h+"f}")});return f(a,{point:this,series:this.series})},firePointEvent:function(a,d,g){var f=this,h=this.series.options;(h.point.events[a]||f.options&&f.options.events&&f.options.events[a])&&this.importEvents();"click"===a&&h.allowPointSelect&&(g=function(a){f.select&&f.select(null,a.ctrlKey||a.metaKey||a.shiftKey)});m(this,a,d,g)},visible:!0}})(M);(function(a){var D=a.addEvent,z=a.animObject,F=a.arrayMax,J=a.arrayMin,m=a.correctFloat,f=a.Date,h=a.defaultOptions,q=a.defaultPlotOptions,
n=a.defined,k=a.each,v=a.erase,d=a.error,g=a.extend,w=a.fireEvent,B=a.grep,c=a.isArray,e=a.isNumber,l=a.isString,u=a.merge,L=a.pick,b=a.removeEvent,t=a.splat,y=a.stableSort,K=a.SVGElement,x=a.syncTimeout,I=a.win;a.Series=a.seriesType("line",null,{lineWidth:2,allowPointSelect:!1,showCheckbox:!1,animation:{duration:1E3},events:{},marker:{lineWidth:0,lineColor:"#ffffff",radius:4,states:{hover:{animation:{duration:50},enabled:!0,radiusPlus:2,lineWidthPlus:1},select:{fillColor:"#cccccc",lineColor:"#000000",
lineWidth:2}}},point:{events:{}},dataLabels:{align:"center",formatter:function(){return null===this.y?"":a.numberFormat(this.y,-1)},style:{fontSize:"11px",fontWeight:"bold",color:"contrast",textShadow:"1px 1px contrast, -1px -1px contrast, -1px 1px contrast, 1px -1px contrast"},verticalAlign:"bottom",x:0,y:0,padding:5},cropThreshold:300,pointRange:0,softThreshold:!0,states:{hover:{lineWidthPlus:1,marker:{},halo:{size:10,opacity:.25}},select:{marker:{}}},stickyTracking:!0,turboThreshold:1E3},{isCartesian:!0,
pointClass:a.Point,sorted:!0,requireSorting:!0,directTouch:!1,axisTypes:["xAxis","yAxis"],colorCounter:0,parallelArrays:["x","y"],coll:"series",init:function(a,b){var c=this,d,e,f=a.series,r=function(a,b){return L(a.options.index,a._i)-L(b.options.index,b._i)};c.chart=a;c.options=b=c.setOptions(b);c.linkedSeries=[];c.bindAxes();g(c,{name:b.name,state:"",visible:!1!==b.visible,selected:!0===b.selected});e=b.events;for(d in e)D(c,d,e[d]);if(e&&e.click||b.point&&b.point.events&&b.point.events.click||
b.allowPointSelect)a.runTrackerClick=!0;c.getColor();c.getSymbol();k(c.parallelArrays,function(a){c[a+"Data"]=[]});c.setData(b.data,!1);c.isCartesian&&(a.hasCartesianSeries=!0);f.push(c);c._i=f.length-1;y(f,r);this.yAxis&&y(this.yAxis.series,r);k(f,function(a,b){a.index=b;a.name=a.name||"Series "+(b+1)})},bindAxes:function(){var a=this,b=a.options,c=a.chart,e;k(a.axisTypes||[],function(g){k(c[g],function(c){e=c.options;if(b[g]===e.index||void 0!==b[g]&&b[g]===e.id||void 0===b[g]&&0===e.index)c.series.push(a),
a[g]=c,c.isDirty=!0});a[g]||a.optionalAxis===g||d(18,!0)})},updateParallelArrays:function(a,b){var c=a.series,d=arguments,g=e(b)?function(d){var e="y"===d&&c.toYData?c.toYData(a):a[d];c[d+"Data"][b]=e}:function(a){Array.prototype[b].apply(c[a+"Data"],Array.prototype.slice.call(d,2))};k(c.parallelArrays,g)},autoIncrement:function(){var a=this.options,b=this.xIncrement,c,d=a.pointIntervalUnit,b=L(b,a.pointStart,0);this.pointInterval=c=L(this.pointInterval,a.pointInterval,1);d&&(a=new f(b),"day"===d?
a=+a[f.hcSetDate](a[f.hcGetDate]()+c):"month"===d?a=+a[f.hcSetMonth](a[f.hcGetMonth]()+c):"year"===d&&(a=+a[f.hcSetFullYear](a[f.hcGetFullYear]()+c)),c=a-b);this.xIncrement=b+c;return b},setOptions:function(a){var b=this.chart,c=b.options.plotOptions,b=b.userOptions||{},d=b.plotOptions||{},e=c[this.type];this.userOptions=a;c=u(e,c.series,a);this.tooltipOptions=u(h.tooltip,h.plotOptions[this.type].tooltip,b.tooltip,d.series&&d.series.tooltip,d[this.type]&&d[this.type].tooltip,a.tooltip);null===e.marker&&
delete c.marker;this.zoneAxis=c.zoneAxis;a=this.zones=(c.zones||[]).slice();!c.negativeColor&&!c.negativeFillColor||c.zones||a.push({value:c[this.zoneAxis+"Threshold"]||c.threshold||0,className:"highcharts-negative",color:c.negativeColor,fillColor:c.negativeFillColor});a.length&&n(a[a.length-1].value)&&a.push({color:this.color,fillColor:this.fillColor});return c},getCyclic:function(a,b,c){var d,e=this.userOptions,g=a+"Index",f=a+"Counter",h=c?c.length:L(this.chart.options.chart[a+"Count"],this.chart[a+
"Count"]);b||(d=L(e[g],e["_"+g]),n(d)||(e["_"+g]=d=this.chart[f]%h,this.chart[f]+=1),c&&(b=c[d]));void 0!==d&&(this[g]=d);this[a]=b},getColor:function(){this.options.colorByPoint?this.options.color=null:this.getCyclic("color",this.options.color||q[this.type].color,this.chart.options.colors)},getSymbol:function(){this.getCyclic("symbol",this.options.marker.symbol,this.chart.options.symbols)},drawLegendSymbol:a.LegendSymbolMixin.drawLineMarker,setData:function(a,b,g,f){var h=this,r=h.points,n=r&&r.length||
0,t,u=h.options,x=h.chart,m=null,y=h.xAxis,G=u.turboThreshold,q=this.xData,w=this.yData,v=(t=h.pointArrayMap)&&t.length;a=a||[];t=a.length;b=L(b,!0);if(!1!==f&&t&&n===t&&!h.cropped&&!h.hasGroupedData&&h.visible)k(a,function(a,b){r[b].update&&a!==u.data[b]&&r[b].update(a,!1,null,!1)});else{h.xIncrement=null;h.colorCounter=0;k(this.parallelArrays,function(a){h[a+"Data"].length=0});if(G&&t>G){for(g=0;null===m&&g<t;)m=a[g],g++;if(e(m))for(g=0;g<t;g++)q[g]=this.autoIncrement(),w[g]=a[g];else if(c(m))if(v)for(g=
0;g<t;g++)m=a[g],q[g]=m[0],w[g]=m.slice(1,v+1);else for(g=0;g<t;g++)m=a[g],q[g]=m[0],w[g]=m[1];else d(12)}else for(g=0;g<t;g++)void 0!==a[g]&&(m={series:h},h.pointClass.prototype.applyOptions.apply(m,[a[g]]),h.updateParallelArrays(m,g));l(w[0])&&d(14,!0);h.data=[];h.options.data=h.userOptions.data=a;for(g=n;g--;)r[g]&&r[g].destroy&&r[g].destroy();y&&(y.minRange=y.userMinRange);h.isDirty=x.isDirtyBox=!0;h.isDirtyData=!!r;g=!1}"point"===u.legendType&&(this.processData(),this.generatePoints());b&&x.redraw(g)},
processData:function(a){var b=this.xData,c=this.yData,e=b.length,g;g=0;var f,h,l=this.xAxis,k,r=this.options;k=r.cropThreshold;var n=this.getExtremesFromAll||r.getExtremesFromAll,t=this.isCartesian,r=l&&l.val2lin,u=l&&l.isLog,m,x;if(t&&!this.isDirty&&!l.isDirty&&!this.yAxis.isDirty&&!a)return!1;l&&(a=l.getExtremes(),m=a.min,x=a.max);if(t&&this.sorted&&!n&&(!k||e>k||this.forceCrop))if(b[e-1]<m||b[0]>x)b=[],c=[];else if(b[0]<m||b[e-1]>x)g=this.cropData(this.xData,this.yData,m,x),b=g.xData,c=g.yData,
g=g.start,f=!0;for(k=b.length||1;--k;)e=u?r(b[k])-r(b[k-1]):b[k]-b[k-1],0<e&&(void 0===h||e<h)?h=e:0>e&&this.requireSorting&&d(15);this.cropped=f;this.cropStart=g;this.processedXData=b;this.processedYData=c;this.closestPointRange=h},cropData:function(a,b,c,d){var e=a.length,g=0,f=e,h=L(this.cropShoulder,1),l;for(l=0;l<e;l++)if(a[l]>=c){g=Math.max(0,l-h);break}for(c=l;c<e;c++)if(a[c]>d){f=c+h;break}return{xData:a.slice(g,f),yData:b.slice(g,f),start:g,end:f}},generatePoints:function(){var a=this.options.data,
b=this.data,c,d=this.processedXData,e=this.processedYData,g=this.pointClass,f=d.length,h=this.cropStart||0,l,k=this.hasGroupedData,n,u=[],m;b||k||(b=[],b.length=a.length,b=this.data=b);for(m=0;m<f;m++)l=h+m,k?(u[m]=(new g).init(this,[d[m]].concat(t(e[m]))),u[m].dataGroup=this.groupMap[m]):(b[l]?n=b[l]:void 0!==a[l]&&(b[l]=n=(new g).init(this,a[l],d[m])),u[m]=n),u[m].index=l;if(b&&(f!==(c=b.length)||k))for(m=0;m<c;m++)m!==h||k||(m+=f),b[m]&&(b[m].destroyElements(),b[m].plotX=void 0);this.data=b;this.points=
u},getExtremes:function(a){var b=this.yAxis,d=this.processedXData,g,f=[],h=0;g=this.xAxis.getExtremes();var l=g.min,k=g.max,r,n,t,m;a=a||this.stackedYData||this.processedYData||[];g=a.length;for(m=0;m<g;m++)if(n=d[m],t=a[m],r=(e(t,!0)||c(t))&&(!b.isLog||t.length||0<t),n=this.getExtremesFromAll||this.options.getExtremesFromAll||this.cropped||(d[m+1]||n)>=l&&(d[m-1]||n)<=k,r&&n)if(r=t.length)for(;r--;)null!==t[r]&&(f[h++]=t[r]);else f[h++]=t;this.dataMin=J(f);this.dataMax=F(f)},translate:function(){this.processedXData||
this.processData();this.generatePoints();for(var a=this.options,b=a.stacking,c=this.xAxis,d=c.categories,g=this.yAxis,f=this.points,h=f.length,l=!!this.modifyValue,k=a.pointPlacement,t="between"===k||e(k),u=a.threshold,x=a.startFromThreshold?u:0,y,q,w,v,K=Number.MAX_VALUE,a=0;a<h;a++){var I=f[a],B=I.x,z=I.y;q=I.low;var D=b&&g.stacks[(this.negStacks&&z<(x?0:u)?"-":"")+this.stackKey],F;g.isLog&&null!==z&&0>=z&&(I.isNull=!0);I.plotX=y=m(Math.min(Math.max(-1E5,c.translate(B,0,0,0,1,k,"flags"===this.type)),
1E5));b&&this.visible&&!I.isNull&&D&&D[B]&&(v=this.getStackIndicator(v,B,this.index),F=D[B],z=F.points[v.key],q=z[0],z=z[1],q===x&&v.key===D[B].base&&(q=L(u,g.min)),g.isLog&&0>=q&&(q=null),I.total=I.stackTotal=F.total,I.percentage=F.total&&I.y/F.total*100,I.stackY=z,F.setOffset(this.pointXOffset||0,this.barW||0));I.yBottom=n(q)?g.translate(q,0,1,0,1):null;l&&(z=this.modifyValue(z,I));I.plotY=q="number"===typeof z&&Infinity!==z?Math.min(Math.max(-1E5,g.translate(z,0,1,0,1)),1E5):void 0;I.isInside=
void 0!==q&&0<=q&&q<=g.len&&0<=y&&y<=c.len;I.clientX=t?m(c.translate(B,0,0,0,1,k)):y;I.negative=I.y<(u||0);I.category=d&&void 0!==d[I.x]?d[I.x]:I.x;I.isNull||(void 0!==w&&(K=Math.min(K,Math.abs(y-w))),w=y)}this.closestPointRangePx=K},getValidPoints:function(a,b){var c=this.chart;return B(a||this.points||[],function(a){return b&&!c.isInsidePlot(a.plotX,a.plotY,c.inverted)?!1:!a.isNull})},setClip:function(a){var b=this.chart,c=this.options,d=b.renderer,e=b.inverted,g=this.clipBox,f=g||b.clipBox,h=this.sharedClipKey||
["_sharedClip",a&&a.duration,a&&a.easing,f.height,c.xAxis,c.yAxis].join(),l=b[h],k=b[h+"m"];l||(a&&(f.width=0,b[h+"m"]=k=d.clipRect(-99,e?-b.plotLeft:-b.plotTop,99,e?b.chartWidth:b.chartHeight)),b[h]=l=d.clipRect(f),l.count={length:0});a&&!l.count[this.index]&&(l.count[this.index]=!0,l.count.length+=1);!1!==c.clip&&(this.group.clip(a||g?l:b.clipRect),this.markerGroup.clip(k),this.sharedClipKey=h);a||(l.count[this.index]&&(delete l.count[this.index],--l.count.length),0===l.count.length&&h&&b[h]&&(g||
(b[h]=b[h].destroy()),b[h+"m"]&&(b[h+"m"]=b[h+"m"].destroy())))},animate:function(a){var b=this.chart,c=z(this.options.animation),d;a?this.setClip(c):(d=this.sharedClipKey,(a=b[d])&&a.animate({width:b.plotSizeX},c),b[d+"m"]&&b[d+"m"].animate({width:b.plotSizeX+99},c),this.animate=null)},afterAnimate:function(){this.setClip();w(this,"afterAnimate")},drawPoints:function(){var a=this.points,b=this.chart,c,d,g,f,h=this.options.marker,l,k,n,t,m=this.markerGroup,u=L(h.enabled,this.xAxis.isRadial?!0:null,
this.closestPointRangePx>2*h.radius);if(!1!==h.enabled||this._hasPointMarkers)for(d=a.length;d--;)g=a[d],c=g.plotY,f=g.graphic,l=g.marker||{},k=!!g.marker,n=u&&void 0===l.enabled||l.enabled,t=g.isInside,n&&e(c)&&null!==g.y?(c=L(l.symbol,this.symbol),g.hasImage=0===c.indexOf("url"),n=this.markerAttribs(g,g.selected&&"select"),f?f[t?"show":"hide"](!0).animate(n):t&&(0<n.width||g.hasImage)&&(g.graphic=f=b.renderer.symbol(c,n.x,n.y,n.width,n.height,k?l:h).add(m)),f&&f.attr(this.pointAttribs(g,g.selected&&
"select")),f&&f.addClass(g.getClassName(),!0)):f&&(g.graphic=f.destroy())},markerAttribs:function(a,b){var c=this.options.marker,d=a&&a.options,e=d&&d.marker||{},d=L(e.radius,c.radius);b&&(c=c.states[b],b=e.states&&e.states[b],d=L(b&&b.radius,c&&c.radius,d+(c&&c.radiusPlus||0)));a.hasImage&&(d=0);a={x:Math.floor(a.plotX)-d,y:a.plotY-d};d&&(a.width=a.height=2*d);return a},pointAttribs:function(a,b){var c=this.options.marker,d=a&&a.options,e=d&&d.marker||{},g=c.lineWidth,f=this.color,d=d&&d.color,h=
a&&a.color,l;a&&this.zones.length&&(a=a.getZone())&&a.color&&(l=a.color);f=d||l||h||f;l=e.fillColor||c.fillColor||f;f=e.lineColor||c.lineColor||f;b&&(c=c.states[b],b=e.states&&e.states[b]||{},g=c.lineWidth||g+c.lineWidthPlus,l=b.fillColor||c.fillColor||l,f=b.lineColor||c.lineColor||f);return{stroke:f,"stroke-width":g,fill:l}},destroy:function(){var a=this,c=a.chart,d=/AppleWebKit\/533/.test(I.navigator.userAgent),e,g=a.data||[],f,h,l;w(a,"destroy");b(a);k(a.axisTypes||[],function(b){(l=a[b])&&l.series&&
(v(l.series,a),l.isDirty=l.forceRedraw=!0)});a.legendItem&&a.chart.legend.destroyItem(a);for(e=g.length;e--;)(f=g[e])&&f.destroy&&f.destroy();a.points=null;clearTimeout(a.animationTimeout);for(h in a)a[h]instanceof K&&!a[h].survive&&(e=d&&"group"===h?"hide":"destroy",a[h][e]());c.hoverSeries===a&&(c.hoverSeries=null);v(c.series,a);for(h in a)delete a[h]},getGraphPath:function(a,b,c){var d=this,e=d.options,g=e.step,f,h=[],l=[],r;a=a||d.points;(f=a.reversed)&&a.reverse();(g={right:1,center:2}[g]||g&&
3)&&f&&(g=4-g);!e.connectNulls||b||c||(a=this.getValidPoints(a));k(a,function(f,k){var t=f.plotX,p=f.plotY,m=a[k-1];(f.leftCliff||m&&m.rightCliff)&&!c&&(r=!0);f.isNull&&!n(b)&&0<k?r=!e.connectNulls:f.isNull&&!b?r=!0:(0===k||r?k=["M",f.plotX,f.plotY]:d.getPointSpline?k=d.getPointSpline(a,f,k):g?(k=1===g?["L",m.plotX,p]:2===g?["L",(m.plotX+t)/2,m.plotY,"L",(m.plotX+t)/2,p]:["L",t,m.plotY],k.push("L",t,p)):k=["L",t,p],l.push(f.x),g&&l.push(f.x),h.push.apply(h,k),r=!1)});h.xMap=l;return d.graphPath=h},
drawGraph:function(){var a=this,b=this.options,c=(this.gappedPath||this.getGraphPath).call(this),d=[["graph","highcharts-graph",b.lineColor||this.color,b.dashStyle]];k(this.zones,function(c,e){d.push(["zone-graph-"+e,"highcharts-graph highcharts-zone-graph-"+e+" "+(c.className||""),c.color||a.color,c.dashStyle||b.dashStyle])});k(d,function(d,e){var g=d[0],f=a[g];f?(f.endX=c.xMap,f.animate({d:c})):c.length&&(a[g]=a.chart.renderer.path(c).addClass(d[1]).attr({zIndex:1}).add(a.group),f={stroke:d[2],
"stroke-width":b.lineWidth,fill:a.fillGraph&&a.color||"none"},d[3]?f.dashstyle=d[3]:"square"!==b.linecap&&(f["stroke-linecap"]=f["stroke-linejoin"]="round"),f=a[g].attr(f).shadow(2>e&&b.shadow));f&&(f.startX=c.xMap,f.isArea=c.isArea)})},applyZones:function(){var a=this,b=this.chart,c=b.renderer,d=this.zones,e,g,f=this.clips||[],h,l=this.graph,n=this.area,t=Math.max(b.chartWidth,b.chartHeight),m=this[(this.zoneAxis||"y")+"Axis"],u,x,y=b.inverted,q,w,v,K,I=!1;d.length&&(l||n)&&m&&void 0!==m.min&&(x=
m.reversed,q=m.horiz,l&&l.hide(),n&&n.hide(),u=m.getExtremes(),k(d,function(d,k){e=x?q?b.plotWidth:0:q?0:m.toPixels(u.min);e=Math.min(Math.max(L(g,e),0),t);g=Math.min(Math.max(Math.round(m.toPixels(L(d.value,u.max),!0)),0),t);I&&(e=g=m.toPixels(u.max));w=Math.abs(e-g);v=Math.min(e,g);K=Math.max(e,g);m.isXAxis?(h={x:y?K:v,y:0,width:w,height:t},q||(h.x=b.plotHeight-h.x)):(h={x:0,y:y?K:v,width:t,height:w},q&&(h.y=b.plotWidth-h.y));y&&c.isVML&&(h=m.isXAxis?{x:0,y:x?v:K,height:h.width,width:b.chartWidth}:
{x:h.y-b.plotLeft-b.spacingBox.x,y:0,width:h.height,height:b.chartHeight});f[k]?f[k].animate(h):(f[k]=c.clipRect(h),l&&a["zone-graph-"+k].clip(f[k]),n&&a["zone-area-"+k].clip(f[k]));I=d.value>u.max}),this.clips=f)},invertGroups:function(a){function c(){var b={width:d.yAxis.len,height:d.xAxis.len};k(["group","markerGroup"],function(c){d[c]&&d[c].attr(b).invert(a)})}var d=this,e=d.chart;d.xAxis&&(D(e,"resize",c),D(d,"destroy",function(){b(e,"resize",c)}),c(a),d.invertGroups=c)},plotGroup:function(a,
b,c,d,e){var g=this[a],f=!g;f&&(this[a]=g=this.chart.renderer.g(b).attr({zIndex:d||.1}).add(e),g.addClass("highcharts-series-"+this.index+" highcharts-"+this.type+"-series highcharts-color-"+this.colorIndex+" "+(this.options.className||"")));g.attr({visibility:c})[f?"attr":"animate"](this.getPlotBox());return g},getPlotBox:function(){var a=this.chart,b=this.xAxis,c=this.yAxis;a.inverted&&(b=c,c=this.xAxis);return{translateX:b?b.left:a.plotLeft,translateY:c?c.top:a.plotTop,scaleX:1,scaleY:1}},render:function(){var a=
this,b=a.chart,c,d=a.options,e=!!a.animate&&b.renderer.isSVG&&z(d.animation).duration,g=a.visible?"inherit":"hidden",f=d.zIndex,h=a.hasRendered,l=b.seriesGroup,k=b.inverted;c=a.plotGroup("group","series",g,f,l);a.markerGroup=a.plotGroup("markerGroup","markers",g,f,l);e&&a.animate(!0);c.inverted=a.isCartesian?k:!1;a.drawGraph&&(a.drawGraph(),a.applyZones());a.drawDataLabels&&a.drawDataLabels();a.visible&&a.drawPoints();a.drawTracker&&!1!==a.options.enableMouseTracking&&a.drawTracker();a.invertGroups(k);
!1===d.clip||a.sharedClipKey||h||c.clip(b.clipRect);e&&a.animate();h||(a.animationTimeout=x(function(){a.afterAnimate()},e));a.isDirty=a.isDirtyData=!1;a.hasRendered=!0},redraw:function(){var a=this.chart,b=this.isDirty||this.isDirtyData,c=this.group,d=this.xAxis,e=this.yAxis;c&&(a.inverted&&c.attr({width:a.plotWidth,height:a.plotHeight}),c.animate({translateX:L(d&&d.left,a.plotLeft),translateY:L(e&&e.top,a.plotTop)}));this.translate();this.render();b&&delete this.kdTree},kdDimensions:1,kdAxisArray:["clientX",
"plotY"],searchPoint:function(a,b){var c=this.xAxis,d=this.yAxis,e=this.chart.inverted;return this.searchKDTree({clientX:e?c.len-a.chartY+c.pos:a.chartX-c.pos,plotY:e?d.len-a.chartX+d.pos:a.chartY-d.pos},b)},buildKDTree:function(){function a(c,d,e){var g,f;if(f=c&&c.length)return g=b.kdAxisArray[d%e],c.sort(function(a,b){return a[g]-b[g]}),f=Math.floor(f/2),{point:c[f],left:a(c.slice(0,f),d+1,e),right:a(c.slice(f+1),d+1,e)}}var b=this,c=b.kdDimensions;delete b.kdTree;x(function(){b.kdTree=a(b.getValidPoints(null,
!b.directTouch),c,c)},b.options.kdNow?0:1)},searchKDTree:function(a,b){function c(a,b,h,l){var k=b.point,t=d.kdAxisArray[h%l],m,u,r=k;u=n(a[e])&&n(k[e])?Math.pow(a[e]-k[e],2):null;m=n(a[g])&&n(k[g])?Math.pow(a[g]-k[g],2):null;m=(u||0)+(m||0);k.dist=n(m)?Math.sqrt(m):Number.MAX_VALUE;k.distX=n(u)?Math.sqrt(u):Number.MAX_VALUE;t=a[t]-k[t];m=0>t?"left":"right";u=0>t?"right":"left";b[m]&&(m=c(a,b[m],h+1,l),r=m[f]<r[f]?m:k);b[u]&&Math.sqrt(t*t)<r[f]&&(a=c(a,b[u],h+1,l),r=a[f]<r[f]?a:r);return r}var d=
this,e=this.kdAxisArray[0],g=this.kdAxisArray[1],f=b?"distX":"dist";this.kdTree||this.buildKDTree();if(this.kdTree)return c(a,this.kdTree,this.kdDimensions,this.kdDimensions)}})})(M);(function(a){function D(a,f,d,g,h){var k=a.chart.inverted;this.axis=a;this.isNegative=d;this.options=f;this.x=g;this.total=null;this.points={};this.stack=h;this.rightCliff=this.leftCliff=0;this.alignOptions={align:f.align||(k?d?"left":"right":"center"),verticalAlign:f.verticalAlign||(k?"middle":d?"bottom":"top"),y:n(f.y,
k?4:d?14:-6),x:n(f.x,k?d?-6:6:0)};this.textAlign=f.textAlign||(k?d?"right":"left":"center")}var z=a.Axis,F=a.Chart,J=a.correctFloat,m=a.defined,f=a.destroyObjectProperties,h=a.each,q=a.format,n=a.pick;a=a.Series;D.prototype={destroy:function(){f(this,this.axis)},render:function(a){var f=this.options,d=f.format,d=d?q(d,this):f.formatter.call(this);this.label?this.label.attr({text:d,visibility:"hidden"}):this.label=this.axis.chart.renderer.text(d,null,null,f.useHTML).css(f.style).attr({align:this.textAlign,
rotation:f.rotation,visibility:"hidden"}).add(a)},setOffset:function(a,f){var d=this.axis,g=d.chart,h=g.inverted,k=d.reversed,k=this.isNegative&&!k||!this.isNegative&&k,c=d.translate(d.usePercentage?100:this.total,0,0,0,1),d=d.translate(0),d=Math.abs(c-d);a=g.xAxis[0].translate(this.x)+a;var e=g.plotHeight,h={x:h?k?c:c-d:a,y:h?e-a-f:k?e-c-d:e-c,width:h?d:f,height:h?f:d};if(f=this.label)f.align(this.alignOptions,null,h),h=f.alignAttr,f[!1===this.options.crop||g.isInsidePlot(h.x,h.y)?"show":"hide"](!0)}};
F.prototype.getStacks=function(){var a=this;h(a.yAxis,function(a){a.stacks&&a.hasVisibleSeries&&(a.oldStacks=a.stacks)});h(a.series,function(f){!f.options.stacking||!0!==f.visible&&!1!==a.options.chart.ignoreHiddenSeries||(f.stackKey=f.type+n(f.options.stack,""))})};z.prototype.buildStacks=function(){var a=this.series,f,d=n(this.options.reversedStacks,!0),g=a.length,h;if(!this.isXAxis){this.usePercentage=!1;for(h=g;h--;)a[d?h:g-h-1].setStackedPoints();for(h=g;h--;)f=a[d?h:g-h-1],f.setStackCliffs&&
f.setStackCliffs();if(this.usePercentage)for(h=0;h<g;h++)a[h].setPercentStacks()}};z.prototype.renderStackTotals=function(){var a=this.chart,f=a.renderer,d=this.stacks,g,h,n=this.stackTotalGroup;n||(this.stackTotalGroup=n=f.g("stack-labels").attr({visibility:"visible",zIndex:6}).add());n.translate(a.plotLeft,a.plotTop);for(g in d)for(h in a=d[g],a)a[h].render(n)};z.prototype.resetStacks=function(){var a=this.stacks,f,d;if(!this.isXAxis)for(f in a)for(d in a[f])a[f][d].touched<this.stacksTouched?(a[f][d].destroy(),
delete a[f][d]):(a[f][d].total=null,a[f][d].cum=0)};z.prototype.cleanStacks=function(){var a,f,d;if(!this.isXAxis)for(f in this.oldStacks&&(a=this.stacks=this.oldStacks),a)for(d in a[f])a[f][d].cum=a[f][d].total};a.prototype.setStackedPoints=function(){if(this.options.stacking&&(!0===this.visible||!1===this.chart.options.chart.ignoreHiddenSeries)){var a=this.processedXData,f=this.processedYData,d=[],g=f.length,h=this.options,q=h.threshold,c=h.startFromThreshold?q:0,e=h.stack,h=h.stacking,l=this.stackKey,
u="-"+l,z=this.negStacks,b=this.yAxis,t=b.stacks,y=b.oldStacks,K,x,I,r,G,H,F;b.stacksTouched+=1;for(G=0;G<g;G++)H=a[G],F=f[G],K=this.getStackIndicator(K,H,this.index),r=K.key,I=(x=z&&F<(c?0:q))?u:l,t[I]||(t[I]={}),t[I][H]||(y[I]&&y[I][H]?(t[I][H]=y[I][H],t[I][H].total=null):t[I][H]=new D(b,b.options.stackLabels,x,H,e)),I=t[I][H],null!==F&&(I.points[r]=I.points[this.index]=[n(I.cum,c)],m(I.cum)||(I.base=r),I.touched=b.stacksTouched,0<K.index&&!1===this.singleStacks&&(I.points[r][0]=I.points[this.index+
","+H+",0"][0])),"percent"===h?(x=x?l:u,z&&t[x]&&t[x][H]?(x=t[x][H],I.total=x.total=Math.max(x.total,I.total)+Math.abs(F)||0):I.total=J(I.total+(Math.abs(F)||0))):I.total=J(I.total+(F||0)),I.cum=n(I.cum,c)+(F||0),null!==F&&(I.points[r].push(I.cum),d[G]=I.cum);"percent"===h&&(b.usePercentage=!0);this.stackedYData=d;b.oldStacks={}}};a.prototype.setPercentStacks=function(){var a=this,f=a.stackKey,d=a.yAxis.stacks,g=a.processedXData,n;h([f,"-"+f],function(f){for(var c=g.length,e,h;c--;)if(e=g[c],n=a.getStackIndicator(n,
e,a.index,f),e=(h=d[f]&&d[f][e])&&h.points[n.key])h=h.total?100/h.total:0,e[0]=J(e[0]*h),e[1]=J(e[1]*h),a.stackedYData[c]=e[1]})};a.prototype.getStackIndicator=function(a,f,d,g){!m(a)||a.x!==f||g&&a.key!==g?a={x:f,index:0,key:g}:a.index++;a.key=[d,f,a.index].join();return a}})(M);(function(a){var D=a.addEvent,z=a.animate,F=a.Axis,J=a.createElement,m=a.css,f=a.defined,h=a.each,q=a.erase,n=a.extend,k=a.fireEvent,v=a.inArray,d=a.isNumber,g=a.isObject,w=a.merge,B=a.pick,c=a.Point,e=a.Series,l=a.seriesTypes,
u=a.setAnimation,L=a.splat;n(a.Chart.prototype,{addSeries:function(a,c,d){var b,e=this;a&&(c=B(c,!0),k(e,"addSeries",{options:a},function(){b=e.initSeries(a);e.isDirtyLegend=!0;e.linkSeries();c&&e.redraw(d)}));return b},addAxis:function(a,c,d,e){var b=c?"xAxis":"yAxis",f=this.options;a=w(a,{index:this[b].length,isX:c});new F(this,a);f[b]=L(f[b]||{});f[b].push(a);B(d,!0)&&this.redraw(e)},showLoading:function(a){var b=this,c=b.options,d=b.loadingDiv,e=c.loading,f=function(){d&&m(d,{left:b.plotLeft+
"px",top:b.plotTop+"px",width:b.plotWidth+"px",height:b.plotHeight+"px"})};d||(b.loadingDiv=d=J("div",{className:"highcharts-loading highcharts-loading-hidden"},null,b.container),b.loadingSpan=J("span",{className:"highcharts-loading-inner"},null,d),D(b,"redraw",f));d.className="highcharts-loading";b.loadingSpan.innerHTML=a||c.lang.loading;m(d,n(e.style,{zIndex:10}));m(b.loadingSpan,e.labelStyle);b.loadingShown||(m(d,{opacity:0,display:""}),z(d,{opacity:e.style.opacity||.5},{duration:e.showDuration||
0}));b.loadingShown=!0;f()},hideLoading:function(){var a=this.options,c=this.loadingDiv;c&&(c.className="highcharts-loading highcharts-loading-hidden",z(c,{opacity:0},{duration:a.loading.hideDuration||100,complete:function(){m(c,{display:"none"})}}));this.loadingShown=!1},propsRequireDirtyBox:"backgroundColor borderColor borderWidth margin marginTop marginRight marginBottom marginLeft spacing spacingTop spacingRight spacingBottom spacingLeft borderRadius plotBackgroundColor plotBackgroundImage plotBorderColor plotBorderWidth plotShadow shadow".split(" "),
propsRequireUpdateSeries:["chart.polar","chart.ignoreHiddenSeries","chart.type","colors","plotOptions"],update:function(a,c){var b,e={credits:"addCredits",title:"setTitle",subtitle:"setSubtitle"},g=a.chart,l,k;if(g){w(!0,this.options.chart,g);"className"in g&&this.setClassName(g.className);if("inverted"in g||"polar"in g)this.propFromSeries(),l=!0;for(b in g)g.hasOwnProperty(b)&&(-1!==v("chart."+b,this.propsRequireUpdateSeries)&&(k=!0),-1!==v(b,this.propsRequireDirtyBox)&&(this.isDirtyBox=!0));"style"in
g&&this.renderer.setStyle(g.style)}for(b in a){if(this[b]&&"function"===typeof this[b].update)this[b].update(a[b],!1);else if("function"===typeof this[e[b]])this[e[b]](a[b]);"chart"!==b&&-1!==v(b,this.propsRequireUpdateSeries)&&(k=!0)}a.colors&&(this.options.colors=a.colors);a.plotOptions&&w(!0,this.options.plotOptions,a.plotOptions);h(["xAxis","yAxis","series"],function(b){a[b]&&h(L(a[b]),function(a){var c=f(a.id)&&this.get(a.id)||this[b][0];c&&c.coll===b&&c.update(a,!1)},this)},this);l&&h(this.axes,
function(a){a.update({},!1)});k&&h(this.series,function(a){a.update({},!1)});a.loading&&w(!0,this.options.loading,a.loading);b=g&&g.width;g=g&&g.height;d(b)&&b!==this.chartWidth||d(g)&&g!==this.chartHeight?this.setSize(b,g):B(c,!0)&&this.redraw()},setSubtitle:function(a){this.setTitle(void 0,a)}});n(c.prototype,{update:function(a,c,d,e){function b(){f.applyOptions(a);null===f.y&&l&&(f.graphic=l.destroy());g(a,!0)&&(l&&l.element&&a&&a.marker&&a.marker.symbol&&(f.graphic=l.destroy()),a&&a.dataLabels&&
f.dataLabel&&(f.dataLabel=f.dataLabel.destroy()));k=f.index;h.updateParallelArrays(f,k);m.data[k]=g(m.data[k],!0)?f.options:a;h.isDirty=h.isDirtyData=!0;!h.fixedBox&&h.hasCartesianSeries&&(n.isDirtyBox=!0);"point"===m.legendType&&(n.isDirtyLegend=!0);c&&n.redraw(d)}var f=this,h=f.series,l=f.graphic,k,n=h.chart,m=h.options;c=B(c,!0);!1===e?b():f.firePointEvent("update",{options:a},b)},remove:function(a,c){this.series.removePoint(v(this,this.series.data),a,c)}});n(e.prototype,{addPoint:function(a,c,
d,e){var b=this.options,f=this.data,g=this.chart,h=this.xAxis&&this.xAxis.names,l=b.data,k,n,m=this.xData,u,t;c=B(c,!0);k={series:this};this.pointClass.prototype.applyOptions.apply(k,[a]);t=k.x;u=m.length;if(this.requireSorting&&t<m[u-1])for(n=!0;u&&m[u-1]>t;)u--;this.updateParallelArrays(k,"splice",u,0,0);this.updateParallelArrays(k,u);h&&k.name&&(h[t]=k.name);l.splice(u,0,a);n&&(this.data.splice(u,0,null),this.processData());"point"===b.legendType&&this.generatePoints();d&&(f[0]&&f[0].remove?f[0].remove(!1):
(f.shift(),this.updateParallelArrays(k,"shift"),l.shift()));this.isDirtyData=this.isDirty=!0;c&&g.redraw(e)},removePoint:function(a,c,d){var b=this,e=b.data,f=e[a],g=b.points,h=b.chart,l=function(){g&&g.length===e.length&&g.splice(a,1);e.splice(a,1);b.options.data.splice(a,1);b.updateParallelArrays(f||{series:b},"splice",a,1);f&&f.destroy();b.isDirty=!0;b.isDirtyData=!0;c&&h.redraw()};u(d,h);c=B(c,!0);f?f.firePointEvent("remove",null,l):l()},remove:function(a,c,d){function b(){e.destroy();f.isDirtyLegend=
f.isDirtyBox=!0;f.linkSeries();B(a,!0)&&f.redraw(c)}var e=this,f=e.chart;!1!==d?k(e,"remove",null,b):b()},update:function(a,c){var b=this,d=this.chart,e=this.userOptions,f=this.type,g=a.type||e.type||d.options.chart.type,k=l[f].prototype,m=["group","markerGroup","dataLabelsGroup"],u;if(g&&g!==f||void 0!==a.zIndex)m.length=0;h(m,function(a){m[a]=b[a];delete b[a]});a=w(e,{animation:!1,index:this.index,pointStart:this.xData[0]},{data:this.options.data},a);this.remove(!1,null,!1);for(u in k)this[u]=void 0;
n(this,l[g||f].prototype);h(m,function(a){b[a]=m[a]});this.init(d,a);d.linkSeries();B(c,!0)&&d.redraw(!1)}});n(F.prototype,{update:function(a,c){var b=this.chart;a=b.options[this.coll][this.options.index]=w(this.userOptions,a);this.destroy(!0);this.init(b,n(a,{events:void 0}));b.isDirtyBox=!0;B(c,!0)&&b.redraw()},remove:function(a){for(var b=this.chart,c=this.coll,d=this.series,e=d.length;e--;)d[e]&&d[e].remove(!1);q(b.axes,this);q(b[c],this);b.options[c].splice(this.options.index,1);h(b[c],function(a,
b){a.options.index=b});this.destroy();b.isDirtyBox=!0;B(a,!0)&&b.redraw()},setTitle:function(a,c){this.update({title:a},c)},setCategories:function(a,c){this.update({categories:a},c)}})})(M);(function(a){var D=a.color,z=a.each,F=a.map,J=a.pick,m=a.Series,f=a.seriesType;f("area","line",{softThreshold:!1,threshold:0},{singleStacks:!1,getStackPoints:function(){var a=[],f=[],n=this.xAxis,k=this.yAxis,m=k.stacks[this.stackKey],d={},g=this.points,w=this.index,B=k.series,c=B.length,e,l=J(k.options.reversedStacks,
!0)?1:-1,u,L;if(this.options.stacking){for(u=0;u<g.length;u++)d[g[u].x]=g[u];for(L in m)null!==m[L].total&&f.push(L);f.sort(function(a,c){return a-c});e=F(B,function(){return this.visible});z(f,function(b,g){var h=0,t,q;if(d[b]&&!d[b].isNull)a.push(d[b]),z([-1,1],function(a){var h=1===a?"rightNull":"leftNull",k=0,n=m[f[g+a]];if(n)for(u=w;0<=u&&u<c;)t=n.points[u],t||(u===w?d[b][h]=!0:e[u]&&(q=m[b].points[u])&&(k-=q[1]-q[0])),u+=l;d[b][1===a?"rightCliff":"leftCliff"]=k});else{for(u=w;0<=u&&u<c;){if(t=
m[b].points[u]){h=t[1];break}u+=l}h=k.toPixels(h,!0);a.push({isNull:!0,plotX:n.toPixels(b,!0),plotY:h,yBottom:h})}})}return a},getGraphPath:function(a){var f=m.prototype.getGraphPath,h=this.options,k=h.stacking,v=this.yAxis,d,g,w=[],B=[],c=this.index,e,l=v.stacks[this.stackKey],u=h.threshold,z=v.getThreshold(h.threshold),b,h=h.connectNulls||"percent"===k,t=function(b,d,f){var g=a[b];b=k&&l[g.x].points[c];var h=g[f+"Null"]||0;f=g[f+"Cliff"]||0;var n,m,g=!0;f||h?(n=(h?b[0]:b[1])+f,m=b[0]+f,g=!!h):!k&&
a[d]&&a[d].isNull&&(n=m=u);void 0!==n&&(B.push({plotX:e,plotY:null===n?z:v.getThreshold(n),isNull:g}),w.push({plotX:e,plotY:null===m?z:v.getThreshold(m),doCurve:!1}))};a=a||this.points;k&&(a=this.getStackPoints());for(d=0;d<a.length;d++)if(g=a[d].isNull,e=J(a[d].rectPlotX,a[d].plotX),b=J(a[d].yBottom,z),!g||h)h||t(d,d-1,"left"),g&&!k&&h||(B.push(a[d]),w.push({x:d,plotX:e,plotY:b})),h||t(d,d+1,"right");d=f.call(this,B,!0,!0);w.reversed=!0;g=f.call(this,w,!0,!0);g.length&&(g[0]="L");g=d.concat(g);f=
f.call(this,B,!1,h);g.xMap=d.xMap;this.areaPath=g;return f},drawGraph:function(){this.areaPath=[];m.prototype.drawGraph.apply(this);var a=this,f=this.areaPath,n=this.options,k=[["area","highcharts-area",this.color,n.fillColor]];z(this.zones,function(f,d){k.push(["zone-area-"+d,"highcharts-area highcharts-zone-area-"+d+" "+f.className,f.color||a.color,f.fillColor||n.fillColor])});z(k,function(h){var d=h[0],g=a[d];g?(g.endX=f.xMap,g.animate({d:f})):(g=a[d]=a.chart.renderer.path(f).addClass(h[1]).attr({fill:J(h[3],
D(h[2]).setOpacity(J(n.fillOpacity,.75)).get()),zIndex:0}).add(a.group),g.isArea=!0);g.startX=f.xMap;g.shiftUnit=n.step?2:1})},drawLegendSymbol:a.LegendSymbolMixin.drawRectangle})})(M);(function(a){var D=a.extendClass,z=a.merge,F=a.pick,J=a.Series,m=a.seriesTypes;a.defaultPlotOptions.spline=z(a.defaultPlotOptions.line);m.spline=D(J,{type:"spline",getPointSpline:function(a,h,m){var f=h.plotX,k=h.plotY,q=a[m-1];m=a[m+1];var d,g,w,B;if(q&&!q.isNull&&!1!==q.doCurve&&m&&!m.isNull&&!1!==m.doCurve){a=q.plotY;
w=m.plotX;m=m.plotY;var c=0;d=(1.5*f+q.plotX)/2.5;g=(1.5*k+a)/2.5;w=(1.5*f+w)/2.5;B=(1.5*k+m)/2.5;w!==d&&(c=(B-g)*(w-f)/(w-d)+k-B);g+=c;B+=c;g>a&&g>k?(g=Math.max(a,k),B=2*k-g):g<a&&g<k&&(g=Math.min(a,k),B=2*k-g);B>m&&B>k?(B=Math.max(m,k),g=2*k-B):B<m&&B<k&&(B=Math.min(m,k),g=2*k-B);h.rightContX=w;h.rightContY=B}h=["C",F(q.rightContX,q.plotX),F(q.rightContY,q.plotY),F(d,f),F(g,k),f,k];q.rightContX=q.rightContY=null;return h}})})(M);(function(a){var D=a.seriesTypes.area.prototype,z=a.seriesType;z("areaspline",
"spline",a.defaultPlotOptions.area,{getStackPoints:D.getStackPoints,getGraphPath:D.getGraphPath,setStackCliffs:D.setStackCliffs,drawGraph:D.drawGraph,drawLegendSymbol:a.LegendSymbolMixin.drawRectangle})})(M);(function(a){var D=a.animObject,z=a.color,F=a.each,J=a.extend,m=a.isNumber,f=a.merge,h=a.pick,q=a.Series,n=a.seriesType,k=a.stop,v=a.svg;n("column","line",{borderRadius:0,groupPadding:.2,marker:null,pointPadding:.1,minPointLength:0,cropThreshold:50,pointRange:null,states:{hover:{halo:!1,brightness:.1,
shadow:!1},select:{color:"#cccccc",borderColor:"#000000",shadow:!1}},dataLabels:{align:null,verticalAlign:null,y:null},softThreshold:!1,startFromThreshold:!0,stickyTracking:!1,tooltip:{distance:6},threshold:0,borderColor:"#ffffff"},{cropShoulder:0,directTouch:!0,trackerGroups:["group","dataLabelsGroup"],negStacks:!0,init:function(){q.prototype.init.apply(this,arguments);var a=this,f=a.chart;f.hasRendered&&F(f.series,function(d){d.type===a.type&&(d.isDirty=!0)})},getColumnMetrics:function(){var a=
this,f=a.options,k=a.xAxis,m=a.yAxis,c=k.reversed,e,l={},n=0;!1===f.grouping?n=1:F(a.chart.series,function(b){var c=b.options,d=b.yAxis,f;b.type===a.type&&b.visible&&m.len===d.len&&m.pos===d.pos&&(c.stacking?(e=b.stackKey,void 0===l[e]&&(l[e]=n++),f=l[e]):!1!==c.grouping&&(f=n++),b.columnIndex=f)});var q=Math.min(Math.abs(k.transA)*(k.ordinalSlope||f.pointRange||k.closestPointRange||k.tickInterval||1),k.len),b=q*f.groupPadding,t=(q-2*b)/n,f=Math.min(f.maxPointWidth||k.len,h(f.pointWidth,t*(1-2*f.pointPadding)));
a.columnMetrics={width:f,offset:(t-f)/2+(b+((a.columnIndex||0)+(c?1:0))*t-q/2)*(c?-1:1)};return a.columnMetrics},crispCol:function(a,f,h,k){var c=this.chart,d=this.borderWidth,g=-(d%2?.5:0),d=d%2?.5:1;c.inverted&&c.renderer.isVML&&(d+=1);h=Math.round(a+h)+g;a=Math.round(a)+g;k=Math.round(f+k)+d;g=.5>=Math.abs(f)&&.5<k;f=Math.round(f)+d;k-=f;g&&k&&(--f,k+=1);return{x:a,y:f,width:h-a,height:k}},translate:function(){var a=this,f=a.chart,k=a.options,m=a.dense=2>a.closestPointRange*a.xAxis.transA,m=a.borderWidth=
h(k.borderWidth,m?0:1),c=a.yAxis,e=a.translatedThreshold=c.getThreshold(k.threshold),l=h(k.minPointLength,5),n=a.getColumnMetrics(),v=n.width,b=a.barW=Math.max(v,1+2*m),t=a.pointXOffset=n.offset;f.inverted&&(e-=.5);k.pointPadding&&(b=Math.ceil(b));q.prototype.translate.apply(a);F(a.points,function(d){var g=h(d.yBottom,e),k=999+Math.abs(g),k=Math.min(Math.max(-k,d.plotY),c.len+k),m=d.plotX+t,n=b,u=Math.min(k,g),q,y=Math.max(k,g)-u;Math.abs(y)<l&&l&&(y=l,q=!c.reversed&&!d.negative||c.reversed&&d.negative,
u=Math.abs(u-e)>l?g-l:e-(q?l:0));d.barX=m;d.pointWidth=v;d.tooltipPos=f.inverted?[c.len+c.pos-f.plotLeft-k,a.xAxis.len-m-n/2,y]:[m+n/2,k+c.pos-f.plotTop,y];d.shapeType="rect";d.shapeArgs=a.crispCol.apply(a,d.isNull?[d.plotX,c.len/2,0,0]:[m,u,n,y])})},getSymbol:a.noop,drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,drawGraph:function(){this.group[this.dense?"addClass":"removeClass"]("highcharts-dense-data")},pointAttribs:function(a,f){var d=this.options,g=this.pointAttrToOptions||{},c=g.stroke||
"borderColor",e=g["stroke-width"]||"borderWidth",h=a&&a.color||this.color,k=a[c]||d[c]||this.color||h,g=d.dashStyle,m;a&&this.zones.length&&(h=(h=a.getZone())&&h.color||a.options.color||this.color);f&&(f=d.states[f],m=f.brightness,h=f.color||void 0!==m&&z(h).brighten(f.brightness).get()||h,k=f[c]||k,g=f.dashStyle||g);a={fill:h,stroke:k,"stroke-width":a[e]||d[e]||this[e]||0};d.borderRadius&&(a.r=d.borderRadius);g&&(a.dashstyle=g);return a},drawPoints:function(){var a=this,g=this.chart,h=a.options,
n=g.renderer,c=h.animationLimit||250,e;F(a.points,function(d){var l=d.graphic;m(d.plotY)&&null!==d.y?(e=d.shapeArgs,l?(k(l),l[g.pointCount<c?"animate":"attr"](f(e))):d.graphic=l=n[d.shapeType](e).attr({"class":d.getClassName()}).add(d.group||a.group),l.attr(a.pointAttribs(d,d.selected&&"select")).shadow(h.shadow,null,h.stacking&&!h.borderRadius)):l&&(d.graphic=l.destroy())})},animate:function(a){var d=this,f=this.yAxis,h=d.options,c=this.chart.inverted,e={};v&&(a?(e.scaleY=.001,a=Math.min(f.pos+f.len,
Math.max(f.pos,f.toPixels(h.threshold))),c?e.translateX=a-f.len:e.translateY=a,d.group.attr(e)):(e[c?"translateX":"translateY"]=f.pos,d.group.animate(e,J(D(d.options.animation),{step:function(a,c){d.group.attr({scaleY:Math.max(.001,c.pos)})}})),d.animate=null))},remove:function(){var a=this,f=a.chart;f.hasRendered&&F(f.series,function(d){d.type===a.type&&(d.isDirty=!0)});q.prototype.remove.apply(a,arguments)}})})(M);(function(a){a=a.seriesType;a("bar","column",null,{inverted:!0})})(M);(function(a){var D=
a.Series;a=a.seriesType;a("scatter","line",{lineWidth:0,marker:{enabled:!0},tooltip:{headerFormat:'\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e \x3cspan style\x3d"font-size: 0.85em"\x3e {series.name}\x3c/span\x3e\x3cbr/\x3e',pointFormat:"x: \x3cb\x3e{point.x}\x3c/b\x3e\x3cbr/\x3ey: \x3cb\x3e{point.y}\x3c/b\x3e\x3cbr/\x3e"}},{sorted:!1,requireSorting:!1,noSharedTooltip:!0,trackerGroups:["group","markerGroup","dataLabelsGroup"],takeOrdinalPosition:!1,kdDimensions:2,drawGraph:function(){this.options.lineWidth&&
D.prototype.drawGraph.call(this)}})})(M);(function(a){var D=a.pick,z=a.relativeLength;a.CenteredSeriesMixin={getCenter:function(){var a=this.options,J=this.chart,m=2*(a.slicedOffset||0),f=J.plotWidth-2*m,J=J.plotHeight-2*m,h=a.center,h=[D(h[0],"50%"),D(h[1],"50%"),a.size||"100%",a.innerSize||0],q=Math.min(f,J),n,k;for(n=0;4>n;++n)k=h[n],a=2>n||2===n&&/%$/.test(k),h[n]=z(k,[f,J,q,h[2]][n])+(a?m:0);h[3]>h[2]&&(h[3]=h[2]);return h}}})(M);(function(a){var D=a.addEvent,z=a.defined,F=a.each,J=a.extend,
m=a.inArray,f=a.noop,h=a.pick,q=a.Point,n=a.Series,k=a.seriesType,v=a.setAnimation;k("pie","line",{center:[null,null],clip:!1,colorByPoint:!0,dataLabels:{distance:30,enabled:!0,formatter:function(){return null===this.y?void 0:this.point.name},x:0},ignoreHiddenPoint:!0,legendType:"point",marker:null,size:null,showInLegend:!1,slicedOffset:10,stickyTracking:!1,tooltip:{followPointer:!0},borderColor:"#ffffff",borderWidth:1,states:{hover:{brightness:.1,shadow:!1}}},{isCartesian:!1,requireSorting:!1,directTouch:!0,
noSharedTooltip:!0,trackerGroups:["group","dataLabelsGroup"],axisTypes:[],pointAttribs:a.seriesTypes.column.prototype.pointAttribs,animate:function(a){var d=this,f=d.points,h=d.startAngleRad;a||(F(f,function(a){var c=a.graphic,f=a.shapeArgs;c&&(c.attr({r:a.startR||d.center[3]/2,start:h,end:h}),c.animate({r:f.r,start:f.start,end:f.end},d.options.animation))}),d.animate=null)},updateTotals:function(){var a,f=0,h=this.points,k=h.length,c,e=this.options.ignoreHiddenPoint;for(a=0;a<k;a++)c=h[a],0>c.y&&
(c.y=null),f+=e&&!c.visible?0:c.y;this.total=f;for(a=0;a<k;a++)c=h[a],c.percentage=0<f&&(c.visible||!e)?c.y/f*100:0,c.total=f},generatePoints:function(){n.prototype.generatePoints.call(this);this.updateTotals()},translate:function(a){this.generatePoints();var d=0,f=this.options,k=f.slicedOffset,c=k+(f.borderWidth||0),e,l,m,n=f.startAngle||0,b=this.startAngleRad=Math.PI/180*(n-90),n=(this.endAngleRad=Math.PI/180*(h(f.endAngle,n+360)-90))-b,t=this.points,q=f.dataLabels.distance,f=f.ignoreHiddenPoint,
v,x=t.length,I;a||(this.center=a=this.getCenter());this.getX=function(b,c){m=Math.asin(Math.min((b-a[1])/(a[2]/2+q),1));return a[0]+(c?-1:1)*Math.cos(m)*(a[2]/2+q)};for(v=0;v<x;v++){I=t[v];e=b+d*n;if(!f||I.visible)d+=I.percentage/100;l=b+d*n;I.shapeType="arc";I.shapeArgs={x:a[0],y:a[1],r:a[2]/2,innerR:a[3]/2,start:Math.round(1E3*e)/1E3,end:Math.round(1E3*l)/1E3};m=(l+e)/2;m>1.5*Math.PI?m-=2*Math.PI:m<-Math.PI/2&&(m+=2*Math.PI);I.slicedTranslation={translateX:Math.round(Math.cos(m)*k),translateY:Math.round(Math.sin(m)*
k)};e=Math.cos(m)*a[2]/2;l=Math.sin(m)*a[2]/2;I.tooltipPos=[a[0]+.7*e,a[1]+.7*l];I.half=m<-Math.PI/2||m>Math.PI/2?1:0;I.angle=m;c=Math.min(c,q/5);I.labelPos=[a[0]+e+Math.cos(m)*q,a[1]+l+Math.sin(m)*q,a[0]+e+Math.cos(m)*c,a[1]+l+Math.sin(m)*c,a[0]+e,a[1]+l,0>q?"center":I.half?"right":"left",m]}},drawGraph:null,drawPoints:function(){var a=this,f=a.chart.renderer,h,k,c,e,l=a.options.shadow;l&&!a.shadowGroup&&(a.shadowGroup=f.g("shadow").add(a.group));F(a.points,function(d){if(null!==d.y){k=d.graphic;
e=d.shapeArgs;h=d.sliced?d.slicedTranslation:{};var g=d.shadowGroup;l&&!g&&(g=d.shadowGroup=f.g("shadow").add(a.shadowGroup));g&&g.attr(h);c=a.pointAttribs(d,d.selected&&"select");k?k.setRadialReference(a.center).attr(c).animate(J(e,h)):(d.graphic=k=f[d.shapeType](e).addClass(d.getClassName()).setRadialReference(a.center).attr(h).add(a.group),d.visible||k.attr({visibility:"hidden"}),k.attr(c).attr({"stroke-linejoin":"round"}).shadow(l,g))}})},searchPoint:f,sortByAngle:function(a,f){a.sort(function(a,
d){return void 0!==a.angle&&(d.angle-a.angle)*f})},drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,getCenter:a.CenteredSeriesMixin.getCenter,getSymbol:f},{init:function(){q.prototype.init.apply(this,arguments);var a=this,f;a.name=h(a.name,"Slice");f=function(d){a.slice("select"===d.type)};D(a,"select",f);D(a,"unselect",f);return a},setVisible:function(a,f){var d=this,g=d.series,c=g.chart,e=g.options.ignoreHiddenPoint;f=h(f,e);a!==d.visible&&(d.visible=d.options.visible=a=void 0===a?!d.visible:
a,g.options.data[m(d,g.data)]=d.options,F(["graphic","dataLabel","connector","shadowGroup"],function(c){if(d[c])d[c][a?"show":"hide"](!0)}),d.legendItem&&c.legend.colorizeItem(d,a),a||"hover"!==d.state||d.setState(""),e&&(g.isDirty=!0),f&&c.redraw())},slice:function(a,f,k){var d=this.series;v(k,d.chart);h(f,!0);this.sliced=this.options.sliced=a=z(a)?a:!this.sliced;d.options.data[m(this,d.data)]=this.options;a=a?this.slicedTranslation:{translateX:0,translateY:0};this.graphic.animate(a);this.shadowGroup&&
this.shadowGroup.animate(a)},haloPath:function(a){var d=this.shapeArgs;return this.sliced||!this.visible?[]:this.series.chart.renderer.symbols.arc(d.x,d.y,d.r+a,d.r+a,{innerR:this.shapeArgs.r,start:d.start,end:d.end})}})})(M);(function(a){var D=a.addEvent,z=a.arrayMax,F=a.defined,J=a.each,m=a.extend,f=a.format,h=a.map,q=a.merge,n=a.noop,k=a.pick,v=a.relativeLength,d=a.Series,g=a.seriesTypes,w=a.stableSort,B=a.stop;a.distribute=function(a,d){function c(a,b){return a.target-b.target}var e,f=!0,b=a,
g=[],k;k=0;for(e=a.length;e--;)k+=a[e].size;if(k>d){w(a,function(a,b){return(b.rank||0)-(a.rank||0)});for(k=e=0;k<=d;)k+=a[e].size,e++;g=a.splice(e-1,a.length)}w(a,c);for(a=h(a,function(a){return{size:a.size,targets:[a.target]}});f;){for(e=a.length;e--;)f=a[e],k=(Math.min.apply(0,f.targets)+Math.max.apply(0,f.targets))/2,f.pos=Math.min(Math.max(0,k-f.size/2),d-f.size);e=a.length;for(f=!1;e--;)0<e&&a[e-1].pos+a[e-1].size>a[e].pos&&(a[e-1].size+=a[e].size,a[e-1].targets=a[e-1].targets.concat(a[e].targets),
a[e-1].pos+a[e-1].size>d&&(a[e-1].pos=d-a[e-1].size),a.splice(e,1),f=!0)}e=0;J(a,function(a){var c=0;J(a.targets,function(){b[e].pos=a.pos+c;c+=b[e].size;e++})});b.push.apply(b,g);w(b,c)};d.prototype.drawDataLabels=function(){var a=this,d=a.options,g=d.dataLabels,h=a.points,n,b,t=a.hasRendered||0,y,v,x=k(g.defer,!0),w=a.chart.renderer;if(g.enabled||a._hasPointLabels)a.dlProcessOptions&&a.dlProcessOptions(g),v=a.plotGroup("dataLabelsGroup","data-labels",x&&!t?"hidden":"visible",g.zIndex||6),x&&(v.attr({opacity:+t}),
t||D(a,"afterAnimate",function(){a.visible&&v.show(!0);v[d.animation?"animate":"attr"]({opacity:1},{duration:200})})),b=g,J(h,function(c){var e,h=c.dataLabel,l,t,r=c.connector,u=!0,x,I={};n=c.dlOptions||c.options&&c.options.dataLabels;e=k(n&&n.enabled,b.enabled)&&null!==c.y;if(h&&!e)c.dataLabel=h.destroy();else if(e){g=q(b,n);x=g.style;e=g.rotation;l=c.getLabelConfig();y=g.format?f(g.format,l):g.formatter.call(l,g);x.color=k(g.color,x.color,a.color,"#000000");if(h)F(y)?(h.attr({text:y}),u=!1):(c.dataLabel=
h=h.destroy(),r&&(c.connector=r.destroy()));else if(F(y)){h={fill:g.backgroundColor,stroke:g.borderColor,"stroke-width":g.borderWidth,r:g.borderRadius||0,rotation:e,padding:g.padding,zIndex:1};"contrast"===x.color&&(I.color=g.inside||0>g.distance||d.stacking?w.getContrast(c.color||a.color):"#000000");d.cursor&&(I.cursor=d.cursor);for(t in h)void 0===h[t]&&delete h[t];h=c.dataLabel=w[e?"text":"label"](y,0,-9999,g.shape,null,null,g.useHTML,null,"data-label").attr(h);h.addClass("highcharts-data-label-color-"+
c.colorIndex+" "+(g.className||""));h.css(m(x,I));h.add(v);h.shadow(g.shadow)}h&&a.alignDataLabel(c,h,g,null,u)}})};d.prototype.alignDataLabel=function(a,d,f,g,h){var b=this.chart,c=b.inverted,e=k(a.plotX,-9999),l=k(a.plotY,-9999),n=d.getBBox(),q,r=f.rotation,u=f.align,v=this.visible&&(a.series.forceDL||b.isInsidePlot(e,Math.round(l),c)||g&&b.isInsidePlot(e,c?g.x+1:g.y+g.height-1,c)),w="justify"===k(f.overflow,"justify");v&&(q=f.style.fontSize,q=b.renderer.fontMetrics(q,d).b,g=m({x:c?b.plotWidth-
l:e,y:Math.round(c?b.plotHeight-e:l),width:0,height:0},g),m(f,{width:n.width,height:n.height}),r?(w=!1,c=b.renderer.rotCorr(q,r),c={x:g.x+f.x+g.width/2+c.x,y:g.y+f.y+{top:0,middle:.5,bottom:1}[f.verticalAlign]*g.height},d[h?"attr":"animate"](c).attr({align:u}),e=(r+720)%360,e=180<e&&360>e,"left"===u?c.y-=e?n.height:0:"center"===u?(c.x-=n.width/2,c.y-=n.height/2):"right"===u&&(c.x-=n.width,c.y-=e?0:n.height)):(d.align(f,null,g),c=d.alignAttr),w?this.justifyDataLabel(d,f,c,n,g,h):k(f.crop,!0)&&(v=b.isInsidePlot(c.x,
c.y)&&b.isInsidePlot(c.x+n.width,c.y+n.height)),f.shape&&!r&&d.attr({anchorX:a.plotX,anchorY:a.plotY}));v||(B(d),d.attr({y:-9999}),d.placed=!1)};d.prototype.justifyDataLabel=function(a,d,f,g,h,b){var c=this.chart,e=d.align,k=d.verticalAlign,l,m,n=a.box?0:a.padding||0;l=f.x+n;0>l&&("right"===e?d.align="left":d.x=-l,m=!0);l=f.x+g.width-n;l>c.plotWidth&&("left"===e?d.align="right":d.x=c.plotWidth-l,m=!0);l=f.y+n;0>l&&("bottom"===k?d.verticalAlign="top":d.y=-l,m=!0);l=f.y+g.height-n;l>c.plotHeight&&("top"===
k?d.verticalAlign="bottom":d.y=c.plotHeight-l,m=!0);m&&(a.placed=!b,a.align(d,null,h))};g.pie&&(g.pie.prototype.drawDataLabels=function(){var c=this,e=c.data,f,g=c.chart,m=c.options.dataLabels,b=k(m.connectorPadding,10),n=k(m.connectorWidth,1),q=g.plotWidth,v=g.plotHeight,x,w=m.distance,r=c.center,B=r[2]/2,H=r[1],D=0<w,p,A,F,O,C=[[],[]],E,M,Q,R,T=[0,0,0,0];c.visible&&(m.enabled||c._hasPointLabels)&&(d.prototype.drawDataLabels.apply(c),J(e,function(a){a.dataLabel&&a.visible&&(C[a.half].push(a),a.dataLabel._pos=
null)}),J(C,function(d,e){var k,l,n=d.length,t,u,x;if(n)for(c.sortByAngle(d,e-.5),0<w&&(k=Math.max(0,H-B-w),l=Math.min(H+B+w,g.plotHeight),t=h(d,function(a){if(a.dataLabel)return x=a.dataLabel.getBBox().height||21,{target:a.labelPos[1]-k+x/2,size:x,rank:a.y}}),a.distribute(t,l+x-k)),R=0;R<n;R++)f=d[R],F=f.labelPos,p=f.dataLabel,Q=!1===f.visible?"hidden":"inherit",u=F[1],t?void 0===t[R].pos?Q="hidden":(O=t[R].size,M=k+t[R].pos):M=u,E=m.justify?r[0]+(e?-1:1)*(B+w):c.getX(M<k+2||M>l-2?u:M,e),p._attr=
{visibility:Q,align:F[6]},p._pos={x:E+m.x+({left:b,right:-b}[F[6]]||0),y:M+m.y-10},F.x=E,F.y=M,null===c.options.size&&(A=p.width,E-A<b?T[3]=Math.max(Math.round(A-E+b),T[3]):E+A>q-b&&(T[1]=Math.max(Math.round(E+A-q+b),T[1])),0>M-O/2?T[0]=Math.max(Math.round(-M+O/2),T[0]):M+O/2>v&&(T[2]=Math.max(Math.round(M+O/2-v),T[2])))}),0===z(T)||this.verifyDataLabelOverflow(T))&&(this.placeDataLabels(),D&&n&&J(this.points,function(a){var b;x=a.connector;if((p=a.dataLabel)&&p._pos&&a.visible){Q=p._attr.visibility;
if(b=!x)a.connector=x=g.renderer.path().addClass("highcharts-data-label-connector highcharts-color-"+a.colorIndex).add(c.dataLabelsGroup),x.attr({"stroke-width":n,stroke:m.connectorColor||a.color||"#666666"});x[b?"attr":"animate"]({d:c.connectorPath(a.labelPos)});x.attr("visibility",Q)}else x&&(a.connector=x.destroy())}))},g.pie.prototype.connectorPath=function(a){var c=a.x,d=a.y;return k(this.options.softConnector,!0)?["M",c+("left"===a[6]?5:-5),d,"C",c,d,2*a[2]-a[4],2*a[3]-a[5],a[2],a[3],"L",a[4],
a[5]]:["M",c+("left"===a[6]?5:-5),d,"L",a[2],a[3],"L",a[4],a[5]]},g.pie.prototype.placeDataLabels=function(){J(this.points,function(a){var c=a.dataLabel;c&&a.visible&&((a=c._pos)?(c.attr(c._attr),c[c.moved?"animate":"attr"](a),c.moved=!0):c&&c.attr({y:-9999}))})},g.pie.prototype.alignDataLabel=n,g.pie.prototype.verifyDataLabelOverflow=function(a){var c=this.center,d=this.options,f=d.center,g=d.minSize||80,b,h;null!==f[0]?b=Math.max(c[2]-Math.max(a[1],a[3]),g):(b=Math.max(c[2]-a[1]-a[3],g),c[0]+=(a[3]-
a[1])/2);null!==f[1]?b=Math.max(Math.min(b,c[2]-Math.max(a[0],a[2])),g):(b=Math.max(Math.min(b,c[2]-a[0]-a[2]),g),c[1]+=(a[0]-a[2])/2);b<c[2]?(c[2]=b,c[3]=Math.min(v(d.innerSize||0,b),b),this.translate(c),this.drawDataLabels&&this.drawDataLabels()):h=!0;return h});g.column&&(g.column.prototype.alignDataLabel=function(a,e,f,g,h){var b=this.chart.inverted,c=a.series,l=a.dlBox||a.shapeArgs,m=k(a.below,a.plotY>k(this.translatedThreshold,c.yAxis.len)),n=k(f.inside,!!this.options.stacking);l&&(g=q(l),0>
g.y&&(g.height+=g.y,g.y=0),l=g.y+g.height-c.yAxis.len,0<l&&(g.height-=l),b&&(g={x:c.yAxis.len-g.y-g.height,y:c.xAxis.len-g.x-g.width,width:g.height,height:g.width}),n||(b?(g.x+=m?0:g.width,g.width=0):(g.y+=m?g.height:0,g.height=0)));f.align=k(f.align,!b||n?"center":m?"right":"left");f.verticalAlign=k(f.verticalAlign,b||n?"middle":m?"top":"bottom");d.prototype.alignDataLabel.call(this,a,e,f,g,h)})})(M);(function(a){var D=a.Chart,z=a.each,F=a.pick,J=a.addEvent;D.prototype.callbacks.push(function(a){function f(){var f=
[];z(a.series,function(a){var h=a.options.dataLabels,k=a.dataLabelCollections||["dataLabel"];(h.enabled||a._hasPointLabels)&&!h.allowOverlap&&a.visible&&z(k,function(h){z(a.points,function(a){a[h]&&(a[h].labelrank=F(a.labelrank,a.shapeArgs&&a.shapeArgs.height),f.push(a[h]))})})});a.hideOverlappingLabels(f)}f();J(a,"redraw",f)});D.prototype.hideOverlappingLabels=function(a){var f=a.length,h,m,n,k,v,d,g,w,B,c=function(a,c,d,f,b,g,h,k){return!(b>a+d||b+h<a||g>c+f||g+k<c)};for(m=0;m<f;m++)if(h=a[m])h.oldOpacity=
h.opacity,h.newOpacity=1;a.sort(function(a,c){return(c.labelrank||0)-(a.labelrank||0)});for(m=0;m<f;m++)for(n=a[m],h=m+1;h<f;++h)if(k=a[h],n&&k&&n.placed&&k.placed&&0!==n.newOpacity&&0!==k.newOpacity&&(v=n.alignAttr,d=k.alignAttr,g=n.parentGroup,w=k.parentGroup,B=2*(n.box?0:n.padding),v=c(v.x+g.translateX,v.y+g.translateY,n.width-B,n.height-B,d.x+w.translateX,d.y+w.translateY,k.width-B,k.height-B)))(n.labelrank<k.labelrank?n:k).newOpacity=0;z(a,function(a){var c,d;a&&(d=a.newOpacity,a.oldOpacity!==
d&&a.placed&&(d?a.show(!0):c=function(){a.hide()},a.alignAttr.opacity=d,a[a.isOld?"animate":"attr"](a.alignAttr,null,c)),a.isOld=!0)})}})(M);(function(a){var D=a.addEvent,z=a.Chart,F=a.createElement,J=a.css,m=a.defaultOptions,f=a.defaultPlotOptions,h=a.each,q=a.extend,n=a.fireEvent,k=a.hasTouch,v=a.inArray,d=a.isObject,g=a.Legend,w=a.merge,B=a.pick,c=a.Point,e=a.Series,l=a.seriesTypes,u=a.svg,L;L=a.TrackerMixin={drawTrackerPoint:function(){var a=this,c=a.chart,d=c.pointer,e=function(a){for(var b=
a.target,d;b&&!d;)d=b.point,b=b.parentNode;if(void 0!==d&&d!==c.hoverPoint)d.onMouseOver(a)};h(a.points,function(a){a.graphic&&(a.graphic.element.point=a);a.dataLabel&&(a.dataLabel.element.point=a)});a._hasTracking||(h(a.trackerGroups,function(b){if(a[b]){a[b].addClass("highcharts-tracker").on("mouseover",e).on("mouseout",function(a){d.onTrackerMouseOut(a)});if(k)a[b].on("touchstart",e);a.options.cursor&&a[b].css(J).css({cursor:a.options.cursor})}}),a._hasTracking=!0)},drawTrackerGraph:function(){var a=
this,c=a.options,d=c.trackByArea,e=[].concat(d?a.areaPath:a.graphPath),f=e.length,g=a.chart,l=g.pointer,m=g.renderer,n=g.options.tooltip.snap,q=a.tracker,p,v=function(){if(g.hoverSeries!==a)a.onMouseOver()},w="rgba(192,192,192,"+(u?.0001:.002)+")";if(f&&!d)for(p=f+1;p--;)"M"===e[p]&&e.splice(p+1,0,e[p+1]-n,e[p+2],"L"),(p&&"M"===e[p]||p===f)&&e.splice(p,0,"L",e[p-2]+n,e[p-1]);q?q.attr({d:e}):a.graph&&(a.tracker=m.path(e).attr({"stroke-linejoin":"round",visibility:a.visible?"visible":"hidden",stroke:w,
fill:d?w:"none","stroke-width":a.graph.strokeWidth()+(d?0:2*n),zIndex:2}).add(a.group),h([a.tracker,a.markerGroup],function(a){a.addClass("highcharts-tracker").on("mouseover",v).on("mouseout",function(a){l.onTrackerMouseOut(a)});c.cursor&&a.css({cursor:c.cursor});if(k)a.on("touchstart",v)}))}};l.column&&(l.column.prototype.drawTracker=L.drawTrackerPoint);l.pie&&(l.pie.prototype.drawTracker=L.drawTrackerPoint);l.scatter&&(l.scatter.prototype.drawTracker=L.drawTrackerPoint);q(g.prototype,{setItemEvents:function(a,
c,d){var b=this,e=b.chart,f="highcharts-legend-"+(a.series?"point":"series")+"-active";(d?c:a.legendGroup).on("mouseover",function(){a.setState("hover");e.seriesGroup.addClass(f);c.css(b.options.itemHoverStyle)}).on("mouseout",function(){c.css(a.visible?b.itemStyle:b.itemHiddenStyle);e.seriesGroup.removeClass(f);a.setState()}).on("click",function(b){var c=function(){a.setVisible&&a.setVisible()};b={browserEvent:b};a.firePointEvent?a.firePointEvent("legendItemClick",b,c):n(a,"legendItemClick",b,c)})},
createCheckboxForItem:function(a){a.checkbox=F("input",{type:"checkbox",checked:a.selected,defaultChecked:a.selected},this.options.itemCheckboxStyle,this.chart.container);D(a.checkbox,"click",function(b){n(a.series||a,"checkboxClick",{checked:b.target.checked,item:a},function(){a.select()})})}});m.legend.itemStyle.cursor="pointer";q(z.prototype,{showResetZoom:function(){var a=this,c=m.lang,d=a.options.chart.resetZoomButton,e=d.theme,f=e.states,g="chart"===d.relativeTo?null:"plotBox";this.resetZoomButton=
a.renderer.button(c.resetZoom,null,null,function(){a.zoomOut()},e,f&&f.hover).attr({align:d.position.align,title:c.resetZoomTitle}).addClass("highcharts-reset-zoom").add().align(d.position,!1,g)},zoomOut:function(){var a=this;n(a,"selection",{resetSelection:!0},function(){a.zoom()})},zoom:function(a){var b,c=this.pointer,e=!1,f;!a||a.resetSelection?h(this.axes,function(a){b=a.zoom()}):h(a.xAxis.concat(a.yAxis),function(a){var d=a.axis,f=d.isXAxis;if(c[f?"zoomX":"zoomY"]||c[f?"pinchX":"pinchY"])b=
d.zoom(a.min,a.max),d.displayBtn&&(e=!0)});f=this.resetZoomButton;e&&!f?this.showResetZoom():!e&&d(f)&&(this.resetZoomButton=f.destroy());b&&this.redraw(B(this.options.chart.animation,a&&a.animation,100>this.pointCount))},pan:function(a,c){var b=this,d=b.hoverPoints,e;d&&h(d,function(a){a.setState()});h("xy"===c?[1,0]:[1],function(c){c=b[c?"xAxis":"yAxis"][0];var d=c.horiz,f=a[d?"chartX":"chartY"],d=d?"mouseDownX":"mouseDownY",g=b[d],h=(c.pointRange||0)/2,k=c.getExtremes(),l=c.toValue(g-f,!0)+h,h=
c.toValue(g+c.len-f,!0)-h,g=g>f;c.series.length&&(g||l>Math.min(k.dataMin,k.min))&&(!g||h<Math.max(k.dataMax,k.max))&&(c.setExtremes(l,h,!1,!1,{trigger:"pan"}),e=!0);b[d]=f});e&&b.redraw(!1);J(b.container,{cursor:"move"})}});q(c.prototype,{select:function(a,c){var b=this,d=b.series,e=d.chart;a=B(a,!b.selected);b.firePointEvent(a?"select":"unselect",{accumulate:c},function(){b.selected=b.options.selected=a;d.options.data[v(b,d.data)]=b.options;b.setState(a&&"select");c||h(e.getSelectedPoints(),function(a){a.selected&&
a!==b&&(a.selected=a.options.selected=!1,d.options.data[v(a,d.data)]=a.options,a.setState(""),a.firePointEvent("unselect"))})})},onMouseOver:function(a,c){var b=this.series,d=b.chart,e=d.tooltip,f=d.hoverPoint;if(this.series){if(!c){if(f&&f!==this)f.onMouseOut();if(d.hoverSeries!==b)b.onMouseOver();d.hoverPoint=this}!e||e.shared&&!b.noSharedTooltip?e||this.setState("hover"):(this.setState("hover"),e.refresh(this,a));this.firePointEvent("mouseOver")}},onMouseOut:function(){var a=this.series.chart,
c=a.hoverPoints;this.firePointEvent("mouseOut");c&&-1!==v(this,c)||(this.setState(),a.hoverPoint=null)},importEvents:function(){if(!this.hasImportedEvents){var a=w(this.series.options.point,this.options).events,c;this.events=a;for(c in a)D(this,c,a[c]);this.hasImportedEvents=!0}},setState:function(b,c){var d=Math.floor(this.plotX),e=this.plotY,g=this.series,h=g.options.states[b]||{},k=f[g.type].marker&&g.options.marker,l=k&&!1===k.enabled,m=k&&k.states&&k.states[b]||{},n=!1===m.enabled,p=g.stateMarkerGraphic,
t=this.marker||{},u=g.chart,v=g.halo,w;b=b||"";if(!(b===this.state&&!c||this.selected&&"select"!==b||!1===h.enabled||b&&(n||l&&!1===m.enabled)||b&&t.states&&t.states[b]&&!1===t.states[b].enabled)){k&&g.markerAttribs&&(w=g.markerAttribs(this,b));if(this.graphic)this.state&&this.graphic.removeClass("highcharts-point-"+this.state),b&&this.graphic.addClass("highcharts-point-"+b),this.graphic.attr(g.pointAttribs(this,b)),w&&this.graphic.animate(w,B(u.options.chart.animation,m.animation,k.animation)),p&&
p.hide();else{if(b&&m){k=t.symbol||g.symbol;p&&p.currentSymbol!==k&&(p=p.destroy());if(p)p[c?"animate":"attr"]({x:w.x,y:w.y});else k&&(g.stateMarkerGraphic=p=u.renderer.symbol(k,w.x,w.y,w.width,w.height).add(g.markerGroup),p.currentSymbol=k);p&&p.attr(g.pointAttribs(this,b))}p&&(p[b&&u.isInsidePlot(d,e,u.inverted)?"show":"hide"](),p.element.point=this)}(d=h.halo)&&d.size?(v||(g.halo=v=u.renderer.path().add(g.markerGroup||g.group)),a.stop(v),v[c?"animate":"attr"]({d:this.haloPath(d.size)}),v.attr({"class":"highcharts-halo highcharts-color-"+
B(this.colorIndex,g.colorIndex)}),v.attr(q({fill:this.color||g.color,"fill-opacity":d.opacity,zIndex:-1},d.attributes))):v&&v.animate({d:this.haloPath(0)});this.state=b}},haloPath:function(a){return this.series.chart.renderer.symbols.circle(Math.floor(this.plotX)-a,this.plotY-a,2*a,2*a)}});q(e.prototype,{onMouseOver:function(){var a=this.chart,c=a.hoverSeries;if(c&&c!==this)c.onMouseOut();this.options.events.mouseOver&&n(this,"mouseOver");this.setState("hover");a.hoverSeries=this},onMouseOut:function(){var a=
this.options,c=this.chart,d=c.tooltip,e=c.hoverPoint;c.hoverSeries=null;if(e)e.onMouseOut();this&&a.events.mouseOut&&n(this,"mouseOut");!d||a.stickyTracking||d.shared&&!this.noSharedTooltip||d.hide();this.setState()},setState:function(a){var b=this,c=b.options,d=b.graph,e=c.states,f=c.lineWidth,c=0;a=a||"";if(b.state!==a&&(h([b.group,b.markerGroup],function(c){c&&(b.state&&c.removeClass("highcharts-series-"+b.state),a&&c.addClass("highcharts-series-"+a))}),b.state=a,!e[a]||!1!==e[a].enabled)&&(a&&
(f=e[a].lineWidth||f+(e[a].lineWidthPlus||0)),d&&!d.dashstyle))for(e={"stroke-width":f},d.attr(e);b["zone-graph-"+c];)b["zone-graph-"+c].attr(e),c+=1},setVisible:function(a,c){var b=this,d=b.chart,e=b.legendItem,f,g=d.options.chart.ignoreHiddenSeries,k=b.visible;f=(b.visible=a=b.options.visible=b.userOptions.visible=void 0===a?!k:a)?"show":"hide";h(["group","dataLabelsGroup","markerGroup","tracker","tt"],function(a){if(b[a])b[a][f]()});if(d.hoverSeries===b||(d.hoverPoint&&d.hoverPoint.series)===b)b.onMouseOut();
e&&d.legend.colorizeItem(b,a);b.isDirty=!0;b.options.stacking&&h(d.series,function(a){a.options.stacking&&a.visible&&(a.isDirty=!0)});h(b.linkedSeries,function(b){b.setVisible(a,!1)});g&&(d.isDirtyBox=!0);!1!==c&&d.redraw();n(b,f)},show:function(){this.setVisible(!0)},hide:function(){this.setVisible(!1)},select:function(a){this.selected=a=void 0===a?!this.selected:a;this.checkbox&&(this.checkbox.checked=a);n(this,a?"select":"unselect")},drawTracker:L.drawTrackerGraph})})(M);(function(a){var D=a.Chart,
z=a.each,F=a.inArray,J=a.isObject,m=a.pick,f=a.splat;D.prototype.setResponsive=function(a){var f=this.options.responsive;f&&f.rules&&z(f.rules,function(f){this.matchResponsiveRule(f,a)},this)};D.prototype.matchResponsiveRule=function(f,q){var h=this.respRules,k=f.condition,v;v=f.callback||function(){return this.chartWidth<=m(k.maxWidth,Number.MAX_VALUE)&&this.chartHeight<=m(k.maxHeight,Number.MAX_VALUE)&&this.chartWidth>=m(k.minWidth,0)&&this.chartHeight>=m(k.minHeight,0)};void 0===f._id&&(f._id=
a.idCounter++);v=v.call(this);!h[f._id]&&v?f.chartOptions&&(h[f._id]=this.currentOptions(f.chartOptions),this.update(f.chartOptions,q)):h[f._id]&&!v&&(this.update(h[f._id],q),delete h[f._id])};D.prototype.currentOptions=function(a){function h(a,m,d){var g,k;for(g in a)if(-1<F(g,["series","xAxis","yAxis"]))for(a[g]=f(a[g]),d[g]=[],k=0;k<a[g].length;k++)d[g][k]={},h(a[g][k],m[g][k],d[g][k]);else J(a[g])?(d[g]={},h(a[g],m[g]||{},d[g])):d[g]=m[g]||null}var m={};h(a,this.options,m);return m}})(M);return M});
/*
 Highcharts JS v5.0.2 (2016-10-26)

 (c) 2009-2016 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(x){"object"===typeof module&&module.exports?module.exports=x:x(Highcharts)})(function(x){(function(a){function t(a,b,d){this.init(a,b,d)}var u=a.each,w=a.extend,q=a.merge,r=a.splat;w(t.prototype,{init:function(a,b,d){var h=this,k=h.defaultOptions;h.chart=b;h.options=a=q(k,b.angular?{background:{}}:void 0,a);(a=a.background)&&u([].concat(r(a)).reverse(),function(b){var c,k=d.userOptions;c=q(h.defaultBackgroundOptions,b);b.backgroundColor&&(c.backgroundColor=b.backgroundColor);c.color=c.backgroundColor;
d.options.plotBands.unshift(c);k.plotBands=k.plotBands||[];k.plotBands!==d.options.plotBands&&k.plotBands.unshift(c)})},defaultOptions:{center:["50%","50%"],size:"85%",startAngle:0},defaultBackgroundOptions:{className:"highcharts-pane",shape:"circle",borderWidth:1,borderColor:"#cccccc",backgroundColor:{linearGradient:{x1:0,y1:0,x2:0,y2:1},stops:[[0,"#ffffff"],[1,"#e6e6e6"]]},from:-Number.MAX_VALUE,innerRadius:0,to:Number.MAX_VALUE,outerRadius:"105%"}});a.Pane=t})(x);(function(a){var t=a.CenteredSeriesMixin,
u=a.each,w=a.extend,q=a.map,r=a.merge,e=a.noop,b=a.Pane,d=a.pick,h=a.pInt,k=a.splat,n=a.wrap,c,g,l=a.Axis.prototype;a=a.Tick.prototype;c={getOffset:e,redraw:function(){this.isDirty=!1},render:function(){this.isDirty=!1},setScale:e,setCategories:e,setTitle:e};g={defaultRadialGaugeOptions:{labels:{align:"center",x:0,y:null},minorGridLineWidth:0,minorTickInterval:"auto",minorTickLength:10,minorTickPosition:"inside",minorTickWidth:1,tickLength:10,tickPosition:"inside",tickWidth:2,title:{rotation:0},zIndex:2},
defaultRadialXOptions:{gridLineWidth:1,labels:{align:null,distance:15,x:0,y:null},maxPadding:0,minPadding:0,showLastLabel:!1,tickLength:0},defaultRadialYOptions:{gridLineInterpolation:"circle",labels:{align:"right",x:-3,y:-2},showLastLabel:!1,title:{x:4,text:null,rotation:90}},setOptions:function(b){b=this.options=r(this.defaultOptions,this.defaultRadialOptions,b);b.plotBands||(b.plotBands=[])},getOffset:function(){l.getOffset.call(this);this.chart.axisOffset[this.side]=0;this.center=this.pane.center=
t.getCenter.call(this.pane)},getLinePath:function(b,f){b=this.center;var c=this.chart,h=d(f,b[2]/2-this.offset);this.isCircular||void 0!==f?f=this.chart.renderer.symbols.arc(this.left+b[0],this.top+b[1],h,h,{start:this.startAngleRad,end:this.endAngleRad,open:!0,innerR:0}):(f=this.postTranslate(this.angleRad,h),f=["M",b[0]+c.plotLeft,b[1]+c.plotTop,"L",f.x,f.y]);return f},setAxisTranslation:function(){l.setAxisTranslation.call(this);this.center&&(this.transA=this.isCircular?(this.endAngleRad-this.startAngleRad)/
(this.max-this.min||1):this.center[2]/2/(this.max-this.min||1),this.minPixelPadding=this.isXAxis?this.transA*this.minPointOffset:0)},beforeSetTickPositions:function(){if(this.autoConnect=this.isCircular&&void 0===d(this.userMax,this.options.max)&&this.endAngleRad-this.startAngleRad===2*Math.PI)this.max+=this.categories&&1||this.pointRange||this.closestPointRange||0},setAxisSize:function(){l.setAxisSize.call(this);this.isRadial&&(this.center=this.pane.center=t.getCenter.call(this.pane),this.isCircular&&
(this.sector=this.endAngleRad-this.startAngleRad),this.len=this.width=this.height=this.center[2]*d(this.sector,1)/2)},getPosition:function(b,f){return this.postTranslate(this.isCircular?this.translate(b):this.angleRad,d(this.isCircular?f:this.translate(b),this.center[2]/2)-this.offset)},postTranslate:function(b,f){var d=this.chart,c=this.center;b=this.startAngleRad+b;return{x:d.plotLeft+c[0]+Math.cos(b)*f,y:d.plotTop+c[1]+Math.sin(b)*f}},getPlotBandPath:function(b,f,c){var k=this.center,p=this.startAngleRad,
l=k[2]/2,m=[d(c.outerRadius,"100%"),c.innerRadius,d(c.thickness,10)],a=Math.min(this.offset,0),g=/%$/,n,e=this.isCircular;"polygon"===this.options.gridLineInterpolation?k=this.getPlotLinePath(b).concat(this.getPlotLinePath(f,!0)):(b=Math.max(b,this.min),f=Math.min(f,this.max),e||(m[0]=this.translate(b),m[1]=this.translate(f)),m=q(m,function(b){g.test(b)&&(b=h(b,10)*l/100);return b}),"circle"!==c.shape&&e?(b=p+this.translate(b),f=p+this.translate(f)):(b=-Math.PI/2,f=1.5*Math.PI,n=!0),m[0]-=a,m[2]-=
a,k=this.chart.renderer.symbols.arc(this.left+k[0],this.top+k[1],m[0],m[0],{start:Math.min(b,f),end:Math.max(b,f),innerR:d(m[1],m[0]-m[2]),open:n}));return k},getPlotLinePath:function(b,f){var d=this,c=d.center,h=d.chart,k=d.getPosition(b),a,l,p;d.isCircular?p=["M",c[0]+h.plotLeft,c[1]+h.plotTop,"L",k.x,k.y]:"circle"===d.options.gridLineInterpolation?(b=d.translate(b))&&(p=d.getLinePath(0,b)):(u(h.xAxis,function(b){b.pane===d.pane&&(a=b)}),p=[],b=d.translate(b),c=a.tickPositions,a.autoConnect&&(c=
c.concat([c[0]])),f&&(c=[].concat(c).reverse()),u(c,function(f,d){l=a.getPosition(f,b);p.push(d?"L":"M",l.x,l.y)}));return p},getTitlePosition:function(){var b=this.center,f=this.chart,d=this.options.title;return{x:f.plotLeft+b[0]+(d.x||0),y:f.plotTop+b[1]-{high:.5,middle:.25,low:0}[d.align]*b[2]+(d.y||0)}}};n(l,"init",function(h,f,a){var l=f.angular,p=f.polar,m=a.isX,n=l&&m,e,A=f.options,q=a.pane||0;if(l){if(w(this,n?c:g),e=!m)this.defaultRadialOptions=this.defaultRadialGaugeOptions}else p&&(w(this,
g),this.defaultRadialOptions=(e=m)?this.defaultRadialXOptions:r(this.defaultYAxisOptions,this.defaultRadialYOptions));l||p?(this.isRadial=!0,f.inverted=!1,A.chart.zoomType=null):this.isRadial=!1;h.call(this,f,a);n||!l&&!p||(h=this.options,f.panes||(f.panes=[]),this.pane=f=f.panes[q]=f.panes[q]||new b(k(A.pane)[q],f,this),f=f.options,this.angleRad=(h.angle||0)*Math.PI/180,this.startAngleRad=(f.startAngle-90)*Math.PI/180,this.endAngleRad=(d(f.endAngle,f.startAngle+360)-90)*Math.PI/180,this.offset=h.offset||
0,this.isCircular=e)});n(l,"autoLabelAlign",function(b){if(!this.isRadial)return b.apply(this,[].slice.call(arguments,1))});n(a,"getPosition",function(b,d,c,h,k){var f=this.axis;return f.getPosition?f.getPosition(c):b.call(this,d,c,h,k)});n(a,"getLabelPosition",function(b,f,c,h,k,a,l,g,n){var m=this.axis,p=a.y,e=20,y=a.align,v=(m.translate(this.pos)+m.startAngleRad+Math.PI/2)/Math.PI*180%360;m.isRadial?(b=m.getPosition(this.pos,m.center[2]/2+d(a.distance,-25)),"auto"===a.rotation?h.attr({rotation:v}):
null===p&&(p=m.chart.renderer.fontMetrics(h.styles.fontSize).b-h.getBBox().height/2),null===y&&(m.isCircular?(this.label.getBBox().width>m.len*m.tickInterval/(m.max-m.min)&&(e=0),y=v>e&&v<180-e?"left":v>180+e&&v<360-e?"right":"center"):y="center",h.attr({align:y})),b.x+=a.x,b.y+=p):b=b.call(this,f,c,h,k,a,l,g,n);return b});n(a,"getMarkPath",function(b,d,c,h,k,a,l){var f=this.axis;f.isRadial?(b=f.getPosition(this.pos,f.center[2]/2+h),d=["M",d,c,"L",b.x,b.y]):d=b.call(this,d,c,h,k,a,l);return d})})(x);
(function(a){var t=a.each,u=a.noop,w=a.pick,q=a.Series,r=a.seriesType,e=a.seriesTypes;r("arearange","area",{lineWidth:1,marker:null,threshold:null,tooltip:{pointFormat:'\x3cspan style\x3d"color:{series.color}"\x3e\u25cf\x3c/span\x3e {series.name}: \x3cb\x3e{point.low}\x3c/b\x3e - \x3cb\x3e{point.high}\x3c/b\x3e\x3cbr/\x3e'},trackByArea:!0,dataLabels:{align:null,verticalAlign:null,xLow:0,xHigh:0,yLow:0,yHigh:0},states:{hover:{halo:!1}}},{pointArrayMap:["low","high"],dataLabelCollections:["dataLabel",
"dataLabelUpper"],toYData:function(b){return[b.low,b.high]},pointValKey:"low",deferTranslatePolar:!0,highToXY:function(b){var d=this.chart,h=this.xAxis.postTranslate(b.rectPlotX,this.yAxis.len-b.plotHigh);b.plotHighX=h.x-d.plotLeft;b.plotHigh=h.y-d.plotTop},translate:function(){var b=this,d=b.yAxis,h=!!b.modifyValue;e.area.prototype.translate.apply(b);t(b.points,function(k){var a=k.low,c=k.high,g=k.plotY;null===c||null===a?k.isNull=!0:(k.plotLow=g,k.plotHigh=d.translate(h?b.modifyValue(c,k):c,0,1,
0,1),h&&(k.yBottom=k.plotHigh))});this.chart.polar&&t(this.points,function(d){b.highToXY(d)})},getGraphPath:function(b){var d=[],h=[],a,n=e.area.prototype.getGraphPath,c,g,l;l=this.options;var p=l.step;b=b||this.points;for(a=b.length;a--;)c=b[a],c.isNull||l.connectEnds||b[a+1]&&!b[a+1].isNull||h.push({plotX:c.plotX,plotY:c.plotY,doCurve:!1}),g={polarPlotY:c.polarPlotY,rectPlotX:c.rectPlotX,yBottom:c.yBottom,plotX:w(c.plotHighX,c.plotX),plotY:c.plotHigh,isNull:c.isNull},h.push(g),d.push(g),c.isNull||
l.connectEnds||b[a-1]&&!b[a-1].isNull||h.push({plotX:c.plotX,plotY:c.plotY,doCurve:!1});b=n.call(this,b);p&&(!0===p&&(p="left"),l.step={left:"right",center:"center",right:"left"}[p]);d=n.call(this,d);h=n.call(this,h);l.step=p;l=[].concat(b,d);this.chart.polar||"M"!==h[0]||(h[0]="L");this.graphPath=l;this.areaPath=this.areaPath.concat(b,h);l.isArea=!0;l.xMap=b.xMap;this.areaPath.xMap=b.xMap;return l},drawDataLabels:function(){var b=this.data,d=b.length,h,a=[],n=q.prototype,c=this.options.dataLabels,
g=c.align,l=c.verticalAlign,p=c.inside,f,m,e=this.chart.inverted;if(c.enabled||this._hasPointLabels){for(h=d;h--;)if(f=b[h])m=p?f.plotHigh<f.plotLow:f.plotHigh>f.plotLow,f.y=f.high,f._plotY=f.plotY,f.plotY=f.plotHigh,a[h]=f.dataLabel,f.dataLabel=f.dataLabelUpper,f.below=m,e?g||(c.align=m?"right":"left"):l||(c.verticalAlign=m?"top":"bottom"),c.x=c.xHigh,c.y=c.yHigh;n.drawDataLabels&&n.drawDataLabels.apply(this,arguments);for(h=d;h--;)if(f=b[h])m=p?f.plotHigh<f.plotLow:f.plotHigh>f.plotLow,f.dataLabelUpper=
f.dataLabel,f.dataLabel=a[h],f.y=f.low,f.plotY=f._plotY,f.below=!m,e?g||(c.align=m?"left":"right"):l||(c.verticalAlign=m?"bottom":"top"),c.x=c.xLow,c.y=c.yLow;n.drawDataLabels&&n.drawDataLabels.apply(this,arguments)}c.align=g;c.verticalAlign=l},alignDataLabel:function(){e.column.prototype.alignDataLabel.apply(this,arguments)},setStackedPoints:u,getSymbol:u,drawPoints:u})})(x);(function(a){var t=a.seriesType;t("areasplinerange","arearange",null,{getPointSpline:a.seriesTypes.spline.prototype.getPointSpline})})(x);
(function(a){var t=a.defaultPlotOptions,u=a.each,w=a.merge,q=a.noop,r=a.pick,e=a.seriesType,b=a.seriesTypes.column.prototype;e("columnrange","arearange",w(t.column,t.arearange,{lineWidth:1,pointRange:null}),{translate:function(){var d=this,h=d.yAxis,a=d.xAxis,n=a.startAngleRad,c,g=d.chart,l=d.xAxis.isRadial,p;b.translate.apply(d);u(d.points,function(b){var f=b.shapeArgs,k=d.options.minPointLength,e,v;b.plotHigh=p=h.translate(b.high,0,1,0,1);b.plotLow=b.plotY;v=p;e=r(b.rectPlotY,b.plotY)-p;Math.abs(e)<
k?(k-=e,e+=k,v-=k/2):0>e&&(e*=-1,v-=e);l?(c=b.barX+n,b.shapeType="path",b.shapeArgs={d:d.polarArc(v+e,v,c,c+b.pointWidth)}):(f.height=e,f.y=v,b.tooltipPos=g.inverted?[h.len+h.pos-g.plotLeft-v-e/2,a.len+a.pos-g.plotTop-f.x-f.width/2,e]:[a.left-g.plotLeft+f.x+f.width/2,h.pos-g.plotTop+v+e/2,e])})},directTouch:!0,trackerGroups:["group","dataLabelsGroup"],drawGraph:q,crispCol:b.crispCol,drawPoints:b.drawPoints,drawTracker:b.drawTracker,getColumnMetrics:b.getColumnMetrics,animate:function(){return b.animate.apply(this,
arguments)},polarArc:function(){return b.polarArc.apply(this,arguments)},pointAttribs:b.pointAttribs})})(x);(function(a){var t=a.each,u=a.isNumber,w=a.merge,q=a.pick,r=a.pInt,e=a.Series,b=a.seriesType,d=a.TrackerMixin;b("gauge","line",{dataLabels:{enabled:!0,defer:!1,y:15,borderRadius:3,crop:!1,verticalAlign:"top",zIndex:2,borderWidth:1,borderColor:"#cccccc"},dial:{},pivot:{},tooltip:{headerFormat:""},showInLegend:!1},{angular:!0,directTouch:!0,drawGraph:a.noop,fixedBox:!0,forceDL:!0,noSharedTooltip:!0,
trackerGroups:["group","dataLabelsGroup"],translate:function(){var b=this.yAxis,d=this.options,a=b.center;this.generatePoints();t(this.points,function(c){var h=w(d.dial,c.dial),l=r(q(h.radius,80))*a[2]/200,k=r(q(h.baseLength,70))*l/100,f=r(q(h.rearLength,10))*l/100,m=h.baseWidth||3,n=h.topWidth||1,e=d.overshoot,v=b.startAngleRad+b.translate(c.y,null,null,null,!0);u(e)?(e=e/180*Math.PI,v=Math.max(b.startAngleRad-e,Math.min(b.endAngleRad+e,v))):!1===d.wrap&&(v=Math.max(b.startAngleRad,Math.min(b.endAngleRad,
v)));v=180*v/Math.PI;c.shapeType="path";c.shapeArgs={d:h.path||["M",-f,-m/2,"L",k,-m/2,l,-n/2,l,n/2,k,m/2,-f,m/2,"z"],translateX:a[0],translateY:a[1],rotation:v};c.plotX=a[0];c.plotY=a[1]})},drawPoints:function(){var b=this,d=b.yAxis.center,a=b.pivot,c=b.options,g=c.pivot,l=b.chart.renderer;t(b.points,function(d){var a=d.graphic,h=d.shapeArgs,k=h.d,g=w(c.dial,d.dial);a?(a.animate(h),h.d=k):(d.graphic=l[d.shapeType](h).attr({rotation:h.rotation,zIndex:1}).addClass("highcharts-dial").add(b.group),d.graphic.attr({stroke:g.borderColor||
"none","stroke-width":g.borderWidth||0,fill:g.backgroundColor||"#000000"}))});a?a.animate({translateX:d[0],translateY:d[1]}):(b.pivot=l.circle(0,0,q(g.radius,5)).attr({zIndex:2}).addClass("highcharts-pivot").translate(d[0],d[1]).add(b.group),b.pivot.attr({"stroke-width":g.borderWidth||0,stroke:g.borderColor||"#cccccc",fill:g.backgroundColor||"#000000"}))},animate:function(b){var d=this;b||(t(d.points,function(b){var c=b.graphic;c&&(c.attr({rotation:180*d.yAxis.startAngleRad/Math.PI}),c.animate({rotation:b.shapeArgs.rotation},
d.options.animation))}),d.animate=null)},render:function(){this.group=this.plotGroup("group","series",this.visible?"visible":"hidden",this.options.zIndex,this.chart.seriesGroup);e.prototype.render.call(this);this.group.clip(this.chart.clipRect)},setData:function(b,d){e.prototype.setData.call(this,b,!1);this.processData();this.generatePoints();q(d,!0)&&this.chart.redraw()},drawTracker:d&&d.drawTrackerPoint},{setState:function(b){this.state=b}})})(x);(function(a){var t=a.each,u=a.noop,w=a.pick,q=a.seriesType,
r=a.seriesTypes;q("boxplot","column",{threshold:null,tooltip:{pointFormat:'\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e \x3cb\x3e {series.name}\x3c/b\x3e\x3cbr/\x3eMaximum: {point.high}\x3cbr/\x3eUpper quartile: {point.q3}\x3cbr/\x3eMedian: {point.median}\x3cbr/\x3eLower quartile: {point.q1}\x3cbr/\x3eMinimum: {point.low}\x3cbr/\x3e'},whiskerLength:"50%",fillColor:"#ffffff",lineWidth:1,medianWidth:2,states:{hover:{brightness:-.3}},whiskerWidth:2},{pointArrayMap:["low","q1","median",
"q3","high"],toYData:function(a){return[a.low,a.q1,a.median,a.q3,a.high]},pointValKey:"high",pointAttribs:function(a){var b=this.options,d=a&&a.color||this.color;return{fill:a.fillColor||b.fillColor||d,stroke:b.lineColor||d,"stroke-width":b.lineWidth||0}},drawDataLabels:u,translate:function(){var a=this.yAxis,b=this.pointArrayMap;r.column.prototype.translate.apply(this);t(this.points,function(d){t(b,function(b){null!==d[b]&&(d[b+"Plot"]=a.translate(d[b],0,1,0,1))})})},drawPoints:function(){var a=
this,b=a.options,d=a.chart.renderer,h,k,n,c,g,l,p=0,f,m,q,r,v=!1!==a.doQuartiles,u,x=a.options.whiskerLength;t(a.points,function(e){var t=e.graphic,y=t?"animate":"attr",I=e.shapeArgs,z={},B={},G={},H=e.color||a.color;void 0!==e.plotY&&(f=I.width,m=Math.floor(I.x),q=m+f,r=Math.round(f/2),h=Math.floor(v?e.q1Plot:e.lowPlot),k=Math.floor(v?e.q3Plot:e.lowPlot),n=Math.floor(e.highPlot),c=Math.floor(e.lowPlot),t||(e.graphic=t=d.g("point").add(a.group),e.stem=d.path().addClass("highcharts-boxplot-stem").add(t),
x&&(e.whiskers=d.path().addClass("highcharts-boxplot-whisker").add(t)),v&&(e.box=d.path(void 0).addClass("highcharts-boxplot-box").add(t)),e.medianShape=d.path(void 0).addClass("highcharts-boxplot-median").add(t),z.stroke=e.stemColor||b.stemColor||H,z["stroke-width"]=w(e.stemWidth,b.stemWidth,b.lineWidth),z.dashstyle=e.stemDashStyle||b.stemDashStyle,e.stem.attr(z),x&&(B.stroke=e.whiskerColor||b.whiskerColor||H,B["stroke-width"]=w(e.whiskerWidth,b.whiskerWidth,b.lineWidth),e.whiskers.attr(B)),v&&(t=
a.pointAttribs(e),e.box.attr(t)),G.stroke=e.medianColor||b.medianColor||H,G["stroke-width"]=w(e.medianWidth,b.medianWidth,b.lineWidth),e.medianShape.attr(G)),l=e.stem.strokeWidth()%2/2,p=m+r+l,e.stem[y]({d:["M",p,k,"L",p,n,"M",p,h,"L",p,c]}),v&&(l=e.box.strokeWidth()%2/2,h=Math.floor(h)+l,k=Math.floor(k)+l,m+=l,q+=l,e.box[y]({d:["M",m,k,"L",m,h,"L",q,h,"L",q,k,"L",m,k,"z"]})),x&&(l=e.whiskers.strokeWidth()%2/2,n+=l,c+=l,u=/%$/.test(x)?r*parseFloat(x)/100:x/2,e.whiskers[y]({d:["M",p-u,n,"L",p+u,n,
"M",p-u,c,"L",p+u,c]})),g=Math.round(e.medianPlot),l=e.medianShape.strokeWidth()%2/2,g+=l,e.medianShape[y]({d:["M",m,g,"L",q,g]}))})},setStackedPoints:u})})(x);(function(a){var t=a.each,u=a.noop,w=a.seriesType,q=a.seriesTypes;w("errorbar","boxplot",{color:"#000000",grouping:!1,linkedTo:":previous",tooltip:{pointFormat:'\x3cspan style\x3d"color:{point.color}"\x3e\u25cf\x3c/span\x3e {series.name}: \x3cb\x3e{point.low}\x3c/b\x3e - \x3cb\x3e{point.high}\x3c/b\x3e\x3cbr/\x3e'},whiskerWidth:null},{type:"errorbar",
pointArrayMap:["low","high"],toYData:function(a){return[a.low,a.high]},pointValKey:"high",doQuartiles:!1,drawDataLabels:q.arearange?function(){var a=this.pointValKey;q.arearange.prototype.drawDataLabels.call(this);t(this.data,function(e){e.y=e[a]})}:u,getColumnMetrics:function(){return this.linkedParent&&this.linkedParent.columnMetrics||q.column.prototype.getColumnMetrics.call(this)}})})(x);(function(a){var t=a.correctFloat,u=a.isNumber,w=a.pick,q=a.Point,r=a.Series,e=a.seriesType,b=a.seriesTypes;
e("waterfall","column",{dataLabels:{inside:!0},lineWidth:1,lineColor:"#333333",dashStyle:"dot",borderColor:"#333333",states:{hover:{lineWidthPlus:0}}},{pointValKey:"y",translate:function(){var d=this.options,a=this.yAxis,k,e,c,g,l,p,f,m,q,r=w(d.minPointLength,5),v=d.threshold,u=d.stacking;b.column.prototype.translate.apply(this);this.minPointLengthOffset=0;f=m=v;e=this.points;k=0;for(d=e.length;k<d;k++)c=e[k],p=this.processedYData[k],g=c.shapeArgs,q=(l=u&&a.stacks[(this.negStacks&&p<v?"-":"")+this.stackKey])?
l[c.x].points[this.index+","+k]:[0,p],c.isSum?c.y=t(p):c.isIntermediateSum&&(c.y=t(p-m)),l=Math.max(f,f+c.y)+q[0],g.y=a.toPixels(l,!0),c.isSum?(g.y=a.toPixels(q[1],!0),g.height=Math.min(a.toPixels(q[0],!0),a.len)-g.y+this.minPointLengthOffset):c.isIntermediateSum?(g.y=a.toPixels(q[1],!0),g.height=Math.min(a.toPixels(m,!0),a.len)-g.y+this.minPointLengthOffset,m=q[1]):(g.height=0<p?a.toPixels(f,!0)-g.y:a.toPixels(f,!0)-a.toPixels(f-p,!0),f+=p),0>g.height&&(g.y+=g.height,g.height*=-1),c.plotY=g.y=Math.round(g.y)-
this.borderWidth%2/2,g.height=Math.max(Math.round(g.height),.001),c.yBottom=g.y+g.height,g.height<=r&&(g.height=r,this.minPointLengthOffset+=r),g.y-=this.minPointLengthOffset,g=c.plotY+(c.negative?g.height:0)-this.minPointLengthOffset,this.chart.inverted?c.tooltipPos[0]=a.len-g:c.tooltipPos[1]=g},processData:function(b){var a=this.yData,d=this.options.data,e,c=a.length,g,l,p,f,m,q;l=g=p=f=this.options.threshold||0;for(q=0;q<c;q++)m=a[q],e=d&&d[q]?d[q]:{},"sum"===m||e.isSum?a[q]=t(l):"intermediateSum"===
m||e.isIntermediateSum?a[q]=t(g):(l+=m,g+=m),p=Math.min(l,p),f=Math.max(l,f);r.prototype.processData.call(this,b);this.dataMin=p;this.dataMax=f},toYData:function(b){return b.isSum?0===b.x?null:"sum":b.isIntermediateSum?0===b.x?null:"intermediateSum":b.y},pointAttribs:function(a,h){var d=this.options.upColor;d&&!a.options.color&&(a.color=0<a.y?d:null);a=b.column.prototype.pointAttribs.call(this,a,h);delete a.dashstyle;return a},getGraphPath:function(){return["M",0,0]},getCrispPath:function(){var b=
this.data,a=b.length,e=this.graph.strokeWidth()+this.borderWidth,e=Math.round(e)%2/2,n=[],c,g,l;for(l=1;l<a;l++)g=b[l].shapeArgs,c=b[l-1].shapeArgs,g=["M",c.x+c.width,c.y+e,"L",g.x,c.y+e],0>b[l-1].y&&(g[2]+=c.height,g[5]+=c.height),n=n.concat(g);return n},drawGraph:function(){r.prototype.drawGraph.call(this);this.graph.attr({d:this.getCrispPath()})},getExtremes:a.noop},{getClassName:function(){var b=q.prototype.getClassName.call(this);this.isSum?b+=" highcharts-sum":this.isIntermediateSum&&(b+=" highcharts-intermediate-sum");
return b},isValid:function(){return u(this.y,!0)||this.isSum||this.isIntermediateSum}})})(x);(function(a){var t=a.Series,u=a.seriesType,w=a.seriesTypes;u("polygon","scatter",{marker:{enabled:!1,states:{hover:{enabled:!1}}},stickyTracking:!1,tooltip:{followPointer:!0,pointFormat:""},trackByArea:!0},{type:"polygon",getGraphPath:function(){for(var a=t.prototype.getGraphPath.call(this),r=a.length+1;r--;)(r===a.length||"M"===a[r])&&0<r&&a.splice(r,0,"z");return this.areaPath=a},drawGraph:function(){this.options.fillColor=
this.color;w.area.prototype.drawGraph.call(this)},drawLegendSymbol:a.LegendSymbolMixin.drawRectangle,drawTracker:t.prototype.drawTracker,setStackedPoints:a.noop})})(x);(function(a){var t=a.arrayMax,u=a.arrayMin,w=a.Axis,q=a.color,r=a.each,e=a.isNumber,b=a.noop,d=a.pick,h=a.pInt,k=a.Point,n=a.Series,c=a.seriesType,g=a.seriesTypes;c("bubble","scatter",{dataLabels:{formatter:function(){return this.point.z},inside:!0,verticalAlign:"middle"},marker:{lineColor:null,lineWidth:1,radius:null,states:{hover:{radiusPlus:0}}},
minSize:8,maxSize:"20%",softThreshold:!1,states:{hover:{halo:{size:5}}},tooltip:{pointFormat:"({point.x}, {point.y}), Size: {point.z}"},turboThreshold:0,zThreshold:0,zoneAxis:"z"},{pointArrayMap:["y","z"],parallelArrays:["x","y","z"],trackerGroups:["group","dataLabelsGroup"],bubblePadding:!0,zoneAxis:"z",markerAttribs:null,pointAttribs:function(b,a){var c=d(this.options.marker.fillOpacity,.5);b=n.prototype.pointAttribs.call(this,b,a);1!==c&&(b.fill=q(b.fill).setOpacity(c).get("rgba"));return b},getRadii:function(b,
a,d,c){var f,h,e,l=this.zData,g=[],m=this.options,k="width"!==m.sizeBy,n=m.zThreshold,p=a-b;h=0;for(f=l.length;h<f;h++)e=l[h],m.sizeByAbsoluteValue&&null!==e&&(e=Math.abs(e-n),a=Math.max(a-n,Math.abs(b-n)),b=0),null===e?e=null:e<b?e=d/2-1:(e=0<p?(e-b)/p:.5,k&&0<=e&&(e=Math.sqrt(e)),e=Math.ceil(d+e*(c-d))/2),g.push(e);this.radii=g},animate:function(b){var a=this.options.animation;b||(r(this.points,function(b){var d=b.graphic;b=b.shapeArgs;d&&b&&(d.attr("r",1),d.animate({r:b.r},a))}),this.animate=null)},
translate:function(){var b,a=this.data,d,c,h=this.radii;g.scatter.prototype.translate.call(this);for(b=a.length;b--;)d=a[b],c=h?h[b]:0,e(c)&&c>=this.minPxSize/2?(d.shapeType="circle",d.shapeArgs={x:d.plotX,y:d.plotY,r:c},d.dlBox={x:d.plotX-c,y:d.plotY-c,width:2*c,height:2*c}):d.shapeArgs=d.plotY=d.dlBox=void 0},drawLegendSymbol:function(b,a){var d=this.chart.renderer,c=d.fontMetrics(b.itemStyle.fontSize).f/2;a.legendSymbol=d.circle(c,b.baseline-c,c).attr({zIndex:3}).add(a.legendGroup);a.legendSymbol.isMarker=
!0},drawPoints:g.column.prototype.drawPoints,alignDataLabel:g.column.prototype.alignDataLabel,buildKDTree:b,applyZones:b},{haloPath:function(){return k.prototype.haloPath.call(this,this.shapeArgs.r+this.series.options.states.hover.halo.size)},ttBelow:!1});w.prototype.beforePadding=function(){var b=this,a=this.len,c=this.chart,g=0,k=a,n=this.isXAxis,q=n?"xData":"yData",w=this.min,x={},A=Math.min(c.plotWidth,c.plotHeight),C=Number.MAX_VALUE,D=-Number.MAX_VALUE,E=this.max-w,z=a/E,F=[];r(this.series,
function(a){var e=a.options;!a.bubblePadding||!a.visible&&c.options.chart.ignoreHiddenSeries||(b.allowZoomOutside=!0,F.push(a),n&&(r(["minSize","maxSize"],function(b){var a=e[b],d=/%$/.test(a),a=h(a);x[b]=d?A*a/100:a}),a.minPxSize=x.minSize,a.maxPxSize=x.maxSize,a=a.zData,a.length&&(C=d(e.zMin,Math.min(C,Math.max(u(a),!1===e.displayNegative?e.zThreshold:-Number.MAX_VALUE))),D=d(e.zMax,Math.max(D,t(a))))))});r(F,function(a){var d=a[q],c=d.length,h;n&&a.getRadii(C,D,a.minPxSize,a.maxPxSize);if(0<E)for(;c--;)e(d[c])&&
b.dataMin<=d[c]&&d[c]<=b.dataMax&&(h=a.radii[c],g=Math.min((d[c]-w)*z-h,g),k=Math.max((d[c]-w)*z+h,k))});F.length&&0<E&&!this.isLog&&(k-=a,z*=(a+g-k)/a,r([["min","userMin",g],["max","userMax",k]],function(a){void 0===d(b.options[a[0]],b[a[1]])&&(b[a[0]]+=a[2]/z)}))}})(x);(function(a){function t(b,a){var d=this.chart,e=this.options.animation,n=this.group,c=this.markerGroup,g=this.xAxis.center,l=d.plotLeft,p=d.plotTop;d.polar?d.renderer.isSVG&&(!0===e&&(e={}),a?(b={translateX:g[0]+l,translateY:g[1]+
p,scaleX:.001,scaleY:.001},n.attr(b),c&&c.attr(b)):(b={translateX:l,translateY:p,scaleX:1,scaleY:1},n.animate(b,e),c&&c.animate(b,e),this.animate=null)):b.call(this,a)}var u=a.each,w=a.pick,q=a.seriesTypes,r=a.wrap,e=a.Series.prototype;a=a.Pointer.prototype;e.searchPointByAngle=function(b){var a=this.chart,e=this.xAxis.pane.center;return this.searchKDTree({clientX:180+-180/Math.PI*Math.atan2(b.chartX-e[0]-a.plotLeft,b.chartY-e[1]-a.plotTop)})};r(e,"buildKDTree",function(b){this.chart.polar&&(this.kdByAngle?
this.searchPoint=this.searchPointByAngle:this.kdDimensions=2);b.apply(this)});e.toXY=function(b){var a,e=this.chart,k=b.plotX;a=b.plotY;b.rectPlotX=k;b.rectPlotY=a;a=this.xAxis.postTranslate(b.plotX,this.yAxis.len-a);b.plotX=b.polarPlotX=a.x-e.plotLeft;b.plotY=b.polarPlotY=a.y-e.plotTop;this.kdByAngle?(e=(k/Math.PI*180+this.xAxis.pane.options.startAngle)%360,0>e&&(e+=360),b.clientX=e):b.clientX=b.plotX};q.spline&&r(q.spline.prototype,"getPointSpline",function(b,a,e,k){var d,c,g,h,p,f,m;this.chart.polar?
(d=e.plotX,c=e.plotY,b=a[k-1],g=a[k+1],this.connectEnds&&(b||(b=a[a.length-2]),g||(g=a[1])),b&&g&&(h=b.plotX,p=b.plotY,a=g.plotX,f=g.plotY,h=(1.5*d+h)/2.5,p=(1.5*c+p)/2.5,g=(1.5*d+a)/2.5,m=(1.5*c+f)/2.5,a=Math.sqrt(Math.pow(h-d,2)+Math.pow(p-c,2)),f=Math.sqrt(Math.pow(g-d,2)+Math.pow(m-c,2)),h=Math.atan2(p-c,h-d),p=Math.atan2(m-c,g-d),m=Math.PI/2+(h+p)/2,Math.abs(h-m)>Math.PI/2&&(m-=Math.PI),h=d+Math.cos(m)*a,p=c+Math.sin(m)*a,g=d+Math.cos(Math.PI+m)*f,m=c+Math.sin(Math.PI+m)*f,e.rightContX=g,e.rightContY=
m),k?(e=["C",b.rightContX||b.plotX,b.rightContY||b.plotY,h||d,p||c,d,c],b.rightContX=b.rightContY=null):e=["M",d,c]):e=b.call(this,a,e,k);return e});r(e,"translate",function(b){var a=this.chart;b.call(this);if(a.polar&&(this.kdByAngle=a.tooltip&&a.tooltip.shared,!this.preventPostTranslate))for(b=this.points,a=b.length;a--;)this.toXY(b[a])});r(e,"getGraphPath",function(b,a){var d=this,e,n;if(this.chart.polar){a=a||this.points;for(e=0;e<a.length;e++)if(!a[e].isNull){n=e;break}!1!==this.options.connectEnds&&
void 0!==n&&(this.connectEnds=!0,a.splice(a.length,0,a[n]));u(a,function(b){void 0===b.polarPlotY&&d.toXY(b)})}return b.apply(this,[].slice.call(arguments,1))});r(e,"animate",t);q.column&&(q=q.column.prototype,q.polarArc=function(b,a,e,k){var d=this.xAxis.center,c=this.yAxis.len;return this.chart.renderer.symbols.arc(d[0],d[1],c-a,null,{start:e,end:k,innerR:c-w(b,c)})},r(q,"animate",t),r(q,"translate",function(b){var a=this.xAxis,e=a.startAngleRad,k,n,c;this.preventPostTranslate=!0;b.call(this);if(a.isRadial)for(k=
this.points,c=k.length;c--;)n=k[c],b=n.barX+e,n.shapeType="path",n.shapeArgs={d:this.polarArc(n.yBottom,n.plotY,b,b+n.pointWidth)},this.toXY(n),n.tooltipPos=[n.plotX,n.plotY],n.ttBelow=n.plotY>a.center[1]}),r(q,"alignDataLabel",function(a,d,h,k,n,c){this.chart.polar?(a=d.rectPlotX/Math.PI*180,null===k.align&&(k.align=20<a&&160>a?"left":200<a&&340>a?"right":"center"),null===k.verticalAlign&&(k.verticalAlign=45>a||315<a?"bottom":135<a&&225>a?"top":"middle"),e.alignDataLabel.call(this,d,h,k,n,c)):a.call(this,
d,h,k,n,c)}));r(a,"getCoordinates",function(a,d){var b=this.chart,e={xAxis:[],yAxis:[]};b.polar?u(b.axes,function(a){var c=a.isXAxis,g=a.center,h=d.chartX-g[0]-b.plotLeft,g=d.chartY-g[1]-b.plotTop;e[c?"xAxis":"yAxis"].push({axis:a,value:a.translate(c?Math.PI-Math.atan2(h,g):Math.sqrt(Math.pow(h,2)+Math.pow(g,2)),!0)})}):e=a.call(this,d);return e})})(x)});
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 - 2014 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0

Optional extensions on the jquery.inputmask base
*/
(function ($) {
    //date & time aliases
    $.extend($.inputmask.defaults.definitions, {
        'h': { //hours
            validator: "[01][0-9]|2[0-3]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-2]", cardinality: 1 }]
        },
        's': { //seconds || minutes
            validator: "[0-5][0-9]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-5]", cardinality: 1 }]
        },
        'd': { //basic day
            validator: "0[1-9]|[12][0-9]|3[01]",
            cardinality: 2,
            prevalidator: [{ validator: "[0-3]", cardinality: 1 }]
        },
        'm': { //basic month
            validator: "0[1-9]|1[012]",
            cardinality: 2,
            prevalidator: [{ validator: "[01]", cardinality: 1 }]
        },
        'y': { //basic year
            validator: "(19|20)\\d{2}",
            cardinality: 4,
            prevalidator: [
                        { validator: "[12]", cardinality: 1 },
                        { validator: "(19|20)", cardinality: 2 },
                        { validator: "(19|20)\\d", cardinality: 3 }
            ]
        }
    });
    $.extend($.inputmask.defaults.aliases, {
        'dd/mm/yyyy': {
            mask: "1/2/y",
            placeholder: "dd/mm/yyyy",
            regex: {
                val1pre: new RegExp("[0-3]"), //daypre
                val1: new RegExp("0[1-9]|[12][0-9]|3[01]"), //day
                val2pre: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])"); }, //monthpre
                val2: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))"); }//month
            },
            leapday: "29/02/",
            separator: '/',
            yearrange: { minyear: 1900, maxyear: 2099 },
            isInYearRange: function (chrs, minyear, maxyear) {
                var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length)));
                var enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                return (enteredyear != NaN ? minyear <= enteredyear && enteredyear <= maxyear : false) ||
            		   (enteredyear2 != NaN ? minyear <= enteredyear2 && enteredyear2 <= maxyear : false);
            },
            determinebaseyear: function (minyear, maxyear, hint) {
                var currentyear = (new Date()).getFullYear();
                if (minyear > currentyear) return minyear;
                if (maxyear < currentyear) {
                    var maxYearPrefix = maxyear.toString().slice(0, 2);
                    var maxYearPostfix = maxyear.toString().slice(2, 4);
                    while (maxyear < maxYearPrefix + hint) {
                        maxYearPrefix--;
                    }
                    var maxxYear = maxYearPrefix + maxYearPostfix;
                    return minyear > maxxYear ? minyear : maxxYear;
                }

                return currentyear;
            },
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString());
                }
            },
            definitions: {
                '1': { //val1 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.regex.val1.test(chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val1.test("0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var isValid = opts.regex.val1pre.test(chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val1.test("0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                '2': { //val2 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var frontValue = buffer.join('').substr(0, 3);
                        if (frontValue.indexOf(opts.placeholder[0]) != -1) frontValue = "01" + opts.separator;
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var frontValue = buffer.join('').substr(0, 3);
                            if (frontValue.indexOf(opts.placeholder[0]) != -1) frontValue = "01" + opts.separator;
                            var isValid = opts.regex.val2pre(opts.separator).test(frontValue + chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                'y': { //year
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                            var dayMonthValue = buffer.join('').substr(0, 6);
                            if (dayMonthValue != opts.leapday)
                                return true;
                            else {
                                var year = parseInt(chrs, 10);//detect leap year
                                if (year % 4 === 0)
                                    if (year % 100 === 0)
                                        if (year % 400 === 0)
                                            return true;
                                        else return false;
                                    else return true;
                                else return false;
                            }
                        } else return false;
                    },
                    cardinality: 4,
                    prevalidator: [
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        if (!strict && !isValid) {
                            var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);

                            isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[0];
                                return { "pos": pos };
                            }
                            yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2);

                            isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[0];
                                buffer[pos++] = yearPrefix[1];
                                return { "pos": pos };
                            }
                        }
                        return isValid;
                    },
                    cardinality: 1
                },
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        if (!strict && !isValid) {
                            var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);

                            isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (isValid) {
                                buffer[pos++] = yearPrefix[1];
                                return { "pos": pos };
                            }

                            yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                            if (opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                                var dayMonthValue = buffer.join('').substr(0, 6);
                                if (dayMonthValue != opts.leapday)
                                    isValid = true;
                                else {
                                    var year = parseInt(chrs, 10);//detect leap year
                                    if (year % 4 === 0)
                                        if (year % 100 === 0)
                                            if (year % 400 === 0)
                                                isValid = true;
                                            else isValid = false;
                                        else isValid = true;
                                    else isValid = false;
                                }
                            } else isValid = false;
                            if (isValid) {
                                buffer[pos - 1] = yearPrefix[0];
                                buffer[pos++] = yearPrefix[1];
                                buffer[pos++] = chrs[0];
                                return { "pos": pos };
                            }
                        }
                        return isValid;
                    }, cardinality: 2
                },
                {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                    }, cardinality: 3
                }
                    ]
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        'mm/dd/yyyy': {
            placeholder: "mm/dd/yyyy",
            alias: "dd/mm/yyyy", //reuse functionality of dd/mm/yyyy alias
            regex: {
                val2pre: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])"); }, //daypre
                val2: function (separator) { var escapedSeparator = $.inputmask.escapeRegex.call(this, separator); return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)"); }, //day
                val1pre: new RegExp("[01]"), //monthpre
                val1: new RegExp("0[1-9]|1[012]") //month
            },
            leapday: "02/29/",
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString());
                }
            }
        },
        'yyyy/mm/dd': {
            mask: "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            leapday: "/02/29",
            onKeyUp: function (e, buffer, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode == opts.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString());
                }
            },
            definitions: {
                '2': { //val2 ~ day or month
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var frontValue = buffer.join('').substr(5, 3);
                        if (frontValue.indexOf(opts.placeholder[5]) != -1) frontValue = "01" + opts.separator;
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.separator || "-./".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    return { "pos": pos, "c": chrs.charAt(0) };
                                }
                            }
                        }

                        //check leap yeap
                        if (isValid) {
                            var dayMonthValue = buffer.join('').substr(4, 4) + chrs;
                            if (dayMonthValue != opts.leapday)
                                return true;
                            else {
                                var year = parseInt(buffer.join('').substr(0, 4), 10);  //detect leap year
                                if (year % 4 === 0)
                                    if (year % 100 === 0)
                                        if (year % 400 === 0)
                                            return true;
                                        else return false;
                                    else return true;
                                else return false;
                            }
                        }

                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var frontValue = buffer.join('').substr(5, 3);
                            if (frontValue.indexOf(opts.placeholder[5]) != -1) frontValue = "01" + opts.separator;
                            var isValid = opts.regex.val2pre(opts.separator).test(frontValue + chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                }
            }
        },
        'dd.mm.yyyy': {
            mask: "1.2.y",
            placeholder: "dd.mm.yyyy",
            leapday: "29.02.",
            separator: '.',
            alias: "dd/mm/yyyy"
        },
        'dd-mm-yyyy': {
            mask: "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday: "29-02-",
            separator: '-',
            alias: "dd/mm/yyyy"
        },
        'mm.dd.yyyy': {
            mask: "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday: "02.29.",
            separator: '.',
            alias: "mm/dd/yyyy"
        },
        'mm-dd-yyyy': {
            mask: "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday: "02-29-",
            separator: '-',
            alias: "mm/dd/yyyy"
        },
        'yyyy.mm.dd': {
            mask: "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday: ".02.29",
            separator: '.',
            alias: "yyyy/mm/dd"
        },
        'yyyy-mm-dd': {
            mask: "y-1-2",
            placeholder: "yyyy-mm-dd",
            leapday: "-02-29",
            separator: '-',
            alias: "yyyy/mm/dd"
        },
        'datetime': {
            mask: "1/2/y h:s",
            placeholder: "dd/mm/yyyy hh:mm",
            alias: "dd/mm/yyyy",
            regex: {
                hrspre: new RegExp("[012]"), //hours pre
                hrs24: new RegExp("2[0-9]|1[3-9]"),
                hrs: new RegExp("[01][0-9]|2[0-3]"), //hours
                ampm: new RegExp("^[a|p|A|P][m|M]")
            },
            timeseparator: ':',
            hourFormat: "24", // or 12
            definitions: {
                'h': { //hours
                    validator: function (chrs, buffer, pos, strict, opts) {
                        var isValid = opts.regex.hrs.test(chrs);
                        if (!strict && !isValid) {
                            if (chrs.charAt(1) == opts.timeseparator || "-.:".indexOf(chrs.charAt(1)) != -1) {
                                isValid = opts.regex.hrs.test("0" + chrs.charAt(0));
                                if (isValid) {
                                    buffer[pos - 1] = "0";
                                    buffer[pos] = chrs.charAt(0);
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                        }

                        if (isValid && opts.hourFormat !== "24" && opts.regex.hrs24.test(chrs)) {

                            var tmp = parseInt(chrs, 10);

                            if (tmp == 24) {
                                buffer[pos + 5] = "a";
                                buffer[pos + 6] = "m";
                            } else {
                                buffer[pos + 5] = "p";
                                buffer[pos + 6] = "m";
                            }

                            tmp = tmp - 12;

                            if (tmp < 10) {
                                buffer[pos] = tmp.toString();
                                buffer[pos - 1] = "0";
                            } else {
                                buffer[pos] = tmp.toString().charAt(1);
                                buffer[pos - 1] = tmp.toString().charAt(0);
                            }

                            return { "pos": pos, "c": buffer[pos] };
                        }

                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [{
                        validator: function (chrs, buffer, pos, strict, opts) {
                            var isValid = opts.regex.hrspre.test(chrs);
                            if (!strict && !isValid) {
                                isValid = opts.regex.hrs.test("0" + chrs);
                                if (isValid) {
                                    buffer[pos] = "0";
                                    pos++;
                                    return { "pos": pos };
                                }
                            }
                            return isValid;
                        }, cardinality: 1
                    }]
                },
                't': { //am/pm
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return opts.regex.ampm.test(chrs + "m");
                    },
                    casing: "lower",
                    cardinality: 1
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        'datetime12': {
            mask: "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'hh:mm t': {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'h:s t': {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        'hh:mm:ss': {
            mask: "h:s:s",
            autoUnmask: false
        },
        'hh:mm': {
            mask: "h:s",
            autoUnmask: false
        },
        'date': {
            alias: "dd/mm/yyyy" // "mm/dd/yyyy"
        },
        'mm/yyyy': {
            mask: "1/y",
            placeholder: "mm/yyyy",
            leapday: "donotuse",
            separator: '/',
            alias: "mm/dd/yyyy"
        }
    });
})(jQuery);

/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 - 2014 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0

Optional extensions on the jquery.inputmask base
*/
(function ($) {
    //extra definitions
    $.extend($.inputmask.defaults.definitions, {
        'A': {
            validator: "[A-Za-z]",
            cardinality: 1,
            casing: "upper" //auto uppercasing
        },
        '#': {
            validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
            cardinality: 1,
            casing: "upper"
        }
    });
    $.extend($.inputmask.defaults.aliases, {
        'url': {
            mask: "ir",
            placeholder: "",
            separator: "",
            defaultPrefix: "http://",
            regex: {
                urlpre1: new RegExp("[fh]"),
                urlpre2: new RegExp("(ft|ht)"),
                urlpre3: new RegExp("(ftp|htt)"),
                urlpre4: new RegExp("(ftp:|http|ftps)"),
                urlpre5: new RegExp("(ftp:/|ftps:|http:|https)"),
                urlpre6: new RegExp("(ftp://|ftps:/|http:/|https:)"),
                urlpre7: new RegExp("(ftp://|ftps://|http://|https:/)"),
                urlpre8: new RegExp("(ftp://|ftps://|http://|https://)")
            },
            definitions: {
                'i': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return true;
                    },
                    cardinality: 8,
                    prevalidator: (function () {
                        var result = [], prefixLimit = 8;
                        for (var i = 0; i < prefixLimit; i++) {
                            result[i] = (function () {
                                var j = i;
                                return {
                                    validator: function (chrs, buffer, pos, strict, opts) {
                                        if (opts.regex["urlpre" + (j + 1)]) {
                                            var tmp = chrs, k;
                                            if (((j + 1) - chrs.length) > 0) {
                                                tmp = buffer.join('').substring(0, ((j + 1) - chrs.length)) + "" + tmp;
                                            }
                                            var isValid = opts.regex["urlpre" + (j + 1)].test(tmp);
                                            if (!strict && !isValid) {
                                                pos = pos - j;
                                                for (k = 0; k < opts.defaultPrefix.length; k++) {
                                                    buffer[pos] = opts.defaultPrefix[k]; pos++;
                                                }
                                                for (k = 0; k < tmp.length - 1; k++) {
                                                    buffer[pos] = tmp[k]; pos++;
                                                }
                                                return { "pos": pos };
                                            }
                                            return isValid;
                                        } else {
                                            return false;
                                        }
                                    }, cardinality: j
                                };
                            })();
                        }
                        return result;
                    })()
                },
                "r": {
                    validator: ".",
                    cardinality: 50
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        "ip": { //ip-address mask
            mask: ["[[x]y]z.[[x]y]z.[[x]y]z.x[yz]", "[[x]y]z.[[x]y]z.[[x]y]z.[[x]y][z]"],
            definitions: {
                'x': {
                    validator: "[012]",
                    cardinality: 1,
                    definitionSymbol: "i"
                },
                'y': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (pos - 1 > -1 && buffer[pos - 1] != ".")
                            chrs = buffer[pos - 1] + chrs;
                        else chrs = "0" + chrs;
                        return new RegExp("2[0-5]|[01][0-9]").test(chrs);
                    },
                    cardinality: 1,
                    definitionSymbol: "i"
                },
                'z': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (pos - 1 > -1 && buffer[pos - 1] != ".") {
                            chrs = buffer[pos - 1] + chrs;
                            if (pos - 2 > -1 && buffer[pos - 2] != ".") {
                                chrs = buffer[pos - 2] + chrs;
                            } else chrs = "0" + chrs;
                        } else chrs = "00" + chrs;
                        return new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
                    },
                    cardinality: 1,
                    definitionSymbol: "i"
                }
            }
        }
    });
})(jQuery);

/**
* @license Input Mask plugin for jquery
* http://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2014 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 0.0.0
*/

(function ($) {
    if ($.fn.inputmask === undefined) {
        //helper functions    
        function isInputEventSupported(eventName) {
            var el = document.createElement('input'),
            eventName = 'on' + eventName,
            isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }
        function resolveAlias(aliasStr, options, opts) {
            var aliasDefinition = opts.aliases[aliasStr];
            if (aliasDefinition) {
                if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts); //alias is another alias
                $.extend(true, opts, aliasDefinition);  //merge alias definition in the options
                $.extend(true, opts, options);  //reapply extra given options
                return true;
            }
            return false;
        }
        function generateMaskSets(opts) {
            var ms = [];
            var genmasks = []; //used to keep track of the masks that where processed, to avoid duplicates
            function getMaskTemplate(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var escaped = false, outCount = 0, greedy = opts.greedy, repeat = opts.repeat;
                if (repeat == "*") greedy = false;
                //if (greedy == true && opts.placeholder == "") opts.placeholder = " ";
                if (mask.length == 1 && greedy == false && repeat != 0) { opts.placeholder = ""; } //hide placeholder with single non-greedy mask
                var singleMask = $.map(mask.split(""), function (element, index) {
                    var outElem = [];
                    if (element == opts.escapeChar) {
                        escaped = true;
                    }
                    else if ((element != opts.optionalmarker.start && element != opts.optionalmarker.end) || escaped) {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            for (var i = 0; i < maskdef.cardinality; i++) {
                                outElem.push(opts.placeholder.charAt((outCount + i) % opts.placeholder.length));
                            }
                        } else {
                            outElem.push(element);
                            escaped = false;
                        }
                        outCount += outElem.length;
                        return outElem;
                    }
                });

                //allocate repetitions
                var repeatedMask = singleMask.slice();
                for (var i = 1; i < repeat && greedy; i++) {
                    repeatedMask = repeatedMask.concat(singleMask.slice());
                }

                return { "mask": repeatedMask, "repeat": repeat, "greedy": greedy };
            }
            //test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, offset: int, casing: null/upper/lower, def: definitionSymbol}
            function getTestingChain(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var isOptional = false, escaped = false;
                var newBlockMarker = false; //indicates wheter the begin/ending of a block should be indicated

                return $.map(mask.split(""), function (element, index) {
                    var outElem = [];

                    if (element == opts.escapeChar) {
                        escaped = true;
                    } else if (element == opts.optionalmarker.start && !escaped) {
                        isOptional = true;
                        newBlockMarker = true;
                    }
                    else if (element == opts.optionalmarker.end && !escaped) {
                        isOptional = false;
                        newBlockMarker = true;
                    }
                    else {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            var prevalidators = maskdef["prevalidator"], prevalidatorsL = prevalidators ? prevalidators.length : 0;
                            for (var i = 1; i < maskdef.cardinality; i++) {
                                var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator["validator"], cardinality = prevalidator["cardinality"];
                                outElem.push({ fn: validator ? typeof validator == 'string' ? new RegExp(validator) : new function () { this.test = validator; } : new RegExp("."), cardinality: cardinality ? cardinality : 1, optionality: isOptional, newBlockMarker: isOptional == true ? newBlockMarker : false, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                                if (isOptional == true) //reset newBlockMarker
                                    newBlockMarker = false;
                            }
                            outElem.push({ fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                        } else {
                            outElem.push({ fn: null, cardinality: 0, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: null, def: element });
                            escaped = false;
                        }
                        //reset newBlockMarker
                        newBlockMarker = false;
                        return outElem;
                    }
                });
            }
            function markOptional(maskPart) { //needed for the clearOptionalTail functionality
                return opts.optionalmarker.start + maskPart + opts.optionalmarker.end;
            }
            function splitFirstOptionalEndPart(maskPart) {
                var optionalStartMarkers = 0, optionalEndMarkers = 0, mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        optionalStartMarkers++;
                    }
                    if (maskPart.charAt(i) == opts.optionalmarker.end) {
                        optionalEndMarkers++;
                    }
                    if (optionalStartMarkers > 0 && optionalStartMarkers == optionalEndMarkers)
                        break;
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function splitFirstOptionalStartPart(maskPart) {
                var mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        break;
                    }
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function generateMask(maskPrefix, maskPart, metadata) {
                var maskParts = splitFirstOptionalEndPart(maskPart);
                var newMask, maskTemplate;

                var masks = splitFirstOptionalStartPart(maskParts[0]);
                if (masks.length > 1) {
                    newMask = maskPrefix + masks[0] + markOptional(masks[1]) + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    newMask = maskPrefix + masks[0] + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    if (splitFirstOptionalStartPart(masks[1]).length > 1) { //optional contains another optional
                        generateMask(maskPrefix + masks[0], masks[1] + maskParts[1], metadata);
                    }
                    if (maskParts.length > 1 && splitFirstOptionalStartPart(maskParts[1]).length > 1) {
                        generateMask(maskPrefix + masks[0] + markOptional(masks[1]), maskParts[1], metadata);
                        generateMask(maskPrefix + masks[0], maskParts[1], metadata);
                    }
                }
                else {
                    newMask = maskPrefix + maskParts;
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                }

            }

            if ($.isFunction(opts.mask)) { //allow mask to be a preprocessing fn - should return a valid mask
                opts.mask = opts.mask.call(this, opts);
            }
            if ($.isArray(opts.mask)) {
                $.each(opts.mask, function (ndx, msk) {
                    if (msk["mask"] != undefined) {
                        generateMask("", msk["mask"].toString(), msk);
                    } else
                        generateMask("", msk.toString());
                });
            } else generateMask("", opts.mask.toString());

            return opts.greedy ? ms : ms.sort(function (a, b) { return a["mask"].length - b["mask"].length; });
        }

        var msie10 = navigator.userAgent.match(new RegExp("msie 10", "i")) !== null,
            iphone = navigator.userAgent.match(new RegExp("iphone", "i")) !== null,
            android = navigator.userAgent.match(new RegExp("android.*safari.*", "i")) !== null,
            androidchrome = navigator.userAgent.match(new RegExp("android.*chrome.*", "i")) !== null,
            pasteEvent = isInputEventSupported('paste') ? 'paste' : isInputEventSupported('input') ? 'input' : "propertychange";


        //masking scope
        //actionObj definition see below
        function maskScope(masksets, activeMasksetIndex, opts, actionObj) {
            var isRTL = false,
                valueOnFocus = getActiveBuffer().join(''),
                $el, chromeValueOnInput,
                skipKeyPressEvent = false, //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipInputEvent = false, //skip when triggered from within inputmask
                ignorable = false;


            //maskset helperfunctions

            function getActiveMaskSet() {
                return masksets[activeMasksetIndex];
            }

            function getActiveTests() {
                return getActiveMaskSet()['tests'];
            }

            function getActiveBufferTemplate() {
                return getActiveMaskSet()['_buffer'];
            }

            function getActiveBuffer() {
                return getActiveMaskSet()['buffer'];
            }

            function isValid(pos, c, strict) { //strict true ~ no correction or autofill
                strict = strict === true; //always set a value to strict to prevent possible strange behavior in the extensions 

                function _isValid(position, activeMaskset, c, strict) {
                    var testPos = determineTestPosition(position), loopend = c ? 1 : 0, chrs = '', buffer = activeMaskset["buffer"];
                    for (var i = activeMaskset['tests'][testPos].cardinality; i > loopend; i--) {
                        chrs += getBufferElement(buffer, testPos - (i - 1));
                    }

                    if (c) {
                        chrs += c;
                    }

                    //return is false or a json object => { pos: ??, c: ??} or true
                    return activeMaskset['tests'][testPos].fn != null ?
                        activeMaskset['tests'][testPos].fn.test(chrs, buffer, position, strict, opts)
                        : (c == getBufferElement(activeMaskset['_buffer'], position, true) || c == opts.skipOptionalPartCharacter) ?
                            { "refresh": true, c: getBufferElement(activeMaskset['_buffer'], position, true), pos: position }
                            : false;
                }

                function PostProcessResults(maskForwards, results) {
                    var hasValidActual = false;
                    $.each(results, function (ndx, rslt) {
                        hasValidActual = $.inArray(rslt["activeMasksetIndex"], maskForwards) == -1 && rslt["result"] !== false;
                        if (hasValidActual) return false;
                    });
                    if (hasValidActual) { //strip maskforwards
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) == -1) {
                                return rslt;
                            } else {
                                masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = actualLVP;
                            }
                        });
                    } else { //keep maskforwards with the least forward
                        var lowestPos = -1, lowestIndex = -1, rsltValid;
                        $.each(results, function (ndx, rslt) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1 && rslt["result"] !== false & (lowestPos == -1 || lowestPos > rslt["result"]["pos"])) {
                                lowestPos = rslt["result"]["pos"];
                                lowestIndex = rslt["activeMasksetIndex"];
                            }
                        });
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1) {
                                if (rslt["result"]["pos"] == lowestPos) {
                                    return rslt;
                                } else if (rslt["result"] !== false) {
                                    for (var i = pos; i < lowestPos; i++) {
                                        rsltValid = _isValid(i, masksets[rslt["activeMasksetIndex"]], masksets[lowestIndex]["buffer"][i], true);
                                        if (rsltValid === false) {
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos - 1;
                                            break;
                                        } else {
                                            setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], i, masksets[lowestIndex]["buffer"][i], true);
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = i;
                                        }
                                    }
                                    //also check check for the lowestpos with the new input
                                    rsltValid = _isValid(lowestPos, masksets[rslt["activeMasksetIndex"]], c, true);
                                    if (rsltValid !== false) {
                                        setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], lowestPos, c, true);
                                        masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos;
                                    }
                                    //console.log("ndx " + rslt["activeMasksetIndex"] + " validate " + masksets[rslt["activeMasksetIndex"]]["buffer"].join('') + " lv " + masksets[rslt["activeMasksetIndex"]]['lastValidPosition']);
                                    return rslt;
                                }
                            }
                        });
                    }
                    return results;
                }

                if (strict) {
                    var result = _isValid(pos, getActiveMaskSet(), c, strict); //only check validity in current mask when validating strict
                    if (result === true) {
                        result = { "pos": pos }; //always take a possible corrected maskposition into account
                    }
                    return result;
                }

                var results = [], result = false, currentActiveMasksetIndex = activeMasksetIndex,
                    actualBuffer = getActiveBuffer().slice(), actualLVP = getActiveMaskSet()["lastValidPosition"],
                    actualPrevious = seekPrevious(pos),
                    maskForwards = [];
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;

                        var maskPos = pos;
                        var lvp = getActiveMaskSet()['lastValidPosition'],
                            rsltValid;
                        if (lvp == actualLVP) {
                            if ((maskPos - actualLVP) > 1) {
                                for (var i = lvp == -1 ? 0 : lvp; i < maskPos; i++) {
                                    rsltValid = _isValid(i, getActiveMaskSet(), actualBuffer[i], true);
                                    if (rsltValid === false) {
                                        break;
                                    } else {
                                        setBufferElement(getActiveBuffer(), i, actualBuffer[i], true);
                                        if (rsltValid === true) {
                                            rsltValid = { "pos": i }; //always take a possible corrected maskposition into account
                                        }
                                        var newValidPosition = rsltValid.pos || i;
                                        if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                            getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                    }
                                }
                            }
                            //does the input match on a further position?
                            if (!isMask(maskPos) && !_isValid(maskPos, getActiveMaskSet(), c, strict)) {
                                var maxForward = seekNext(maskPos) - maskPos;
                                for (var fw = 0; fw < maxForward; fw++) {
                                    if (_isValid(++maskPos, getActiveMaskSet(), c, strict) !== false)
                                        break;
                                }
                                maskForwards.push(activeMasksetIndex);
                                //console.log('maskforward ' + activeMasksetIndex + " pos " + pos + " maskPos " + maskPos);
                            }
                        }

                        if (getActiveMaskSet()['lastValidPosition'] >= actualLVP || activeMasksetIndex == currentActiveMasksetIndex) {
                            if (maskPos >= 0 && maskPos < getMaskLength()) {
                                result = _isValid(maskPos, getActiveMaskSet(), c, strict);
                                if (result !== false) {
                                    if (result === true) {
                                        result = { "pos": maskPos }; //always take a possible corrected maskposition into account
                                    }
                                    var newValidPosition = result.pos || maskPos;
                                    if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                        getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                }
                                //console.log("pos " + pos + " ndx " + activeMasksetIndex + " validate " + getActiveBuffer().join('') + " lv " + getActiveMaskSet()['lastValidPosition']);
                                results.push({ "activeMasksetIndex": index, "result": result });
                            }
                        }
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMasksetIndex

                return PostProcessResults(maskForwards, results); //return results of the multiple mask validations
            }

            function determineActiveMasksetIndex() {
                var currentMasksetIndex = activeMasksetIndex,
                    highestValid = { "activeMasksetIndex": 0, "lastValidPosition": -1, "next": -1 };
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;
                        if (getActiveMaskSet()['lastValidPosition'] > highestValid['lastValidPosition']) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        } else if (getActiveMaskSet()['lastValidPosition'] == highestValid['lastValidPosition'] &&
                            (highestValid['next'] == -1 || highestValid['next'] > seekNext(getActiveMaskSet()['lastValidPosition']))) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        }
                    }
                });

                activeMasksetIndex = highestValid["lastValidPosition"] != -1 && masksets[currentMasksetIndex]["lastValidPosition"] == highestValid["lastValidPosition"] ? currentMasksetIndex : highestValid["activeMasksetIndex"];
                if (currentMasksetIndex != activeMasksetIndex) {
                    clearBuffer(getActiveBuffer(), seekNext(highestValid["lastValidPosition"]), getMaskLength());
                    getActiveMaskSet()["writeOutBuffer"] = true;
                }
                $el.data('_inputmask')['activeMasksetIndex'] = activeMasksetIndex; //store the activeMasksetIndex
            }

            function isMask(pos) {
                var testPos = determineTestPosition(pos);
                var test = getActiveTests()[testPos];

                return test != undefined ? test.fn : false;
            }

            function determineTestPosition(pos) {
                return pos % getActiveTests().length;
            }

            function getMaskLength() {
                return opts.getMaskLength(getActiveBufferTemplate(), getActiveMaskSet()['greedy'], getActiveMaskSet()['repeat'], getActiveBuffer(), opts);
            }

            //pos: from position

            function seekNext(pos) {
                var maskL = getMaskLength();
                if (pos >= maskL) return maskL;
                var position = pos;
                while (++position < maskL && !isMask(position)) {
                }
                return position;
            }

            //pos: from position

            function seekPrevious(pos) {
                var position = pos;
                if (position <= 0) return 0;

                while (--position > 0 && !isMask(position)) {
                }
                return position;
            }

            function setBufferElement(buffer, position, element, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);

                var test = getActiveTests()[determineTestPosition(position)];
                var elem = element;
                if (elem != undefined && test != undefined) {
                    switch (test.casing) {
                        case "upper":
                            elem = element.toUpperCase();
                            break;
                        case "lower":
                            elem = element.toLowerCase();
                            break;
                    }
                }

                buffer[position] = elem;
            }

            function getBufferElement(buffer, position, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);
                return buffer[position];
            }

            //needed to handle the non-greedy mask repetitions

            function prepareBuffer(buffer, position) {
                var j;
                while (buffer[position] == undefined && buffer.length < getMaskLength()) {
                    j = 0;
                    while (getActiveBufferTemplate()[j] !== undefined) { //add a new buffer
                        buffer.push(getActiveBufferTemplate()[j++]);
                    }
                }

                return position;
            }

            function writeBuffer(input, buffer, caretPos) {
                input._valueSet(buffer.join(''));
                if (caretPos != undefined) {
                    caret(input, caretPos);
                }
            }

            function clearBuffer(buffer, start, end, stripNomasks) {
                for (var i = start, maskL = getMaskLength() ; i < end && i < maskL; i++) {
                    if (stripNomasks === true) {
                        if (!isMask(i))
                            setBufferElement(buffer, i, "");
                    } else
                        setBufferElement(buffer, i, getBufferElement(getActiveBufferTemplate().slice(), i, true));
                }
            }

            function setReTargetPlaceHolder(buffer, pos) {
                var testPos = determineTestPosition(pos);
                setBufferElement(buffer, pos, getBufferElement(getActiveBufferTemplate(), testPos));
            }

            function getPlaceHolder(pos) {
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }

            function checkVal(input, writeOut, strict, nptvl, intelliCheck) {
                var inputValue = nptvl != undefined ? nptvl.slice() : truncateInput(input._valueGet()).split('');

                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        ms["buffer"] = ms["_buffer"].slice();
                        ms["lastValidPosition"] = -1;
                        ms["p"] = -1;
                    }
                });
                if (strict !== true) activeMasksetIndex = 0;
                if (writeOut) input._valueSet(""); //initial clear
                var ml = getMaskLength();
                $.each(inputValue, function (ndx, charCode) {
                    if (intelliCheck === true) {
                        var p = getActiveMaskSet()["p"], lvp = p == -1 ? p : seekPrevious(p),
                            pos = lvp == -1 ? ndx : seekNext(lvp);
                        if ($.inArray(charCode, getActiveBufferTemplate().slice(lvp + 1, pos)) == -1) {
                            keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                        }
                    } else {
                        keypressEvent.call(input, undefined, true, charCode.charCodeAt(0), writeOut, strict, ndx);
                    }
                });

                if (strict === true && getActiveMaskSet()["p"] != -1) {
                    getActiveMaskSet()["lastValidPosition"] = seekPrevious(getActiveMaskSet()["p"]);
                }
            }

            function escapeRegex(str) {
                return $.inputmask.escapeRegex.call(this, str);
            }

            function truncateInput(inputValue) {
                return inputValue.replace(new RegExp("(" + escapeRegex(getActiveBufferTemplate().join('')) + ")*$"), "");
            }

            function clearOptionalTail(input) {
                var buffer = getActiveBuffer(), tmpBuffer = buffer.slice(), testPos, pos;
                for (var pos = tmpBuffer.length - 1; pos >= 0; pos--) {
                    var testPos = determineTestPosition(pos);
                    if (getActiveTests()[testPos].optionality) {
                        if (!isMask(pos) || !isValid(pos, buffer[pos], true))
                            tmpBuffer.pop();
                        else break;
                    } else break;
                }
                writeBuffer(input, tmpBuffer);
            }

            function unmaskedvalue($input, skipDatepickerCheck) {
                if (getActiveTests() && (skipDatepickerCheck === true || !$input.hasClass('hasDatepicker'))) {
                    //checkVal(input, false, true);
                    var umValue = $.map(getActiveBuffer(), function (element, index) {
                        return isMask(index) && isValid(index, element, true) ? element : null;
                    });
                    var unmaskedValue = (isRTL ? umValue.reverse() : umValue).join('');
                    return opts.onUnMask != undefined ? opts.onUnMask.call(this, getActiveBuffer().join(''), unmaskedValue) : unmaskedValue;
                } else {
                    return $input[0]._valueGet();
                }
            }

            function TranslatePosition(pos) {
                if (isRTL && typeof pos == 'number' && (!opts.greedy || opts.placeholder != "")) {
                    var bffrLght = getActiveBuffer().length;
                    pos = bffrLght - pos;
                }
                return pos;
            }

            function caret(input, begin, end) {
                var npt = input.jquery && input.length > 0 ? input[0] : input, range;
                if (typeof begin == 'number') {
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    if (!$(input).is(':visible')) {
                        return;
                    }
                    end = (typeof end == 'number') ? end : begin;
                    npt.scrollLeft = npt.scrollWidth;
                    if (opts.insertMode == false && begin == end) end++; //set visualization for insert/overwrite mode
                    if (npt.setSelectionRange) {
                        npt.selectionStart = begin;
                        npt.selectionEnd = android ? begin : end;

                    } else if (npt.createTextRange) {
                        range = npt.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                } else {
                    if (!$(input).is(':visible')) {
                        return { "begin": 0, "end": 0 };
                    }
                    if (npt.setSelectionRange) {
                        begin = npt.selectionStart;
                        end = npt.selectionEnd;
                    } else if (document.selection && document.selection.createRange) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart('character', -100000);
                        end = begin + range.text.length;
                    }
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    return { "begin": begin, "end": end };
                }
            }

            function isComplete(buffer) { //return true / false / undefined (repeat *)
                if (opts.repeat == "*") return undefined;
                var complete = false, highestValidPosition = 0, currentActiveMasksetIndex = activeMasksetIndex;
                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        activeMasksetIndex = ndx;
                        var aml = seekPrevious(getMaskLength());
                        if (ms["lastValidPosition"] >= highestValidPosition && ms["lastValidPosition"] == aml) {
                            var msComplete = true;
                            for (var i = 0; i <= aml; i++) {
                                var mask = isMask(i), testPos = determineTestPosition(i);
                                if ((mask && (buffer[i] == undefined || buffer[i] == getPlaceHolder(i))) || (!mask && buffer[i] != getActiveBufferTemplate()[testPos])) {
                                    msComplete = false;
                                    break;
                                }
                            }
                            complete = complete || msComplete;
                            if (complete) //break loop
                                return false;
                        }
                        highestValidPosition = ms["lastValidPosition"];
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMaskset
                return complete;
            }

            function isSelection(begin, end) {
                return isRTL ? (begin - end) > 1 || ((begin - end) == 1 && opts.insertMode) :
                    (end - begin) > 1 || ((end - begin) == 1 && opts.insertMode);
            }


            //private functions
            function installEventRuler(npt) {
                var events = $._data(npt).events;

                $.each(events, function (eventType, eventHandlers) {
                    $.each(eventHandlers, function (ndx, eventHandler) {
                        if (eventHandler.namespace == "inputmask") {
                            if (eventHandler.type != "setvalue") {
                                var handler = eventHandler.handler;
                                eventHandler.handler = function (e) {
                                    if (this.readOnly || this.disabled)
                                        e.preventDefault;
                                    else
                                        return handler.apply(this, arguments);
                                };
                            }
                        }
                    });
                });
            }

            function patchValueProperty(npt) {
                var valueProperty;
                if (Object.getOwnPropertyDescriptor)
                    valueProperty = Object.getOwnPropertyDescriptor(npt, "value");
                if (valueProperty && valueProperty.get) {
                    if (!npt._valueGet) {
                        var valueGet = valueProperty.get;
                        var valueSet = valueProperty.set;
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        Object.defineProperty(npt, "value", {
                            get: function () {
                                var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                    activeMasksetIndex = inputData['activeMasksetIndex'];
                                return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                            },
                            set: function (value) {
                                valueSet.call(this, value);
                                $(this).triggerHandler('setvalue.inputmask');
                            }
                        });
                    }
                } else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
                    if (!npt._valueGet) {
                        var valueGet = npt.__lookupGetter__("value");
                        var valueSet = npt.__lookupSetter__("value");
                        npt._valueGet = function () {
                            return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                        };
                        npt._valueSet = function (value) {
                            valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                        };

                        npt.__defineGetter__("value", function () {
                            var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                activeMasksetIndex = inputData['activeMasksetIndex'];
                            return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                        });
                        npt.__defineSetter__("value", function (value) {
                            valueSet.call(this, value);
                            $(this).triggerHandler('setvalue.inputmask');
                        });
                    }
                } else {
                    if (!npt._valueGet) {
                        npt._valueGet = function () { return isRTL ? this.value.split('').reverse().join('') : this.value; };
                        npt._valueSet = function (value) { this.value = isRTL ? value.split('').reverse().join('') : value; };
                    }
                    if ($.valHooks.text == undefined || $.valHooks.text.inputmaskpatch != true) {
                        var valueGet = $.valHooks.text && $.valHooks.text.get ? $.valHooks.text.get : function (elem) { return elem.value; };
                        var valueSet = $.valHooks.text && $.valHooks.text.set ? $.valHooks.text.set : function (elem, value) {
                            elem.value = value;
                            return elem;
                        };

                        jQuery.extend($.valHooks, {
                            text: {
                                get: function (elem) {
                                    var $elem = $(elem);
                                    if ($elem.data('_inputmask')) {
                                        if ($elem.data('_inputmask')['opts'].autoUnmask)
                                            return $elem.inputmask('unmaskedvalue');
                                        else {
                                            var result = valueGet(elem),
                                                inputData = $elem.data('_inputmask'), masksets = inputData['masksets'],
                                                activeMasksetIndex = inputData['activeMasksetIndex'];
                                            return result != masksets[activeMasksetIndex]['_buffer'].join('') ? result : '';
                                        }
                                    } else return valueGet(elem);
                                },
                                set: function (elem, value) {
                                    var $elem = $(elem);
                                    var result = valueSet(elem, value);
                                    if ($elem.data('_inputmask')) $elem.triggerHandler('setvalue.inputmask');
                                    return result;
                                },
                                inputmaskpatch: true
                            }
                        });
                    }
                }
            }

            //shift chars to left from start to end and put c at end position if defined

            function shiftL(start, end, c, maskJumps) {
                var buffer = getActiveBuffer();
                if (maskJumps !== false) //jumping over nonmask position
                    while (!isMask(start) && start - 1 >= 0) start--;
                for (var i = start; i < end && i < getMaskLength() ; i++) {
                    if (isMask(i)) {
                        setReTargetPlaceHolder(buffer, i);
                        var j = seekNext(i);
                        var p = getBufferElement(buffer, j);
                        if (p != getPlaceHolder(j)) {
                            if (j < getMaskLength() && isValid(i, p, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                setBufferElement(buffer, i, p, true);
                            } else {
                                if (isMask(i))
                                    break;
                            }
                        }
                    } else {
                        setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined)
                    setBufferElement(buffer, seekPrevious(end), c);

                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return start; //return the used start position
            }

            function shiftR(start, end, c) {
                var buffer = getActiveBuffer();
                if (getBufferElement(buffer, start, true) != getPlaceHolder(start)) {
                    for (var i = seekPrevious(end) ; i > start && i >= 0; i--) {
                        if (isMask(i)) {
                            var j = seekPrevious(i);
                            var t = getBufferElement(buffer, j);
                            if (t != getPlaceHolder(j)) {
                                if (isValid(j, t, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                    setBufferElement(buffer, i, t, true);
                                    setReTargetPlaceHolder(buffer, j);
                                } //else break;
                            }
                        } else
                            setReTargetPlaceHolder(buffer, i);
                    }
                }
                if (c != undefined && getBufferElement(buffer, start) == getPlaceHolder(start))
                    setBufferElement(buffer, start, c);
                var lengthBefore = buffer.length;
                if (getActiveMaskSet()["greedy"] == false) {
                    var trbuffer = truncateInput(buffer.join('')).split('');
                    buffer.length = trbuffer.length;
                    for (var i = 0, bl = buffer.length; i < bl; i++) {
                        buffer[i] = trbuffer[i];
                    }
                    if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                }
                return end - (lengthBefore - buffer.length); //return new start position
            }

            function HandleRemove(input, k, pos) {
                if (opts.numericInput || isRTL) {
                    switch (k) {
                        case opts.keyCode.BACKSPACE:
                            k = opts.keyCode.DELETE;
                            break;
                        case opts.keyCode.DELETE:
                            k = opts.keyCode.BACKSPACE;
                            break;
                    }
                    if (isRTL) {
                        var pend = pos.end;
                        pos.end = pos.begin;
                        pos.begin = pend;
                    }
                }

                var isSelection = true;
                if (pos.begin == pos.end) {
                    var posBegin = k == opts.keyCode.BACKSPACE ? pos.begin - 1 : pos.begin;
                    if (opts.isNumeric && opts.radixPoint != "" && getActiveBuffer()[posBegin] == opts.radixPoint) {
                        pos.begin = (getActiveBuffer().length - 1 == posBegin) /* radixPoint is latest? delete it */ ? pos.begin : k == opts.keyCode.BACKSPACE ? posBegin : seekNext(posBegin);
                        pos.end = pos.begin;
                    }
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                    else if (k == opts.keyCode.DELETE)
                        pos.end++;
                } else if (pos.end - pos.begin == 1 && !opts.insertMode) {
                    isSelection = false;
                    if (k == opts.keyCode.BACKSPACE)
                        pos.begin--;
                }

                clearBuffer(getActiveBuffer(), pos.begin, pos.end);

                var ml = getMaskLength();
                if (opts.greedy == false) {
                    shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                } else {
                    var newpos = pos.begin;
                    for (var i = pos.begin; i < pos.end; i++) { //seeknext to skip placeholders at start in selection
                        if (isMask(i) || !isSelection)
                            newpos = shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                    }
                    if (!isSelection) pos.begin = newpos;
                }
                var firstMaskPos = seekNext(-1);
                clearBuffer(getActiveBuffer(), pos.begin, pos.end, true);
                checkVal(input, false, masksets[1] == undefined || firstMaskPos >= pos.end, getActiveBuffer());
                if (getActiveMaskSet()['lastValidPosition'] < firstMaskPos) {
                    getActiveMaskSet()["lastValidPosition"] = -1;
                    getActiveMaskSet()["p"] = firstMaskPos;
                } else {
                    getActiveMaskSet()["p"] = pos.begin;
                }
            }

            function keydownEvent(e) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                skipKeyPressEvent = false;
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);

                //backspace, delete, and escape get special treatment
                if (k == opts.keyCode.BACKSPACE || k == opts.keyCode.DELETE || (iphone && k == 127) || e.ctrlKey && k == 88) { //backspace/delete
                    e.preventDefault(); //stop default action but allow propagation
                    if (k == 88) valueOnFocus = getActiveBuffer().join('');
                    HandleRemove(input, k, pos);
                    determineActiveMasksetIndex();
                    writeBuffer(input, getActiveBuffer(), getActiveMaskSet()["p"]);
                    if (input._valueGet() == getActiveBufferTemplate().join(''))
                        $input.trigger('cleared');

                    if (opts.showTooltip) { //update tooltip
                        $input.prop("title", getActiveMaskSet()["mask"]);
                    }
                } else if (k == opts.keyCode.END || k == opts.keyCode.PAGE_DOWN) { //when END or PAGE_DOWN pressed set position at lastmatch
                    setTimeout(function () {
                        var caretPos = seekNext(getActiveMaskSet()["lastValidPosition"]);
                        if (!opts.insertMode && caretPos == getMaskLength() && !e.shiftKey) caretPos--;
                        caret(input, e.shiftKey ? pos.begin : caretPos, caretPos);
                    }, 0);
                } else if ((k == opts.keyCode.HOME && !e.shiftKey) || k == opts.keyCode.PAGE_UP) { //Home or page_up
                    caret(input, 0, e.shiftKey ? pos.begin : 0);
                } else if (k == opts.keyCode.ESCAPE || (k == 90 && e.ctrlKey)) { //escape && undo
                    checkVal(input, true, false, valueOnFocus.split(''));
                    $input.click();
                } else if (k == opts.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) { //insert
                    opts.insertMode = !opts.insertMode;
                    caret(input, !opts.insertMode && pos.begin == getMaskLength() ? pos.begin - 1 : pos.begin);
                } else if (opts.insertMode == false && !e.shiftKey) {
                    if (k == opts.keyCode.RIGHT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin);
                        }, 0);
                    } else if (k == opts.keyCode.LEFT) {
                        setTimeout(function () {
                            var caretPos = caret(input);
                            caret(input, caretPos.begin - 1);
                        }, 0);
                    }
                }

                var currentCaretPos = caret(input);
                if (opts.onKeyDown.call(this, e, getActiveBuffer(), opts) === true) //extra stuff to execute on keydown
                    caret(input, currentCaretPos.begin, currentCaretPos.end);
                ignorable = $.inArray(k, opts.ignorables) != -1;
            }


            function keypressEvent(e, checkval, k, writeOut, strict, ndx) {
                //Safari 5.1.x - modal dialog fires keypress twice workaround
                if (k == undefined && skipKeyPressEvent) return false;
                skipKeyPressEvent = true;

                var input = this, $input = $(input);

                e = e || window.event;
                var k = checkval ? k : (e.which || e.charCode || e.keyCode);

                if (checkval !== true && (!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable))) {
                    return true;
                } else {
                    if (k) {
                        //special treat the decimal separator
                        if (checkval !== true && k == 46 && e.shiftKey == false && opts.radixPoint == ",") k = 44;

                        var pos, results, result, c = String.fromCharCode(k);
                        if (checkval) {
                            var pcaret = strict ? ndx : getActiveMaskSet()["lastValidPosition"] + 1;
                            pos = { begin: pcaret, end: pcaret };
                        } else {
                            pos = caret(input);
                        }

                        //should we clear a possible selection??
                        var isSlctn = isSelection(pos.begin, pos.end), redetermineLVP = false,
                            initialIndex = activeMasksetIndex;
                        if (isSlctn) {
                            activeMasksetIndex = initialIndex;
                            $.each(masksets, function (ndx, lmnt) { //init undobuffer for recovery when not valid
                                if (typeof (lmnt) == "object") {
                                    activeMasksetIndex = ndx;
                                    getActiveMaskSet()["undoBuffer"] = getActiveBuffer().join('');
                                }
                            });
                            HandleRemove(input, opts.keyCode.DELETE, pos);
                            if (!opts.insertMode) { //preserve some space
                                $.each(masksets, function (ndx, lmnt) {
                                    if (typeof (lmnt) == "object") {
                                        activeMasksetIndex = ndx;
                                        shiftR(pos.begin, getMaskLength());
                                        getActiveMaskSet()["lastValidPosition"] = seekNext(getActiveMaskSet()["lastValidPosition"]);
                                    }
                                });
                            }
                            activeMasksetIndex = initialIndex; //restore index
                        }

                        var radixPosition = getActiveBuffer().join('').indexOf(opts.radixPoint);
                        if (opts.isNumeric && checkval !== true && radixPosition != -1) {
                            if (opts.greedy && pos.begin <= radixPosition) {
                                pos.begin = seekPrevious(pos.begin);
                                pos.end = pos.begin;
                            } else if (c == opts.radixPoint) {
                                pos.begin = radixPosition;
                                pos.end = pos.begin;
                            }
                        }


                        var p = pos.begin;
                        results = isValid(p, c, strict);
                        if (strict === true) results = [{ "activeMasksetIndex": activeMasksetIndex, "result": results }];
                        var minimalForwardPosition = -1;
                        $.each(results, function (index, result) {
                            activeMasksetIndex = result["activeMasksetIndex"];
                            getActiveMaskSet()["writeOutBuffer"] = true;
                            var np = result["result"];
                            if (np !== false) {
                                var refresh = false, buffer = getActiveBuffer();
                                if (np !== true) {
                                    refresh = np["refresh"]; //only rewrite buffer from isValid
                                    p = np.pos != undefined ? np.pos : p; //set new position from isValid
                                    c = np.c != undefined ? np.c : c; //set new char from isValid
                                }
                                if (refresh !== true) {
                                    if (opts.insertMode == true) {
                                        var lastUnmaskedPosition = getMaskLength();
                                        var bfrClone = buffer.slice();
                                        while (getBufferElement(bfrClone, lastUnmaskedPosition, true) != getPlaceHolder(lastUnmaskedPosition) && lastUnmaskedPosition >= p) {
                                            lastUnmaskedPosition = lastUnmaskedPosition == 0 ? -1 : seekPrevious(lastUnmaskedPosition);
                                        }
                                        if (lastUnmaskedPosition >= p) {
                                            shiftR(p, getMaskLength(), c);
                                            //shift the lvp if needed
                                            var lvp = getActiveMaskSet()["lastValidPosition"], nlvp = seekNext(lvp);
                                            if (nlvp != getMaskLength() && lvp >= p && (getBufferElement(getActiveBuffer(), nlvp, true) != getPlaceHolder(nlvp))) {
                                                getActiveMaskSet()["lastValidPosition"] = nlvp;
                                            }
                                        } else getActiveMaskSet()["writeOutBuffer"] = false;
                                    } else setBufferElement(buffer, p, c, true);
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > seekNext(p)) {
                                        minimalForwardPosition = seekNext(p);
                                    }
                                } else if (!strict) {
                                    var nextPos = p < getMaskLength() ? p + 1 : p;
                                    if (minimalForwardPosition == -1 || minimalForwardPosition > nextPos) {
                                        minimalForwardPosition = nextPos;
                                    }
                                }
                                if (minimalForwardPosition > getActiveMaskSet()["p"])
                                    getActiveMaskSet()["p"] = minimalForwardPosition; //needed for checkval strict 
                            }
                        });

                        if (strict !== true) {
                            activeMasksetIndex = initialIndex;
                            determineActiveMasksetIndex();
                        }
                        if (writeOut !== false) {
                            $.each(results, function (ndx, rslt) {
                                if (rslt["activeMasksetIndex"] == activeMasksetIndex) {
                                    result = rslt;
                                    return false;
                                }
                            });
                            if (result != undefined) {
                                var self = this;
                                setTimeout(function () { opts.onKeyValidation.call(self, result["result"], opts); }, 0);
                                if (getActiveMaskSet()["writeOutBuffer"] && result["result"] !== false) {
                                    var buffer = getActiveBuffer();

                                    var newCaretPosition;
                                    if (checkval) {
                                        newCaretPosition = undefined;
                                    } else if (opts.numericInput) {
                                        if (p > radixPosition) {
                                            newCaretPosition = seekPrevious(minimalForwardPosition);
                                        } else if (c == opts.radixPoint) {
                                            newCaretPosition = minimalForwardPosition - 1;
                                        } else newCaretPosition = seekPrevious(minimalForwardPosition - 1);
                                    } else {
                                        newCaretPosition = minimalForwardPosition;
                                    }

                                    writeBuffer(input, buffer, newCaretPosition);
                                    if (checkval !== true) {
                                        setTimeout(function () { //timeout needed for IE
                                            if (isComplete(buffer) === true)
                                                $input.trigger("complete");
                                            skipInputEvent = true;
                                            $input.trigger("input");
                                        }, 0);
                                    }
                                } else if (isSlctn) {
                                    getActiveMaskSet()["buffer"] = getActiveMaskSet()["undoBuffer"].split('');
                                }
                            }
                        }

                        if (opts.showTooltip) { //update tooltip
                            $input.prop("title", getActiveMaskSet()["mask"]);
                        }

                        //needed for IE8 and below
                        if (e) e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    }
                }
            }

            function keyupEvent(e) {
                var $input = $(this), input = this, k = e.keyCode, buffer = getActiveBuffer();

                if (androidchrome && k == opts.keyCode.BACKSPACE) {
                    if (chromeValueOnInput == input._valueGet())
                        keydownEvent.call(this, e);
                }

                opts.onKeyUp.call(this, e, buffer, opts); //extra stuff to execute on keyup
                if (k == opts.keyCode.TAB && opts.showMaskOnFocus) {
                    if ($input.hasClass('focus.inputmask') && input._valueGet().length == 0) {
                        buffer = getActiveBufferTemplate().slice();
                        writeBuffer(input, buffer);
                        caret(input, 0);
                        valueOnFocus = getActiveBuffer().join('');
                    } else {
                        writeBuffer(input, buffer);
                        if (buffer.join('') == getActiveBufferTemplate().join('') && $.inArray(opts.radixPoint, buffer) != -1) {
                            caret(input, TranslatePosition(0));
                            $input.click();
                        } else
                            caret(input, TranslatePosition(0), TranslatePosition(getMaskLength()));
                    }
                }
            }

            function inputEvent(e) {
                if (skipInputEvent === true) {
                    skipInputEvent = false;
                    return true;
                }
                var input = this, $input = $(input);

                chromeValueOnInput = getActiveBuffer().join('');
                checkVal(input, false, false);
                writeBuffer(input, getActiveBuffer());
                if (isComplete(getActiveBuffer()) === true)
                    $input.trigger("complete");
                $input.click();
            }

            function mask(el) {
                $el = $(el);
                if ($el.is(":input")) {
                    //store tests & original buffer in the input element - used to get the unmasked value
                    $el.data('_inputmask', {
                        'masksets': masksets,
                        'activeMasksetIndex': activeMasksetIndex,
                        'opts': opts,
                        'isRTL': false
                    });

                    //show tooltip
                    if (opts.showTooltip) {
                        $el.prop("title", getActiveMaskSet()["mask"]);
                    }

                    //correct greedy setting if needed
                    getActiveMaskSet()['greedy'] = getActiveMaskSet()['greedy'] ? getActiveMaskSet()['greedy'] : getActiveMaskSet()['repeat'] == 0;

                    //handle maxlength attribute
                    if ($el.attr("maxLength") != null) //only when the attribute is set
                    {
                        var maxLength = $el.prop('maxLength');
                        if (maxLength > -1) { //handle *-repeat
                            $.each(masksets, function (ndx, ms) {
                                if (typeof (ms) == "object") {
                                    if (ms["repeat"] == "*") {
                                        ms["repeat"] = maxLength;
                                    }
                                }
                            });
                        }
                        if (getMaskLength() >= maxLength && maxLength > -1) { //FF sets no defined max length to -1 
                            if (maxLength < getActiveBufferTemplate().length) getActiveBufferTemplate().length = maxLength;
                            if (getActiveMaskSet()['greedy'] == false) {
                                getActiveMaskSet()['repeat'] = Math.round(maxLength / getActiveBufferTemplate().length);
                            }
                            $el.prop('maxLength', getMaskLength() * 2);
                        }
                    }

                    patchValueProperty(el);

                    if (opts.numericInput) opts.isNumeric = opts.numericInput;
                    if (el.dir == "rtl" || (opts.numericInput && opts.rightAlignNumerics) || (opts.isNumeric && opts.rightAlignNumerics))
                        $el.css("text-align", "right");

                    if (el.dir == "rtl" || opts.numericInput) {
                        el.dir = "ltr";
                        $el.removeAttr("dir");
                        var inputData = $el.data('_inputmask');
                        inputData['isRTL'] = true;
                        $el.data('_inputmask', inputData);
                        isRTL = true;
                    }

                    //unbind all events - to make sure that no other mask will interfere when re-masking
                    $el.unbind(".inputmask");
                    $el.removeClass('focus.inputmask');
                    //bind events
                    $el.closest('form').bind("submit", function () { //trigger change on submit if any
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $el.change();
                        }
                    }).bind('reset', function () {
                        setTimeout(function () {
                            $el.trigger("setvalue");
                        }, 0);
                    });
                    $el.bind("mouseenter.inputmask", function () {
                        var $input = $(this), input = this;
                        if (!$input.hasClass('focus.inputmask') && opts.showMaskOnHover) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer());
                            }
                        }
                    }).bind("blur.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet(), buffer = getActiveBuffer();
                        $input.removeClass('focus.inputmask');
                        if (valueOnFocus != getActiveBuffer().join('')) {
                            $input.change();
                        }
                        if (opts.clearMaskOnLostFocus && nptValue != '') {
                            if (nptValue == getActiveBufferTemplate().join(''))
                                input._valueSet('');
                            else { //clearout optional tail of the mask
                                clearOptionalTail(input);
                            }
                        }
                        if (isComplete(buffer) === false) {
                            $input.trigger("incomplete");
                            if (opts.clearIncomplete) {
                                $.each(masksets, function (ndx, ms) {
                                    if (typeof (ms) == "object") {
                                        ms["buffer"] = ms["_buffer"].slice();
                                        ms["lastValidPosition"] = -1;
                                    }
                                });
                                activeMasksetIndex = 0;
                                if (opts.clearMaskOnLostFocus)
                                    input._valueSet('');
                                else {
                                    buffer = getActiveBufferTemplate().slice();
                                    writeBuffer(input, buffer);
                                }
                            }
                        }
                    }).bind("focus.inputmask", function () {
                        var $input = $(this), input = this, nptValue = input._valueGet();
                        if (opts.showMaskOnFocus && !$input.hasClass('focus.inputmask') && (!opts.showMaskOnHover || (opts.showMaskOnHover && nptValue == ''))) {
                            if (input._valueGet() != getActiveBuffer().join('')) {
                                writeBuffer(input, getActiveBuffer(), seekNext(getActiveMaskSet()["lastValidPosition"]));
                            }
                        }
                        $input.addClass('focus.inputmask');
                        valueOnFocus = getActiveBuffer().join('');
                    }).bind("mouseleave.inputmask", function () {
                        var $input = $(this), input = this;
                        if (opts.clearMaskOnLostFocus) {
                            if (!$input.hasClass('focus.inputmask') && input._valueGet() != $input.attr("placeholder")) {
                                if (input._valueGet() == getActiveBufferTemplate().join('') || input._valueGet() == '')
                                    input._valueSet('');
                                else { //clearout optional tail of the mask
                                    clearOptionalTail(input);
                                }
                            }
                        }
                    }).bind("click.inputmask", function () {
                        var input = this;
                        setTimeout(function () {
                            var selectedCaret = caret(input), buffer = getActiveBuffer();
                            if (selectedCaret.begin == selectedCaret.end) {
                                var clickPosition = isRTL ? TranslatePosition(selectedCaret.begin) : selectedCaret.begin,
                                    lvp = getActiveMaskSet()["lastValidPosition"],
                                    lastPosition;
                                if (opts.isNumeric) {
                                    lastPosition = opts.skipRadixDance === false && opts.radixPoint != "" && $.inArray(opts.radixPoint, buffer) != -1 ?
                                        (opts.numericInput ? seekNext($.inArray(opts.radixPoint, buffer)) : $.inArray(opts.radixPoint, buffer)) :
                                        seekNext(lvp);
                                } else {
                                    lastPosition = seekNext(lvp);
                                }
                                if (clickPosition < lastPosition) {
                                    if (isMask(clickPosition))
                                        caret(input, clickPosition);
                                    else caret(input, seekNext(clickPosition));
                                } else
                                    caret(input, lastPosition);
                            }
                        }, 0);
                    }).bind('dblclick.inputmask', function () {
                        var input = this;
                        setTimeout(function () {
                            caret(input, 0, seekNext(getActiveMaskSet()["lastValidPosition"]));
                        }, 0);
                    }).bind(pasteEvent + ".inputmask dragdrop.inputmask drop.inputmask", function (e) {
                        if (skipInputEvent === true) {
                            skipInputEvent = false;
                            return true;
                        }
                        var input = this, $input = $(input);

                        //paste event for IE8 and lower I guess ;-)
                        if (e.type == "propertychange" && input._valueGet().length <= getMaskLength()) {
                            return true;
                        }
                        setTimeout(function () {
                            var pasteValue = opts.onBeforePaste != undefined ? opts.onBeforePaste.call(this, input._valueGet()) : input._valueGet();
                            checkVal(input, true, false, pasteValue.split(''), true);
                            if (isComplete(getActiveBuffer()) === true)
                                $input.trigger("complete");
                            $input.click();
                        }, 0);
                    }).bind('setvalue.inputmask', function () {
                        var input = this;
                        checkVal(input, true);
                        valueOnFocus = getActiveBuffer().join('');
                        if (input._valueGet() == getActiveBufferTemplate().join(''))
                            input._valueSet('');
                    }).bind('complete.inputmask', opts.oncomplete
                    ).bind('incomplete.inputmask', opts.onincomplete
                    ).bind('cleared.inputmask', opts.oncleared
                    ).bind("keyup.inputmask", keyupEvent);

                    if (androidchrome) {
                        $el.bind("input.inputmask", inputEvent);
                    } else {
                        $el.bind("keydown.inputmask", keydownEvent
                        ).bind("keypress.inputmask", keypressEvent);
                    }

                    if (msie10)
                        $el.bind("input.inputmask", inputEvent);

                    //apply mask
                    checkVal(el, true, false);
                    valueOnFocus = getActiveBuffer().join('');
                    // Wrap document.activeElement in a try/catch block since IE9 throw "Unspecified error" if document.activeElement is undefined when we are in an IFrame.
                    var activeElement;
                    try {
                        activeElement = document.activeElement;
                    } catch (e) {
                    }
                    if (activeElement === el) { //position the caret when in focus
                        $el.addClass('focus.inputmask');
                        caret(el, seekNext(getActiveMaskSet()["lastValidPosition"]));
                    } else if (opts.clearMaskOnLostFocus) {
                        if (getActiveBuffer().join('') == getActiveBufferTemplate().join('')) {
                            el._valueSet('');
                        } else {
                            clearOptionalTail(el);
                        }
                    } else {
                        writeBuffer(el, getActiveBuffer());
                    }

                    installEventRuler(el);
                }
            }

            //action object
            if (actionObj != undefined) {
                switch (actionObj["action"]) {
                    case "isComplete":
                        return isComplete(actionObj["buffer"]);
                    case "unmaskedvalue":
                        isRTL = actionObj["$input"].data('_inputmask')['isRTL'];
                        return unmaskedvalue(actionObj["$input"], actionObj["skipDatepickerCheck"]);
                    case "mask":
                        mask(actionObj["el"]);
                        break;
                    case "format":
                        $el = $({});
                        $el.data('_inputmask', {
                            'masksets': masksets,
                            'activeMasksetIndex': activeMasksetIndex,
                            'opts': opts,
                            'isRTL': opts.numericInput
                        });
                        if (opts.numericInput) {
                            opts.isNumeric = opts.numericInput;
                            isRTL = true;
                        }

                        checkVal($el, false, false, actionObj["value"].split(''), true);
                        return getActiveBuffer().join('');
                }
            }
        }
        $.inputmask = {
            //options default
            defaults: {
                placeholder: "_",
                optionalmarker: { start: "[", end: "]" },
                quantifiermarker: { start: "{", end: "}" },
                groupmarker: { start: "(", end: ")" },
                escapeChar: "\\",
                mask: null,
                oncomplete: $.noop, //executes when the mask is complete
                onincomplete: $.noop, //executes when the mask is incomplete and focus is lost
                oncleared: $.noop, //executes when the mask is cleared
                repeat: 0, //repetitions of the mask: * ~ forever, otherwise specify an integer
                greedy: true, //true: allocated buffer for the mask and repetitions - false: allocate only if needed
                autoUnmask: false, //automatically unmask when retrieving the value with $.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
                clearMaskOnLostFocus: true,
                insertMode: true, //insert the input or overwrite the input
                clearIncomplete: false, //clear the incomplete input on blur
                aliases: {}, //aliases definitions => see jquery.inputmask.extensions.js
                onKeyUp: $.noop, //override to implement autocomplete on certain keys for example
                onKeyDown: $.noop, //override to implement autocomplete on certain keys for example
                onBeforePaste: undefined, //executes before masking the pasted value to allow preprocessing of the pasted value.  args => pastedValue => return processedValue
                onUnMask: undefined, //executes after unmasking to allow postprocessing of the unmaskedvalue.  args => maskedValue, unmaskedValue
                showMaskOnFocus: true, //show the mask-placeholder when the input has focus
                showMaskOnHover: true, //show the mask-placeholder when hovering the empty input
                onKeyValidation: $.noop, //executes on every key-press with the result of isValid. Params: result, opts
                skipOptionalPartCharacter: " ", //a character which can be used to skip an optional part of a mask
                showTooltip: false, //show the activemask as tooltip
                numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
                //numeric basic properties
                isNumeric: false, //enable numeric features
                radixPoint: "", //".", // | ","
                skipRadixDance: false, //disable radixpoint caret positioning
                rightAlignNumerics: true, //align numerics to the right
                //numeric basic properties
                definitions: {
                    '9': {
                        validator: "[0-9]",
                        cardinality: 1
                    },
                    'a': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u0451]",
                        cardinality: 1
                    },
                    '*': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
                        cardinality: 1
                    }
                },
                keyCode: {
                    ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
                    NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
                },
                //specify keycodes which should not be considered in the keypress event, otherwise the preventDefault will stop their default behavior especially in FF
                ignorables: [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                getMaskLength: function (buffer, greedy, repeat, currentBuffer, opts) {
                    var calculatedLength = buffer.length;
                    if (!greedy) {
                        if (repeat == "*") {
                            calculatedLength = currentBuffer.length + 1;
                        } else if (repeat > 1) {
                            calculatedLength += (buffer.length * (repeat - 1));
                        }
                    }
                    return calculatedLength;
                }
            },
            escapeRegex: function (str) {
                var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
                return str.replace(new RegExp('(\\' + specials.join('|\\') + ')', 'gim'), '\\$1');
            },
            format: function (value, options) {
                var opts = $.extend(true, {}, $.inputmask.defaults, options);
                resolveAlias(opts.alias, options, opts);
                return maskScope(generateMaskSets(opts), 0, opts, { "action": "format", "value": value });
            }
        };

        $.fn.inputmask = function (fn, options) {
            var opts = $.extend(true, {}, $.inputmask.defaults, options),
                masksets,
                activeMasksetIndex = 0;

            if (typeof fn === "string") {
                switch (fn) {
                    case "mask":
                        //resolve possible aliases given by options
                        resolveAlias(opts.alias, options, opts);
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }

                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), 0, opts, { "action": "mask", "el": this });
                        });
                    case "unmaskedvalue":
                        var $input = $(this), input = this;
                        if ($input.data('_inputmask')) {
                            masksets = $input.data('_inputmask')['masksets'];
                            activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                            opts = $input.data('_inputmask')['opts'];
                            return maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input });
                        } else return $input.val();
                    case "remove":
                        return this.each(function () {
                            var $input = $(this), input = this;
                            if ($input.data('_inputmask')) {
                                masksets = $input.data('_inputmask')['masksets'];
                                activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                                opts = $input.data('_inputmask')['opts'];
                                //writeout the unmaskedvalue
                                input._valueSet(maskScope(masksets, activeMasksetIndex, opts, { "action": "unmaskedvalue", "$input": $input, "skipDatepickerCheck": true }));
                                //clear data
                                $input.removeData('_inputmask');
                                //unbind all events
                                $input.unbind(".inputmask");
                                $input.removeClass('focus.inputmask');
                                //restore the value property
                                var valueProperty;
                                if (Object.getOwnPropertyDescriptor)
                                    valueProperty = Object.getOwnPropertyDescriptor(input, "value");
                                if (valueProperty && valueProperty.get) {
                                    if (input._valueGet) {
                                        Object.defineProperty(input, "value", {
                                            get: input._valueGet,
                                            set: input._valueSet
                                        });
                                    }
                                } else if (document.__lookupGetter__ && input.__lookupGetter__("value")) {
                                    if (input._valueGet) {
                                        input.__defineGetter__("value", input._valueGet);
                                        input.__defineSetter__("value", input._valueSet);
                                    }
                                }
                                try { //try catch needed for IE7 as it does not supports deleting fns
                                    delete input._valueGet;
                                    delete input._valueSet;
                                } catch (e) {
                                    input._valueGet = undefined;
                                    input._valueSet = undefined;

                                }
                            }
                        });
                        break;
                    case "getemptymask": //return the default (empty) mask value, usefull for setting the default value in validation
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['_buffer'].join('');
                        }
                        else return "";
                    case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value 
                        return this.data('_inputmask') ? !this.data('_inputmask')['opts'].autoUnmask : false;
                    case "isComplete":
                        masksets = this.data('_inputmask')['masksets'];
                        activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                        opts = this.data('_inputmask')['opts'];
                        return maskScope(masksets, activeMasksetIndex, opts, { "action": "isComplete", "buffer": this[0]._valueGet().split('') });
                    case "getmetadata": //return mask metadata if exists
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['metadata'];
                        }
                        else return undefined;
                    default:
                        //check if the fn is an alias
                        if (!resolveAlias(fn, options, opts)) {
                            //maybe fn is a mask so we try
                            //set mask
                            opts.mask = fn;
                        }
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }
                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                        });

                        break;
                }
            } else if (typeof fn == "object") {
                opts = $.extend(true, {}, $.inputmask.defaults, fn);

                resolveAlias(opts.alias, fn, opts); //resolve aliases
                masksets = generateMaskSets(opts);
                if (masksets.length == 0) { return this; }
                return this.each(function () {
                    maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts, { "action": "mask", "el": this });
                });
            } else if (fn == undefined) {
                //look for data-inputmask atribute - the attribute should only contain optipns
                return this.each(function () {
                    var attrOptions = $(this).attr("data-inputmask");
                    if (attrOptions && attrOptions != "") {
                        try {
                            attrOptions = attrOptions.replace(new RegExp("'", "g"), '"');
                            var dataoptions = $.parseJSON("{" + attrOptions + "}");
                            $.extend(true, dataoptions, options);
                            opts = $.extend(true, {}, $.inputmask.defaults, dataoptions);
                            resolveAlias(opts.alias, dataoptions, opts);
                            opts.alias = undefined;
                            $(this).inputmask(opts);
                        } catch (ex) { } //need a more relax parseJSON
                    }
                });
            }
        };
    }
})(jQuery);

/*!jQuery Knob*/
/**
 * Downward compatible, touchable dial
 *
 * Version: 1.2.11
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2012 Anthony Terrien
 * Under MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Thanks to vor, eskimoblood, spiffistan, FabrizioC
 */
(function (factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    /**
     * Kontrol library
     */
    "use strict";

    /**
     * Definition of globals and core
     */
    var k = {}, // kontrol
        max = Math.max,
        min = Math.min;

    k.c = {};
    k.c.d = $(document);
    k.c.t = function (e) {
        return e.originalEvent.touches.length - 1;
    };

    /**
     * Kontrol Object
     *
     * Definition of an abstract UI control
     *
     * Each concrete component must call this one.
     * <code>
     * k.o.call(this);
     * </code>
     */
    k.o = function () {
        var s = this;

        this.o = null; // array of options
        this.$ = null; // jQuery wrapped element
        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement
        this.g = null; // deprecated 2D graphics context for 'pre-rendering'
        this.v = null; // value ; mixed array or integer
        this.cv = null; // change value ; not commited value
        this.x = 0; // canvas x position
        this.y = 0; // canvas y position
        this.w = 0; // canvas width
        this.h = 0; // canvas height
        this.$c = null; // jQuery canvas element
        this.c = null; // rendered canvas context
        this.t = 0; // touches index
        this.isInit = false;
        this.fgColor = null; // main color
        this.pColor = null; // previous color
        this.dH = null; // draw hook
        this.cH = null; // change hook
        this.eH = null; // cancel hook
        this.rH = null; // release hook
        this.scale = 1; // scale factor
        this.relative = false;
        this.relativeWidth = false;
        this.relativeHeight = false;
        this.$div = null; // component div

        this.run = function () {
            var cf = function (e, conf) {
                var k;
                for (k in conf) {
                    s.o[k] = conf[k];
                }
                s._carve().init();
                s._configure()
                 ._draw();
            };

            if (this.$.data('kontroled')) return;
            this.$.data('kontroled', true);

            this.extend();
            this.o = $.extend({
                    // Config
                    min: this.$.data('min') !== undefined ? this.$.data('min') : 0,
                    max: this.$.data('max') !== undefined ? this.$.data('max') : 100,
                    stopper: true,
                    readOnly: this.$.data('readonly') || (this.$.attr('readonly') === 'readonly'),

                    // UI
                    cursor: this.$.data('cursor') === true && 30
                            || this.$.data('cursor') || 0,
                    thickness: this.$.data('thickness')
                               && Math.max(Math.min(this.$.data('thickness'), 1), 0.01)
                               || 0.35,
                    lineCap: this.$.data('linecap') || 'butt',
                    width: this.$.data('width') || 200,
                    height: this.$.data('height') || 200,
                    displayInput: this.$.data('displayinput') == null || this.$.data('displayinput'),
                    displayPrevious: this.$.data('displayprevious'),
                    fgColor: this.$.data('fgcolor') || '#87CEEB',
                    inputColor: this.$.data('inputcolor'),
                    font: this.$.data('font') || 'Arial',
                    fontWeight: this.$.data('font-weight') || 'bold',
                    inline: false,
                    step: this.$.data('step') || 1,
                    rotation: this.$.data('rotation'),

                    // Hooks
                    draw: null, // function () {}
                    change: null, // function (value) {}
                    cancel: null, // function () {}
                    release: null, // function (value) {}

                    // Output formatting, allows to add unit: %, ms ...
                    format: function(v) {
                        return v;
                    },
                    parse: function (v) {
                        return parseFloat(v);
                    }
                }, this.o
            );

            // finalize options
            this.o.flip = this.o.rotation === 'anticlockwise' || this.o.rotation === 'acw';
            if (!this.o.inputColor) {
                this.o.inputColor = this.o.fgColor;
            }

            // routing value
            if (this.$.is('fieldset')) {

                // fieldset = array of integer
                this.v = {};
                this.i = this.$.find('input');
                this.i.each(function(k) {
                    var $this = $(this);
                    s.i[k] = $this;
                    s.v[k] = s.o.parse($this.val());

                    $this.bind(
                        'change blur',
                        function () {
                            var val = {};
                            val[k] = $this.val();
                            s.val(s._validate(val));
                        }
                    );
                });
                this.$.find('legend').remove();
            } else {

                // input = integer
                this.i = this.$;
                this.v = this.o.parse(this.$.val());
                this.v === '' && (this.v = this.o.min);
                this.$.bind(
                    'change blur',
                    function () {
                        s.val(s._validate(s.o.parse(s.$.val())));
                    }
                );

            }

            !this.o.displayInput && this.$.hide();

            // adds needed DOM elements (canvas, div)
            this.$c = $(document.createElement('canvas')).attr({
                width: this.o.width,
                height: this.o.height
            });

            // wraps all elements in a div
            // add to DOM before Canvas init is triggered
            this.$div = $('<div style="'
                + (this.o.inline ? 'display:inline;' : '')
                + 'width:' + this.o.width + 'px;height:' + this.o.height + 'px;'
                + '"></div>');

            this.$.wrap(this.$div).before(this.$c);
            this.$div = this.$.parent();

            if (typeof G_vmlCanvasManager !== 'undefined') {
                G_vmlCanvasManager.initElement(this.$c[0]);
            }

            this.c = this.$c[0].getContext ? this.$c[0].getContext('2d') : null;

            if (!this.c) {
                throw {
                    name:        "CanvasNotSupportedException",
                    message:     "Canvas not supported. Please use excanvas on IE8.0.",
                    toString:    function(){return this.name + ": " + this.message}
                }
            }

            // hdpi support
            this.scale = (window.devicePixelRatio || 1) / (
                            this.c.webkitBackingStorePixelRatio ||
                            this.c.mozBackingStorePixelRatio ||
                            this.c.msBackingStorePixelRatio ||
                            this.c.oBackingStorePixelRatio ||
                            this.c.backingStorePixelRatio || 1
                         );

            // detects relative width / height
            this.relativeWidth =  this.o.width % 1 !== 0
                                  && this.o.width.indexOf('%');
            this.relativeHeight = this.o.height % 1 !== 0
                                  && this.o.height.indexOf('%');
            this.relative = this.relativeWidth || this.relativeHeight;

            // computes size and carves the component
            this._carve();

            // prepares props for transaction
            if (this.v instanceof Object) {
                this.cv = {};
                this.copy(this.v, this.cv);
            } else {
                this.cv = this.v;
            }

            // binds configure event
            this.$
                .bind("configure", cf)
                .parent()
                .bind("configure", cf);

            // finalize init
            this._listen()
                ._configure()
                ._xy()
                .init();

            this.isInit = true;

            this.$.val(this.o.format(this.v));
            this._draw();

            return this;
        };

        this._carve = function() {
            if (this.relative) {
                var w = this.relativeWidth ?
                        this.$div.parent().width() *
                        parseInt(this.o.width) / 100
                        : this.$div.parent().width(),
                    h = this.relativeHeight ?
                        this.$div.parent().height() *
                        parseInt(this.o.height) / 100
                        : this.$div.parent().height();

                // apply relative
                this.w = this.h = Math.min(w, h);
            } else {
                this.w = this.o.width;
                this.h = this.o.height;
            }

            // finalize div
            this.$div.css({
                'width': this.w + 'px',
                'height': this.h + 'px'
            });

            // finalize canvas with computed width
            this.$c.attr({
                width: this.w,
                height: this.h
            });

            // scaling
            if (this.scale !== 1) {
                this.$c[0].width = this.$c[0].width * this.scale;
                this.$c[0].height = this.$c[0].height * this.scale;
                this.$c.width(this.w);
                this.$c.height(this.h);
            }

            return this;
        }

        this._draw = function () {

            // canvas pre-rendering
            var d = true;

            s.g = s.c;

            s.clear();

            s.dH && (d = s.dH());

            d !== false && s.draw();
        };

        this._touch = function (e) {
            var touchMove = function (e) {
                var v = s.xy2val(
                            e.originalEvent.touches[s.t].pageX,
                            e.originalEvent.touches[s.t].pageY
                        );

                if (v == s.cv) return;

                if (s.cH && s.cH(v) === false) return;

                s.change(s._validate(v));
                s._draw();
            };

            // get touches index
            this.t = k.c.t(e);

            // First touch
            touchMove(e);

            // Touch events listeners
            k.c.d
                .bind("touchmove.k", touchMove)
                .bind(
                    "touchend.k",
                    function () {
                        k.c.d.unbind('touchmove.k touchend.k');
                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._mouse = function (e) {
            var mouseMove = function (e) {
                var v = s.xy2val(e.pageX, e.pageY);

                if (v == s.cv) return;

                if (s.cH && (s.cH(v) === false)) return;

                s.change(s._validate(v));
                s._draw();
            };

            // First click
            mouseMove(e);

            // Mouse events listeners
            k.c.d
                .bind("mousemove.k", mouseMove)
                .bind(
                    // Escape key cancel current change
                    "keyup.k",
                    function (e) {
                        if (e.keyCode === 27) {
                            k.c.d.unbind("mouseup.k mousemove.k keyup.k");

                            if (s.eH && s.eH() === false)
                                return;

                            s.cancel();
                        }
                    }
                )
                .bind(
                    "mouseup.k",
                    function (e) {
                        k.c.d.unbind('mousemove.k mouseup.k keyup.k');
                        s.val(s.cv);
                    }
                );

            return this;
        };

        this._xy = function () {
            var o = this.$c.offset();
            this.x = o.left;
            this.y = o.top;

            return this;
        };

        this._listen = function () {
            if (!this.o.readOnly) {
                this.$c
                    .bind(
                        "mousedown",
                        function (e) {
                            e.preventDefault();
                            s._xy()._mouse(e);
                        }
                    )
                    .bind(
                        "touchstart",
                        function (e) {
                            e.preventDefault();
                            s._xy()._touch(e);
                        }
                    );

                this.listen();
            } else {
                this.$.attr('readonly', 'readonly');
            }

            if (this.relative) {
                $(window).resize(function() {
                    s._carve().init();
                    s._draw();
                });
            }

            return this;
        };

        this._configure = function () {

            // Hooks
            if (this.o.draw) this.dH = this.o.draw;
            if (this.o.change) this.cH = this.o.change;
            if (this.o.cancel) this.eH = this.o.cancel;
            if (this.o.release) this.rH = this.o.release;

            if (this.o.displayPrevious) {
                this.pColor = this.h2rgba(this.o.fgColor, "0.4");
                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");
            } else {
                this.fgColor = this.o.fgColor;
            }

            return this;
        };

        this._clear = function () {
            this.$c[0].width = this.$c[0].width;
        };

        this._validate = function (v) {
            var val = (~~ (((v < 0) ? -0.5 : 0.5) + (v/this.o.step))) * this.o.step;
            return Math.round(val * 100) / 100;
        };

        // Abstract methods
        this.listen = function () {}; // on start, one time
        this.extend = function () {}; // each time configure triggered
        this.init = function () {}; // each time configure triggered
        this.change = function (v) {}; // on change
        this.val = function (v) {}; // on release
        this.xy2val = function (x, y) {}; //
        this.draw = function () {}; // on change / on release
        this.clear = function () { this._clear(); };

        // Utils
        this.h2rgba = function (h, a) {
            var rgb;
            h = h.substring(1,7)
            rgb = [
                parseInt(h.substring(0,2), 16),
                parseInt(h.substring(2,4), 16),
                parseInt(h.substring(4,6), 16)
            ];

            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
        };

        this.copy = function (f, t) {
            for (var i in f) {
                t[i] = f[i];
            }
        };
    };


    /**
     * k.Dial
     */
    k.Dial = function () {
        k.o.call(this);

        this.startAngle = null;
        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.cursorExt = null;
        this.w2 = null;
        this.PI2 = 2*Math.PI;

        this.extend = function () {
            this.o = $.extend({
                bgColor: this.$.data('bgcolor') || '#EEEEEE',
                angleOffset: this.$.data('angleoffset') || 0,
                angleArc: this.$.data('anglearc') || 360,
                inline: true
            }, this.o);
        };

        this.val = function (v, triggerRelease) {
            if (null != v) {

                // reverse format
                v = this.o.parse(v);

                if (triggerRelease !== false
                    && v != this.v
                    && this.rH
                    && this.rH(v) === false) { return; }

                this.cv = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;
                this.v = this.cv;
                this.$.val(this.o.format(this.v));
                this._draw();
            } else {
                return this.v;
            }
        };

        this.xy2val = function (x, y) {
            var a, ret;

            a = Math.atan2(
                        x - (this.x + this.w2),
                        - (y - this.y - this.w2)
                    ) - this.angleOffset;

            if (this.o.flip) {
                a = this.angleArc - a - this.PI2;
            }

            if (this.angleArc != this.PI2 && (a < 0) && (a > -0.5)) {

                // if isset angleArc option, set to min if .5 under min
                a = 0;
            } else if (a < 0) {
                a += this.PI2;
            }

            ret = (a * (this.o.max - this.o.min) / this.angleArc) + this.o.min;

            this.o.stopper && (ret = max(min(ret, this.o.max), this.o.min));

            return ret;
        };

        this.listen = function () {

            // bind MouseWheel
            var s = this, mwTimerStop,
                mwTimerRelease,
                mw = function (e) {
                    e.preventDefault();

                    var ori = e.originalEvent,
                        deltaX = ori.detail || ori.wheelDeltaX,
                        deltaY = ori.detail || ori.wheelDeltaY,
                        v = s._validate(s.o.parse(s.$.val()))
                            + (
                                deltaX > 0 || deltaY > 0
                                ? s.o.step
                                : deltaX < 0 || deltaY < 0 ? -s.o.step : 0
                              );

                    v = max(min(v, s.o.max), s.o.min);

                    s.val(v, false);

                    if (s.rH) {
                        // Handle mousewheel stop
                        clearTimeout(mwTimerStop);
                        mwTimerStop = setTimeout(function () {
                            s.rH(v);
                            mwTimerStop = null;
                        }, 100);

                        // Handle mousewheel releases
                        if (!mwTimerRelease) {
                            mwTimerRelease = setTimeout(function () {
                                if (mwTimerStop)
                                    s.rH(v);
                                mwTimerRelease = null;
                            }, 200);
                        }
                    }
                },
                kval,
                to,
                m = 1,
                kv = {
                    37: -s.o.step,
                    38: s.o.step,
                    39: s.o.step,
                    40: -s.o.step
                };

            this.$
                .bind(
                    "keydown",
                    function (e) {
                        var kc = e.keyCode;

                        // numpad support
                        if (kc >= 96 && kc <= 105) {
                            kc = e.keyCode = kc - 48;
                        }

                        kval = parseInt(String.fromCharCode(kc));

                        if (isNaN(kval)) {
                            (kc !== 13)                     // enter
                            && kc !== 8                     // bs
                            && kc !== 9                     // tab
                            && kc !== 189                   // -
                            && (kc !== 190
                                || s.$.val().match(/\./))   // . allowed once
                            && e.preventDefault();

                            // arrows
                            if ($.inArray(kc,[37,38,39,40]) > -1) {
                                e.preventDefault();

                                var v = s.o.parse(s.$.val()) + kv[kc] * m;
                                s.o.stopper && (v = max(min(v, s.o.max), s.o.min));

                                s.change(s._validate(v));
                                s._draw();

                                // long time keydown speed-up
                                to = window.setTimeout(function () {
                                    m *= 2;
                                }, 30);
                            }
                        }
                    }
                )
                .bind(
                    "keyup",
                    function (e) {
                        if (isNaN(kval)) {
                            if (to) {
                                window.clearTimeout(to);
                                to = null;
                                m = 1;
                                s.val(s.$.val());
                            }
                        } else {
                            // kval postcond
                            (s.$.val() > s.o.max && s.$.val(s.o.max))
                            || (s.$.val() < s.o.min && s.$.val(s.o.min));
                        }
                    }
                );

            this.$c.bind("mousewheel DOMMouseScroll", mw);
            this.$.bind("mousewheel DOMMouseScroll", mw)
        };

        this.init = function () {
            if (this.v < this.o.min
                || this.v > this.o.max) { this.v = this.o.min; }

            this.$.val(this.v);
            this.w2 = this.w / 2;
            this.cursorExt = this.o.cursor / 100;
            this.xy = this.w2 * this.scale;
            this.lineWidth = this.xy * this.o.thickness;
            this.lineCap = this.o.lineCap;
            this.radius = this.xy - this.lineWidth / 2;

            this.o.angleOffset
            && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);

            this.o.angleArc
            && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);

            // deg to rad
            this.angleOffset = this.o.angleOffset * Math.PI / 180;
            this.angleArc = this.o.angleArc * Math.PI / 180;

            // compute start and end angles
            this.startAngle = 1.5 * Math.PI + this.angleOffset;
            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;

            var s = max(
                String(Math.abs(this.o.max)).length,
                String(Math.abs(this.o.min)).length,
                2
            ) + 2;

            this.o.displayInput
                && this.i.css({
                        'width' : ((this.w / 2 + 4) >> 0) + 'px',
                        'height' : ((this.w / 3) >> 0) + 'px',
                        'position' : 'absolute',
                        'vertical-align' : 'middle',
                        'margin-top' : ((this.w / 3) >> 0) + 'px',
                        'margin-left' : '-' + ((this.w * 3 / 4 + 2) >> 0) + 'px',
                        'border' : 0,
                        'background' : 'none',
                        'font' : this.o.fontWeight + ' ' + ((this.w / s) >> 0) + 'px ' + this.o.font,
                        'text-align' : 'center',
                        'color' : this.o.inputColor || this.o.fgColor,
                        'padding' : '0px',
                        '-webkit-appearance': 'none'
                        }) || this.i.css({
                            'width': '0px',
                            'visibility': 'hidden'
                        });
        };

        this.change = function (v) {
            this.cv = v;
            this.$.val(this.o.format(v));
        };

        this.angle = function (v) {
            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);
        };

        this.arc = function (v) {
          var sa, ea;
          v = this.angle(v);
          if (this.o.flip) {
              sa = this.endAngle + 0.00001;
              ea = sa - v - 0.00001;
          } else {
              sa = this.startAngle - 0.00001;
              ea = sa + v + 0.00001;
          }
          this.o.cursor
              && (sa = ea - this.cursorExt)
              && (ea = ea + this.cursorExt);

          return {
              s: sa,
              e: ea,
              d: this.o.flip && !this.o.cursor
          };
        };

        this.draw = function () {
            var c = this.g,                 // context
                a = this.arc(this.cv),      // Arc
                pa,                         // Previous arc
                r = 1;

            c.lineWidth = this.lineWidth;
            c.lineCap = this.lineCap;

            if (this.o.bgColor !== "none") {
                c.beginPath();
                    c.strokeStyle = this.o.bgColor;
                    c.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true);
                c.stroke();
            }

            if (this.o.displayPrevious) {
                pa = this.arc(this.v);
                c.beginPath();
                c.strokeStyle = this.pColor;
                c.arc(this.xy, this.xy, this.radius, pa.s, pa.e, pa.d);
                c.stroke();
                r = this.cv == this.v;
            }

            c.beginPath();
            c.strokeStyle = r ? this.o.fgColor : this.fgColor ;
            c.arc(this.xy, this.xy, this.radius, a.s, a.e, a.d);
            c.stroke();
        };

        this.cancel = function () {
            this.val(this.v);
        };
    };

    $.fn.dial = $.fn.knob = function (o) {
        return this.each(
            function () {
                var d = new k.Dial();
                d.o = o;
                d.$ = $(this);
                d.run();
            }
        ).parent();
    };

}));

(function($){$.fn.extend({slimScroll:function(options){var defaults={width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:false,disableFadeOut:false,railVisible:false,railColor:"#333",railOpacity:.2,railDraggable:true,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:false,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"};var o=$.extend(defaults,options);this.each(function(){var isOverPanel,isOverBar,isDragg,queueHide,touchDif,barHeight,percentScroll,lastScroll,divS="<div></div>",minBarHeight=30,releaseScroll=false;var me=$(this);if(me.parent().hasClass(o.wrapperClass)){var offset=me.scrollTop();bar=me.parent().find("."+o.barClass);rail=me.parent().find("."+o.railClass);getBarHeight();if($.isPlainObject(options)){if("height"in options&&options.height=="auto"){me.parent().css("height","auto");me.css("height","auto");var height=me.parent().parent().height();me.parent().css("height",height);me.css("height",height)}if("scrollTo"in options){offset=parseInt(o.scrollTo)}else if("scrollBy"in options){offset+=parseInt(o.scrollBy)}else if("destroy"in options){bar.remove();rail.remove();me.unwrap();return}scrollContent(offset,false,true)}return}else if($.isPlainObject(options)){if("destroy"in options){return}}o.height=o.height=="auto"?me.parent().height():o.height;var wrapper=$(divS).addClass(o.wrapperClass).css({position:"relative",overflow:"hidden",width:o.width,height:o.height});me.css({overflow:"hidden",width:o.width,height:o.height,"-ms-touch-action":"none"});var rail=$(divS).addClass(o.railClass).css({width:o.size,height:"100%",position:"absolute",top:0,display:o.alwaysVisible&&o.railVisible?"block":"none","border-radius":o.railBorderRadius,background:o.railColor,opacity:o.railOpacity,zIndex:90});var bar=$(divS).addClass(o.barClass).css({background:o.color,width:o.size,position:"absolute",top:0,opacity:o.opacity,display:o.alwaysVisible?"block":"none","border-radius":o.borderRadius,BorderRadius:o.borderRadius,MozBorderRadius:o.borderRadius,WebkitBorderRadius:o.borderRadius,zIndex:99});var posCss=o.position=="right"?{right:o.distance}:{left:o.distance};rail.css(posCss);bar.css(posCss);me.wrap(wrapper);me.parent().append(bar);me.parent().append(rail);if(o.railDraggable){bar.bind("mousedown",function(e){var $doc=$(document);isDragg=true;t=parseFloat(bar.css("top"));pageY=e.pageY;$doc.bind("mousemove.slimscroll",function(e){currTop=t+e.pageY-pageY;bar.css("top",currTop);scrollContent(0,bar.position().top,false)});$doc.bind("mouseup.slimscroll",function(e){isDragg=false;hideBar();$doc.unbind(".slimscroll")});return false}).bind("selectstart.slimscroll",function(e){e.stopPropagation();e.preventDefault();return false})}rail.hover(function(){showBar()},function(){hideBar()});bar.hover(function(){isOverBar=true},function(){isOverBar=false});me.hover(function(){isOverPanel=true;showBar();hideBar()},function(){isOverPanel=false;hideBar()});if(window.navigator.msPointerEnabled){me.bind("MSPointerDown",function(e,b){if(e.originalEvent.targetTouches.length){touchDif=e.originalEvent.targetTouches[0].pageY}});me.bind("MSPointerMove",function(e){e.originalEvent.preventDefault();if(e.originalEvent.targetTouches.length){var diff=(touchDif-e.originalEvent.targetTouches[0].pageY)/o.touchScrollStep;scrollContent(diff,true);touchDif=e.originalEvent.targetTouches[0].pageY}})}else{me.bind("touchstart",function(e,b){if(e.originalEvent.touches.length){touchDif=e.originalEvent.touches[0].pageY}});me.bind("touchmove",function(e){if(!releaseScroll){e.originalEvent.preventDefault()}if(e.originalEvent.touches.length){var diff=(touchDif-e.originalEvent.touches[0].pageY)/o.touchScrollStep;scrollContent(diff,true);touchDif=e.originalEvent.touches[0].pageY}})}getBarHeight();if(o.start==="bottom"){bar.css({top:me.outerHeight()-bar.outerHeight()});scrollContent(0,true)}else if(o.start!=="top"){scrollContent($(o.start).position().top,null,true);if(!o.alwaysVisible){bar.hide()}}attachWheel();function _onWheel(e){if(!isOverPanel){return}var e=e||window.event;var delta=0;if(e.wheelDelta){delta=-e.wheelDelta/120}if(e.detail){delta=e.detail/3}var target=e.target||e.srcTarget||e.srcElement;if($(target).closest("."+o.wrapperClass).is(me.parent())){scrollContent(delta,true)}if(e.preventDefault&&!releaseScroll){e.preventDefault()}if(!releaseScroll){e.returnValue=false}}function scrollContent(y,isWheel,isJump){releaseScroll=false;var delta=y;var maxTop=me.outerHeight()-bar.outerHeight();if(isWheel){delta=parseInt(bar.css("top"))+y*parseInt(o.wheelStep)/100*bar.outerHeight();delta=Math.min(Math.max(delta,0),maxTop);delta=y>0?Math.ceil(delta):Math.floor(delta);bar.css({top:delta+"px"})}percentScroll=parseInt(bar.css("top"))/(me.outerHeight()-bar.outerHeight());delta=percentScroll*(me[0].scrollHeight-me.outerHeight());if(isJump){delta=y;var offsetTop=delta/me[0].scrollHeight*me.outerHeight();offsetTop=Math.min(Math.max(offsetTop,0),maxTop);bar.css({top:offsetTop+"px"})}me.scrollTop(delta);me.trigger("slimscrolling",~~delta);showBar();hideBar()}function attachWheel(){if(window.addEventListener){this.addEventListener("DOMMouseScroll",_onWheel,false);this.addEventListener("mousewheel",_onWheel,false)}else{document.attachEvent("onmousewheel",_onWheel)}}function getBarHeight(){barHeight=Math.max(me.outerHeight()/me[0].scrollHeight*me.outerHeight(),minBarHeight);bar.css({height:barHeight+"px"});var display=barHeight==me.outerHeight()?"none":"block";bar.css({display:display})}function showBar(){getBarHeight();clearTimeout(queueHide);if(percentScroll==~~percentScroll){releaseScroll=o.allowPageScroll;if(lastScroll!=percentScroll){var msg=~~percentScroll==0?"top":"bottom";me.trigger("slimscroll",msg)}}else{releaseScroll=false}lastScroll=percentScroll;if(barHeight>=me.outerHeight()){releaseScroll=true;return}bar.stop(true,true).fadeIn("fast");if(o.railVisible){rail.stop(true,true).fadeIn("fast")}}function hideBar(){if(!o.alwaysVisible){queueHide=setTimeout(function(){if(!(o.disableFadeOut&&isOverPanel)&&!isOverBar&&!isDragg){bar.fadeOut("slow");rail.fadeOut("slow")}},1e3)}}});return this}});$.fn.extend({slimscroll:$.fn.slimScroll})})(jQuery);
/* jquery.sparkline 2.1.2 - http://omnipotent.net/jquery.sparkline/ 
** Licensed under the New BSD License - see above site for details */

(function(a,b,c){(function(a){typeof define=="function"&&define.amd?define(["jquery"],a):jQuery&&!jQuery.fn.sparkline&&a(jQuery)})(function(d){"use strict";var e={},f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L=0;f=function(){return{common:{type:"line",lineColor:"#00f",fillColor:"#cdf",defaultPixelsPerValue:3,width:"auto",height:"auto",composite:!1,tagValuesAttribute:"values",tagOptionsPrefix:"spark",enableTagOptions:!1,enableHighlight:!0,highlightLighten:1.4,tooltipSkipNull:!0,tooltipPrefix:"",tooltipSuffix:"",disableHiddenCheck:!1,numberFormatter:!1,numberDigitGroupCount:3,numberDigitGroupSep:",",numberDecimalMark:".",disableTooltips:!1,disableInteraction:!1},line:{spotColor:"#f80",highlightSpotColor:"#5f5",highlightLineColor:"#f22",spotRadius:1.5,minSpotColor:"#f80",maxSpotColor:"#f80",lineWidth:1,normalRangeMin:c,normalRangeMax:c,normalRangeColor:"#ccc",drawNormalOnTop:!1,chartRangeMin:c,chartRangeMax:c,chartRangeMinX:c,chartRangeMaxX:c,tooltipFormat:new h('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{y}}{{suffix}}')},bar:{barColor:"#3366cc",negBarColor:"#f44",stackedBarColor:["#3366cc","#dc3912","#ff9900","#109618","#66aa00","#dd4477","#0099c6","#990099"],zeroColor:c,nullColor:c,zeroAxis:!0,barWidth:4,barSpacing:1,chartRangeMax:c,chartRangeMin:c,chartRangeClip:!1,colorMap:c,tooltipFormat:new h('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{value}}{{suffix}}')},tristate:{barWidth:4,barSpacing:1,posBarColor:"#6f6",negBarColor:"#f44",zeroBarColor:"#999",colorMap:{},tooltipFormat:new h('<span style="color: {{color}}">&#9679;</span> {{value:map}}'),tooltipValueLookups:{map:{"-1":"Loss",0:"Draw",1:"Win"}}},discrete:{lineHeight:"auto",thresholdColor:c,thresholdValue:0,chartRangeMax:c,chartRangeMin:c,chartRangeClip:!1,tooltipFormat:new h("{{prefix}}{{value}}{{suffix}}")},bullet:{targetColor:"#f33",targetWidth:3,performanceColor:"#33f",rangeColors:["#d3dafe","#a8b6ff","#7f94ff"],base:c,tooltipFormat:new h("{{fieldkey:fields}} - {{value}}"),tooltipValueLookups:{fields:{r:"Range",p:"Performance",t:"Target"}}},pie:{offset:0,sliceColors:["#3366cc","#dc3912","#ff9900","#109618","#66aa00","#dd4477","#0099c6","#990099"],borderWidth:0,borderColor:"#000",tooltipFormat:new h('<span style="color: {{color}}">&#9679;</span> {{value}} ({{percent.1}}%)')},box:{raw:!1,boxLineColor:"#000",boxFillColor:"#cdf",whiskerColor:"#000",outlierLineColor:"#333",outlierFillColor:"#fff",medianColor:"#f00",showOutliers:!0,outlierIQR:1.5,spotRadius:1.5,target:c,targetColor:"#4a2",chartRangeMax:c,chartRangeMin:c,tooltipFormat:new h("{{field:fields}}: {{value}}"),tooltipFormatFieldlistKey:"field",tooltipValueLookups:{fields:{lq:"Lower Quartile",med:"Median",uq:"Upper Quartile",lo:"Left Outlier",ro:"Right Outlier",lw:"Left Whisker",rw:"Right Whisker"}}}}},E='.jqstooltip { position: absolute;left: 0px;top: 0px;visibility: hidden;background: rgb(0, 0, 0) transparent;background-color: rgba(0,0,0,0.6);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000);-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)";color: white;font: 10px arial, san serif;text-align: left;white-space: nowrap;padding: 5px;border: 1px solid white;z-index: 10000;}.jqsfield { color: white;font: 10px arial, san serif;text-align: left;}',g=function(){var a,b;return a=function(){this.init.apply(this,arguments)},arguments.length>1?(arguments[0]?(a.prototype=d.extend(new arguments[0],arguments[arguments.length-1]),a._super=arguments[0].prototype):a.prototype=arguments[arguments.length-1],arguments.length>2&&(b=Array.prototype.slice.call(arguments,1,-1),b.unshift(a.prototype),d.extend.apply(d,b))):a.prototype=arguments[0],a.prototype.cls=a,a},d.SPFormatClass=h=g({fre:/\{\{([\w.]+?)(:(.+?))?\}\}/g,precre:/(\w+)\.(\d+)/,init:function(a,b){this.format=a,this.fclass=b},render:function(a,b,d){var e=this,f=a,g,h,i,j,k;return this.format.replace(this.fre,function(){var a;return h=arguments[1],i=arguments[3],g=e.precre.exec(h),g?(k=g[2],h=g[1]):k=!1,j=f[h],j===c?"":i&&b&&b[i]?(a=b[i],a.get?b[i].get(j)||j:b[i][j]||j):(n(j)&&(d.get("numberFormatter")?j=d.get("numberFormatter")(j):j=s(j,k,d.get("numberDigitGroupCount"),d.get("numberDigitGroupSep"),d.get("numberDecimalMark"))),j)})}}),d.spformat=function(a,b){return new h(a,b)},i=function(a,b,c){return a<b?b:a>c?c:a},j=function(a,c){var d;return c===2?(d=b.floor(a.length/2),a.length%2?a[d]:(a[d-1]+a[d])/2):a.length%2?(d=(a.length*c+c)/4,d%1?(a[b.floor(d)]+a[b.floor(d)-1])/2:a[d-1]):(d=(a.length*c+2)/4,d%1?(a[b.floor(d)]+a[b.floor(d)-1])/2:a[d-1])},k=function(a){var b;switch(a){case"undefined":a=c;break;case"null":a=null;break;case"true":a=!0;break;case"false":a=!1;break;default:b=parseFloat(a),a==b&&(a=b)}return a},l=function(a){var b,c=[];for(b=a.length;b--;)c[b]=k(a[b]);return c},m=function(a,b){var c,d,e=[];for(c=0,d=a.length;c<d;c++)a[c]!==b&&e.push(a[c]);return e},n=function(a){return!isNaN(parseFloat(a))&&isFinite(a)},s=function(a,b,c,e,f){var g,h;a=(b===!1?parseFloat(a).toString():a.toFixed(b)).split(""),g=(g=d.inArray(".",a))<0?a.length:g,g<a.length&&(a[g]=f);for(h=g-c;h>0;h-=c)a.splice(h,0,e);return a.join("")},o=function(a,b,c){var d;for(d=b.length;d--;){if(c&&b[d]===null)continue;if(b[d]!==a)return!1}return!0},p=function(a){var b=0,c;for(c=a.length;c--;)b+=typeof a[c]=="number"?a[c]:0;return b},r=function(a){return d.isArray(a)?a:[a]},q=function(b){var c;a.createStyleSheet?a.createStyleSheet().cssText=b:(c=a.createElement("style"),c.type="text/css",a.getElementsByTagName("head")[0].appendChild(c),c[typeof a.body.style.WebkitAppearance=="string"?"innerText":"innerHTML"]=b)},d.fn.simpledraw=function(b,e,f,g){var h,i;if(f&&(h=this.data("_jqs_vcanvas")))return h;if(d.fn.sparkline.canvas===!1)return!1;if(d.fn.sparkline.canvas===c){var j=a.createElement("canvas");if(!j.getContext||!j.getContext("2d")){if(!a.namespaces||!!a.namespaces.v)return d.fn.sparkline.canvas=!1,!1;a.namespaces.add("v","urn:schemas-microsoft-com:vml","#default#VML"),d.fn.sparkline.canvas=function(a,b,c,d){return new J(a,b,c)}}else d.fn.sparkline.canvas=function(a,b,c,d){return new I(a,b,c,d)}}return b===c&&(b=d(this).innerWidth()),e===c&&(e=d(this).innerHeight()),h=d.fn.sparkline.canvas(b,e,this,g),i=d(this).data("_jqs_mhandler"),i&&i.registerCanvas(h),h},d.fn.cleardraw=function(){var a=this.data("_jqs_vcanvas");a&&a.reset()},d.RangeMapClass=t=g({init:function(a){var b,c,d=[];for(b in a)a.hasOwnProperty(b)&&typeof b=="string"&&b.indexOf(":")>-1&&(c=b.split(":"),c[0]=c[0].length===0?-Infinity:parseFloat(c[0]),c[1]=c[1].length===0?Infinity:parseFloat(c[1]),c[2]=a[b],d.push(c));this.map=a,this.rangelist=d||!1},get:function(a){var b=this.rangelist,d,e,f;if((f=this.map[a])!==c)return f;if(b)for(d=b.length;d--;){e=b[d];if(e[0]<=a&&e[1]>=a)return e[2]}return c}}),d.range_map=function(a){return new t(a)},u=g({init:function(a,b){var c=d(a);this.$el=c,this.options=b,this.currentPageX=0,this.currentPageY=0,this.el=a,this.splist=[],this.tooltip=null,this.over=!1,this.displayTooltips=!b.get("disableTooltips"),this.highlightEnabled=!b.get("disableHighlight")},registerSparkline:function(a){this.splist.push(a),this.over&&this.updateDisplay()},registerCanvas:function(a){var b=d(a.canvas);this.canvas=a,this.$canvas=b,b.mouseenter(d.proxy(this.mouseenter,this)),b.mouseleave(d.proxy(this.mouseleave,this)),b.click(d.proxy(this.mouseclick,this))},reset:function(a){this.splist=[],this.tooltip&&a&&(this.tooltip.remove(),this.tooltip=c)},mouseclick:function(a){var b=d.Event("sparklineClick");b.originalEvent=a,b.sparklines=this.splist,this.$el.trigger(b)},mouseenter:function(b){d(a.body).unbind("mousemove.jqs"),d(a.body).bind("mousemove.jqs",d.proxy(this.mousemove,this)),this.over=!0,this.currentPageX=b.pageX,this.currentPageY=b.pageY,this.currentEl=b.target,!this.tooltip&&this.displayTooltips&&(this.tooltip=new v(this.options),this.tooltip.updatePosition(b.pageX,b.pageY)),this.updateDisplay()},mouseleave:function(){d(a.body).unbind("mousemove.jqs");var b=this.splist,c=b.length,e=!1,f,g;this.over=!1,this.currentEl=null,this.tooltip&&(this.tooltip.remove(),this.tooltip=null);for(g=0;g<c;g++)f=b[g],f.clearRegionHighlight()&&(e=!0);e&&this.canvas.render()},mousemove:function(a){this.currentPageX=a.pageX,this.currentPageY=a.pageY,this.currentEl=a.target,this.tooltip&&this.tooltip.updatePosition(a.pageX,a.pageY),this.updateDisplay()},updateDisplay:function(){var a=this.splist,b=a.length,c=!1,e=this.$canvas.offset(),f=this.currentPageX-e.left,g=this.currentPageY-e.top,h,i,j,k,l;if(!this.over)return;for(j=0;j<b;j++)i=a[j],k=i.setRegionHighlight(this.currentEl,f,g),k&&(c=!0);if(c){l=d.Event("sparklineRegionChange"),l.sparklines=this.splist,this.$el.trigger(l);if(this.tooltip){h="";for(j=0;j<b;j++)i=a[j],h+=i.getCurrentRegionTooltip();this.tooltip.setContent(h)}this.disableHighlight||this.canvas.render()}k===null&&this.mouseleave()}}),v=g({sizeStyle:"position: static !important;display: block !important;visibility: hidden !important;float: left !important;",init:function(b){var c=b.get("tooltipClassname","jqstooltip"),e=this.sizeStyle,f;this.container=b.get("tooltipContainer")||a.body,this.tooltipOffsetX=b.get("tooltipOffsetX",10),this.tooltipOffsetY=b.get("tooltipOffsetY",12),d("#jqssizetip").remove(),d("#jqstooltip").remove(),this.sizetip=d("<div/>",{id:"jqssizetip",style:e,"class":c}),this.tooltip=d("<div/>",{id:"jqstooltip","class":c}).appendTo(this.container),f=this.tooltip.offset(),this.offsetLeft=f.left,this.offsetTop=f.top,this.hidden=!0,d(window).unbind("resize.jqs scroll.jqs"),d(window).bind("resize.jqs scroll.jqs",d.proxy(this.updateWindowDims,this)),this.updateWindowDims()},updateWindowDims:function(){this.scrollTop=d(window).scrollTop(),this.scrollLeft=d(window).scrollLeft(),this.scrollRight=this.scrollLeft+d(window).width(),this.updatePosition()},getSize:function(a){this.sizetip.html(a).appendTo(this.container),this.width=this.sizetip.width()+1,this.height=this.sizetip.height(),this.sizetip.remove()},setContent:function(a){if(!a){this.tooltip.css("visibility","hidden"),this.hidden=!0;return}this.getSize(a),this.tooltip.html(a).css({width:this.width,height:this.height,visibility:"visible"}),this.hidden&&(this.hidden=!1,this.updatePosition())},updatePosition:function(a,b){if(a===c){if(this.mousex===c)return;a=this.mousex-this.offsetLeft,b=this.mousey-this.offsetTop}else this.mousex=a-=this.offsetLeft,this.mousey=b-=this.offsetTop;if(!this.height||!this.width||this.hidden)return;b-=this.height+this.tooltipOffsetY,a+=this.tooltipOffsetX,b<this.scrollTop&&(b=this.scrollTop),a<this.scrollLeft?a=this.scrollLeft:a+this.width>this.scrollRight&&(a=this.scrollRight-this.width),this.tooltip.css({left:a,top:b})},remove:function(){this.tooltip.remove(),this.sizetip.remove(),this.sizetip=this.tooltip=c,d(window).unbind("resize.jqs scroll.jqs")}}),F=function(){q(E)},d(F),K=[],d.fn.sparkline=function(b,e){return this.each(function(){var f=new d.fn.sparkline.options(this,e),g=d(this),h,i;h=function(){var e,h,i,j,k,l,m;if(b==="html"||b===c){m=this.getAttribute(f.get("tagValuesAttribute"));if(m===c||m===null)m=g.html();e=m.replace(/(^\s*<!--)|(-->\s*$)|\s+/g,"").split(",")}else e=b;h=f.get("width")==="auto"?e.length*f.get("defaultPixelsPerValue"):f.get("width");if(f.get("height")==="auto"){if(!f.get("composite")||!d.data(this,"_jqs_vcanvas"))j=a.createElement("span"),j.innerHTML="a",g.html(j),i=d(j).innerHeight()||d(j).height(),d(j).remove(),j=null}else i=f.get("height");f.get("disableInteraction")?k=!1:(k=d.data(this,"_jqs_mhandler"),k?f.get("composite")||k.reset():(k=new u(this,f),d.data(this,"_jqs_mhandler",k)));if(f.get("composite")&&!d.data(this,"_jqs_vcanvas")){d.data(this,"_jqs_errnotify")||(alert("Attempted to attach a composite sparkline to an element with no existing sparkline"),d.data(this,"_jqs_errnotify",!0));return}l=new(d.fn.sparkline[f.get("type")])(this,e,f,h,i),l.render(),k&&k.registerSparkline(l)};if(d(this).html()&&!f.get("disableHiddenCheck")&&d(this).is(":hidden")||!d(this).parents("body").length){if(!f.get("composite")&&d.data(this,"_jqs_pending"))for(i=K.length;i;i--)K[i-1][0]==this&&K.splice(i-1,1);K.push([this,h]),d.data(this,"_jqs_pending",!0)}else h.call(this)})},d.fn.sparkline.defaults=f(),d.sparkline_display_visible=function(){var a,b,c,e=[];for(b=0,c=K.length;b<c;b++)a=K[b][0],d(a).is(":visible")&&!d(a).parents().is(":hidden")?(K[b][1].call(a),d.data(K[b][0],"_jqs_pending",!1),e.push(b)):!d(a).closest("html").length&&!d.data(a,"_jqs_pending")&&(d.data(K[b][0],"_jqs_pending",!1),e.push(b));for(b=e.length;b;b--)K.splice(e[b-1],1)},d.fn.sparkline.options=g({init:function(a,b){var c,f,g,h;this.userOptions=b=b||{},this.tag=a,this.tagValCache={},f=d.fn.sparkline.defaults,g=f.common,this.tagOptionsPrefix=b.enableTagOptions&&(b.tagOptionsPrefix||g.tagOptionsPrefix),h=this.getTagSetting("type"),h===e?c=f[b.type||g.type]:c=f[h],this.mergedOptions=d.extend({},g,c,b)},getTagSetting:function(a){var b=this.tagOptionsPrefix,d,f,g,h;if(b===!1||b===c)return e;if(this.tagValCache.hasOwnProperty(a))d=this.tagValCache.key;else{d=this.tag.getAttribute(b+a);if(d===c||d===null)d=e;else if(d.substr(0,1)==="["){d=d.substr(1,d.length-2).split(",");for(f=d.length;f--;)d[f]=k(d[f].replace(/(^\s*)|(\s*$)/g,""))}else if(d.substr(0,1)==="{"){g=d.substr(1,d.length-2).split(","),d={};for(f=g.length;f--;)h=g[f].split(":",2),d[h[0].replace(/(^\s*)|(\s*$)/g,"")]=k(h[1].replace(/(^\s*)|(\s*$)/g,""))}else d=k(d);this.tagValCache.key=d}return d},get:function(a,b){var d=this.getTagSetting(a),f;return d!==e?d:(f=this.mergedOptions[a])===c?b:f}}),d.fn.sparkline._base=g({disabled:!1,init:function(a,b,e,f,g){this.el=a,this.$el=d(a),this.values=b,this.options=e,this.width=f,this.height=g,this.currentRegion=c},initTarget:function(){var a=!this.options.get("disableInteraction");(this.target=this.$el.simpledraw(this.width,this.height,this.options.get("composite"),a))?(this.canvasWidth=this.target.pixelWidth,this.canvasHeight=this.target.pixelHeight):this.disabled=!0},render:function(){return this.disabled?(this.el.innerHTML="",!1):!0},getRegion:function(a,b){},setRegionHighlight:function(a,b,d){var e=this.currentRegion,f=!this.options.get("disableHighlight"),g;return b>this.canvasWidth||d>this.canvasHeight||b<0||d<0?null:(g=this.getRegion(a,b,d),e!==g?(e!==c&&f&&this.removeHighlight(),this.currentRegion=g,g!==c&&f&&this.renderHighlight(),!0):!1)},clearRegionHighlight:function(){return this.currentRegion!==c?(this.removeHighlight(),this.currentRegion=c,!0):!1},renderHighlight:function(){this.changeHighlight(!0)},removeHighlight:function(){this.changeHighlight(!1)},changeHighlight:function(a){},getCurrentRegionTooltip:function(){var a=this.options,b="",e=[],f,g,i,j,k,l,m,n,o,p,q,r,s,t;if(this.currentRegion===c)return"";f=this.getCurrentRegionFields(),q=a.get("tooltipFormatter");if(q)return q(this,a,f);a.get("tooltipChartTitle")&&(b+='<div class="jqs jqstitle">'+a.get("tooltipChartTitle")+"</div>\n"),g=this.options.get("tooltipFormat");if(!g)return"";d.isArray(g)||(g=[g]),d.isArray(f)||(f=[f]),m=this.options.get("tooltipFormatFieldlist"),n=this.options.get("tooltipFormatFieldlistKey");if(m&&n){o=[];for(l=f.length;l--;)p=f[l][n],(t=d.inArray(p,m))!=-1&&(o[t]=f[l]);f=o}i=g.length,s=f.length;for(l=0;l<i;l++){r=g[l],typeof r=="string"&&(r=new h(r)),j=r.fclass||"jqsfield";for(t=0;t<s;t++)if(!f[t].isNull||!a.get("tooltipSkipNull"))d.extend(f[t],{prefix:a.get("tooltipPrefix"),suffix:a.get("tooltipSuffix")}),k=r.render(f[t],a.get("tooltipValueLookups"),a),e.push('<div class="'+j+'">'+k+"</div>")}return e.length?b+e.join("\n"):""},getCurrentRegionFields:function(){},calcHighlightColor:function(a,c){var d=c.get("highlightColor"),e=c.get("highlightLighten"),f,g,h,j;if(d)return d;if(e){f=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(a)||/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(a);if(f){h=[],g=a.length===4?16:1;for(j=0;j<3;j++)h[j]=i(b.round(parseInt(f[j+1],16)*g*e),0,255);return"rgb("+h.join(",")+")"}}return a}}),w={changeHighlight:function(a){var b=this.currentRegion,c=this.target,e=this.regionShapes[b],f;e&&(f=this.renderRegion(b,a),d.isArray(f)||d.isArray(e)?(c.replaceWithShapes(e,f),this.regionShapes[b]=d.map(f,function(a){return a.id})):(c.replaceWithShape(e,f),this.regionShapes[b]=f.id))},render:function(){var a=this.values,b=this.target,c=this.regionShapes,e,f,g,h;if(!this.cls._super.render.call(this))return;for(g=a.length;g--;){e=this.renderRegion(g);if(e)if(d.isArray(e)){f=[];for(h=e.length;h--;)e[h].append(),f.push(e[h].id);c[g]=f}else e.append(),c[g]=e.id;else c[g]=null}b.render()}},d.fn.sparkline.line=x=g(d.fn.sparkline._base,{type:"line",init:function(a,b,c,d,e){x._super.init.call(this,a,b,c,d,e),this.vertices=[],this.regionMap=[],this.xvalues=[],this.yvalues=[],this.yminmax=[],this.hightlightSpotId=null,this.lastShapeId=null,this.initTarget()},getRegion:function(a,b,d){var e,f=this.regionMap;for(e=f.length;e--;)if(f[e]!==null&&b>=f[e][0]&&b<=f[e][1])return f[e][2];return c},getCurrentRegionFields:function(){var a=this.currentRegion;return{isNull:this.yvalues[a]===null,x:this.xvalues[a],y:this.yvalues[a],color:this.options.get("lineColor"),fillColor:this.options.get("fillColor"),offset:a}},renderHighlight:function(){var a=this.currentRegion,b=this.target,d=this.vertices[a],e=this.options,f=e.get("spotRadius"),g=e.get("highlightSpotColor"),h=e.get("highlightLineColor"),i,j;if(!d)return;f&&g&&(i=b.drawCircle(d[0],d[1],f,c,g),this.highlightSpotId=i.id,b.insertAfterShape(this.lastShapeId,i)),h&&(j=b.drawLine(d[0],this.canvasTop,d[0],this.canvasTop+this.canvasHeight,h),this.highlightLineId=j.id,b.insertAfterShape(this.lastShapeId,j))},removeHighlight:function(){var a=this.target;this.highlightSpotId&&(a.removeShapeId(this.highlightSpotId),this.highlightSpotId=null),this.highlightLineId&&(a.removeShapeId(this.highlightLineId),this.highlightLineId=null)},scanValues:function(){var a=this.values,c=a.length,d=this.xvalues,e=this.yvalues,f=this.yminmax,g,h,i,j,k;for(g=0;g<c;g++)h=a[g],i=typeof a[g]=="string",j=typeof a[g]=="object"&&a[g]instanceof Array,k=i&&a[g].split(":"),i&&k.length===2?(d.push(Number(k[0])),e.push(Number(k[1])),f.push(Number(k[1]))):j?(d.push(h[0]),e.push(h[1]),f.push(h[1])):(d.push(g),a[g]===null||a[g]==="null"?e.push(null):(e.push(Number(h)),f.push(Number(h))));this.options.get("xvalues")&&(d=this.options.get("xvalues")),this.maxy=this.maxyorg=b.max.apply(b,f),this.miny=this.minyorg=b.min.apply(b,f),this.maxx=b.max.apply(b,d),this.minx=b.min.apply(b,d),this.xvalues=d,this.yvalues=e,this.yminmax=f},processRangeOptions:function(){var a=this.options,b=a.get("normalRangeMin"),d=a.get("normalRangeMax");b!==c&&(b<this.miny&&(this.miny=b),d>this.maxy&&(this.maxy=d)),a.get("chartRangeMin")!==c&&(a.get("chartRangeClip")||a.get("chartRangeMin")<this.miny)&&(this.miny=a.get("chartRangeMin")),a.get("chartRangeMax")!==c&&(a.get("chartRangeClip")||a.get("chartRangeMax")>this.maxy)&&(this.maxy=a.get("chartRangeMax")),a.get("chartRangeMinX")!==c&&(a.get("chartRangeClipX")||a.get("chartRangeMinX")<this.minx)&&(this.minx=a.get("chartRangeMinX")),a.get("chartRangeMaxX")!==c&&(a.get("chartRangeClipX")||a.get("chartRangeMaxX")>this.maxx)&&(this.maxx=a.get("chartRangeMaxX"))},drawNormalRange:function(a,d,e,f,g){var h=this.options.get("normalRangeMin"),i=this.options.get("normalRangeMax"),j=d+b.round(e-e*((i-this.miny)/g)),k=b.round(e*(i-h)/g);this.target.drawRect(a,j,f,k,c,this.options.get("normalRangeColor")).append()},render:function(){var a=this.options,e=this.target,f=this.canvasWidth,g=this.canvasHeight,h=this.vertices,i=a.get("spotRadius"),j=this.regionMap,k,l,m,n,o,p,q,r,s,u,v,w,y,z,A,B,C,D,E,F,G,H,I,J,K;if(!x._super.render.call(this))return;this.scanValues(),this.processRangeOptions(),I=this.xvalues,J=this.yvalues;if(!this.yminmax.length||this.yvalues.length<2)return;n=o=0,k=this.maxx-this.minx===0?1:this.maxx-this.minx,l=this.maxy-this.miny===0?1:this.maxy-this.miny,m=this.yvalues.length-1,i&&(f<i*4||g<i*4)&&(i=0);if(i){G=a.get("highlightSpotColor")&&!a.get("disableInteraction");if(G||a.get("minSpotColor")||a.get("spotColor")&&J[m]===this.miny)g-=b.ceil(i);if(G||a.get("maxSpotColor")||a.get("spotColor")&&J[m]===this.maxy)g-=b.ceil(i),n+=b.ceil(i);if(G||(a.get("minSpotColor")||a.get("maxSpotColor"))&&(J[0]===this.miny||J[0]===this.maxy))o+=b.ceil(i),f-=b.ceil(i);if(G||a.get("spotColor")||a.get("minSpotColor")||a.get("maxSpotColor")&&(J[m]===this.miny||J[m]===this.maxy))f-=b.ceil(i)}g--,a.get("normalRangeMin")!==c&&!a.get("drawNormalOnTop")&&this.drawNormalRange(o,n,g,f,l),q=[],r=[q],z=A=null,B=J.length;for(K=0;K<B;K++)s=I[K],v=I[K+1],u=J[K],w=o+b.round((s-this.minx)*(f/k)),y=K<B-1?o+b.round((v-this.minx)*(f/k)):f,A=w+(y-w)/2,j[K]=[z||0,A,K],z=A,u===null?K&&(J[K-1]!==null&&(q=[],r.push(q)),h.push(null)):(u<this.miny&&(u=this.miny),u>this.maxy&&(u=this.maxy),q.length||q.push([w,n+g]),p=[w,n+b.round(g-g*((u-this.miny)/l))],q.push(p),h.push(p));C=[],D=[],E=r.length;for(K=0;K<E;K++)q=r[K],q.length&&(a.get("fillColor")&&(q.push([q[q.length-1][0],n+g]),D.push(q.slice(0)),q.pop()),q.length>2&&(q[0]=[q[0][0],q[1][1]]),C.push(q));E=D.length;for(K=0;K<E;K++)e.drawShape(D[K],a.get("fillColor"),a.get("fillColor")).append();a.get("normalRangeMin")!==c&&a.get("drawNormalOnTop")&&this.drawNormalRange(o,n,g,f,l),E=C.length;for(K=0;K<E;K++)e.drawShape(C[K],a.get("lineColor"),c,a.get("lineWidth")).append();if(i&&a.get("valueSpots")){F=a.get("valueSpots"),F.get===c&&(F=new t(F));for(K=0;K<B;K++)H=F.get(J[K]),H&&e.drawCircle(o+b.round((I[K]-this.minx)*(f/k)),n+b.round(g-g*((J[K]-this.miny)/l)),i,c,H).append()}i&&a.get("spotColor")&&J[m]!==null&&e.drawCircle(o+b.round((I[I.length-1]-this.minx)*(f/k)),n+b.round(g-g*((J[m]-this.miny)/l)),i,c,a.get("spotColor")).append(),this.maxy!==this.minyorg&&(i&&a.get("minSpotColor")&&(s=I[d.inArray(this.minyorg,J)],e.drawCircle(o+b.round((s-this.minx)*(f/k)),n+b.round(g-g*((this.minyorg-this.miny)/l)),i,c,a.get("minSpotColor")).append()),i&&a.get("maxSpotColor")&&(s=I[d.inArray(this.maxyorg,J)],e.drawCircle(o+b.round((s-this.minx)*(f/k)),n+b.round(g-g*((this.maxyorg-this.miny)/l)),i,c,a.get("maxSpotColor")).append())),this.lastShapeId=e.getLastShapeId(),this.canvasTop=n,e.render()}}),d.fn.sparkline.bar=y=g(d.fn.sparkline._base,w,{type:"bar",init:function(a,e,f,g,h){var j=parseInt(f.get("barWidth"),10),n=parseInt(f.get("barSpacing"),10),o=f.get("chartRangeMin"),p=f.get("chartRangeMax"),q=f.get("chartRangeClip"),r=Infinity,s=-Infinity,u,v,w,x,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R;y._super.init.call(this,a,e,f,g,h);for(A=0,B=e.length;A<B;A++){O=e[A],u=typeof O=="string"&&O.indexOf(":")>-1;if(u||d.isArray(O))J=!0,u&&(O=e[A]=l(O.split(":"))),O=m(O,null),v=b.min.apply(b,O),w=b.max.apply(b,O),v<r&&(r=v),w>s&&(s=w)}this.stacked=J,this.regionShapes={},this.barWidth=j,this.barSpacing=n,this.totalBarWidth=j+n,this.width=g=e.length*j+(e.length-1)*n,this.initTarget(),q&&(H=o===c?-Infinity:o,I=p===c?Infinity:p),z=[],x=J?[]:z;var S=[],T=[];for(A=0,B=e.length;A<B;A++)if(J){K=e[A],e[A]=N=[],S[A]=0,x[A]=T[A]=0;for(L=0,M=K.length;L<M;L++)O=N[L]=q?i(K[L],H,I):K[L],O!==null&&(O>0&&(S[A]+=O),r<0&&s>0?O<0?T[A]+=b.abs(O):x[A]+=O:x[A]+=b.abs(O-(O<0?s:r)),z.push(O))}else O=q?i(e[A],H,I):e[A],O=e[A]=k(O),O!==null&&z.push(O);this.max=G=b.max.apply(b,z),this.min=F=b.min.apply(b,z),this.stackMax=s=J?b.max.apply(b,S):G,this.stackMin=r=J?b.min.apply(b,z):F,f.get("chartRangeMin")!==c&&(f.get("chartRangeClip")||f.get("chartRangeMin")<F)&&(F=f.get("chartRangeMin")),f.get("chartRangeMax")!==c&&(f.get("chartRangeClip")||f.get("chartRangeMax")>G)&&(G=f.get("chartRangeMax")),this.zeroAxis=D=f.get("zeroAxis",!0),F<=0&&G>=0&&D?E=0:D==0?E=F:F>0?E=F:E=G,this.xaxisOffset=E,C=J?b.max.apply(b,x)+b.max.apply(b,T):G-F,this.canvasHeightEf=D&&F<0?this.canvasHeight-2:this.canvasHeight-1,F<E?(Q=J&&G>=0?s:G,P=(Q-E)/C*this.canvasHeight,P!==b.ceil(P)&&(this.canvasHeightEf-=2,P=b.ceil(P))):P=this.canvasHeight,this.yoffset=P,d.isArray(f.get("colorMap"))?(this.colorMapByIndex=f.get("colorMap"),this.colorMapByValue=null):(this.colorMapByIndex=null,this.colorMapByValue=f.get("colorMap"),this.colorMapByValue&&this.colorMapByValue.get===c&&(this.colorMapByValue=new t(this.colorMapByValue))),this.range=C},getRegion:function(a,d,e){var f=b.floor(d/this.totalBarWidth);return f<0||f>=this.values.length?c:f},getCurrentRegionFields:function(){var a=this.currentRegion,b=r(this.values[a]),c=[],d,e;for(e=b.length;e--;)d=b[e],c.push({isNull:d===null,value:d,color:this.calcColor(e,d,a),offset:a});return c},calcColor:function(a,b,e){var f=this.colorMapByIndex,g=this.colorMapByValue,h=this.options,i,j;return this.stacked?i=h.get("stackedBarColor"):i=b<0?h.get("negBarColor"):h.get("barColor"),b===0&&h.get("zeroColor")!==c&&(i=h.get("zeroColor")),g&&(j=g.get(b))?i=j:f&&f.length>e&&(i=f[e]),d.isArray(i)?i[a%i.length]:i},renderRegion:function(a,e){var f=this.values[a],g=this.options,h=this.xaxisOffset,i=[],j=this.range,k=this.stacked,l=this.target,m=a*this.totalBarWidth,n=this.canvasHeightEf,p=this.yoffset,q,r,s,t,u,v,w,x,y,z;f=d.isArray(f)?f:[f],w=f.length,x=f[0],t=o(null,f),z=o(h,f,!0);if(t)return g.get("nullColor")?(s=e?g.get("nullColor"):this.calcHighlightColor(g.get("nullColor"),g),q=p>0?p-1:p,l.drawRect(m,q,this.barWidth-1,0,s,s)):c;u=p;for(v=0;v<w;v++){x=f[v];if(k&&x===h){if(!z||y)continue;y=!0}j>0?r=b.floor(n*(b.abs(x-h)/j))+1:r=1,x<h||x===h&&p===0?(q=u,u+=r):(q=p-r,p-=r),s=this.calcColor(v,x,a),e&&(s=this.calcHighlightColor(s,g)),i.push(l.drawRect(m,q,this.barWidth-1,r-1,s,s))}return i.length===1?i[0]:i}}),d.fn.sparkline.tristate=z=g(d.fn.sparkline._base,w,{type:"tristate",init:function(a,b,e,f,g){var h=parseInt(e.get("barWidth"),10),i=parseInt(e.get("barSpacing"),10);z._super.init.call(this,a,b,e,f,g),this.regionShapes={},this.barWidth=h,this.barSpacing=i,this.totalBarWidth=h+i,this.values=d.map(b,Number),this.width=f=b.length*h+(b.length-1)*i,d.isArray(e.get("colorMap"))?(this.colorMapByIndex=e.get("colorMap"),this.colorMapByValue=null):(this.colorMapByIndex=null,this.colorMapByValue=e.get("colorMap"),this.colorMapByValue&&this.colorMapByValue.get===c&&(this.colorMapByValue=new t(this.colorMapByValue))),this.initTarget()},getRegion:function(a,c,d){return b.floor(c/this.totalBarWidth)},getCurrentRegionFields:function(){var a=this.currentRegion;return{isNull:this.values[a]===c,value:this.values[a],color:this.calcColor(this.values[a],a),offset:a}},calcColor:function(a,b){var c=this.values,d=this.options,e=this.colorMapByIndex,f=this.colorMapByValue,g,h;return f&&(h=f.get(a))?g=h:e&&e.length>b?g=e[b]:c[b]<0?g=d.get("negBarColor"):c[b]>0?g=d.get("posBarColor"):g=d.get("zeroBarColor"),g},renderRegion:function(a,c){var d=this.values,e=this.options,f=this.target,g,h,i,j,k,l;g=f.pixelHeight,i=b.round(g/2),j=a*this.totalBarWidth,d[a]<0?(k=i,h=i-1):d[a]>0?(k=0,h=i-1):(k=i-1,h=2),l=this.calcColor(d[a],a);if(l===null)return;return c&&(l=this.calcHighlightColor(l,e)),f.drawRect(j,k,this.barWidth-1,h-1,l,l)}}),d.fn.sparkline.discrete=A=g(d.fn.sparkline._base,w,{type:"discrete",init:function(a,e,f,g,h){A._super.init.call(this,a,e,f,g,h),this.regionShapes={},this.values=e=d.map(e,Number),this.min=b.min.apply(b,e),this.max=b.max.apply(b,e),this.range=this.max-this.min,this.width=g=f.get("width")==="auto"?e.length*2:this.width,this.interval=b.floor(g/e.length),this.itemWidth=g/e.length,f.get("chartRangeMin")!==c&&(f.get("chartRangeClip")||f.get("chartRangeMin")<this.min)&&(this.min=f.get("chartRangeMin")),f.get("chartRangeMax")!==c&&(f.get("chartRangeClip")||f.get("chartRangeMax")>this.max)&&(this.max=f.get("chartRangeMax")),this.initTarget(),this.target&&(this.lineHeight=f.get("lineHeight")==="auto"?b.round(this.canvasHeight*.3):f.get("lineHeight"))},getRegion:function(a,c,d){return b.floor(c/this.itemWidth)},getCurrentRegionFields:function(){var a=this.currentRegion;return{isNull:this.values[a]===c,value:this.values[a],offset:a}},renderRegion:function(a,c){var d=this.values,e=this.options,f=this.min,g=this.max,h=this.range,j=this.interval,k=this.target,l=this.canvasHeight,m=this.lineHeight,n=l-m,o,p,q,r;return p=i(d[a],f,g),r=a*j,o=b.round(n-n*((p-f)/h)),q=e.get("thresholdColor")&&p<e.get("thresholdValue")?e.get("thresholdColor"):e.get("lineColor"),c&&(q=this.calcHighlightColor(q,e)),k.drawLine(r,o,r,o+m,q)}}),d.fn.sparkline.bullet=B=g(d.fn.sparkline._base,{type:"bullet",init:function(a,d,e,f,g){var h,i,j;B._super.init.call(this,a,d,e,f,g),this.values=d=l(d),j=d.slice(),j[0]=j[0]===null?j[2]:j[0],j[1]=d[1]===null?j[2]:j[1],h=b.min.apply(b,d),i=b.max.apply(b,d),e.get("base")===c?h=h<0?h:0:h=e.get("base"),this.min=h,this.max=i,this.range=i-h,this.shapes={},this.valueShapes={},this.regiondata={},this.width=f=e.get("width")==="auto"?"4.0em":f,this.target=this.$el.simpledraw(f,g,e.get("composite")),d.length||(this.disabled=!0),this.initTarget()},getRegion:function(a,b,d){var e=this.target.getShapeAt(a,b,d);return e!==c&&this.shapes[e]!==c?this.shapes[e]:c},getCurrentRegionFields:function(){var a=this.currentRegion;return{fieldkey:a.substr(0,1),value:this.values[a.substr(1)],region:a}},changeHighlight:function(a){var b=this.currentRegion,c=this.valueShapes[b],d;delete this.shapes[c];switch(b.substr(0,1)){case"r":d=this.renderRange(b.substr(1),a);break;case"p":d=this.renderPerformance(a);break;case"t":d=this.renderTarget(a)}this.valueShapes[b]=d.id,this.shapes[d.id]=b,this.target.replaceWithShape(c,d)},renderRange:function(a,c){var d=this.values[a],e=b.round(this.canvasWidth*((d-this.min)/this.range)),f=this.options.get("rangeColors")[a-2];return c&&(f=this.calcHighlightColor(f,this.options)),this.target.drawRect(0,0,e-1,this.canvasHeight-1,f,f)},renderPerformance:function(a){var c=this.values[1],d=b.round(this.canvasWidth*((c-this.min)/this.range)),e=this.options.get("performanceColor");return a&&(e=this.calcHighlightColor(e,this.options)),this.target.drawRect(0,b.round(this.canvasHeight*.3),d-1,b.round(this.canvasHeight*.4)-1,e,e)},renderTarget:function(a){var c=this.values[0],d=b.round(this.canvasWidth*((c-this.min)/this.range)-this.options.get("targetWidth")/2),e=b.round(this.canvasHeight*.1),f=this.canvasHeight-e*2,g=this.options.get("targetColor");return a&&(g=this.calcHighlightColor(g,this.options)),this.target.drawRect(d,e,this.options.get("targetWidth")-1,f-1,g,g)},render:function(){var a=this.values.length,b=this.target,c,d;if(!B._super.render.call(this))return;for(c=2;c<a;c++)d=this.renderRange(c).append(),this.shapes[d.id]="r"+c,this.valueShapes["r"+c]=d.id;this.values[1]!==null&&(d=this.renderPerformance().append(),this.shapes[d.id]="p1",this.valueShapes.p1=d.id),this.values[0]!==null&&(d=this.renderTarget().append(),this.shapes[d.id]="t0",this.valueShapes.t0=d.id),b.render()}}),d.fn.sparkline.pie=C=g(d.fn.sparkline._base,{type:"pie",init:function(a,c,e,f,g){var h=0,i;C._super.init.call(this,a,c,e,f,g),this.shapes={},this.valueShapes={},this.values=c=d.map(c,Number),e.get("width")==="auto"&&(this.width=this.height);if(c.length>0)for(i=c.length;i--;)h+=c[i];this.total=h,this.initTarget(),this.radius=b.floor(b.min(this.canvasWidth,this.canvasHeight)/2)},getRegion:function(a,b,d){var e=this.target.getShapeAt(a,b,d);return e!==c&&this.shapes[e]!==c?this.shapes[e]:c},getCurrentRegionFields:function(){var a=this.currentRegion;return{isNull:this.values[a]===c,value:this.values[a],percent:this.values[a]/this.total*100,color:this.options.get("sliceColors")[a%this.options.get("sliceColors").length],offset:a}},changeHighlight:function(a){var b=this.currentRegion,c=this.renderSlice(b,a),d=this.valueShapes[b];delete this.shapes[d],this.target.replaceWithShape(d,c),this.valueShapes[b]=c.id,this.shapes[c.id]=b},renderSlice:function(a,d){var e=this.target,f=this.options,g=this.radius,h=f.get("borderWidth"),i=f.get("offset"),j=2*b.PI,k=this.values,l=this.total,m=i?2*b.PI*(i/360):0,n,o,p,q,r;q=k.length;for(p=0;p<q;p++){n=m,o=m,l>0&&(o=m+j*(k[p]/l));if(a===p)return r=f.get("sliceColors")[p%f.get("sliceColors").length],d&&(r=this.calcHighlightColor(r,f)),e.drawPieSlice(g,g,g-h,n,o,c,r);m=o}},render:function(){var a=this.target,d=this.values,e=this.options,f=this.radius,g=e.get("borderWidth"),h,i;if(!C._super.render.call(this))return;g&&a.drawCircle(f,f,b.floor(f-g/2),e.get("borderColor"),c,g).append();for(i=d.length;i--;)d[i]&&(h=this.renderSlice(i).append(),this.valueShapes[i]=h.id,this.shapes[h.id]=i);a.render()}}),d.fn.sparkline.box=D=g(d.fn.sparkline._base,{type:"box",init:function(a,b,c,e,f){D._super.init.call(this,a,b,c,e,f),this.values=d.map(b,Number),this.width=c.get("width")==="auto"?"4.0em":e,this.initTarget(),this.values.length||(this.disabled=1)},getRegion:function(){return 1},getCurrentRegionFields:function(){var a=[{field:"lq",value:this.quartiles[0]},{field:"med",value:this.quartiles
[1]},{field:"uq",value:this.quartiles[2]}];return this.loutlier!==c&&a.push({field:"lo",value:this.loutlier}),this.routlier!==c&&a.push({field:"ro",value:this.routlier}),this.lwhisker!==c&&a.push({field:"lw",value:this.lwhisker}),this.rwhisker!==c&&a.push({field:"rw",value:this.rwhisker}),a},render:function(){var a=this.target,d=this.values,e=d.length,f=this.options,g=this.canvasWidth,h=this.canvasHeight,i=f.get("chartRangeMin")===c?b.min.apply(b,d):f.get("chartRangeMin"),k=f.get("chartRangeMax")===c?b.max.apply(b,d):f.get("chartRangeMax"),l=0,m,n,o,p,q,r,s,t,u,v,w;if(!D._super.render.call(this))return;if(f.get("raw"))f.get("showOutliers")&&d.length>5?(n=d[0],m=d[1],p=d[2],q=d[3],r=d[4],s=d[5],t=d[6]):(m=d[0],p=d[1],q=d[2],r=d[3],s=d[4]);else{d.sort(function(a,b){return a-b}),p=j(d,1),q=j(d,2),r=j(d,3),o=r-p;if(f.get("showOutliers")){m=s=c;for(u=0;u<e;u++)m===c&&d[u]>p-o*f.get("outlierIQR")&&(m=d[u]),d[u]<r+o*f.get("outlierIQR")&&(s=d[u]);n=d[0],t=d[e-1]}else m=d[0],s=d[e-1]}this.quartiles=[p,q,r],this.lwhisker=m,this.rwhisker=s,this.loutlier=n,this.routlier=t,w=g/(k-i+1),f.get("showOutliers")&&(l=b.ceil(f.get("spotRadius")),g-=2*b.ceil(f.get("spotRadius")),w=g/(k-i+1),n<m&&a.drawCircle((n-i)*w+l,h/2,f.get("spotRadius"),f.get("outlierLineColor"),f.get("outlierFillColor")).append(),t>s&&a.drawCircle((t-i)*w+l,h/2,f.get("spotRadius"),f.get("outlierLineColor"),f.get("outlierFillColor")).append()),a.drawRect(b.round((p-i)*w+l),b.round(h*.1),b.round((r-p)*w),b.round(h*.8),f.get("boxLineColor"),f.get("boxFillColor")).append(),a.drawLine(b.round((m-i)*w+l),b.round(h/2),b.round((p-i)*w+l),b.round(h/2),f.get("lineColor")).append(),a.drawLine(b.round((m-i)*w+l),b.round(h/4),b.round((m-i)*w+l),b.round(h-h/4),f.get("whiskerColor")).append(),a.drawLine(b.round((s-i)*w+l),b.round(h/2),b.round((r-i)*w+l),b.round(h/2),f.get("lineColor")).append(),a.drawLine(b.round((s-i)*w+l),b.round(h/4),b.round((s-i)*w+l),b.round(h-h/4),f.get("whiskerColor")).append(),a.drawLine(b.round((q-i)*w+l),b.round(h*.1),b.round((q-i)*w+l),b.round(h*.9),f.get("medianColor")).append(),f.get("target")&&(v=b.ceil(f.get("spotRadius")),a.drawLine(b.round((f.get("target")-i)*w+l),b.round(h/2-v),b.round((f.get("target")-i)*w+l),b.round(h/2+v),f.get("targetColor")).append(),a.drawLine(b.round((f.get("target")-i)*w+l-v),b.round(h/2),b.round((f.get("target")-i)*w+l+v),b.round(h/2),f.get("targetColor")).append()),a.render()}}),G=g({init:function(a,b,c,d){this.target=a,this.id=b,this.type=c,this.args=d},append:function(){return this.target.appendShape(this),this}}),H=g({_pxregex:/(\d+)(px)?\s*$/i,init:function(a,b,c){if(!a)return;this.width=a,this.height=b,this.target=c,this.lastShapeId=null,c[0]&&(c=c[0]),d.data(c,"_jqs_vcanvas",this)},drawLine:function(a,b,c,d,e,f){return this.drawShape([[a,b],[c,d]],e,f)},drawShape:function(a,b,c,d){return this._genShape("Shape",[a,b,c,d])},drawCircle:function(a,b,c,d,e,f){return this._genShape("Circle",[a,b,c,d,e,f])},drawPieSlice:function(a,b,c,d,e,f,g){return this._genShape("PieSlice",[a,b,c,d,e,f,g])},drawRect:function(a,b,c,d,e,f){return this._genShape("Rect",[a,b,c,d,e,f])},getElement:function(){return this.canvas},getLastShapeId:function(){return this.lastShapeId},reset:function(){alert("reset not implemented")},_insert:function(a,b){d(b).html(a)},_calculatePixelDims:function(a,b,c){var e;e=this._pxregex.exec(b),e?this.pixelHeight=e[1]:this.pixelHeight=d(c).height(),e=this._pxregex.exec(a),e?this.pixelWidth=e[1]:this.pixelWidth=d(c).width()},_genShape:function(a,b){var c=L++;return b.unshift(c),new G(this,c,a,b)},appendShape:function(a){alert("appendShape not implemented")},replaceWithShape:function(a,b){alert("replaceWithShape not implemented")},insertAfterShape:function(a,b){alert("insertAfterShape not implemented")},removeShapeId:function(a){alert("removeShapeId not implemented")},getShapeAt:function(a,b,c){alert("getShapeAt not implemented")},render:function(){alert("render not implemented")}}),I=g(H,{init:function(b,e,f,g){I._super.init.call(this,b,e,f),this.canvas=a.createElement("canvas"),f[0]&&(f=f[0]),d.data(f,"_jqs_vcanvas",this),d(this.canvas).css({display:"inline-block",width:b,height:e,verticalAlign:"top"}),this._insert(this.canvas,f),this._calculatePixelDims(b,e,this.canvas),this.canvas.width=this.pixelWidth,this.canvas.height=this.pixelHeight,this.interact=g,this.shapes={},this.shapeseq=[],this.currentTargetShapeId=c,d(this.canvas).css({width:this.pixelWidth,height:this.pixelHeight})},_getContext:function(a,b,d){var e=this.canvas.getContext("2d");return a!==c&&(e.strokeStyle=a),e.lineWidth=d===c?1:d,b!==c&&(e.fillStyle=b),e},reset:function(){var a=this._getContext();a.clearRect(0,0,this.pixelWidth,this.pixelHeight),this.shapes={},this.shapeseq=[],this.currentTargetShapeId=c},_drawShape:function(a,b,d,e,f){var g=this._getContext(d,e,f),h,i;g.beginPath(),g.moveTo(b[0][0]+.5,b[0][1]+.5);for(h=1,i=b.length;h<i;h++)g.lineTo(b[h][0]+.5,b[h][1]+.5);d!==c&&g.stroke(),e!==c&&g.fill(),this.targetX!==c&&this.targetY!==c&&g.isPointInPath(this.targetX,this.targetY)&&(this.currentTargetShapeId=a)},_drawCircle:function(a,d,e,f,g,h,i){var j=this._getContext(g,h,i);j.beginPath(),j.arc(d,e,f,0,2*b.PI,!1),this.targetX!==c&&this.targetY!==c&&j.isPointInPath(this.targetX,this.targetY)&&(this.currentTargetShapeId=a),g!==c&&j.stroke(),h!==c&&j.fill()},_drawPieSlice:function(a,b,d,e,f,g,h,i){var j=this._getContext(h,i);j.beginPath(),j.moveTo(b,d),j.arc(b,d,e,f,g,!1),j.lineTo(b,d),j.closePath(),h!==c&&j.stroke(),i&&j.fill(),this.targetX!==c&&this.targetY!==c&&j.isPointInPath(this.targetX,this.targetY)&&(this.currentTargetShapeId=a)},_drawRect:function(a,b,c,d,e,f,g){return this._drawShape(a,[[b,c],[b+d,c],[b+d,c+e],[b,c+e],[b,c]],f,g)},appendShape:function(a){return this.shapes[a.id]=a,this.shapeseq.push(a.id),this.lastShapeId=a.id,a.id},replaceWithShape:function(a,b){var c=this.shapeseq,d;this.shapes[b.id]=b;for(d=c.length;d--;)c[d]==a&&(c[d]=b.id);delete this.shapes[a]},replaceWithShapes:function(a,b){var c=this.shapeseq,d={},e,f,g;for(f=a.length;f--;)d[a[f]]=!0;for(f=c.length;f--;)e=c[f],d[e]&&(c.splice(f,1),delete this.shapes[e],g=f);for(f=b.length;f--;)c.splice(g,0,b[f].id),this.shapes[b[f].id]=b[f]},insertAfterShape:function(a,b){var c=this.shapeseq,d;for(d=c.length;d--;)if(c[d]===a){c.splice(d+1,0,b.id),this.shapes[b.id]=b;return}},removeShapeId:function(a){var b=this.shapeseq,c;for(c=b.length;c--;)if(b[c]===a){b.splice(c,1);break}delete this.shapes[a]},getShapeAt:function(a,b,c){return this.targetX=b,this.targetY=c,this.render(),this.currentTargetShapeId},render:function(){var a=this.shapeseq,b=this.shapes,c=a.length,d=this._getContext(),e,f,g;d.clearRect(0,0,this.pixelWidth,this.pixelHeight);for(g=0;g<c;g++)e=a[g],f=b[e],this["_draw"+f.type].apply(this,f.args);this.interact||(this.shapes={},this.shapeseq=[])}}),J=g(H,{init:function(b,c,e){var f;J._super.init.call(this,b,c,e),e[0]&&(e=e[0]),d.data(e,"_jqs_vcanvas",this),this.canvas=a.createElement("span"),d(this.canvas).css({display:"inline-block",position:"relative",overflow:"hidden",width:b,height:c,margin:"0px",padding:"0px",verticalAlign:"top"}),this._insert(this.canvas,e),this._calculatePixelDims(b,c,this.canvas),this.canvas.width=this.pixelWidth,this.canvas.height=this.pixelHeight,f='<v:group coordorigin="0 0" coordsize="'+this.pixelWidth+" "+this.pixelHeight+'"'+' style="position:absolute;top:0;left:0;width:'+this.pixelWidth+"px;height="+this.pixelHeight+'px;"></v:group>',this.canvas.insertAdjacentHTML("beforeEnd",f),this.group=d(this.canvas).children()[0],this.rendered=!1,this.prerender=""},_drawShape:function(a,b,d,e,f){var g=[],h,i,j,k,l,m,n;for(n=0,m=b.length;n<m;n++)g[n]=""+b[n][0]+","+b[n][1];return h=g.splice(0,1),f=f===c?1:f,i=d===c?' stroked="false" ':' strokeWeight="'+f+'px" strokeColor="'+d+'" ',j=e===c?' filled="false"':' fillColor="'+e+'" filled="true" ',k=g[0]===g[g.length-1]?"x ":"",l='<v:shape coordorigin="0 0" coordsize="'+this.pixelWidth+" "+this.pixelHeight+'" '+' id="jqsshape'+a+'" '+i+j+' style="position:absolute;left:0px;top:0px;height:'+this.pixelHeight+"px;width:"+this.pixelWidth+'px;padding:0px;margin:0px;" '+' path="m '+h+" l "+g.join(", ")+" "+k+'e">'+" </v:shape>",l},_drawCircle:function(a,b,d,e,f,g,h){var i,j,k;return b-=e,d-=e,i=f===c?' stroked="false" ':' strokeWeight="'+h+'px" strokeColor="'+f+'" ',j=g===c?' filled="false"':' fillColor="'+g+'" filled="true" ',k='<v:oval  id="jqsshape'+a+'" '+i+j+' style="position:absolute;top:'+d+"px; left:"+b+"px; width:"+e*2+"px; height:"+e*2+'px"></v:oval>',k},_drawPieSlice:function(a,d,e,f,g,h,i,j){var k,l,m,n,o,p,q,r;if(g===h)return"";h-g===2*b.PI&&(g=0,h=2*b.PI),l=d+b.round(b.cos(g)*f),m=e+b.round(b.sin(g)*f),n=d+b.round(b.cos(h)*f),o=e+b.round(b.sin(h)*f);if(l===n&&m===o){if(h-g<b.PI)return"";l=n=d+f,m=o=e}return l===n&&m===o&&h-g<b.PI?"":(k=[d-f,e-f,d+f,e+f,l,m,n,o],p=i===c?' stroked="false" ':' strokeWeight="1px" strokeColor="'+i+'" ',q=j===c?' filled="false"':' fillColor="'+j+'" filled="true" ',r='<v:shape coordorigin="0 0" coordsize="'+this.pixelWidth+" "+this.pixelHeight+'" '+' id="jqsshape'+a+'" '+p+q+' style="position:absolute;left:0px;top:0px;height:'+this.pixelHeight+"px;width:"+this.pixelWidth+'px;padding:0px;margin:0px;" '+' path="m '+d+","+e+" wa "+k.join(", ")+' x e">'+" </v:shape>",r)},_drawRect:function(a,b,c,d,e,f,g){return this._drawShape(a,[[b,c],[b,c+e],[b+d,c+e],[b+d,c],[b,c]],f,g)},reset:function(){this.group.innerHTML=""},appendShape:function(a){var b=this["_draw"+a.type].apply(this,a.args);return this.rendered?this.group.insertAdjacentHTML("beforeEnd",b):this.prerender+=b,this.lastShapeId=a.id,a.id},replaceWithShape:function(a,b){var c=d("#jqsshape"+a),e=this["_draw"+b.type].apply(this,b.args);c[0].outerHTML=e},replaceWithShapes:function(a,b){var c=d("#jqsshape"+a[0]),e="",f=b.length,g;for(g=0;g<f;g++)e+=this["_draw"+b[g].type].apply(this,b[g].args);c[0].outerHTML=e;for(g=1;g<a.length;g++)d("#jqsshape"+a[g]).remove()},insertAfterShape:function(a,b){var c=d("#jqsshape"+a),e=this["_draw"+b.type].apply(this,b.args);c[0].insertAdjacentHTML("afterEnd",e)},removeShapeId:function(a){var b=d("#jqsshape"+a);this.group.removeChild(b[0])},getShapeAt:function(a,b,c){var d=a.id.substr(8);return d},render:function(){this.rendered||(this.group.innerHTML=this.prerender,this.rendered=!0)}})})})(document,Math);
/*!
 * Laravel-Bootstrap-Modal-Form (https://github.com/JerseyMilker/Laravel-Bootstrap-Modal-Form)
 * Copyright 2015 Jesse Leite - MIT License
 *
 * Bromance:
 * Adam Wathan has nice boots. Thank you for BootForms magic.
 * Matt Higgins has nice beard. Thank you for JS wizardry.
 */

$('document').ready(function() {

    // Prepare reset.
    function resetModalFormErrors() {
        $('.form-group').removeClass('has-error');
        $('.form-group').find('.help-block').remove();
    }

    // Intercept submit.
    $('form.bootstrap-modal-form').on('submit', function(submission) {
        submission.preventDefault();

        // Set vars.
        var form   = $(this),
            url    = form.attr('action'),
            submit = form.find('[type=submit]');

        // Check for file inputs.
        if (form.find('[type=file]').length) {

            // If found, prepare submission via FormData object.
            var input       = form.serializeArray(),
                data        = new FormData(),
                contentType = false;

            // Append input to FormData object.
            $.each(input, function(index, input) {
                data.append(input.name, input.value);
            });

            // Append files to FormData object.
            $.each(form.find('[type=file]'), function(index, input) {
                if (input.files.length == 1) {
                    data.append(input.name, input.files[0]);
                } else if (input.files.length > 1) {
                    data.append(input.name, input.files);
                }
            });
        }

        // If no file input found, do not use FormData object (better browser compatibility).
        else {
            var data        = form.serialize(),
                contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        }

        // Please wait.
        if (submit.is('button')) {
            var submitOriginal = submit.html();
            submit.html('Please wait...');
        } else if (submit.is('input')) {
            var submitOriginal = submit.val();
            submit.val('Please wait...');
        }

        // Request.
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            cache: false,
            contentType: contentType,
            processData: false

        // Response.
        }).always(function(response, status) {

            // Reset errors.
            resetModalFormErrors();

            // Check for errors.
            if (response.status == 422) {
                var errors = $.parseJSON(response.responseText);

                // Iterate through errors object.
                $.each(errors, function(field, message) {
                    console.error(field+': '+message);
                    var formGroup = $('[name='+field+']', form).closest('.form-group');
                    formGroup.addClass('has-error').append('<div class="row"><div class="col-md-4"></div><div class="col-md-6"><span class="help-block"><strong>'+message+'</strong></span></div></div>');
                    
                });

                // Reset submit.
                if (submit.is('button')) {
                    submit.html(submitOriginal);
                } else if (submit.is('input')) {
                    submit.val(submitOriginal);
                }

            // If successful, reload.
            } else {
                location.reload();
                
            }
        });
    });

    // Reset errors when opening modal.
    $('.bootstrap-modal-form-open').click(function() {
        resetModalFormErrors();
    });

});

/* @license
morris.js v0.5.0
Copyright 2014 Olly Smith All rights reserved.
Licensed under the BSD-2-Clause License.
*/
(function(){var a,b,c,d,e=[].slice,f=function(a,b){return function(){return a.apply(b,arguments)}},g={}.hasOwnProperty,h=function(a,b){function c(){this.constructor=a}for(var d in b)g.call(b,d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},i=[].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(b in this&&this[b]===a)return b;return-1};b=window.Morris={},a=jQuery,b.EventEmitter=function(){function a(){}return a.prototype.on=function(a,b){return null==this.handlers&&(this.handlers={}),null==this.handlers[a]&&(this.handlers[a]=[]),this.handlers[a].push(b),this},a.prototype.fire=function(){var a,b,c,d,f,g,h;if(c=arguments[0],a=2<=arguments.length?e.call(arguments,1):[],null!=this.handlers&&null!=this.handlers[c]){for(g=this.handlers[c],h=[],d=0,f=g.length;f>d;d++)b=g[d],h.push(b.apply(null,a));return h}},a}(),b.commas=function(a){var b,c,d,e;return null!=a?(d=0>a?"-":"",b=Math.abs(a),c=Math.floor(b).toFixed(0),d+=c.replace(/(?=(?:\d{3})+$)(?!^)/g,","),e=b.toString(),e.length>c.length&&(d+=e.slice(c.length)),d):"-"},b.pad2=function(a){return(10>a?"0":"")+a},b.Grid=function(c){function d(b){this.resizeHandler=f(this.resizeHandler,this);var c=this;if(this.el="string"==typeof b.element?a(document.getElementById(b.element)):a(b.element),null==this.el||0===this.el.length)throw new Error("Graph container element not found");"static"===this.el.css("position")&&this.el.css("position","relative"),this.options=a.extend({},this.gridDefaults,this.defaults||{},b),"string"==typeof this.options.units&&(this.options.postUnits=b.units),this.raphael=new Raphael(this.el[0]),this.elementWidth=null,this.elementHeight=null,this.dirty=!1,this.selectFrom=null,this.init&&this.init(),this.setData(this.options.data),this.el.bind("mousemove",function(a){var b,d,e,f,g;return d=c.el.offset(),g=a.pageX-d.left,c.selectFrom?(b=c.data[c.hitTest(Math.min(g,c.selectFrom))]._x,e=c.data[c.hitTest(Math.max(g,c.selectFrom))]._x,f=e-b,c.selectionRect.attr({x:b,width:f})):c.fire("hovermove",g,a.pageY-d.top)}),this.el.bind("mouseleave",function(){return c.selectFrom&&(c.selectionRect.hide(),c.selectFrom=null),c.fire("hoverout")}),this.el.bind("touchstart touchmove touchend",function(a){var b,d;return d=a.originalEvent.touches[0]||a.originalEvent.changedTouches[0],b=c.el.offset(),c.fire("hovermove",d.pageX-b.left,d.pageY-b.top)}),this.el.bind("click",function(a){var b;return b=c.el.offset(),c.fire("gridclick",a.pageX-b.left,a.pageY-b.top)}),this.options.rangeSelect&&(this.selectionRect=this.raphael.rect(0,0,0,this.el.innerHeight()).attr({fill:this.options.rangeSelectColor,stroke:!1}).toBack().hide(),this.el.bind("mousedown",function(a){var b;return b=c.el.offset(),c.startRange(a.pageX-b.left)}),this.el.bind("mouseup",function(a){var b;return b=c.el.offset(),c.endRange(a.pageX-b.left),c.fire("hovermove",a.pageX-b.left,a.pageY-b.top)})),this.options.resize&&a(window).bind("resize",function(){return null!=c.timeoutId&&window.clearTimeout(c.timeoutId),c.timeoutId=window.setTimeout(c.resizeHandler,100)}),this.el.css("-webkit-tap-highlight-color","rgba(0,0,0,0)"),this.postInit&&this.postInit()}return h(d,c),d.prototype.gridDefaults={dateFormat:null,axes:!0,grid:!0,gridLineColor:"#aaa",gridStrokeWidth:.5,gridTextColor:"#888",gridTextSize:12,gridTextFamily:"sans-serif",gridTextWeight:"normal",hideHover:!1,yLabelFormat:null,xLabelAngle:0,numLines:5,padding:25,parseTime:!0,postUnits:"",preUnits:"",ymax:"auto",ymin:"auto 0",goals:[],goalStrokeWidth:1,goalLineColors:["#666633","#999966","#cc6666","#663333"],events:[],eventStrokeWidth:1,eventLineColors:["#005a04","#ccffbb","#3a5f0b","#005502"],rangeSelect:null,rangeSelectColor:"#eef",resize:!1},d.prototype.setData=function(a,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r;return null==c&&(c=!0),this.options.data=a,null==a||0===a.length?(this.data=[],this.raphael.clear(),null!=this.hover&&this.hover.hide(),void 0):(o=this.cumulative?0:null,p=this.cumulative?0:null,this.options.goals.length>0&&(h=Math.min.apply(Math,this.options.goals),g=Math.max.apply(Math,this.options.goals),p=null!=p?Math.min(p,h):h,o=null!=o?Math.max(o,g):g),this.data=function(){var c,d,g;for(g=[],f=c=0,d=a.length;d>c;f=++c)j=a[f],i={src:j},i.label=j[this.options.xkey],this.options.parseTime?(i.x=b.parseDate(i.label),this.options.dateFormat?i.label=this.options.dateFormat(i.x):"number"==typeof i.label&&(i.label=new Date(i.label).toString())):(i.x=f,this.options.xLabelFormat&&(i.label=this.options.xLabelFormat(i))),l=0,i.y=function(){var a,b,c,d;for(c=this.options.ykeys,d=[],e=a=0,b=c.length;b>a;e=++a)n=c[e],q=j[n],"string"==typeof q&&(q=parseFloat(q)),null!=q&&"number"!=typeof q&&(q=null),null!=q&&(this.cumulative?l+=q:null!=o?(o=Math.max(q,o),p=Math.min(q,p)):o=p=q),this.cumulative&&null!=l&&(o=Math.max(l,o),p=Math.min(l,p)),d.push(q);return d}.call(this),g.push(i);return g}.call(this),this.options.parseTime&&(this.data=this.data.sort(function(a,b){return(a.x>b.x)-(b.x>a.x)})),this.xmin=this.data[0].x,this.xmax=this.data[this.data.length-1].x,this.events=[],this.options.events.length>0&&(this.events=this.options.parseTime?function(){var a,c,e,f;for(e=this.options.events,f=[],a=0,c=e.length;c>a;a++)d=e[a],f.push(b.parseDate(d));return f}.call(this):this.options.events,this.xmax=Math.max(this.xmax,Math.max.apply(Math,this.events)),this.xmin=Math.min(this.xmin,Math.min.apply(Math,this.events))),this.xmin===this.xmax&&(this.xmin-=1,this.xmax+=1),this.ymin=this.yboundary("min",p),this.ymax=this.yboundary("max",o),this.ymin===this.ymax&&(p&&(this.ymin-=1),this.ymax+=1),((r=this.options.axes)===!0||"both"===r||"y"===r||this.options.grid===!0)&&(this.options.ymax===this.gridDefaults.ymax&&this.options.ymin===this.gridDefaults.ymin?(this.grid=this.autoGridLines(this.ymin,this.ymax,this.options.numLines),this.ymin=Math.min(this.ymin,this.grid[0]),this.ymax=Math.max(this.ymax,this.grid[this.grid.length-1])):(k=(this.ymax-this.ymin)/(this.options.numLines-1),this.grid=function(){var a,b,c,d;for(d=[],m=a=b=this.ymin,c=this.ymax;k>0?c>=a:a>=c;m=a+=k)d.push(m);return d}.call(this))),this.dirty=!0,c?this.redraw():void 0)},d.prototype.yboundary=function(a,b){var c,d;return c=this.options["y"+a],"string"==typeof c?"auto"===c.slice(0,4)?c.length>5?(d=parseInt(c.slice(5),10),null==b?d:Math[a](b,d)):null!=b?b:0:parseInt(c,10):c},d.prototype.autoGridLines=function(a,b,c){var d,e,f,g,h,i,j,k,l;return h=b-a,l=Math.floor(Math.log(h)/Math.log(10)),j=Math.pow(10,l),e=Math.floor(a/j)*j,d=Math.ceil(b/j)*j,i=(d-e)/(c-1),1===j&&i>1&&Math.ceil(i)!==i&&(i=Math.ceil(i),d=e+i*(c-1)),0>e&&d>0&&(e=Math.floor(a/i)*i,d=Math.ceil(b/i)*i),1>i?(g=Math.floor(Math.log(i)/Math.log(10)),f=function(){var a,b;for(b=[],k=a=e;i>0?d>=a:a>=d;k=a+=i)b.push(parseFloat(k.toFixed(1-g)));return b}()):f=function(){var a,b;for(b=[],k=a=e;i>0?d>=a:a>=d;k=a+=i)b.push(k);return b}(),f},d.prototype._calc=function(){var a,b,c,d,e,f,g,h;return e=this.el.width(),c=this.el.height(),(this.elementWidth!==e||this.elementHeight!==c||this.dirty)&&(this.elementWidth=e,this.elementHeight=c,this.dirty=!1,this.left=this.options.padding,this.right=this.elementWidth-this.options.padding,this.top=this.options.padding,this.bottom=this.elementHeight-this.options.padding,((g=this.options.axes)===!0||"both"===g||"y"===g)&&(f=function(){var a,c,d,e;for(d=this.grid,e=[],a=0,c=d.length;c>a;a++)b=d[a],e.push(this.measureText(this.yAxisFormat(b)).width);return e}.call(this),this.left+=Math.max.apply(Math,f)),((h=this.options.axes)===!0||"both"===h||"x"===h)&&(a=function(){var a,b,c;for(c=[],d=a=0,b=this.data.length;b>=0?b>a:a>b;d=b>=0?++a:--a)c.push(this.measureText(this.data[d].text,-this.options.xLabelAngle).height);return c}.call(this),this.bottom-=Math.max.apply(Math,a)),this.width=Math.max(1,this.right-this.left),this.height=Math.max(1,this.bottom-this.top),this.dx=this.width/(this.xmax-this.xmin),this.dy=this.height/(this.ymax-this.ymin),this.calc)?this.calc():void 0},d.prototype.transY=function(a){return this.bottom-(a-this.ymin)*this.dy},d.prototype.transX=function(a){return 1===this.data.length?(this.left+this.right)/2:this.left+(a-this.xmin)*this.dx},d.prototype.redraw=function(){return this.raphael.clear(),this._calc(),this.drawGrid(),this.drawGoals(),this.drawEvents(),this.draw?this.draw():void 0},d.prototype.measureText=function(a,b){var c,d;return null==b&&(b=0),d=this.raphael.text(100,100,a).attr("font-size",this.options.gridTextSize).attr("font-family",this.options.gridTextFamily).attr("font-weight",this.options.gridTextWeight).rotate(b),c=d.getBBox(),d.remove(),c},d.prototype.yAxisFormat=function(a){return this.yLabelFormat(a)},d.prototype.yLabelFormat=function(a){return"function"==typeof this.options.yLabelFormat?this.options.yLabelFormat(a):""+this.options.preUnits+b.commas(a)+this.options.postUnits},d.prototype.drawGrid=function(){var a,b,c,d,e,f,g,h;if(this.options.grid!==!1||(e=this.options.axes)===!0||"both"===e||"y"===e){for(f=this.grid,h=[],c=0,d=f.length;d>c;c++)a=f[c],b=this.transY(a),((g=this.options.axes)===!0||"both"===g||"y"===g)&&this.drawYAxisLabel(this.left-this.options.padding/2,b,this.yAxisFormat(a)),this.options.grid?h.push(this.drawGridLine("M"+this.left+","+b+"H"+(this.left+this.width))):h.push(void 0);return h}},d.prototype.drawGoals=function(){var a,b,c,d,e,f,g;for(f=this.options.goals,g=[],c=d=0,e=f.length;e>d;c=++d)b=f[c],a=this.options.goalLineColors[c%this.options.goalLineColors.length],g.push(this.drawGoal(b,a));return g},d.prototype.drawEvents=function(){var a,b,c,d,e,f,g;for(f=this.events,g=[],c=d=0,e=f.length;e>d;c=++d)b=f[c],a=this.options.eventLineColors[c%this.options.eventLineColors.length],g.push(this.drawEvent(b,a));return g},d.prototype.drawGoal=function(a,b){return this.raphael.path("M"+this.left+","+this.transY(a)+"H"+this.right).attr("stroke",b).attr("stroke-width",this.options.goalStrokeWidth)},d.prototype.drawEvent=function(a,b){return this.raphael.path("M"+this.transX(a)+","+this.bottom+"V"+this.top).attr("stroke",b).attr("stroke-width",this.options.eventStrokeWidth)},d.prototype.drawYAxisLabel=function(a,b,c){return this.raphael.text(a,b,c).attr("font-size",this.options.gridTextSize).attr("font-family",this.options.gridTextFamily).attr("font-weight",this.options.gridTextWeight).attr("fill",this.options.gridTextColor).attr("text-anchor","end")},d.prototype.drawGridLine=function(a){return this.raphael.path(a).attr("stroke",this.options.gridLineColor).attr("stroke-width",this.options.gridStrokeWidth)},d.prototype.startRange=function(a){return this.hover.hide(),this.selectFrom=a,this.selectionRect.attr({x:a,width:0}).show()},d.prototype.endRange=function(a){var b,c;return this.selectFrom?(c=Math.min(this.selectFrom,a),b=Math.max(this.selectFrom,a),this.options.rangeSelect.call(this.el,{start:this.data[this.hitTest(c)].x,end:this.data[this.hitTest(b)].x}),this.selectFrom=null):void 0},d.prototype.resizeHandler=function(){return this.timeoutId=null,this.raphael.setSize(this.el.width(),this.el.height()),this.redraw()},d}(b.EventEmitter),b.parseDate=function(a){var b,c,d,e,f,g,h,i,j,k,l;return"number"==typeof a?a:(c=a.match(/^(\d+) Q(\d)$/),e=a.match(/^(\d+)-(\d+)$/),f=a.match(/^(\d+)-(\d+)-(\d+)$/),h=a.match(/^(\d+) W(\d+)$/),i=a.match(/^(\d+)-(\d+)-(\d+)[ T](\d+):(\d+)(Z|([+-])(\d\d):?(\d\d))?$/),j=a.match(/^(\d+)-(\d+)-(\d+)[ T](\d+):(\d+):(\d+(\.\d+)?)(Z|([+-])(\d\d):?(\d\d))?$/),c?new Date(parseInt(c[1],10),3*parseInt(c[2],10)-1,1).getTime():e?new Date(parseInt(e[1],10),parseInt(e[2],10)-1,1).getTime():f?new Date(parseInt(f[1],10),parseInt(f[2],10)-1,parseInt(f[3],10)).getTime():h?(k=new Date(parseInt(h[1],10),0,1),4!==k.getDay()&&k.setMonth(0,1+(4-k.getDay()+7)%7),k.getTime()+6048e5*parseInt(h[2],10)):i?i[6]?(g=0,"Z"!==i[6]&&(g=60*parseInt(i[8],10)+parseInt(i[9],10),"+"===i[7]&&(g=0-g)),Date.UTC(parseInt(i[1],10),parseInt(i[2],10)-1,parseInt(i[3],10),parseInt(i[4],10),parseInt(i[5],10)+g)):new Date(parseInt(i[1],10),parseInt(i[2],10)-1,parseInt(i[3],10),parseInt(i[4],10),parseInt(i[5],10)).getTime():j?(l=parseFloat(j[6]),b=Math.floor(l),d=Math.round(1e3*(l-b)),j[8]?(g=0,"Z"!==j[8]&&(g=60*parseInt(j[10],10)+parseInt(j[11],10),"+"===j[9]&&(g=0-g)),Date.UTC(parseInt(j[1],10),parseInt(j[2],10)-1,parseInt(j[3],10),parseInt(j[4],10),parseInt(j[5],10)+g,b,d)):new Date(parseInt(j[1],10),parseInt(j[2],10)-1,parseInt(j[3],10),parseInt(j[4],10),parseInt(j[5],10),b,d).getTime()):new Date(parseInt(a,10),0,1).getTime())},b.Hover=function(){function c(c){null==c&&(c={}),this.options=a.extend({},b.Hover.defaults,c),this.el=a("<div class='"+this.options["class"]+"'></div>"),this.el.hide(),this.options.parent.append(this.el)}return c.defaults={"class":"morris-hover morris-default-style"},c.prototype.update=function(a,b,c){return a?(this.html(a),this.show(),this.moveTo(b,c)):this.hide()},c.prototype.html=function(a){return this.el.html(a)},c.prototype.moveTo=function(a,b){var c,d,e,f,g,h;return g=this.options.parent.innerWidth(),f=this.options.parent.innerHeight(),d=this.el.outerWidth(),c=this.el.outerHeight(),e=Math.min(Math.max(0,a-d/2),g-d),null!=b?(h=b-c-10,0>h&&(h=b+10,h+c>f&&(h=f/2-c/2))):h=f/2-c/2,this.el.css({left:e+"px",top:parseInt(h)+"px"})},c.prototype.show=function(){return this.el.show()},c.prototype.hide=function(){return this.el.hide()},c}(),b.Line=function(a){function c(a){return this.hilight=f(this.hilight,this),this.onHoverOut=f(this.onHoverOut,this),this.onHoverMove=f(this.onHoverMove,this),this.onGridClick=f(this.onGridClick,this),this instanceof b.Line?(c.__super__.constructor.call(this,a),void 0):new b.Line(a)}return h(c,a),c.prototype.init=function(){return"always"!==this.options.hideHover?(this.hover=new b.Hover({parent:this.el}),this.on("hovermove",this.onHoverMove),this.on("hoverout",this.onHoverOut),this.on("gridclick",this.onGridClick)):void 0},c.prototype.defaults={lineWidth:3,pointSize:4,lineColors:["#0b62a4","#7A92A3","#4da74d","#afd8f8","#edc240","#cb4b4b","#9440ed"],pointStrokeWidths:[1],pointStrokeColors:["#ffffff"],pointFillColors:[],smooth:!0,xLabels:"auto",xLabelFormat:null,xLabelMargin:24,hideHover:!1},c.prototype.calc=function(){return this.calcPoints(),this.generatePaths()},c.prototype.calcPoints=function(){var a,b,c,d,e,f;for(e=this.data,f=[],c=0,d=e.length;d>c;c++)a=e[c],a._x=this.transX(a.x),a._y=function(){var c,d,e,f;for(e=a.y,f=[],c=0,d=e.length;d>c;c++)b=e[c],null!=b?f.push(this.transY(b)):f.push(b);return f}.call(this),f.push(a._ymax=Math.min.apply(Math,[this.bottom].concat(function(){var c,d,e,f;for(e=a._y,f=[],c=0,d=e.length;d>c;c++)b=e[c],null!=b&&f.push(b);return f}())));return f},c.prototype.hitTest=function(a){var b,c,d,e,f;if(0===this.data.length)return null;for(f=this.data.slice(1),b=d=0,e=f.length;e>d&&(c=f[b],!(a<(c._x+this.data[b]._x)/2));b=++d);return b},c.prototype.onGridClick=function(a,b){var c;return c=this.hitTest(a),this.fire("click",c,this.data[c].src,a,b)},c.prototype.onHoverMove=function(a){var b;return b=this.hitTest(a),this.displayHoverForRow(b)},c.prototype.onHoverOut=function(){return this.options.hideHover!==!1?this.displayHoverForRow(null):void 0},c.prototype.displayHoverForRow=function(a){var b;return null!=a?((b=this.hover).update.apply(b,this.hoverContentForRow(a)),this.hilight(a)):(this.hover.hide(),this.hilight())},c.prototype.hoverContentForRow=function(a){var b,c,d,e,f,g,h;for(d=this.data[a],b="<div class='morris-hover-row-label'>"+d.label+"</div>",h=d.y,c=f=0,g=h.length;g>f;c=++f)e=h[c],b+="<div class='morris-hover-point' style='color: "+this.colorFor(d,c,"label")+"'>\n  "+this.options.labels[c]+":\n  "+this.yLabelFormat(e)+"\n</div>";return"function"==typeof this.options.hoverCallback&&(b=this.options.hoverCallback(a,this.options,b,d.src)),[b,d._x,d._ymax]},c.prototype.generatePaths=function(){var a,c,d,e;return this.paths=function(){var f,g,h,j;for(j=[],c=f=0,g=this.options.ykeys.length;g>=0?g>f:f>g;c=g>=0?++f:--f)e="boolean"==typeof this.options.smooth?this.options.smooth:(h=this.options.ykeys[c],i.call(this.options.smooth,h)>=0),a=function(){var a,b,e,f;for(e=this.data,f=[],a=0,b=e.length;b>a;a++)d=e[a],void 0!==d._y[c]&&f.push({x:d._x,y:d._y[c]});return f}.call(this),a.length>1?j.push(b.Line.createPath(a,e,this.bottom)):j.push(null);return j}.call(this)},c.prototype.draw=function(){var a;return((a=this.options.axes)===!0||"both"===a||"x"===a)&&this.drawXAxis(),this.drawSeries(),this.options.hideHover===!1?this.displayHoverForRow(this.data.length-1):void 0},c.prototype.drawXAxis=function(){var a,c,d,e,f,g,h,i,j,k,l=this;for(h=this.bottom+this.options.padding/2,f=null,e=null,a=function(a,b){var c,d,g,i,j;return c=l.drawXAxisLabel(l.transX(b),h,a),j=c.getBBox(),c.transform("r"+-l.options.xLabelAngle),d=c.getBBox(),c.transform("t0,"+d.height/2+"..."),0!==l.options.xLabelAngle&&(i=-.5*j.width*Math.cos(l.options.xLabelAngle*Math.PI/180),c.transform("t"+i+",0...")),d=c.getBBox(),(null==f||f>=d.x+d.width||null!=e&&e>=d.x)&&d.x>=0&&d.x+d.width<l.el.width()?(0!==l.options.xLabelAngle&&(g=1.25*l.options.gridTextSize/Math.sin(l.options.xLabelAngle*Math.PI/180),e=d.x-g),f=d.x-l.options.xLabelMargin):c.remove()},d=this.options.parseTime?1===this.data.length&&"auto"===this.options.xLabels?[[this.data[0].label,this.data[0].x]]:b.labelSeries(this.xmin,this.xmax,this.width,this.options.xLabels,this.options.xLabelFormat):function(){var a,b,c,d;for(c=this.data,d=[],a=0,b=c.length;b>a;a++)g=c[a],d.push([g.label,g.x]);return d}.call(this),d.reverse(),k=[],i=0,j=d.length;j>i;i++)c=d[i],k.push(a(c[0],c[1]));return k},c.prototype.drawSeries=function(){var a,b,c,d,e,f;for(this.seriesPoints=[],a=b=d=this.options.ykeys.length-1;0>=d?0>=b:b>=0;a=0>=d?++b:--b)this._drawLineFor(a);for(f=[],a=c=e=this.options.ykeys.length-1;0>=e?0>=c:c>=0;a=0>=e?++c:--c)f.push(this._drawPointFor(a));return f},c.prototype._drawPointFor=function(a){var b,c,d,e,f,g;for(this.seriesPoints[a]=[],f=this.data,g=[],d=0,e=f.length;e>d;d++)c=f[d],b=null,null!=c._y[a]&&(b=this.drawLinePoint(c._x,c._y[a],this.colorFor(c,a,"point"),a)),g.push(this.seriesPoints[a].push(b));return g},c.prototype._drawLineFor=function(a){var b;return b=this.paths[a],null!==b?this.drawLinePath(b,this.colorFor(null,a,"line"),a):void 0},c.createPath=function(a,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r;for(k="",c&&(g=b.Line.gradients(a)),l={y:null},h=q=0,r=a.length;r>q;h=++q)e=a[h],null!=e.y&&(null!=l.y?c?(f=g[h],j=g[h-1],i=(e.x-l.x)/4,m=l.x+i,o=Math.min(d,l.y+i*j),n=e.x-i,p=Math.min(d,e.y-i*f),k+="C"+m+","+o+","+n+","+p+","+e.x+","+e.y):k+="L"+e.x+","+e.y:c&&null==g[h]||(k+="M"+e.x+","+e.y)),l=e;return k},c.gradients=function(a){var b,c,d,e,f,g,h,i;for(c=function(a,b){return(a.y-b.y)/(a.x-b.x)},i=[],d=g=0,h=a.length;h>g;d=++g)b=a[d],null!=b.y?(e=a[d+1]||{y:null},f=a[d-1]||{y:null},null!=f.y&&null!=e.y?i.push(c(f,e)):null!=f.y?i.push(c(f,b)):null!=e.y?i.push(c(b,e)):i.push(null)):i.push(null);return i},c.prototype.hilight=function(a){var b,c,d,e,f;if(null!==this.prevHilight&&this.prevHilight!==a)for(b=c=0,e=this.seriesPoints.length-1;e>=0?e>=c:c>=e;b=e>=0?++c:--c)this.seriesPoints[b][this.prevHilight]&&this.seriesPoints[b][this.prevHilight].animate(this.pointShrinkSeries(b));if(null!==a&&this.prevHilight!==a)for(b=d=0,f=this.seriesPoints.length-1;f>=0?f>=d:d>=f;b=f>=0?++d:--d)this.seriesPoints[b][a]&&this.seriesPoints[b][a].animate(this.pointGrowSeries(b));return this.prevHilight=a},c.prototype.colorFor=function(a,b,c){return"function"==typeof this.options.lineColors?this.options.lineColors.call(this,a,b,c):"point"===c?this.options.pointFillColors[b%this.options.pointFillColors.length]||this.options.lineColors[b%this.options.lineColors.length]:this.options.lineColors[b%this.options.lineColors.length]},c.prototype.drawXAxisLabel=function(a,b,c){return this.raphael.text(a,b,c).attr("font-size",this.options.gridTextSize).attr("font-family",this.options.gridTextFamily).attr("font-weight",this.options.gridTextWeight).attr("fill",this.options.gridTextColor)},c.prototype.drawLinePath=function(a,b,c){return this.raphael.path(a).attr("stroke",b).attr("stroke-width",this.lineWidthForSeries(c))},c.prototype.drawLinePoint=function(a,b,c,d){return this.raphael.circle(a,b,this.pointSizeForSeries(d)).attr("fill",c).attr("stroke-width",this.pointStrokeWidthForSeries(d)).attr("stroke",this.pointStrokeColorForSeries(d))},c.prototype.pointStrokeWidthForSeries=function(a){return this.options.pointStrokeWidths[a%this.options.pointStrokeWidths.length]},c.prototype.pointStrokeColorForSeries=function(a){return this.options.pointStrokeColors[a%this.options.pointStrokeColors.length]},c.prototype.lineWidthForSeries=function(a){return this.options.lineWidth instanceof Array?this.options.lineWidth[a%this.options.lineWidth.length]:this.options.lineWidth},c.prototype.pointSizeForSeries=function(a){return this.options.pointSize instanceof Array?this.options.pointSize[a%this.options.pointSize.length]:this.options.pointSize},c.prototype.pointGrowSeries=function(a){return Raphael.animation({r:this.pointSizeForSeries(a)+3},25,"linear")},c.prototype.pointShrinkSeries=function(a){return Raphael.animation({r:this.pointSizeForSeries(a)},25,"linear")},c}(b.Grid),b.labelSeries=function(c,d,e,f,g){var h,i,j,k,l,m,n,o,p,q,r;if(j=200*(d-c)/e,i=new Date(c),n=b.LABEL_SPECS[f],void 0===n)for(r=b.AUTO_LABEL_ORDER,p=0,q=r.length;q>p;p++)if(k=r[p],m=b.LABEL_SPECS[k],j>=m.span){n=m;break}for(void 0===n&&(n=b.LABEL_SPECS.second),g&&(n=a.extend({},n,{fmt:g})),h=n.start(i),l=[];(o=h.getTime())<=d;)o>=c&&l.push([n.fmt(h),o]),n.incr(h);return l},c=function(a){return{span:60*a*1e3,start:function(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate(),a.getHours())},fmt:function(a){return""+b.pad2(a.getHours())+":"+b.pad2(a.getMinutes())},incr:function(b){return b.setUTCMinutes(b.getUTCMinutes()+a)}}},d=function(a){return{span:1e3*a,start:function(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate(),a.getHours(),a.getMinutes())},fmt:function(a){return""+b.pad2(a.getHours())+":"+b.pad2(a.getMinutes())+":"+b.pad2(a.getSeconds())},incr:function(b){return b.setUTCSeconds(b.getUTCSeconds()+a)}}},b.LABEL_SPECS={decade:{span:1728e8,start:function(a){return new Date(a.getFullYear()-a.getFullYear()%10,0,1)},fmt:function(a){return""+a.getFullYear()},incr:function(a){return a.setFullYear(a.getFullYear()+10)}},year:{span:1728e7,start:function(a){return new Date(a.getFullYear(),0,1)},fmt:function(a){return""+a.getFullYear()},incr:function(a){return a.setFullYear(a.getFullYear()+1)}},month:{span:24192e5,start:function(a){return new Date(a.getFullYear(),a.getMonth(),1)},fmt:function(a){return""+a.getFullYear()+"-"+b.pad2(a.getMonth()+1)},incr:function(a){return a.setMonth(a.getMonth()+1)}},week:{span:6048e5,start:function(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate())},fmt:function(a){return""+a.getFullYear()+"-"+b.pad2(a.getMonth()+1)+"-"+b.pad2(a.getDate())},incr:function(a){return a.setDate(a.getDate()+7)}},day:{span:864e5,start:function(a){return new Date(a.getFullYear(),a.getMonth(),a.getDate())},fmt:function(a){return""+a.getFullYear()+"-"+b.pad2(a.getMonth()+1)+"-"+b.pad2(a.getDate())},incr:function(a){return a.setDate(a.getDate()+1)}},hour:c(60),"30min":c(30),"15min":c(15),"10min":c(10),"5min":c(5),minute:c(1),"30sec":d(30),"15sec":d(15),"10sec":d(10),"5sec":d(5),second:d(1)},b.AUTO_LABEL_ORDER=["decade","year","month","week","day","hour","30min","15min","10min","5min","minute","30sec","15sec","10sec","5sec","second"],b.Area=function(c){function d(c){var f;return this instanceof b.Area?(f=a.extend({},e,c),this.cumulative=!f.behaveLikeLine,"auto"===f.fillOpacity&&(f.fillOpacity=f.behaveLikeLine?.8:1),d.__super__.constructor.call(this,f),void 0):new b.Area(c)}var e;return h(d,c),e={fillOpacity:"auto",behaveLikeLine:!1},d.prototype.calcPoints=function(){var a,b,c,d,e,f,g;for(f=this.data,g=[],d=0,e=f.length;e>d;d++)a=f[d],a._x=this.transX(a.x),b=0,a._y=function(){var d,e,f,g;for(f=a.y,g=[],d=0,e=f.length;e>d;d++)c=f[d],this.options.behaveLikeLine?g.push(this.transY(c)):(b+=c||0,g.push(this.transY(b)));return g}.call(this),g.push(a._ymax=Math.max.apply(Math,a._y));return g},d.prototype.drawSeries=function(){var a,b,c,d,e,f,g,h;for(this.seriesPoints=[],b=this.options.behaveLikeLine?function(){f=[];for(var a=0,b=this.options.ykeys.length-1;b>=0?b>=a:a>=b;b>=0?a++:a--)f.push(a);return f}.apply(this):function(){g=[];for(var a=e=this.options.ykeys.length-1;0>=e?0>=a:a>=0;0>=e?a++:a--)g.push(a);return g}.apply(this),h=[],c=0,d=b.length;d>c;c++)a=b[c],this._drawFillFor(a),this._drawLineFor(a),h.push(this._drawPointFor(a));return h},d.prototype._drawFillFor=function(a){var b;return b=this.paths[a],null!==b?(b+="L"+this.transX(this.xmax)+","+this.bottom+"L"+this.transX(this.xmin)+","+this.bottom+"Z",this.drawFilledPath(b,this.fillForSeries(a))):void 0},d.prototype.fillForSeries=function(a){var b;return b=Raphael.rgb2hsl(this.colorFor(this.data[a],a,"line")),Raphael.hsl(b.h,this.options.behaveLikeLine?.9*b.s:.75*b.s,Math.min(.98,this.options.behaveLikeLine?1.2*b.l:1.25*b.l))},d.prototype.drawFilledPath=function(a,b){return this.raphael.path(a).attr("fill",b).attr("fill-opacity",this.options.fillOpacity).attr("stroke","none")},d}(b.Line),b.Bar=function(c){function d(c){return this.onHoverOut=f(this.onHoverOut,this),this.onHoverMove=f(this.onHoverMove,this),this.onGridClick=f(this.onGridClick,this),this instanceof b.Bar?(d.__super__.constructor.call(this,a.extend({},c,{parseTime:!1})),void 0):new b.Bar(c)}return h(d,c),d.prototype.init=function(){return this.cumulative=this.options.stacked,"always"!==this.options.hideHover?(this.hover=new b.Hover({parent:this.el}),this.on("hovermove",this.onHoverMove),this.on("hoverout",this.onHoverOut),this.on("gridclick",this.onGridClick)):void 0},d.prototype.defaults={barSizeRatio:.75,barGap:3,barColors:["#0b62a4","#7a92a3","#4da74d","#afd8f8","#edc240","#cb4b4b","#9440ed"],barOpacity:1,barRadius:[0,0,0,0],xLabelMargin:50},d.prototype.calc=function(){var a;return this.calcBars(),this.options.hideHover===!1?(a=this.hover).update.apply(a,this.hoverContentForRow(this.data.length-1)):void 0},d.prototype.calcBars=function(){var a,b,c,d,e,f,g;for(f=this.data,g=[],a=d=0,e=f.length;e>d;a=++d)b=f[a],b._x=this.left+this.width*(a+.5)/this.data.length,g.push(b._y=function(){var a,d,e,f;for(e=b.y,f=[],a=0,d=e.length;d>a;a++)c=e[a],null!=c?f.push(this.transY(c)):f.push(null);return f}.call(this));return g},d.prototype.draw=function(){var a;return((a=this.options.axes)===!0||"both"===a||"x"===a)&&this.drawXAxis(),this.drawSeries()},d.prototype.drawXAxis=function(){var a,b,c,d,e,f,g,h,i,j,k,l,m;for(j=this.bottom+(this.options.xAxisLabelTopPadding||this.options.padding/2),g=null,f=null,m=[],a=k=0,l=this.data.length;l>=0?l>k:k>l;a=l>=0?++k:--k)h=this.data[this.data.length-1-a],b=this.drawXAxisLabel(h._x,j,h.label),i=b.getBBox(),b.transform("r"+-this.options.xLabelAngle),c=b.getBBox(),b.transform("t0,"+c.height/2+"..."),0!==this.options.xLabelAngle&&(e=-.5*i.width*Math.cos(this.options.xLabelAngle*Math.PI/180),b.transform("t"+e+",0...")),(null==g||g>=c.x+c.width||null!=f&&f>=c.x)&&c.x>=0&&c.x+c.width<this.el.width()?(0!==this.options.xLabelAngle&&(d=1.25*this.options.gridTextSize/Math.sin(this.options.xLabelAngle*Math.PI/180),f=c.x-d),m.push(g=c.x-this.options.xLabelMargin)):m.push(b.remove());return m},d.prototype.drawSeries=function(){var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o;return c=this.width/this.options.data.length,h=this.options.stacked?1:this.options.ykeys.length,a=(c*this.options.barSizeRatio-this.options.barGap*(h-1))/h,this.options.barSize&&(a=Math.min(a,this.options.barSize)),l=c-a*h-this.options.barGap*(h-1),g=l/2,o=this.ymin<=0&&this.ymax>=0?this.transY(0):null,this.bars=function(){var h,l,p,q;for(p=this.data,q=[],d=h=0,l=p.length;l>h;d=++h)i=p[d],e=0,q.push(function(){var h,l,p,q;for(p=i._y,q=[],j=h=0,l=p.length;l>h;j=++h)n=p[j],null!==n?(o?(m=Math.min(n,o),b=Math.max(n,o)):(m=n,b=this.bottom),f=this.left+d*c+g,this.options.stacked||(f+=j*(a+this.options.barGap)),k=b-m,this.options.verticalGridCondition&&this.options.verticalGridCondition(i.x)&&this.drawBar(this.left+d*c,this.top,c,Math.abs(this.top-this.bottom),this.options.verticalGridColor,this.options.verticalGridOpacity,this.options.barRadius),this.options.stacked&&(m-=e),this.drawBar(f,m,a,k,this.colorFor(i,j,"bar"),this.options.barOpacity,this.options.barRadius),q.push(e+=k)):q.push(null);return q}.call(this));return q}.call(this)},d.prototype.colorFor=function(a,b,c){var d,e;return"function"==typeof this.options.barColors?(d={x:a.x,y:a.y[b],label:a.label},e={index:b,key:this.options.ykeys[b],label:this.options.labels[b]},this.options.barColors.call(this,d,e,c)):this.options.barColors[b%this.options.barColors.length]},d.prototype.hitTest=function(a){return 0===this.data.length?null:(a=Math.max(Math.min(a,this.right),this.left),Math.min(this.data.length-1,Math.floor((a-this.left)/(this.width/this.data.length))))},d.prototype.onGridClick=function(a,b){var c;return c=this.hitTest(a),this.fire("click",c,this.data[c].src,a,b)},d.prototype.onHoverMove=function(a){var b,c;return b=this.hitTest(a),(c=this.hover).update.apply(c,this.hoverContentForRow(b))},d.prototype.onHoverOut=function(){return this.options.hideHover!==!1?this.hover.hide():void 0},d.prototype.hoverContentForRow=function(a){var b,c,d,e,f,g,h,i;for(d=this.data[a],b="<div class='morris-hover-row-label'>"+d.label+"</div>",i=d.y,c=g=0,h=i.length;h>g;c=++g)f=i[c],b+="<div class='morris-hover-point' style='color: "+this.colorFor(d,c,"label")+"'>\n  "+this.options.labels[c]+":\n  "+this.yLabelFormat(f)+"\n</div>";return"function"==typeof this.options.hoverCallback&&(b=this.options.hoverCallback(a,this.options,b,d.src)),e=this.left+(a+.5)*this.width/this.data.length,[b,e]},d.prototype.drawXAxisLabel=function(a,b,c){var d;return d=this.raphael.text(a,b,c).attr("font-size",this.options.gridTextSize).attr("font-family",this.options.gridTextFamily).attr("font-weight",this.options.gridTextWeight).attr("fill",this.options.gridTextColor)},d.prototype.drawBar=function(a,b,c,d,e,f,g){var h,i;return h=Math.max.apply(Math,g),i=0===h||h>d?this.raphael.rect(a,b,c,d):this.raphael.path(this.roundedRect(a,b,c,d,g)),i.attr("fill",e).attr("fill-opacity",f).attr("stroke","none")},d.prototype.roundedRect=function(a,b,c,d,e){return null==e&&(e=[0,0,0,0]),["M",a,e[0]+b,"Q",a,b,a+e[0],b,"L",a+c-e[1],b,"Q",a+c,b,a+c,b+e[1],"L",a+c,b+d-e[2],"Q",a+c,b+d,a+c-e[2],b+d,"L",a+e[3],b+d,"Q",a,b+d,a,b+d-e[3],"Z"]},d}(b.Grid),b.Donut=function(c){function d(c){this.resizeHandler=f(this.resizeHandler,this),this.select=f(this.select,this),this.click=f(this.click,this);var d=this;if(!(this instanceof b.Donut))return new b.Donut(c);if(this.options=a.extend({},this.defaults,c),this.el="string"==typeof c.element?a(document.getElementById(c.element)):a(c.element),null===this.el||0===this.el.length)throw new Error("Graph placeholder not found.");void 0!==c.data&&0!==c.data.length&&(this.raphael=new Raphael(this.el[0]),this.options.resize&&a(window).bind("resize",function(){return null!=d.timeoutId&&window.clearTimeout(d.timeoutId),d.timeoutId=window.setTimeout(d.resizeHandler,100)}),this.setData(c.data))}return h(d,c),d.prototype.defaults={colors:["#0B62A4","#3980B5","#679DC6","#95BBD7","#B0CCE1","#095791","#095085","#083E67","#052C48","#042135"],backgroundColor:"#FFFFFF",labelColor:"#000000",formatter:b.commas,resize:!1},d.prototype.redraw=function(){var a,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x;for(this.raphael.clear(),c=this.el.width()/2,d=this.el.height()/2,n=(Math.min(c,d)-10)/3,l=0,u=this.values,o=0,r=u.length;r>o;o++)m=u[o],l+=m;for(i=5/(2*n),a=1.9999*Math.PI-i*this.data.length,g=0,f=0,this.segments=[],v=this.values,e=p=0,s=v.length;s>p;e=++p)m=v[e],j=g+i+a*(m/l),k=new b.DonutSegment(c,d,2*n,n,g,j,this.data[e].color||this.options.colors[f%this.options.colors.length],this.options.backgroundColor,f,this.raphael),k.render(),this.segments.push(k),k.on("hover",this.select),k.on("click",this.click),g=j,f+=1;for(this.text1=this.drawEmptyDonutLabel(c,d-10,this.options.labelColor,15,800),this.text2=this.drawEmptyDonutLabel(c,d+10,this.options.labelColor,14),h=Math.max.apply(Math,this.values),f=0,w=this.values,x=[],q=0,t=w.length;t>q;q++){if(m=w[q],m===h){this.select(f);
break}x.push(f+=1)}return x},d.prototype.setData=function(a){var b;return this.data=a,this.values=function(){var a,c,d,e;for(d=this.data,e=[],a=0,c=d.length;c>a;a++)b=d[a],e.push(parseFloat(b.value));return e}.call(this),this.redraw()},d.prototype.click=function(a){return this.fire("click",a,this.data[a])},d.prototype.select=function(a){var b,c,d,e,f,g;for(g=this.segments,e=0,f=g.length;f>e;e++)c=g[e],c.deselect();return d=this.segments[a],d.select(),b=this.data[a],this.setLabels(b.label,this.options.formatter(b.value,b))},d.prototype.setLabels=function(a,b){var c,d,e,f,g,h,i,j;return c=2*(Math.min(this.el.width()/2,this.el.height()/2)-10)/3,f=1.8*c,e=c/2,d=c/3,this.text1.attr({text:a,transform:""}),g=this.text1.getBBox(),h=Math.min(f/g.width,e/g.height),this.text1.attr({transform:"S"+h+","+h+","+(g.x+g.width/2)+","+(g.y+g.height)}),this.text2.attr({text:b,transform:""}),i=this.text2.getBBox(),j=Math.min(f/i.width,d/i.height),this.text2.attr({transform:"S"+j+","+j+","+(i.x+i.width/2)+","+i.y})},d.prototype.drawEmptyDonutLabel=function(a,b,c,d,e){var f;return f=this.raphael.text(a,b,"").attr("font-size",d).attr("fill",c),null!=e&&f.attr("font-weight",e),f},d.prototype.resizeHandler=function(){return this.timeoutId=null,this.raphael.setSize(this.el.width(),this.el.height()),this.redraw()},d}(b.EventEmitter),b.DonutSegment=function(a){function b(a,b,c,d,e,g,h,i,j,k){this.cx=a,this.cy=b,this.inner=c,this.outer=d,this.color=h,this.backgroundColor=i,this.index=j,this.raphael=k,this.deselect=f(this.deselect,this),this.select=f(this.select,this),this.sin_p0=Math.sin(e),this.cos_p0=Math.cos(e),this.sin_p1=Math.sin(g),this.cos_p1=Math.cos(g),this.is_long=g-e>Math.PI?1:0,this.path=this.calcSegment(this.inner+3,this.inner+this.outer-5),this.selectedPath=this.calcSegment(this.inner+3,this.inner+this.outer),this.hilight=this.calcArc(this.inner)}return h(b,a),b.prototype.calcArcPoints=function(a){return[this.cx+a*this.sin_p0,this.cy+a*this.cos_p0,this.cx+a*this.sin_p1,this.cy+a*this.cos_p1]},b.prototype.calcSegment=function(a,b){var c,d,e,f,g,h,i,j,k,l;return k=this.calcArcPoints(a),c=k[0],e=k[1],d=k[2],f=k[3],l=this.calcArcPoints(b),g=l[0],i=l[1],h=l[2],j=l[3],"M"+c+","+e+("A"+a+","+a+",0,"+this.is_long+",0,"+d+","+f)+("L"+h+","+j)+("A"+b+","+b+",0,"+this.is_long+",1,"+g+","+i)+"Z"},b.prototype.calcArc=function(a){var b,c,d,e,f;return f=this.calcArcPoints(a),b=f[0],d=f[1],c=f[2],e=f[3],"M"+b+","+d+("A"+a+","+a+",0,"+this.is_long+",0,"+c+","+e)},b.prototype.render=function(){var a=this;return this.arc=this.drawDonutArc(this.hilight,this.color),this.seg=this.drawDonutSegment(this.path,this.color,this.backgroundColor,function(){return a.fire("hover",a.index)},function(){return a.fire("click",a.index)})},b.prototype.drawDonutArc=function(a,b){return this.raphael.path(a).attr({stroke:b,"stroke-width":2,opacity:0})},b.prototype.drawDonutSegment=function(a,b,c,d,e){return this.raphael.path(a).attr({fill:b,stroke:c,"stroke-width":3}).hover(d).click(e)},b.prototype.select=function(){return this.selected?void 0:(this.seg.animate({path:this.selectedPath},150,"<>"),this.arc.animate({opacity:1},150,"<>"),this.selected=!0)},b.prototype.deselect=function(){return this.selected?(this.seg.animate({path:this.path},150,"<>"),this.arc.animate({opacity:0},150,"<>"),this.selected=!1):void 0},b}(b.EventEmitter)}).call(this);
/*! Select2 4.0.2-rc.1 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=v.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),n.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var c=r[a];delete r[a],t[a]=!0,m.apply(b,c)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,c,d,f){var h,k,l,m,n,s,u=[],v=typeof d;if(f=f||a,"undefined"===v||"function"===v){for(c=!c.length&&d.length?["require","exports","module"]:c,n=0;n<c.length;n+=1)if(m=o(c[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=d?d.apply(q[a],u):void 0,a&&(h&&h.exports!==b&&h.exports!==q[a]?q[a]=h.exports:l===b&&s||(q[a]=l))}else a&&(q[a]=d)},a=c=n=function(a,c,d,e,f){if("string"==typeof a)return p[a]?p[a](c):j(o(a,c).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?m(b,a,c,d):setTimeout(function(){m(b,a,c,d)},4),n},n.config=function(a){return n(a)},a._defined=q,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){var e=b[d];"function"==typeof e&&"constructor"!==d&&c.push(d)}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){var a=Array.prototype.unshift;return a.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice;this.listeners=this.listeners||{},a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;d>c;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;a>c;c++){var d=Math.floor(36*Math.random());b+=d.toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return e!==f||"hidden"!==f&&"visible"!==f?"scroll"===e||"scroll"===f?!0:d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth:!1},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){var c=b.find(".select2-results");c.append(a)},c.prototype.sort=function(a){var b=this.options.get("sorter");return b(a)},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()}),e=b.$results.find(".select2-results__option[aria-selected]");e.each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")});var f=e.filter("[aria-selected=true]");f.length>0?f.first().trigger("mouseenter"):e.first().trigger("mouseenter")})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{"class":"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&d.setClasses()}),b.on("unselect",function(){b.isOpen()&&d.setClasses()}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):0>h-g&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");return"true"===c.attr("aria-selected")?void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{})):void d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){var a=this.$results.find(".select2-results__option--highlighted");return a},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),2>=c?this.$results.scrollTop(0):(g>this.$results.outerHeight()||0>g)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){var a={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46};return a}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id+"-container",a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2"),e=a(".select2.select2-container--open");e.each(function(){var b=a(this);if(this!=d[0]){var c=b.data("element");c.select2("close")}})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){var c=b.find(".selection");c.append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},d.prototype.selectionContainer=function(){var b=a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');return b},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id,d=b.length>1;if(d||c)return a.call(this,b);this.clear();var e=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(e)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||(c.which==b.DELETE||c.which==b.BACKSPACE)&&this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented();var b=a.which;if(b===c.BACKSPACE&&""===e.$search.val()){var d=e.$searchContainer.prev(".select2-selection__choice");if(d.length>0){var f=d.data("data");e.searchRemoveChoice(f),a.preventDefault()}}});var f=document.documentMode,g=f&&11>=f;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){return g?void e.$selection.off("input.search input.searchcheck"):void e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{var b=this.$search.val().length+1;a=.75*b+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){var a={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return a}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),d+=null!=c.id?"-"+c.id.toString():"-"+a.generateChars(4)},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple"))return a.selected=!1,
c(a.element).is("option")?(a.element.selected=!1,void this.$element.trigger("change")):void this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this,f=this.$element.children();f.each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(b=c.data(a[0],"data"),null!=b)return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){var c=this.options.get("matcher");return c(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&""!==a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0),k=i.text===b.term;if(k||j)return f?!1:(a.data=g,void c(a))}if(f)return!0;var l=e.createTag(b);if(null!=l){var m=e.option(l);m.attr("data-select2-tag",!0),e.addOptions([m]),e.insertTag(g,l)}a.results=g,c(a)}var e=this;return this._removeOldTags(),null==b.term||null!=b.page?void a.call(this,b,c):void a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){var c=(this._lastTag,this.$element.find("option[data-select2-tag]"));c.each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(a,b,c){function d(a){e.trigger("select",{data:a})}var e=this;b.term=b.term||"";var f=this.tokenizer(b,this.options,d);f.term!==b.term&&(this.$search.length&&(this.$search.val(f.term),this.$search.focus()),b.term=f.term),a.call(this,b,c)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",b.term.length<this.minimumInputLength?void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength?void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;return d.maximumSelectionLength>0&&f>=d.maximumSelectionLength?void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}}):void a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){var b=e.showSearch(a);b?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){var c=e.$results.offset().top+e.$results.outerHeight(!1),d=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1);c+50>=d&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id,h=this.$container.parents().filter(b.hasScroll);h.off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return a(c.data.results)<this.minimumResultsForSearch?!1:b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(){d._handleSelectOnClose()})},a.prototype._handleSelectOnClose=function(){var a=this.getHighlightedResults();if(!(a.length<1)){var b=a.data("data");null!=b.element&&b.element.selected||null==b.element&&b.selected||this.trigger("select",{data:b})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){var b=a.minimum-a.input.length,c="Please enter "+b+" or more characters";return c},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),(null!=l.tokenSeparators||null!=l.tokenizer)&&(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(O){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(P){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var Q=k.loadPath(this.defaults.amdLanguageBase+"en"),R=new k(l.language);R.extend(Q),l.translations=R}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){var h=e.children[g],i=c(d,h);null==i&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var j=b(e.text).toUpperCase(),k=b(d.term).toUpperCase();return j.indexOf(k)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)};var E=new D;return E}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return 0>=e?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;i>h;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this._sync=c.bind(this._syncAttributes,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._sync);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._sync)}),this._observer.observe(this.$element[0],{attributes:!0,subtree:!1})):this.$element[0].addEventListener&&this.$element[0].addEventListener("DOMAttrModified",b._sync,!1)},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),(null==a||0===a.length)&&(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._sync),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&this.$element[0].removeEventListener("DOMAttrModified",this._sync,!1),this._sync=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("jquery-mousewheel",["jquery"],function(a){return a}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if(b=b||{},"object"==typeof b)return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d;return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2.");var e=Array.prototype.slice.call(arguments,1);d=c[b].apply(c,e)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});
//# sourceMappingURL=all.js.map
