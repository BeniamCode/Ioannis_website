;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = window.jQuery;

// Assumptions:

// CustomPagerSlider element is a properly set up flexslider, and uses 
// default flexslider controls in a custom container.
// Classes array should have the number of pager items visible at any given time and
// should have position classes in the order in which they will be applied. 
// This array should include side classes for the first offscreen elements
// on either side which includes the hidden class. It expects an ODD number (for now), and the active item is in the middle.
// Offscreen class should hide the elements in some way via CSS.
/**
 * [CustomPagerSlider description]
 * @param {[type]} el
 * @param {[type]} controlsContainer
 * @param {[type]} title
 * @param {[type]} positionClasses
 * @param {[type]} hiddenClass
 */
var CustomPagerSlider = function(args) {
	this.$el = $(args.slider);
	this.controlsContainer = this.$el.parent().find(args.controlsContainer);
	this.title = args.title;
	this.positionClasses = args.positionClasses;
	this.numberOfVisibleElements = this.positionClasses.length;
	this.hiddenClass = args.hiddenClass;

	this.init();
}

$.extend(CustomPagerSlider.prototype, {

	// apply position classes based on active element
	updatePagerPositions: function(index, distance) {
		var _this = this;

		// find active slide pager
		var activeSlide = index >= 0 ? this.controlsContainer.find('li:eq(' + index + ')') : this.controlsContainer.find('.flex-active').closest('li');

		// get array of visible pagers
		var pagerArray = this.getPagerArray(activeSlide);
		
		// if distance > 1, do it twice
		
		if (Modernizr.csstransitions) {
			if (distance && Math.abs(distance) !== 1 && Math.abs(distance) !== 6) {
				var direction = (distance === 2 || distance === -5) ? 'back' : 'forward';

				this.travelThrough(direction, activeSlide, pagerArray);

				return;
			}
		}

		$.each(pagerArray, function(i, el) {
			$(el).attr('class', _this.positionClasses[i]);
			$(el).attr('style', '');
		})

	},

	travelThrough: function(direction, activeSlide, pagerArray) {
		var _this = this;

		var prevActive = $(activeSlide).prev().length ? $(activeSlide).prev() : $(activeSlide).siblings('li:last-child');
		var nextActive = $(activeSlide).next().length ? $(activeSlide).next() : $(activeSlide).siblings('li:first-child');

		var pagerArrayBack = this.getPagerArray(prevActive);
		var pagerArrayForward = this.getPagerArray(nextActive);

		if (direction == 'back') {
			$.each(pagerArrayBack, function(i, el) {
				$(el).attr('class', _this.positionClasses[i]);
				$(el).attr('style', '');
			})
		} else if (direction == 'forward') {
			$.each(pagerArrayForward, function(i, el) {
				$(el).attr('class', _this.positionClasses[i]);
				$(el).attr('style', '');
			})
		}

		setTimeout(function(){
			$.each(pagerArray, function(i, el) {
				$(el).attr('class', _this.positionClasses[i]);
				$(el).attr('style', '');
			})
		},500);

		// $('.active').on('webkitTransitionEnd', function(e){
		// 	$.each(pagerArray, function(i, el) {
		// 		$(el).attr('class', _this.positionClasses[i]);
		// 		$(el).attr('style', '');
		// 	})
		// })
	},

	getPagerArray: function(el) {
		var _this = this;

		var $el = $(el),
			flankLength = (this.numberOfVisibleElements - 1)*0.5;

		var elements = [$el];

		for (var i = 0; i <= flankLength; i++) {
			var prev = $(elements[0]).prev().length ? $(elements[0]).prev()[0] : $el.siblings(':last-child')[0],
				next = $(elements[elements.length-1]).next().length ? $(elements[elements.length-1]).next()[0] : $el.siblings(':first-child')[0];

			if (elements.length < _this.numberOfVisibleElements) {
				if (next) elements.push(next);
				if (prev) elements.unshift(prev);
			}
		}

		return elements;
	},

	//

	init: function() {
		var _this = this;
		var linkTitles = [];

		// instantiate flexslider
		this.$el.flexslider({
			directionNav: false,
			pauseOnHover: true,
			slideshow: false,
			controlsContainer: _this.controlsContainer,
			start: $.proxy(_this.updatePagerPositions, _this),
			before: function(slider) {
				$(_this.controlsContainer).addClass('sliding');

				var distance = slider.animatingTo - slider.currentSlide;

				_this.updatePagerPositions(slider.animatingTo, distance);
			},
			after: function(slider) {
				// $('.offscreen').css('display', 'none');
				$(_this.controlsContainer).removeClass('sliding');
			}
		})

		// Custom Link titles
		this.$el.find('li').each(function(i, el){
			var title = $(el).find(_this.title).text();

			linkTitles.push(title);
		});
		this.controlsContainer.find('li').each(function(i, el){
			$(el).find('a').html('<span>' + linkTitles[i] + '</span>');
		})
	}

})

// Export
exports.CustomPagerSlider = CustomPagerSlider;
},{}],2:[function(require,module,exports){
/*
requires Form Element to have a data-posturl attr
 */

var $ = window.jQuery;

var Editable = function(args) {
	this.$formElement = $(args.formElement);
	this.$textElement = $(args.textElement);
	this.$fieldElement = $(args.fieldElement);
	this.$container = $(args.container);
	this.editClass = args.editClass;
	this.submitBtn = args.submitBtn;
	this.$submit = $(this.submitBtn);

	this.isEditing = false;

	this.$doc = $(document);

	this.init();
};

$.extend(Editable.prototype, {

	enterEditMode: function(e) {
		if (e) e.preventDefault();

		this.isEditing = true;

		this.$textElement.parent().addClass(this.editClass);
		this.$fieldElement[0].focus();
	},

	exitEditMode: function(e) {
		if (e) e.preventDefault();

		this.isEditing = false;

		this.$fieldElement.val('');
		this.$textElement.parent().removeClass(this.editClass);
	},

	submitSearchForm: function(e) {
		if (e) e.preventDefault();

		var _this = this,
			$body = $('body');


		if(this.$formElement.hasClass('reload')){
			this.$formElement.submit();
		} else {
			$body.addClass('ajax-loading');

			var data = {
				action: this.$formElement.attr('action'),
				term: this.$fieldElement.val()
			};

			$.post(this.$formElement.data('posturl'), data, function(response) {
				_this.$container.html(response);
				_this.exitEditMode();
				$body.removeClass('ajax-loading');
			});
		}
	},

	init: function() {
		var _this = this;

		this.$textElement.on('click', $.proxy(this.enterEditMode, this));
		
		this.$doc.on('click', function(e){
			if (e.target != _this.$textElement[0] && e.target != _this.$fieldElement[0] && e.target != $(_this.submitBtn)[0]) {
				_this.exitEditMode();
			}
		})

		if(!this.$formElement.hasClass('reload')){
			this.$formElement.submit($.proxy(this.submitSearchForm, this));
		}

		this.$doc.on('click', this.submitBtn, function(e){
			e.preventDefault();

			if (_this.isEditing) {
				_this.submitSearchForm();
			} else {
				_this.enterEditMode();
			}
		})
	}

})

module.exports = Editable;
},{}],3:[function(require,module,exports){
var elementIsInView = function(el) {
	var $win = jQuery(window),
		$el = jQuery(el);

	var windowHeight = $win.height(),
		totalScroll = $win.scrollTop() + windowHeight,
		offsetTop = $el.offset().top;

	var isInView = offsetTop >= totalScroll && (totalScroll >= (offsetTop + $el.height() + windowHeight));

	$el.toggleClass('in-view', isInView);

	return isInView;
};

exports.elementIsInView = elementIsInView;
},{}],4:[function(require,module,exports){
var sketchPath = require('./sketch-path.js').sketchPath;
var erasePath = require('./sketch-path.js').erasePath;

var $ = window.jQuery;

var FBDS = function(el, selector, activeClass, delay, closeBtn) {
	this.$el = $(el);
	this.selector = selector;
	this.$valueElements = this.$el.find(selector);
	this.closeBtn = closeBtn;

	this.activeClass = activeClass;
	this.delay = delay || 2000;

	this.$currentValueElement = $(this.$valueElements[0]);

	this.init();
};

$.extend(FBDS.prototype, {

	start: function() {
		var _this = this;

		this.interval = setInterval(function(){
			_this.$el.trigger('play-next');
		}, _this.delay);
	},

	stop: function() {
		this.$valueElements.removeClass(this.activeClass);
		clearInterval(this.interval);
	},

	playNext: function() {
		var next = this.$currentValueElement.next().length ? this.$currentValueElement.next() : this.$valueElements[0],
			$next = $(next);

		this.$valueElements.removeClass(this.activeClass);

		$next.addClass(this.activeClass);

		this.$currentValueElement = $next;
	},

	showAnimation: function(e) {
		e.preventDefault();

		this.stop();
		this.$el.off('mouseover mouseout');

		this.$el.addClass('suppress');

		var $clicked = $(e.currentTarget),
			target = $clicked.data('target'),
			$target = $(target);

		$target.siblings().removeClass('show');
		$target.addClass('show');
		sketchPath(target);
	},

	hideAnimation: function(e) {
		e.preventDefault();

		this.start();
		this.addHoverListeners();

		this.$el.removeClass('suppress');
		$('.recede').removeClass('recede');

		$(e.currentTarget).parent().removeClass('show');
		erasePath($(e.currentTarget).parent()[0]);
	},

	addHoverListeners: function() {
		var _this = this;

		this.$el.on('mouseover', this.selector, function(e){
			_this.stop();
			_this.$el.addClass('recede');
			$(this).siblings().addClass('recede');
		});
		this.$el.on('mouseout', this.selector, function(e){
			_this.start();
			_this.$el.removeClass('recede');
			$(this).siblings().removeClass('recede');
		});
	},

	init: function() {
		var _this = this;

		this.addHoverListeners();

		this.$el.on('play-next', $.proxy(this.playNext, this));

		this.$valueElements.on('click', $.proxy(this.showAnimation, this));
		$('body').on('click', this.closeBtn, $.proxy(this.hideAnimation, this));

		this.$currentValueElement.addClass(this.activeClass);

		this.start();
	}

})

// Export
module.exports = FBDS;
},{"./sketch-path.js":11}],5:[function(require,module,exports){
var $ = window.jQuery;

var TileFilter = function (context, trigger, action, callback) {
	this.$context = $(context);
	this.trigger = trigger;
	this.action = action;
	this.callback = callback;
};

$.extend(TileFilter.prototype, {

	init: function() {
		var _this = this;

		this.$context.one('click', this.trigger, function(e){
			e.preventDefault();

			var $trigger = $(e.currentTarget);

			_this.$context.addClass('ajax-loading');

			var office = $trigger.attr("data-office");
			var filter = $trigger.attr("data-filter");

			var data = {
				action: _this.action,
				office: office,
				filter: filter
			};


			$.post('/wp-admin/admin-ajax.php', data, function(response) {
				$('.rss-grid').empty();
				$('.rss-grid').append(response);
				
				_this.$context.find(_this.trigger).removeClass('active');
				$trigger.addClass('active');

				_this.$context.removeClass('ajax-loading');

				if (_this.callback) {
					_this.callback();
				}
			});
		})
	}

})

module.exports = TileFilter;
},{}],6:[function(require,module,exports){
var $ = window.jQuery;

var LoadMoreInfinite = function(context, trigger, target, action) {
	var _this = this;

	this.context = context;
	this.trigger = trigger;
	this.target = target;
	this.action = action;

	this.init();
	
	$(document).on('pjax:complete', function() {
		_this.init();
	});

	$(document).on('pjax:beforeSend', function() {
		$(context).find(trigger).infiniteScrollHelper('destroy');
	});
}

$.extend(LoadMoreInfinite.prototype, {

	init: function(){
		var _this = this;

		var $trigger = $(this.context).find(this.trigger),
		$target = $(this.context).find(this.target);

		var search_disabled = $target.attr('data-search-disabled');
		var modalOpen = !!$('body').hasClass('open-modal');
	
		if(search_disabled != 1 && !modalOpen){
			var ish = new InfiniteScrollHelper($trigger.infiniteScrollHelper({

				loadMore: function(page, done) {

					var offset = parseInt($target.attr("data-offset"));
					var offset_count = parseInt($target.attr("data-offset-count"));
					var office = $target.attr("data-office");
					var person = $target.attr("data-people");
					// ajax request would be kicked off here
					var data = {
						action: _this.action,
						offset: offset,
						office: office,
						person: person, 
						term: ''
					};

					$.post('/wp-admin/admin-ajax.php', data, function(response) {
						if(response == 'false'){
							$trigger.infiniteScrollHelper('destroy');
						} else {
							$target.append(response);
							$target.attr("data-offset", offset + offset_count);
						}

						done();
					});
				},
				bottomBuffer: 0,
				triggerInitialLoad: false,
				loadingClassTarget: _this.trigger
			}));
		}
	}

})

module.exports = LoadMoreInfinite;
},{}],7:[function(require,module,exports){
// required scripts
require('../vendor/jquery.flexslider-min.js');
require('../vendor/jquery.infinite-scroll-helper.min.js');

// required functions as variables
var ParallaxElement = require('./parallax.js');
var ScrollManager = require('./scrolling-page.js');
var FBDS = require('./fbds.js');
var sketchPath = require('./sketch-path.js').sketchPath;
var erasePath = require('./sketch-path.js').erasePath;
var CustomPagerSlider = require('./custom-pager-flexslider.js').CustomPagerSlider;
var AsyncModal = require('./modals.js');
var EditableFormSubmit = require('./editable-form-submit.js');
var TileFilter = require('./filter-tiles.js');
var loadMoreInfinite = require('./load-more-infinite.js');
var triggerToggle = require('./trigger-toggle.js');
var TileCycler = require('./tile-cycler.js');

// cache jQuery and dom elements
var $ = window.jQuery;
var $doc = $(document),
	$body = $('body');


/* Consistent on all/many pages */
function commonInit() {
	sketchPath('h1');
	
	/* Safari position bug - titles won't write due to conflicts with
	/* fixed position menu.  This is a HACK for now */
	var $current = $('.current-menu-item');
	$current.addClass('hover');
	setTimeout(function(){ $current.removeClass('hover') }, 0);

	new triggerToggle('.toggle-drawer', {
		closeOnStart: true,
		toggleClass: 'closed'
	});
}

/* Page-specific object instantiation and misc. */

function homepageInit() {
	new AsyncModal({
	    context: '.home',
	    trigger: '.work-block',
	    modalSelector: '#client-modal',
	    overlay: '.overlay',
	    closeBtn: '.close-btn',
	    currentDirectory: '',
	    title: 'Home',
	    isPjax: true
	});

	new AsyncModal({
		context: '.home',
		trigger: '.leader-group li',
		modalSelector: '#person-modal',
		overlay: '.overlay',
		closeBtn: '.close-btn',
		currentDirectory: '',
		title: 'Home',
		isPjax: true
	});

	new FBDS('#value-illustration', '.value', 'entice', 2000, '.hide');

	new CustomPagerSlider({
		slider: '.history-slider', 
		controlsContainer: '.manual-pager', 
		title: 'h2', 
		positionClasses: ['positioned offscreen left', 'positioned edge far-left', 'positioned mid-left', 'positioned active', 'positioned mid-right', 'positioned edge far-right', 'positioned offscreen right'], 
		hiddenClass: 'offscreen'
	});

	new ParallaxElement('.chalk-path', {
		property: 'stroke-dashoffset',
		speed: 3.05
	});

	new ScrollManager('#homepage-wrapper .content', {
		panel: '.panel',
		navigation: '#secondary'
	});
}

function locationsInit () {

	var tileCycle = new TileCycler({
		tileContainer: '.rss-grid',
		tileSelector: 'li',
		length: 12,
		innerContent: '.content-wrapper',
		transitionOutClass: 'transitioning'
	});

	var tileFilter = new TileFilter('.contact', '.tile-filter a', 'get_filtered_office_content', function() {
		tileFilter.init();
		tileCycle.init();
	});

	tileFilter.init();
	tileCycle.init();
}
function articleInit() {

	// Async Ajax Calls
	new loadMoreInfinite('.news', '#contact', '.article-list', 'get_news_posts');
	new loadMoreInfinite('.blog', '#contact', '.article-list', 'get_blog_posts');
	new loadMoreInfinite('.category', '#contact', '.pjax-container', 'get_category_posts');

	new EditableFormSubmit({
		formElement: '#search-form',
		textElement: '.search',
		fieldElement: '.search-field',
		editClass: 'search-mode',
		submitBtn: '.search-submit',
		container: '.search-results'
	});
}

function workInit() {
	new AsyncModal({
		context: '.work',
		trigger: '.grid-tile',
		modalSelector: '#work-modal',
		overlay: '.overlay',
		closeBtn: '.close-btn',
		currentDirectory: '/work',
		title: 'Work',
		isPjax: true
	});

	new EditableFormSubmit({
		formElement: '#search-form',
		textElement: '.search',
		fieldElement: '.search-field',
		editClass: 'search-mode',
		submitBtn: '.search-submit',
		container: '.search-results'
	});

	new triggerToggle('.view-case-study', {
		toggleElement: '#case-study',
		toggleClass: 'open',
		toggleText: 'Close Case Study',
		originalText: 'View Case Study'
	});

	var loadmore = new loadMoreInfinite('.work', '#contact', '#work-wrapper', 'get_more_work');

	$body.on('modal-closed', function(e) {
		loadMore.init();
	});
}

function peopleInit() {
	new AsyncModal({
		context: '.people',
		trigger: '.grid-tile',
		modalSelector: '#person-modal',
		overlay: '.overlay',
		closeBtn: '.close-btn',
		currentDirectory: '/people',
		title: 'People',
		isPjax: true
	});

	new EditableFormSubmit({
		formElement: '#search-form',
		textElement: '.search',
		fieldElement: '.search-field',
		editClass: 'search-mode',
		submitBtn: '.search-submit',
		container: '.search-results'
	});

	var loadMore = new loadMoreInfinite('.people', '#contact', '#people-wrapper', 'get_more_people');

	$body.on('modal-closed', function(e) {
		loadMore.init();
	});
}


/* PJAX Modals */
/* PJAX default settings */
if ($.pjax.defaults) {
	$.pjax.defaults.timeout = 50000;
	$.pjax.defaults.scrollTo = false;
}
$doc.on('pjax:beforeSend', function() {
	$body.addClass('pjax-loading');
});
$doc.on('pjax:complete', function() {
	$body.removeClass('pjax-loading');
	if ($body.hasClass('contact')) locationsInit();
	if ($body.hasClass('work')) workInit();
	if ($body.hasClass('people')) peopleInit();
	if ($body.hasClass('news') || $body.hasClass('blog')) articleInit();
});
$doc.pjax('.region-filter', '.map-content-wrapper');
$doc.pjax('#locations a', '.map-content-wrapper');
$doc.pjax('.dropdown a', '.pjax-container');
$doc.pjax('.clear-filter', '.pjax-container');


/* Flexsliders */
/* Flexsliders have classes/data attr to determine what
/* config options to use. */

$('.flexslider').each(function(i, el){
	var $el = $(el),
		manualControls = $el.hasClass('custom-controls') ? $el.parents('section').find('.manual-controls li a') : false,
		controlsContainer = $el.hasClass('custom-controls') ? false : $el.parents('section').find('.manual-pager'),
		showControls = $el.hasClass('no-controls') != true,
		autoSlide = $el.hasClass('autoslide'),
		animation = $el.data('animation') || 'fade',
		direction = $el.data('direction') || 'horizontal';
		slideshowSpeed = Number($el.data('speed')) || 7000;

	$el.flexslider({
		directionNav: false,
		controlNav: showControls,
		pauseOnHover: true,
		manualControls: manualControls,
		controlsContainer: controlsContainer,
		animation: animation,
		direction: direction,
		slideshowSpeed: slideshowSpeed,
		slideshow: autoSlide,
		useCSS: false
	})
})

/* To have more control over pager markup, we are using these
/* custom prev/next links instead of their defaults */
$('.flex-direction-link').on('click', function(e){
	e.preventDefault();

	var flexslider = $(this).data('slider'),
		dir = $(this).data('direction');

	$(flexslider).flexslider(dir);
});


/*-------------------------------------------- */
/** Initialize Page Javascript */
/*-------------------------------------------- */

// common js to init once
commonInit();

// find better way to target pages?
if ($body.hasClass('home')) homepageInit();
if ($body.hasClass('work')) workInit();
if ($body.hasClass('people')) peopleInit();
if ($body.hasClass('contact')) locationsInit();
if ($body.hasClass('news') || $body.hasClass('blog')) articleInit();

},{"../vendor/jquery.flexslider-min.js":15,"../vendor/jquery.infinite-scroll-helper.min.js":16,"./custom-pager-flexslider.js":1,"./editable-form-submit.js":2,"./fbds.js":4,"./filter-tiles.js":5,"./load-more-infinite.js":6,"./modals.js":8,"./parallax.js":9,"./scrolling-page.js":10,"./sketch-path.js":11,"./tile-cycler.js":12,"./trigger-toggle.js":13}],8:[function(require,module,exports){
require('../vendor/jquery.pjax.js');

var $ = window.jQuery;

var AsyncModal = function(opts) {
	this.modalSelector = opts.modalSelector;
	this.trigger = opts.trigger;
	this.overlay = opts.overlay;
	this.closeBtn = opts.closeBtn;

	this.isPjax = opts.isPjax;
	this.postUrl = opts.postUrl;
	this.action = opts.action;
	this.baseUrl = 'http://' + window.location.hostname + opts.currentDirectory;
	this.title = opts.title;

	this.$context = $(opts.context);
	this.$body = $('body');

	this.closeOnOverlayClick = opts.closeOnOverlayClick || true;
	this.isLoading = false;

	this.init();
};

$.extend(AsyncModal.prototype, {

	openModal: function(dataUrl, currentTrigger) {
		var _this = this;

		this.isLoading = true;

		this.baseUrl = window.location.href;
		this.$modal = this.$context.find(this.modalSelector);

		this.$body.addClass('open-modal');

		// open modal immediately in loading state
		this.$modal.addClass('open loading');

		// if AJAX
		if (!this.isPjax) {
			var data = {
				action: this.action,
				id: $(currentTrigger).attr('data-id')
			};
			$.post(this.postUrl, data, function(response){
				_this.$modal.html(response);
				_this.$modal.removeClass('loading');
				_this.addCloseListeners();
			})
			return;
		}

		$.pjax({
			url: dataUrl, 
			container: this.modalSelector
		});
		
		// on complete, hook up close listeners & remove loading
		this.$context.on('pjax:complete', function() {
			var topOffset = window.scrollY + (($(window).height() - _this.$modal.height()) * .5);
				topOffset = topOffset < 0 ? window.scrollY : topOffset;

			_this.$modal.removeClass('loading').css('top', topOffset);
			_this.addCloseListeners();

			_this.isLoading = false;

			if($(currentTrigger).attr('data-title') != undefined)
				document.title = $(currentTrigger).attr('data-title');
		});
	},

	closeModal: function(e) {
		if (e) e.preventDefault();

		if (this.isLoading) return;

		this.$body.removeClass('open-modal');
		
		this.$context.find(this.modalSelector).removeClass('open').html('');
		
		document.title = this.title + ' | Initiative';

		if (window.history.replaceState) {
 			window.history.replaceState({}, '', this.baseUrl);
 		} else {
 			window.location.replace(this.baseUrl);
 		}

 		this.$body.trigger('modal-closed');
 		this.removeCloseListeners();
	},

	addCloseListeners: function() {
		var $overlay = $(this.overlay),
			$closeBtn = this.$context.find(this.closeBtn);

		$closeBtn.one('click', $.proxy(this.closeModal, this));

		if (this.closeOnOverlayClick) {
			$overlay.on('click', $.proxy(this.closeModal, this));
		}
	},

	removeCloseListeners: function() {
		var $overlay = $(this.overlay),
			$closeBtn = this.$context.find(this.closeBtn);

		$closeBtn.off();
		$overlay.off();
	},

	init: function() {
		var _this = this;
		this.addCloseListeners();

		// remove any old handlers
		this.$context.off('click', this.trigger);

		if (!this.isPjax) $.pjax.disable();

		if (!Modernizr.history) {
			this.baseUrl = document.referrer || this.baseUrl;
		}

		this.$context.on('click', this.trigger, function(e) {
			e.preventDefault();

			var currentTrigger = e.currentTarget,
				dataUrl = $(currentTrigger).attr('href') || $(currentTrigger).data('url');

			_this.openModal(dataUrl, currentTrigger);
		});
	}
})

module.exports = AsyncModal;
},{"../vendor/jquery.pjax.js":17}],9:[function(require,module,exports){
var elementIsInView = require('./element-in-view.js').elementIsInView,
	$ = window.jQuery;

/*************************************

Parallax

*************************************/

var ParallaxElement = function(el, opts, undefined) {
	// jquery elements
	this.$el = $(el);
	this.$parent = opts.parent ? $(opts.parent) : this.$el.parents('section');

	// bool options
	this.animateWhenOutOfView = opts.animateWhenOutOfView || false;
	this.fullSizeBG = opts.fullSizeBG;
	this.fullScreen = opts.fullScreen;
	
	// value options
	this.evt = opts.evt || 'scroll';
	this.property = opts.property;
	this.fallbackProperty = opts.fallbackProperty;
	this.direction = opts.direction || 'positive';
	this.speed = opts.speed || 1;
	this.delay = opts.delay;
	this.stopAtValue = opts.stopAtValue;

	// function options
	this.valueCalculation = opts.valueCalculation || false; // NOTE: Value calculations must implement their own SPEED
	this.propertyValueFormat = opts.propertyValueFormat;
	this.getOriginalVal = opts.getOriginalVal || false;
	this.stopCallback = opts.stopCallback;

	// cache dom elements
	this.$win = $(window);
	this.$doc = $(document);

	// tracking vars
	this.lastScrollY = this.$win.scrollTop();
	this.isQueued = false;
	this.paused = false;
	this.stopped = false;
	this.destroyed = false;
	this.resizeTicker = 0;

	if (!opts.manualInit) {
		this.init();		
	}
};

$.extend(ParallaxElement.prototype, {

	scrollHandler: function() {
		if (this.canAnimate()) this.animate();
	},

	canAnimate: function() {
		var parentInView = this.$parent[0] ? elementIsInView(this.$parent[0]) : true;

		var cannotAnimate = this.destroyed || this.paused || !parentInView && !this.animateWhenOutOfView || this.$win.scrollTop() < this.calculatedDelay;

		return !cannotAnimate;
	},

	calculateMoveValue: function() {
		// calculate moveValue
		var moveValue = (this.$win.scrollTop() - this.calculatedDelay) * this.speed;
		// modify based on direction
		moveValue = this.direction == 'negative' ? Number(this.originalVal) - moveValue : Number(this.originalVal) + moveValue;

		// replace with custom value calculation if given
		if (typeof this.valueCalculation == 'function') moveValue = this.valueCalculation.call(this.$el[0]);

		// stop moving at value if specified
		if (this.stopAtValue !== undefined) {
			moveValue = this.checkForStop(moveValue);
		}

		return Math.ceil(moveValue);
	},

	checkForStop: function(moveValue) {
		switch (this.originalVal < this.stopAtValue) {
				case true: 
					if (moveValue >= this.stopAtValue){
						moveValue = this.stopAtValue;
						if (this.stopCallback) this.stopCallback(this.$el);
						this.stopped = true;
					}
					break;
				case false:
					if (moveValue <= this.stopAtValue){
						moveValue = this.stopAtValue;
						if (this.stopCallback) this.stopCallback(this.$el);
						this.stopped = true;
					}
					break;
			}

		return moveValue;
	},

	checkforRestart: function(moveValue) {
		if (this.originalVal < this.stopAtValue && moveValue <= this.stopAtValue) {
			this.stopped = false;
		} else if (this.originalVal > this.stopAtValue && moveValue >= this.stopAtValue) {
			this.stopped = false;
		}
	},

	animate: function() {
		var moveValue = this.calculateMoveValue();

		if (this.fallbackProperty && !Modernizr.csstransitions) {
			this.$el.css(this.fallbackProperty, Math.ceil(moveValue));
			return;
		}

		// property value needs custom format
		if (this.propertyValueFormat) {
			moveValue = this.propertyValueFormat(this.$el, moveValue);
		}

		// update css property
		this.$el.css(this.property, moveValue);

		// if stopped, keep track of when to un-stop
		if (this.stopped) this.checkforRestart();
	},

	animateTo: function(newPosition) {
		var self = this;
		this.originalVal = [newPosition];

		if (this.propertyValueFormat) {
			newPosition = this.propertyValueFormat(this.$el, newPosition);
		}

		this.$el.css(this.property, newPosition);
	},

	calculateOriginalVal: function() {
		var self = this;

		return parseFloat(this.$el.css(this.property)) || 0;
	},

	resetPosition: function(ticker) {
		var self = this;

		// debounce until resize is over
		setTimeout(function(){
			if (ticker == self.resizeTicker) {
				self.destroy();
				self.init();
			} else {
				return;
			}
		}, 400);
	},

	pause: function() {
		this.paused = true;
		this.originalVal = this.getOriginalVal ? [this.getOriginalVal(this.$el[0])] : this.calculateOriginalVal();
		this.$el.trigger('pause');
	},

	start: function() {
		this.paused = false;
		this.$el.trigger('start');
	},

	destroy: function() {
		this.destroyed = true;
		this.$el.css(this.property, '');
	},

	init: function() {
		var self = this;

		this.destroyed = false;

		// calculated vals
		this.originalVal = this.getOriginalVal ? this.getOriginalVal(this.$el[0]) : this.calculateOriginalVal();

		var offset = this.$el.css('position') == 'fixed' ? 0 : this.$el.offset().top;

		this.calculatedDelay = (this.delay === undefined && this.delay !== 0) ? 0 : this.delay + offset;

		// call animate to position things
		if (this.canAnimate()) this.animate();

		// full size?
		if (this.fullScreen) {
			setToWindowHeight(this.$el);
		}

		if (this.fullSizeBG) {
			this.$el.css('background-size', this.$doc.width());
		}

		// always listen to the specified event

		if (Modernizr.touch) {
			this.$win.on(this.evt, $.proxy(this.touchHandler, this));
		} else {
			this.$win.on(this.evt, $.proxy(this.scrollHandler, this));
		}

		// reset on window resize
		this.$win.on('resize', function(e){
			self.resizeTicker++;
			self.resetPosition(self.resizeTicker);
		});
	}

});

// Export
module.exports = ParallaxElement;
},{"./element-in-view.js":3}],10:[function(require,module,exports){
var smoothScroll = require('../vendor/jquery.smooth-scroll.min.js'),
	FastClick = require('../vendor/fastclick.js'),
	$ = window.jQuery;

// Manager Objects
var ScrollManager = function(el, opts) {
	// Elements and selectors
	this.$scroller = $(opts.el);
	this.$panels = $(opts.panel);
	this.$prevBtn = $(opts.prevBtn);
	this.$nextBtn = $(opts.nextBtn);
	this.panelSelector = opts.panel;
	this.navigation = new NavManager(opts.navigation);

	// Extra data
	this.activeClass = opts.activeClass || 'in-focus';

	// Cached Dom Elements
	this.$win = $(window);
	this.$doc = $(document);

	// Calculated Variables and Tracking
	this.$currentPanel = window.location.hash ? $(window.location.hash) : $($(this.panelSelector)[0]);
	this.latestKnownScrollY = 0;
	this.cushion = 0;

	this.init();
};

$.extend(ScrollManager.prototype, {

	getPanelInFocus: function(position) {
		var self = this;

		var $currentPanel;

		this.$panels.each(function(i, el) {
			var $el = $(el),
				offset = $el.offset().top,
				cushion = $el.height()*.5;

			if (offset >= position - cushion && offset <= position + cushion) {
				$currentPanel = $(el);
				$currentPanel.addClass(self.activeClass).siblings().removeClass(self.activeClass);
			}
		});

		return $currentPanel;
	},

	nextPanel: function(e) {
		if (e) e.preventDefault();

		var self = this;
		var scrollElement = Modernizr.touch ? self.$scroller : null;

		var $nextPanel = this.$currentPanel.next(this.panelSelector),
			nextPanelID = '#' + $nextPanel.attr('id');

		$.smoothScroll({
		    scrollTarget: nextPanelID,
		    scrollElement: scrollElement,
		    afterScroll: function() {
		    	self.$doc.trigger('afterScroll', nextPanelID);
		    	self.$currentPanel = $nextPanel;
		    }
		});

	},

	prevPanel: function(e) {
		if (e) e.preventDefault();

		var self = this;
		var scrollElement = Modernizr.touch ? self.$scroller : null;

		var $nextPanel = this.$currentPanel.prev(this.panelSelector),
			nextPanelID = '#' + $nextPanel.attr('id');

		$.smoothScroll({
		    scrollTarget: nextPanelID,
		    scrollElement: scrollElement,
		    afterScroll: function() {
		    	self.$doc.trigger('afterScroll', nextPanelID);
		    	self.$currentPanel = $nextPanel;
		    }
		});
	},

	scrollHandler: function() {			
		var self = this;
		this.latestKnownScrollY = this.$win.scrollTop();

		// debounce if smooth scroll is on
		if (!this.navigation.isScrolling) {
			self.$currentPanel = self.getPanelInFocus(self.latestKnownScrollY) || self.$currentPanel;

			var id = '#' + self.$currentPanel.attr('id');
			this.navigation.setActiveLink(id);
		} else {
			self.$doc.on('afterScroll', function(e, href){
				self.$currentPanel = $(href);
				self.navigation.setActiveLink(href);
			});
		}
	},

	init: function() {
		var self = this;

		// make first panel nav item active
		this.navigation.setActiveLink('#' + this.$currentPanel.attr('id'));

		// set up listeners
		this.$doc.on('afterScroll', function(e, href){
			self.$currentPanel = $(href);
			self.navigation.setActiveLink(href);
		});

		this.$prevBtn.on('click', $.proxy(this.prevPanel, this));
		this.$nextBtn.on('click', $.proxy(this.nextPanel, this));

		// Conditional based on touch support
		if (Modernizr.touch) {
			
			this.$win.on('touchmove', $.proxy(this.scrollHandler, this));
			//hook up fastclick
			FastClick(document.body);
		} else {
			// desktop listens to scroll
			this.$win.on('scroll', $.proxy(this.scrollHandler, this));
		}
	}

});

var NavManager = function(el) {
	this.$el = $(el);
	this.$doc = $(document);
	this.$win = $(window);
	this.isScrolling = false;

	if (!this.$el.attr('id')) return;

	this.init();
};

$.extend(NavManager.prototype, {

	setActiveLink: function(href) {
		var $activeLink = $('a[href=' + href + ']');

		this.$el.find('a').removeClass('active');
		$activeLink.addClass('active');
	},

	init: function() {
		var self = this;

		// init smoothscrolling
		this.$el.on('click', 'a', function(e){
			e.preventDefault();
			var href = $(this).attr('href'),
				id = href.replace('#','');

			$.smoothScroll({
				offset: 0,
				scrollTarget: href,
				scrollElement: null,
				speed: 'slow',
				beforeScroll: function() {
					self.isScrolling = true;
				},
				afterScroll: function() {
					self.$doc.trigger('afterScroll', href);
					self.isScrolling = false;
					self.setActiveLink(href);
				}
			});
		});
	}
});

module.exports = ScrollManager;
},{"../vendor/fastclick.js":14,"../vendor/jquery.smooth-scroll.min.js":18}],11:[function(require,module,exports){
var $ = window.jQuery;

var toArray = function(arr) {
	return Array.prototype.slice.call(arr);
};

var erasePath = function(container) {
	var svg = $(container).find('svg'),
		paths = $(svg).find('path');

	$.each(paths, function(i, path){
		var length = path.getTotalLength();
		
		path.style.strokeDasharray = length + ' ' + length;
		path.style.strokeDashoffset = length;
		path.style.visibility = 'hidden';
		path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + '0s linear';
	})
};

var sketchPath = function(container) {

	var svg = document.querySelector(container + ' svg');

	if (!svg) return;
	
	svg.style.visibility = 'visible';

	var paths = toArray(svg.querySelectorAll('path'));
	var begin = 0;

	var durations = paths.map(function(container) {

		if (!container) return;

		var length = container.getTotalLength();
		
		var className = container.getAttribute('class') || '';

		container.style.strokeDasharray = length + ' ' + length;
		container.style.strokeDashoffset = length;

		return Math.pow(length, 0.5) * 0.02;

	});

	paths[0].getBoundingClientRect();

	var counter;

	paths.forEach(function(path, i) {

		if (!path) return;

		path.style.visibility = 'visible';
		path.getBoundingClientRect();

		if ($(path).attr("class") == "dashed" ) {
			path.style.strokeDasharray = '32 22';
			path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + '8s ease-out';
			path.style.strokeDashoffset = '0';

		} else {
			
			if ($(svg).attr("id") == "decisive" ) {
				path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + .5 + 's ' + begin + 's ease-out';
				path.style.strokeDashoffset = '0';
				begin += durations[i] + 0.01;
			} else if ($(container).hasClass('step-animation')) {
				path.style.transition = path.style.WebkitTransition = 'all ' + .15 + 's ' + begin + 's ease-in-out';
				path.style.strokeDashoffset = '0';
				begin += durations[i] + 0;
			} else {
				path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + 1.5 + 's ' + begin + 's ease-in-out';
				path.style.strokeDashoffset = '0';
			}
		}
	});
};

exports.sketchPath = sketchPath;
exports.erasePath = erasePath;

},{}],12:[function(require,module,exports){
var $ = window.jQuery,
	Modernizr = window.Modernizr;

var GridTileCycler = function(args) {
	this.length = args.length;

	this.transitionOutClass = args.transitionOutClass;
	this.cycleLength = args.cycleLength || 4000;

	this.$tileContainer = $(args.tileContainer);
	this.tileContentSelector = args.innerContent;
	this.tileSelector = args.tileSelector;

	// have Modernizr prefix transitionend event
	var transEndEventNames = {
	    'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
	    'MozTransition'    : 'transitionend',      // only for FF < 15
	    'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
	};

	this.transitionEndEvent = transEndEventNames[ Modernizr.prefixed('transition') ];
};

$.extend(GridTileCycler.prototype, {

	swapTile: function(index) {
		if (this.isSwapping || !this.looseItems.length) return;

		var _this = this;

		// prevent overlapping swapping
		this.isSwapping = true;

		// get elements to swap
		var oldTile = this.detachItemByIndex(index, this.activeItems),
			$oldTile = $(oldTile);
		var newTile = this.looseItems.shift();

		// re-map arrays to elements
		this.activeItems = this.getElementArray(this.activeItems);
		this.looseItems = this.getElementArray(this.looseItems);

		$oldTile.parent().prepend(newTile);
		$oldTile.addClass(this.transitionOutClass);

		$oldTile.addClass(this.transitionOutClass);

		if (Modernizr.csstransitions) {
			$oldTile.one(this.transitionEndEvent, function(e){
				// swap elements in data arrays
				_this.looseItems.push(oldTile);
				_this.appendAtIndex(newTile, index, _this.activeItems);

				// detach loose elements
				_this.updateTilesInDom();
				
				// allow next swap to begin
				_this.isSwapping = false;
			})
		} else {
			// swap elements in data arrays
			_this.looseItems.push(oldTile);
			_this.appendAtIndex(newTile, index, _this.activeItems);

			// detach loose elements
			_this.updateTilesInDom();

			// allow next swap to begin
			_this.isSwapping = false;
		}
	},

	detachItemByIndex: function(index, array) {
		return array.splice(index, 1);
	},

	appendAtIndex: function(el, index, array) {
		return array.splice(index, 0, el);
	},

	updateTilesInDom: function() {
		var _this = this;

		// detach loose elements
		$.each(this.looseItems, function(i, el) {
			$(el).removeClass(_this.transitionOutClass).detach();
		});
	},

	setInitialView: function() {
		var _this = this;

		this.activeItems = this.getElementArray(this.activeItems);
		this.looseItems = this.getElementArray(this.looseItems);

		// detach loose elements
		$.each(this.looseItems, function(i, el) {
			$(el).detach();
		});

		// repopulate container with ordered list
		$.each(this.tiles, function(i, el) {
			var $el = $(el);
			$el.append(_this.activeItems[i]);
		});
	},

	startCycle: function() {
		var _this = this;

		this.interval = setInterval(function(){
			var randomIndex = _this.getRandomIndex();

			_this.swapTile(randomIndex);

		}, this.cycleLength);
	},

	stopCycle: function() {
		clearInterval(this.interval);
	},

	getRandomIndex: function() {
		return Math.floor((Math.random()*(this.length)));
	},

	getElementArray: function(array) {
		return $.map(array, function(el, index){
			return $(el)[0];
		})
	},

	getInnerContentArray: function(array) {
		var _this = this;

		return $.map(array, function(el, index){
			var innerEl = $(el).find(_this.innerContent);
			return innerEl;
		})
	},

	init: function() {
		var _this = this;

		this.stopCycle();

		/*-------------------------------------------- */
		/** Declare tracking arrays */
		/*-------------------------------------------- */
		
		this.oldTiles = [];
		this.activeItems = [];
		this.looseItems = [];

		/*-------------------------------------------- */
		/** Get Data from dom */
		/*-------------------------------------------- */
		
		this.tiles = this.$tileContainer.children(this.tileSelector);
		this.activeItems = $(this.tileContentSelector);

		// do nothing if there are too few items
		if (this.activeItems.length <= this.length) return;

		/*-------------------------------------------- */
		/** Set up dom to display only number of tiles specified */
		/*-------------------------------------------- */

		var trimLength = this.tiles.length - this.length;

		// map tile and item arrays to dom elements
		this.tiles = this.getElementArray(this.tiles);
		this.activeItems = this.getElementArray(this.activeItems);

		// push excess items into loose items array
		for (var i = 0; i < trimLength; i++) {
			var el = this.activeItems.pop();

			this.looseItems.push(el);
		}
		// detach excess tiles
		for (var i = 0; i < trimLength; i++) {
			var el = this.tiles.pop();

			this.oldTiles[i] = (el);

			$(el).detach();
		}

		this.setInitialView();
		this.startCycle();

		this.$tileContainer.hover( 
			function(e) {
				_this.stopCycle();
			},
			function(e) {
				_this.startCycle();
			}
		)
	}

})

module.exports = GridTileCycler;
},{}],13:[function(require,module,exports){
var $ = window.jQuery;

var ToggleManager = function(trigger, opts) {
	this.trigger = trigger;
	this.toggleElement = opts.toggleElement;
	this.toggleClass = opts.toggleClass || 'open';
	this.toggleText = opts.toggleText;
	this.originalText = opts.originalText;

	this.isToggled = opts.closeOnStart;

	$('body').on('click', this.trigger, $.proxy(this.clickHandler, this));
}

$.extend(ToggleManager.prototype, {

	clickHandler: function(e){
		e.preventDefault();

		this.$toggleElement = this.toggleElement ? $(this.toggleElement) : $(e.currentTarget).parent();

		this.isToggled = !this.$toggleElement.hasClass(this.toggleClass);

		this.$toggleElement.toggleClass(this.toggleClass, this.isToggled);

		if (this.toggleText) {
			var replaceText = this.isToggled ? this.toggleText : this.originalText;
			$(e.currentTarget).text(replaceText);
		}
	}
})

module.exports = ToggleManager;
},{}],14:[function(require,module,exports){
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.9
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specificed layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 */
function FastClick(layer) {
	'use strict';
	var oldOnClick, self = this;


	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	if (!layer || !layer.nodeType) {
		throw new TypeError('Layer must be a document node');
	}

	/** @type function() */
	this.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };

	/** @type function() */
	this.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };

	/** @type function() */
	this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };

	/** @type function() */
	this.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(self, arguments); };

	/** @type function() */
	this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };

	/** @type function() */
	this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Set up event handlers as required
	if (this.deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchmove', this.onTouchMove, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((this.deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
	case 'select':
		return true;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	if (this.deviceIsIOS && targetElement.setSelectionRange) {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (this.deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!this.deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < 200) {
		this.cancelNextClick = true;
		return true;
	}

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (this.deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (this.deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		if (!this.deviceIsIOS4 || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (this.deviceIsIOS && !this.deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (this.deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	if ((/Chrome\/[0-9]+/).test(navigator.userAgent)) {

		// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
		if (FastClick.prototype.deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && metaViewport.content.indexOf('user-scalable=no') !== -1) {
				return true;
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.attach = function(layer) {
	'use strict';
	return new FastClick(layer);
};


if (typeof define !== 'undefined' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}

},{}],15:[function(require,module,exports){
/*
 * jQuery FlexSlider v2.2.0
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */(function(e){e.flexslider=function(t,n){var r=e(t);r.vars=e.extend({},e.flexslider.defaults,n);var i=r.vars.namespace,s=window.navigator&&window.navigator.msPointerEnabled&&window.MSGesture,o=("ontouchstart"in window||s||window.DocumentTouch&&document instanceof DocumentTouch)&&r.vars.touch,u="click touchend MSPointerUp",a="",f,l=r.vars.direction==="vertical",c=r.vars.reverse,h=r.vars.itemWidth>0,p=r.vars.animation==="fade",d=r.vars.asNavFor!=="",v={},m=!0;e.data(t,"flexslider",r);v={init:function(){r.animating=!1;r.currentSlide=parseInt(r.vars.startAt?r.vars.startAt:0);isNaN(r.currentSlide)&&(r.currentSlide=0);r.animatingTo=r.currentSlide;r.atEnd=r.currentSlide===0||r.currentSlide===r.last;r.containerSelector=r.vars.selector.substr(0,r.vars.selector.search(" "));r.slides=e(r.vars.selector,r);r.container=e(r.containerSelector,r);r.count=r.slides.length;r.syncExists=e(r.vars.sync).length>0;r.vars.animation==="slide"&&(r.vars.animation="swing");r.prop=l?"top":"marginLeft";r.args={};r.manualPause=!1;r.stopped=!1;r.started=!1;r.startTimeout=null;r.transitions=!r.vars.video&&!p&&r.vars.useCSS&&function(){var e=document.createElement("div"),t=["perspectiveProperty","WebkitPerspective","MozPerspective","OPerspective","msPerspective"];for(var n in t)if(e.style[t[n]]!==undefined){r.pfx=t[n].replace("Perspective","").toLowerCase();r.prop="-"+r.pfx+"-transform";return!0}return!1}();r.vars.controlsContainer!==""&&(r.controlsContainer=e(r.vars.controlsContainer).length>0&&e(r.vars.controlsContainer));r.vars.manualControls!==""&&(r.manualControls=e(r.vars.manualControls).length>0&&e(r.vars.manualControls));if(r.vars.randomize){r.slides.sort(function(){return Math.round(Math.random())-.5});r.container.empty().append(r.slides)}r.doMath();r.setup("init");r.vars.controlNav&&v.controlNav.setup();r.vars.directionNav&&v.directionNav.setup();r.vars.keyboard&&(e(r.containerSelector).length===1||r.vars.multipleKeyboard)&&e(document).bind("keyup",function(e){var t=e.keyCode;if(!r.animating&&(t===39||t===37)){var n=t===39?r.getTarget("next"):t===37?r.getTarget("prev"):!1;r.flexAnimate(n,r.vars.pauseOnAction)}});r.vars.mousewheel&&r.bind("mousewheel",function(e,t,n,i){e.preventDefault();var s=t<0?r.getTarget("next"):r.getTarget("prev");r.flexAnimate(s,r.vars.pauseOnAction)});r.vars.pausePlay&&v.pausePlay.setup();r.vars.slideshow&&r.vars.pauseInvisible&&v.pauseInvisible.init();if(r.vars.slideshow){r.vars.pauseOnHover&&r.hover(function(){!r.manualPlay&&!r.manualPause&&r.pause()},function(){!r.manualPause&&!r.manualPlay&&!r.stopped&&r.play()});if(!r.vars.pauseInvisible||!v.pauseInvisible.isHidden())r.vars.initDelay>0?r.startTimeout=setTimeout(r.play,r.vars.initDelay):r.play()}d&&v.asNav.setup();o&&r.vars.touch&&v.touch();(!p||p&&r.vars.smoothHeight)&&e(window).bind("resize orientationchange focus",v.resize);r.find("img").attr("draggable","false");setTimeout(function(){r.vars.start(r)},200)},asNav:{setup:function(){r.asNav=!0;r.animatingTo=Math.floor(r.currentSlide/r.move);r.currentItem=r.currentSlide;r.slides.removeClass(i+"active-slide").eq(r.currentItem).addClass(i+"active-slide");if(!s)r.slides.click(function(t){t.preventDefault();var n=e(this),s=n.index(),o=n.offset().left-e(r).scrollLeft();if(o<=0&&n.hasClass(i+"active-slide"))r.flexAnimate(r.getTarget("prev"),!0);else if(!e(r.vars.asNavFor).data("flexslider").animating&&!n.hasClass(i+"active-slide")){r.direction=r.currentItem<s?"next":"prev";r.flexAnimate(s,r.vars.pauseOnAction,!1,!0,!0)}});else{t._slider=r;r.slides.each(function(){var t=this;t._gesture=new MSGesture;t._gesture.target=t;t.addEventListener("MSPointerDown",function(e){e.preventDefault();e.currentTarget._gesture&&e.currentTarget._gesture.addPointer(e.pointerId)},!1);t.addEventListener("MSGestureTap",function(t){t.preventDefault();var n=e(this),i=n.index();if(!e(r.vars.asNavFor).data("flexslider").animating&&!n.hasClass("active")){r.direction=r.currentItem<i?"next":"prev";r.flexAnimate(i,r.vars.pauseOnAction,!1,!0,!0)}})})}}},controlNav:{setup:function(){r.manualControls?v.controlNav.setupManual():v.controlNav.setupPaging()},setupPaging:function(){var t=r.vars.controlNav==="thumbnails"?"control-thumbs":"control-paging",n=1,s,o;r.controlNavScaffold=e('<ol class="'+i+"control-nav "+i+t+'"></ol>');if(r.pagingCount>1)for(var f=0;f<r.pagingCount;f++){o=r.slides.eq(f);s=r.vars.controlNav==="thumbnails"?'<img src="'+o.attr("data-thumb")+'"/>':"<a>"+n+"</a>";if("thumbnails"===r.vars.controlNav&&!0===r.vars.thumbCaptions){var l=o.attr("data-thumbcaption");""!=l&&undefined!=l&&(s+='<span class="'+i+'caption">'+l+"</span>")}r.controlNavScaffold.append("<li>"+s+"</li>");n++}r.controlsContainer?e(r.controlsContainer).append(r.controlNavScaffold):r.append(r.controlNavScaffold);v.controlNav.set();v.controlNav.active();r.controlNavScaffold.delegate("a, img",u,function(t){t.preventDefault();if(a===""||a===t.type){var n=e(this),s=r.controlNav.index(n);if(!n.hasClass(i+"active")){r.direction=s>r.currentSlide?"next":"prev";r.flexAnimate(s,r.vars.pauseOnAction)}}a===""&&(a=t.type);v.setToClearWatchedEvent()})},setupManual:function(){r.controlNav=r.manualControls;v.controlNav.active();r.controlNav.bind(u,function(t){t.preventDefault();if(a===""||a===t.type){var n=e(this),s=r.controlNav.index(n);if(!n.hasClass(i+"active")){s>r.currentSlide?r.direction="next":r.direction="prev";r.flexAnimate(s,r.vars.pauseOnAction)}}a===""&&(a=t.type);v.setToClearWatchedEvent()})},set:function(){var t=r.vars.controlNav==="thumbnails"?"img":"a";r.controlNav=e("."+i+"control-nav li "+t,r.controlsContainer?r.controlsContainer:r)},active:function(){r.controlNav.removeClass(i+"active").eq(r.animatingTo).addClass(i+"active")},update:function(t,n){r.pagingCount>1&&t==="add"?r.controlNavScaffold.append(e("<li><a>"+r.count+"</a></li>")):r.pagingCount===1?r.controlNavScaffold.find("li").remove():r.controlNav.eq(n).closest("li").remove();v.controlNav.set();r.pagingCount>1&&r.pagingCount!==r.controlNav.length?r.update(n,t):v.controlNav.active()}},directionNav:{setup:function(){var t=e('<ul class="'+i+'direction-nav"><li><a class="'+i+'prev" href="#">'+r.vars.prevText+'</a></li><li><a class="'+i+'next" href="#">'+r.vars.nextText+"</a></li></ul>");if(r.controlsContainer){e(r.controlsContainer).append(t);r.directionNav=e("."+i+"direction-nav li a",r.controlsContainer)}else{r.append(t);r.directionNav=e("."+i+"direction-nav li a",r)}v.directionNav.update();r.directionNav.bind(u,function(t){t.preventDefault();var n;if(a===""||a===t.type){n=e(this).hasClass(i+"next")?r.getTarget("next"):r.getTarget("prev");r.flexAnimate(n,r.vars.pauseOnAction)}a===""&&(a=t.type);v.setToClearWatchedEvent()})},update:function(){var e=i+"disabled";r.pagingCount===1?r.directionNav.addClass(e).attr("tabindex","-1"):r.vars.animationLoop?r.directionNav.removeClass(e).removeAttr("tabindex"):r.animatingTo===0?r.directionNav.removeClass(e).filter("."+i+"prev").addClass(e).attr("tabindex","-1"):r.animatingTo===r.last?r.directionNav.removeClass(e).filter("."+i+"next").addClass(e).attr("tabindex","-1"):r.directionNav.removeClass(e).removeAttr("tabindex")}},pausePlay:{setup:function(){var t=e('<div class="'+i+'pauseplay"><a></a></div>');if(r.controlsContainer){r.controlsContainer.append(t);r.pausePlay=e("."+i+"pauseplay a",r.controlsContainer)}else{r.append(t);r.pausePlay=e("."+i+"pauseplay a",r)}v.pausePlay.update(r.vars.slideshow?i+"pause":i+"play");r.pausePlay.bind(u,function(t){t.preventDefault();if(a===""||a===t.type)if(e(this).hasClass(i+"pause")){r.manualPause=!0;r.manualPlay=!1;r.pause()}else{r.manualPause=!1;r.manualPlay=!0;r.play()}a===""&&(a=t.type);v.setToClearWatchedEvent()})},update:function(e){e==="play"?r.pausePlay.removeClass(i+"pause").addClass(i+"play").html(r.vars.playText):r.pausePlay.removeClass(i+"play").addClass(i+"pause").html(r.vars.pauseText)}},touch:function(){var e,n,i,o,u,a,f=!1,d=0,v=0,m=0;if(!s){t.addEventListener("touchstart",g,!1);function g(s){if(r.animating)s.preventDefault();else if(window.navigator.msPointerEnabled||s.touches.length===1){r.pause();o=l?r.h:r.w;a=Number(new Date);d=s.touches[0].pageX;v=s.touches[0].pageY;i=h&&c&&r.animatingTo===r.last?0:h&&c?r.limit-(r.itemW+r.vars.itemMargin)*r.move*r.animatingTo:h&&r.currentSlide===r.last?r.limit:h?(r.itemW+r.vars.itemMargin)*r.move*r.currentSlide:c?(r.last-r.currentSlide+r.cloneOffset)*o:(r.currentSlide+r.cloneOffset)*o;e=l?v:d;n=l?d:v;t.addEventListener("touchmove",y,!1);t.addEventListener("touchend",b,!1)}}function y(t){d=t.touches[0].pageX;v=t.touches[0].pageY;u=l?e-v:e-d;f=l?Math.abs(u)<Math.abs(d-n):Math.abs(u)<Math.abs(v-n);var s=500;if(!f||Number(new Date)-a>s){t.preventDefault();if(!p&&r.transitions){r.vars.animationLoop||(u/=r.currentSlide===0&&u<0||r.currentSlide===r.last&&u>0?Math.abs(u)/o+2:1);r.setProps(i+u,"setTouch")}}}function b(s){t.removeEventListener("touchmove",y,!1);if(r.animatingTo===r.currentSlide&&!f&&u!==null){var l=c?-u:u,h=l>0?r.getTarget("next"):r.getTarget("prev");r.canAdvance(h)&&(Number(new Date)-a<550&&Math.abs(l)>50||Math.abs(l)>o/2)?r.flexAnimate(h,r.vars.pauseOnAction):p||r.flexAnimate(r.currentSlide,r.vars.pauseOnAction,!0)}t.removeEventListener("touchend",b,!1);e=null;n=null;u=null;i=null}}else{t.style.msTouchAction="none";t._gesture=new MSGesture;t._gesture.target=t;t.addEventListener("MSPointerDown",w,!1);t._slider=r;t.addEventListener("MSGestureChange",E,!1);t.addEventListener("MSGestureEnd",S,!1);function w(e){e.stopPropagation();if(r.animating)e.preventDefault();else{r.pause();t._gesture.addPointer(e.pointerId);m=0;o=l?r.h:r.w;a=Number(new Date);i=h&&c&&r.animatingTo===r.last?0:h&&c?r.limit-(r.itemW+r.vars.itemMargin)*r.move*r.animatingTo:h&&r.currentSlide===r.last?r.limit:h?(r.itemW+r.vars.itemMargin)*r.move*r.currentSlide:c?(r.last-r.currentSlide+r.cloneOffset)*o:(r.currentSlide+r.cloneOffset)*o}}function E(e){e.stopPropagation();var n=e.target._slider;if(!n)return;var r=-e.translationX,s=-e.translationY;m+=l?s:r;u=m;f=l?Math.abs(m)<Math.abs(-r):Math.abs(m)<Math.abs(-s);if(e.detail===e.MSGESTURE_FLAG_INERTIA){setImmediate(function(){t._gesture.stop()});return}if(!f||Number(new Date)-a>500){e.preventDefault();if(!p&&n.transitions){n.vars.animationLoop||(u=m/(n.currentSlide===0&&m<0||n.currentSlide===n.last&&m>0?Math.abs(m)/o+2:1));n.setProps(i+u,"setTouch")}}}function S(t){t.stopPropagation();var r=t.target._slider;if(!r)return;if(r.animatingTo===r.currentSlide&&!f&&u!==null){var s=c?-u:u,l=s>0?r.getTarget("next"):r.getTarget("prev");r.canAdvance(l)&&(Number(new Date)-a<550&&Math.abs(s)>50||Math.abs(s)>o/2)?r.flexAnimate(l,r.vars.pauseOnAction):p||r.flexAnimate(r.currentSlide,r.vars.pauseOnAction,!0)}e=null;n=null;u=null;i=null;m=0}}},resize:function(){if(!r.animating&&r.is(":visible")){h||r.doMath();if(p)v.smoothHeight();else if(h){r.slides.width(r.computedW);r.update(r.pagingCount);r.setProps()}else if(l){r.viewport.height(r.h);r.setProps(r.h,"setTotal")}else{r.vars.smoothHeight&&v.smoothHeight();r.newSlides.width(r.computedW);r.setProps(r.computedW,"setTotal")}}},smoothHeight:function(e){if(!l||p){var t=p?r:r.viewport;e?t.animate({height:r.slides.eq(r.animatingTo).height()},e):t.height(r.slides.eq(r.animatingTo).height())}},sync:function(t){var n=e(r.vars.sync).data("flexslider"),i=r.animatingTo;switch(t){case"animate":n.flexAnimate(i,r.vars.pauseOnAction,!1,!0);break;case"play":!n.playing&&!n.asNav&&n.play();break;case"pause":n.pause()}},pauseInvisible:{visProp:null,init:function(){var e=["webkit","moz","ms","o"];if("hidden"in document)return"hidden";for(var t=0;t<e.length;t++)e[t]+"Hidden"in document&&(v.pauseInvisible.visProp=e[t]+"Hidden");if(v.pauseInvisible.visProp){var n=v.pauseInvisible.visProp.replace(/[H|h]idden/,"")+"visibilitychange";document.addEventListener(n,function(){v.pauseInvisible.isHidden()?r.startTimeout?clearTimeout(r.startTimeout):r.pause():r.started?r.play():r.vars.initDelay>0?setTimeout(r.play,r.vars.initDelay):r.play()})}},isHidden:function(){return document[v.pauseInvisible.visProp]||!1}},setToClearWatchedEvent:function(){clearTimeout(f);f=setTimeout(function(){a=""},3e3)}};r.flexAnimate=function(t,n,s,u,a){!r.vars.animationLoop&&t!==r.currentSlide&&(r.direction=t>r.currentSlide?"next":"prev");d&&r.pagingCount===1&&(r.direction=r.currentItem<t?"next":"prev");if(!r.animating&&(r.canAdvance(t,a)||s)&&r.is(":visible")){if(d&&u){var f=e(r.vars.asNavFor).data("flexslider");r.atEnd=t===0||t===r.count-1;f.flexAnimate(t,!0,!1,!0,a);r.direction=r.currentItem<t?"next":"prev";f.direction=r.direction;if(Math.ceil((t+1)/r.visible)-1===r.currentSlide||t===0){r.currentItem=t;r.slides.removeClass(i+"active-slide").eq(t).addClass(i+"active-slide");return!1}r.currentItem=t;r.slides.removeClass(i+"active-slide").eq(t).addClass(i+"active-slide");t=Math.floor(t/r.visible)}r.animating=!0;r.animatingTo=t;n&&r.pause();r.vars.before(r);r.syncExists&&!a&&v.sync("animate");r.vars.controlNav&&v.controlNav.active();h||r.slides.removeClass(i+"active-slide").eq(t).addClass(i+"active-slide");r.atEnd=t===0||t===r.last;r.vars.directionNav&&v.directionNav.update();if(t===r.last){r.vars.end(r);r.vars.animationLoop||r.pause()}if(!p){var m=l?r.slides.filter(":first").height():r.computedW,g,y,b;if(h){g=r.vars.itemMargin;b=(r.itemW+g)*r.move*r.animatingTo;y=b>r.limit&&r.visible!==1?r.limit:b}else r.currentSlide===0&&t===r.count-1&&r.vars.animationLoop&&r.direction!=="next"?y=c?(r.count+r.cloneOffset)*m:0:r.currentSlide===r.last&&t===0&&r.vars.animationLoop&&r.direction!=="prev"?y=c?0:(r.count+1)*m:y=c?(r.count-1-t+r.cloneOffset)*m:(t+r.cloneOffset)*m;r.setProps(y,"",r.vars.animationSpeed);if(r.transitions){if(!r.vars.animationLoop||!r.atEnd){r.animating=!1;r.currentSlide=r.animatingTo}r.container.unbind("webkitTransitionEnd transitionend");r.container.bind("webkitTransitionEnd transitionend",function(){r.wrapup(m)})}else r.container.animate(r.args,r.vars.animationSpeed,r.vars.easing,function(){r.wrapup(m)})}else if(!o){r.slides.eq(r.currentSlide).css({zIndex:1}).animate({opacity:0},r.vars.animationSpeed,r.vars.easing);r.slides.eq(t).css({zIndex:2}).animate({opacity:1},r.vars.animationSpeed,r.vars.easing,r.wrapup)}else{r.slides.eq(r.currentSlide).css({opacity:0,zIndex:1});r.slides.eq(t).css({opacity:1,zIndex:2});r.wrapup(m)}r.vars.smoothHeight&&v.smoothHeight(r.vars.animationSpeed)}};r.wrapup=function(e){!p&&!h&&(r.currentSlide===0&&r.animatingTo===r.last&&r.vars.animationLoop?r.setProps(e,"jumpEnd"):r.currentSlide===r.last&&r.animatingTo===0&&r.vars.animationLoop&&r.setProps(e,"jumpStart"));r.animating=!1;r.currentSlide=r.animatingTo;r.vars.after(r)};r.animateSlides=function(){!r.animating&&m&&r.flexAnimate(r.getTarget("next"))};r.pause=function(){clearInterval(r.animatedSlides);r.animatedSlides=null;r.playing=!1;r.vars.pausePlay&&v.pausePlay.update("play");r.syncExists&&v.sync("pause")};r.play=function(){r.playing&&clearInterval(r.animatedSlides);r.animatedSlides=r.animatedSlides||setInterval(r.animateSlides,r.vars.slideshowSpeed);r.started=r.playing=!0;r.vars.pausePlay&&v.pausePlay.update("pause");r.syncExists&&v.sync("play")};r.stop=function(){r.pause();r.stopped=!0};r.canAdvance=function(e,t){var n=d?r.pagingCount-1:r.last;return t?!0:d&&r.currentItem===r.count-1&&e===0&&r.direction==="prev"?!0:d&&r.currentItem===0&&e===r.pagingCount-1&&r.direction!=="next"?!1:e===r.currentSlide&&!d?!1:r.vars.animationLoop?!0:r.atEnd&&r.currentSlide===0&&e===n&&r.direction!=="next"?!1:r.atEnd&&r.currentSlide===n&&e===0&&r.direction==="next"?!1:!0};r.getTarget=function(e){r.direction=e;return e==="next"?r.currentSlide===r.last?0:r.currentSlide+1:r.currentSlide===0?r.last:r.currentSlide-1};r.setProps=function(e,t,n){var i=function(){var n=e?e:(r.itemW+r.vars.itemMargin)*r.move*r.animatingTo,i=function(){if(h)return t==="setTouch"?e:c&&r.animatingTo===r.last?0:c?r.limit-(r.itemW+r.vars.itemMargin)*r.move*r.animatingTo:r.animatingTo===r.last?r.limit:n;switch(t){case"setTotal":return c?(r.count-1-r.currentSlide+r.cloneOffset)*e:(r.currentSlide+r.cloneOffset)*e;case"setTouch":return c?e:e;case"jumpEnd":return c?e:r.count*e;case"jumpStart":return c?r.count*e:e;default:return e}}();return i*-1+"px"}();if(r.transitions){i=l?"translate3d(0,"+i+",0)":"translate3d("+i+",0,0)";n=n!==undefined?n/1e3+"s":"0s";r.container.css("-"+r.pfx+"-transition-duration",n)}r.args[r.prop]=i;(r.transitions||n===undefined)&&r.container.css(r.args)};r.setup=function(t){if(!p){var n,s;if(t==="init"){r.viewport=e('<div class="'+i+'viewport"></div>').css({overflow:"hidden",position:"relative"}).appendTo(r).append(r.container);r.cloneCount=0;r.cloneOffset=0;if(c){s=e.makeArray(r.slides).reverse();r.slides=e(s);r.container.empty().append(r.slides)}}if(r.vars.animationLoop&&!h){r.cloneCount=2;r.cloneOffset=1;t!=="init"&&r.container.find(".clone").remove();r.container.append(r.slides.first().clone().addClass("clone").attr("aria-hidden","true")).prepend(r.slides.last().clone().addClass("clone").attr("aria-hidden","true"))}r.newSlides=e(r.vars.selector,r);n=c?r.count-1-r.currentSlide+r.cloneOffset:r.currentSlide+r.cloneOffset;if(l&&!h){r.container.height((r.count+r.cloneCount)*200+"%").css("position","absolute").width("100%");setTimeout(function(){r.newSlides.css({display:"block"});r.doMath();r.viewport.height(r.h);r.setProps(n*r.h,"init")},t==="init"?100:0)}else{r.container.width((r.count+r.cloneCount)*200+"%");r.setProps(n*r.computedW,"init");setTimeout(function(){r.doMath();r.newSlides.css({width:r.computedW,"float":"left",display:"block"});r.vars.smoothHeight&&v.smoothHeight()},t==="init"?100:0)}}else{r.slides.css({width:"100%","float":"left",marginRight:"-100%",position:"relative"});t==="init"&&(o?r.slides.css({opacity:0,display:"block",webkitTransition:"opacity "+r.vars.animationSpeed/1e3+"s ease",zIndex:1}).eq(r.currentSlide).css({opacity:1,zIndex:2}):r.slides.css({opacity:0,display:"block",zIndex:1}).eq(r.currentSlide).css({zIndex:2}).animate({opacity:1},r.vars.animationSpeed,r.vars.easing));r.vars.smoothHeight&&v.smoothHeight()}h||r.slides.removeClass(i+"active-slide").eq(r.currentSlide).addClass(i+"active-slide")};r.doMath=function(){var e=r.slides.first(),t=r.vars.itemMargin,n=r.vars.minItems,i=r.vars.maxItems;r.w=r.viewport===undefined?r.width():r.viewport.width();r.h=e.height();r.boxPadding=e.outerWidth()-e.width();if(h){r.itemT=r.vars.itemWidth+t;r.minW=n?n*r.itemT:r.w;r.maxW=i?i*r.itemT-t:r.w;r.itemW=r.minW>r.w?(r.w-t*(n-1))/n:r.maxW<r.w?(r.w-t*(i-1))/i:r.vars.itemWidth>r.w?r.w:r.vars.itemWidth;r.visible=Math.floor(r.w/r.itemW);r.move=r.vars.move>0&&r.vars.move<r.visible?r.vars.move:r.visible;r.pagingCount=Math.ceil((r.count-r.visible)/r.move+1);r.last=r.pagingCount-1;r.limit=r.pagingCount===1?0:r.vars.itemWidth>r.w?r.itemW*(r.count-1)+t*(r.count-1):(r.itemW+t)*r.count-r.w-t}else{r.itemW=r.w;r.pagingCount=r.count;r.last=r.count-1}r.computedW=r.itemW-r.boxPadding};r.update=function(e,t){r.doMath();if(!h){e<r.currentSlide?r.currentSlide+=1:e<=r.currentSlide&&e!==0&&(r.currentSlide-=1);r.animatingTo=r.currentSlide}if(r.vars.controlNav&&!r.manualControls)if(t==="add"&&!h||r.pagingCount>r.controlNav.length)v.controlNav.update("add");else if(t==="remove"&&!h||r.pagingCount<r.controlNav.length){if(h&&r.currentSlide>r.last){r.currentSlide-=1;r.animatingTo-=1}v.controlNav.update("remove",r.last)}r.vars.directionNav&&v.directionNav.update()};r.addSlide=function(t,n){var i=e(t);r.count+=1;r.last=r.count-1;l&&c?n!==undefined?r.slides.eq(r.count-n).after(i):r.container.prepend(i):n!==undefined?r.slides.eq(n).before(i):r.container.append(i);r.update(n,"add");r.slides=e(r.vars.selector+":not(.clone)",r);r.setup();r.vars.added(r)};r.removeSlide=function(t){var n=isNaN(t)?r.slides.index(e(t)):t;r.count-=1;r.last=r.count-1;isNaN(t)?e(t,r.slides).remove():l&&c?r.slides.eq(r.last).remove():r.slides.eq(t).remove();r.doMath();r.update(n,"remove");r.slides=e(r.vars.selector+":not(.clone)",r);r.setup();r.vars.removed(r)};v.init()};e(window).blur(function(e){focused=!1}).focus(function(e){focused=!0});e.flexslider.defaults={namespace:"flex-",selector:".slides > li",animation:"fade",easing:"swing",direction:"horizontal",reverse:!1,animationLoop:!0,smoothHeight:!1,startAt:0,slideshow:!0,slideshowSpeed:7e3,animationSpeed:600,initDelay:0,randomize:!1,thumbCaptions:!1,pauseOnAction:!0,pauseOnHover:!1,pauseInvisible:!0,useCSS:!0,touch:!0,video:!1,controlNav:!0,directionNav:!0,prevText:"Previous",nextText:"Next",keyboard:!0,multipleKeyboard:!1,mousewheel:!1,pausePlay:!1,pauseText:"Pause",playText:"Play",controlsContainer:"",manualControls:"",sync:"",asNavFor:"",itemWidth:0,itemMargin:0,minItems:1,maxItems:0,move:0,allowOneSlide:!0,start:function(){},before:function(){},after:function(){},end:function(){},added:function(){},removed:function(){}};e.fn.flexslider=function(t){t===undefined&&(t={});if(typeof t=="object")return this.each(function(){var n=e(this),r=t.selector?t.selector:".slides > li",i=n.find(r);if(i.length===1&&t.allowOneSlide===!0||i.length===0){i.fadeIn(400);t.start&&t.start(n)}else n.data("flexslider")===undefined&&new e.flexslider(this,t)});var n=e(this).data("flexslider");switch(t){case"play":n.play();break;case"pause":n.pause();break;case"stop":n.stop();break;case"next":n.flexAnimate(n.getTarget("next"),!0);break;case"prev":case"previous":n.flexAnimate(n.getTarget("prev"),!0);break;default:typeof t=="number"&&n.flexAnimate(t,!0)}}})(jQuery);
},{}],16:[function(require,module,exports){
!function(a,b){"use strict";function c(c,d){this.options=a.extend({},h,d),this.$element=a(c),this.$win=a(b),this.$loadingClassTarget=this._getLoadingClassTarget(),this.$scrollContainer=this._getScrollContainer(),this.loading=!1,this.doneLoadingInt=null,this.pageCount=this.options.triggerInitialLoad?this.options.startingPageCount-1:this.options.startingPageCount,this.destroyed=!1,this._init()}function d(b,c,d){a.isFunction(b[c])&&b[c].apply(b,d)}function e(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)},h=c&&!d;clearTimeout(d),d=setTimeout(g,b),h&&a.apply(e,f)}}var f="infiniteScrollHelper",g="plugin_"+f,h={bottomBuffer:0,debounceInt:100,doneLoading:null,interval:300,loadingClass:"loading",loadingClassTarget:null,loadMore:a.noop,startingPageCount:1,triggerInitialLoad:!1};c.prototype._init=function(){this._addListeners(),this.options.triggerInitialLoad?this._beginLoadMore():this._handleScroll()},c.prototype._getLoadingClassTarget=function(){return this.options.loadingClassTarget?a(this.options.loadingClassTarget):this.$element},c.prototype._getScrollContainer=function(){var b=null;return"scroll"==this.$element.css("overflow-y")&&(b=this.$element),b||(b=this.$element.parents().filter(function(){return"scroll"==a(this).css("overflow-y")})),b=b.length>0?b:this.$win},c.prototype._addListeners=function(){var a=this;this.$scrollContainer.on("scroll."+f,e(function(){a._handleScroll()},this.options.debounceInt))},c.prototype._removeListeners=function(){this.$scrollContainer.off("scroll."+f)},c.prototype._handleScroll=function(){var a=this;this._shouldTriggerLoad()&&(this._beginLoadMore(),this.options.doneLoading&&(this.doneLoadingInt=setInterval(function(){a.options.doneLoading(a.pageCount)&&a._endLoadMore()},this.options.interval)))},c.prototype._shouldTriggerLoad=function(){var a=this._getElementHeight(),b=this.$scrollContainer.scrollTop()+this.$scrollContainer.height()+this.options.bottomBuffer;return!this.loading&&b>=a&&this.$element.is(":visible")},c.prototype._getElementHeight=function(){return this.$element==this.$scrollContainer?this.$element[0].scrollHeight:this.$element.height()},c.prototype._beginLoadMore=function(){this.pageCount++,this.options.loadMore(this.pageCount,a.proxy(this._endLoadMore,this)),this.loading=!0,this.$loadingClassTarget.addClass(this.options.loadingClass),this._removeListeners()},c.prototype._endLoadMore=function(){clearInterval(this.doneLoadingInt),this.loading=!1,this.$loadingClassTarget.removeClass(this.options.loadingClass),!this.destroyed&&this._addListeners()},c.prototype.destroy=function(){this._removeListeners(),this.options.loadMore=null,this.options.doneLoading=null,a.data(this.$element[0],g,null),clearInterval(this.doneLoadingInt),this.destroyed=!0},a.fn[f]=function(b){var e=!1,f=arguments;return"string"==typeof b&&(e=b),this.each(function(){var h=a.data(this,g);h?e&&d(h,e,Array.prototype.slice.call(f,1)):a.data(this,g,new c(this,b))})},b.InfiniteScrollHelper=b.InfiniteScrollHelper||c}(jQuery,window);
},{}],17:[function(require,module,exports){
// jquery.pjax.js
// copyright chris wanstrath
// https://github.com/defunkt/jquery-pjax

(function($){

// When called on a container with a selector, fetches the href with
// ajax into the container or with the data-pjax attribute on the link
// itself.
//
// Tries to make sure the back button and ctrl+click work the way
// you'd expect.
//
// Exported as $.fn.pjax
//
// Accepts a jQuery ajax options object that may include these
// pjax specific options:
//
//
// container - Where to stick the response body. Usually a String selector.
//             $(container).html(xhr.responseBody)
//             (default: current jquery context)
//      push - Whether to pushState the URL. Defaults to true (of course).
//   replace - Want to use replaceState instead? That's cool.
//
// For convenience the second parameter can be either the container or
// the options object.
//
// Returns the jQuery object
function fnPjax(selector, container, options) {
  var context = this
  return this.on('click.pjax', selector, function(event) {
    var opts = $.extend({}, optionsFor(container, options))
    if (!opts.container)
      opts.container = $(this).attr('data-pjax') || context
    handleClick(event, opts)
  })
}

// Public: pjax on click handler
//
// Exported as $.pjax.click.
//
// event   - "click" jQuery.Event
// options - pjax options
//
// Examples
//
//   $(document).on('click', 'a', $.pjax.click)
//   // is the same as
//   $(document).pjax('a')
//
//  $(document).on('click', 'a', function(event) {
//    var container = $(this).closest('[data-pjax-container]')
//    $.pjax.click(event, container)
//  })
//
// Returns nothing.
function handleClick(event, container, options) {
  options = optionsFor(container, options)

  var link = event.currentTarget

  if (link.tagName.toUpperCase() !== 'A')
    throw "$.fn.pjax or $.pjax.click requires an anchor element"

  // Middle click, cmd click, and ctrl click should open
  // links in a new tab as normal.
  if ( event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey )
    return

  // Ignore cross origin links
  if ( location.protocol !== link.protocol || location.hostname !== link.hostname )
    return

  // Ignore anchors on the same page
  if (link.hash && link.href.replace(link.hash, '') ===
       location.href.replace(location.hash, ''))
    return

  // Ignore empty anchor "foo.html#"
  if (link.href === location.href + '#')
    return

  var defaults = {
    url: link.href,
    container: $(link).attr('data-pjax'),
    target: link
  }

  var opts = $.extend({}, defaults, options)
  var clickEvent = $.Event('pjax:click')
  $(link).trigger(clickEvent, [opts])

  if (!clickEvent.isDefaultPrevented()) {
    pjax(opts)
    event.preventDefault()
  }
}

// Public: pjax on form submit handler
//
// Exported as $.pjax.submit
//
// event   - "click" jQuery.Event
// options - pjax options
//
// Examples
//
//  $(document).on('submit', 'form', function(event) {
//    var container = $(this).closest('[data-pjax-container]')
//    $.pjax.submit(event, container)
//  })
//
// Returns nothing.
function handleSubmit(event, container, options) {
  options = optionsFor(container, options)

  var form = event.currentTarget

  if (form.tagName.toUpperCase() !== 'FORM')
    throw "$.pjax.submit requires a form element"

  var defaults = {
    type: form.method.toUpperCase(),
    url: form.action,
    data: $(form).serializeArray(),
    container: $(form).attr('data-pjax'),
    target: form
  }

  pjax($.extend({}, defaults, options))

  event.preventDefault()
}

// Loads a URL with ajax, puts the response body inside a container,
// then pushState()'s the loaded URL.
//
// Works just like $.ajax in that it accepts a jQuery ajax
// settings object (with keys like url, type, data, etc).
//
// Accepts these extra keys:
//
// container - Where to stick the response body.
//             $(container).html(xhr.responseBody)
//      push - Whether to pushState the URL. Defaults to true (of course).
//   replace - Want to use replaceState instead? That's cool.
//
// Use it just like $.ajax:
//
//   var xhr = $.pjax({ url: this.href, container: '#main' })
//   console.log( xhr.readyState )
//
// Returns whatever $.ajax returns.
function pjax(options) {
  options = $.extend(true, {}, $.ajaxSettings, pjax.defaults, options)

  if ($.isFunction(options.url)) {
    options.url = options.url()
  }

  var target = options.target

  var hash = parseURL(options.url).hash

  var context = options.context = findContainerFor(options.container)

  // We want the browser to maintain two separate internal caches: one
  // for pjax'd partial page loads and one for normal page loads.
  // Without adding this secret parameter, some browsers will often
  // confuse the two.
  if (!options.data) options.data = {}
  options.data._pjax = context.selector

  function fire(type, args) {
    var event = $.Event(type, { relatedTarget: target })
    context.trigger(event, args)
    return !event.isDefaultPrevented()
  }

  var timeoutTimer

  options.beforeSend = function(xhr, settings) {
    // No timeout for non-GET requests
    // Its not safe to request the resource again with a fallback method.
    if (settings.type !== 'GET') {
      settings.timeout = 0
    }

    xhr.setRequestHeader('X-PJAX', 'true')
    xhr.setRequestHeader('X-PJAX-Container', context.selector)

    if (!fire('pjax:beforeSend', [xhr, settings]))
      return false

    if (settings.timeout > 0) {
      timeoutTimer = setTimeout(function() {
        if (fire('pjax:timeout', [xhr, options]))
          xhr.abort('timeout')
      }, settings.timeout)

      // Clear timeout setting so jquerys internal timeout isn't invoked
      settings.timeout = 0
    }

    options.requestUrl = parseURL(settings.url).href
  }

  options.complete = function(xhr, textStatus) {
    if (timeoutTimer)
      clearTimeout(timeoutTimer)

    fire('pjax:complete', [xhr, textStatus, options])

    fire('pjax:end', [xhr, options])
  }

  options.error = function(xhr, textStatus, errorThrown) {
    var container = extractContainer("", xhr, options)

    var allowed = fire('pjax:error', [xhr, textStatus, errorThrown, options])
    if (options.type == 'GET' && textStatus !== 'abort' && allowed) {
      locationReplace(container.url)
    }
  }

  options.success = function(data, status, xhr) {
    // If $.pjax.defaults.version is a function, invoke it first.
    // Otherwise it can be a static string.
    var currentVersion = (typeof $.pjax.defaults.version === 'function') ?
      $.pjax.defaults.version() :
      $.pjax.defaults.version

    var latestVersion = xhr.getResponseHeader('X-PJAX-Version')

    var container = extractContainer(data, xhr, options)

    // If there is a layout version mismatch, hard load the new url
    if (currentVersion && latestVersion && currentVersion !== latestVersion) {
      locationReplace(container.url)
      return
    }

    // If the new response is missing a body, hard load the page
    if (!container.contents) {
      locationReplace(container.url)
      return
    }

    pjax.state = {
      id: options.id || uniqueId(),
      url: container.url,
      title: container.title,
      container: context.selector,
      fragment: options.fragment,
      timeout: options.timeout
    }

    if (options.push || options.replace) {
      window.history.replaceState(pjax.state, container.title, container.url)
    }

    // Clear out any focused controls before inserting new page contents.
    document.activeElement.blur()

    if (container.title) document.title = container.title
    context.html(container.contents)

    // FF bug: Won't autofocus fields that are inserted via JS.
    // This behavior is incorrect. So if theres no current focus, autofocus
    // the last field.
    //
    // http://www.w3.org/html/wg/drafts/html/master/forms.html
    var autofocusEl = context.find('input[autofocus], textarea[autofocus]').last()[0]
    if (autofocusEl && document.activeElement !== autofocusEl) {
      autofocusEl.focus();
    }

    executeScriptTags(container.scripts)

    // Scroll to top by default
    if (typeof options.scrollTo === 'number')
      $(window).scrollTop(options.scrollTo)

    // If the URL has a hash in it, make sure the browser
    // knows to navigate to the hash.
    if ( hash !== '' ) {
      // Avoid using simple hash set here. Will add another history
      // entry. Replace the url with replaceState and scroll to target
      // by hand.
      //
      //   window.location.hash = hash
      var url = parseURL(container.url)
      url.hash = hash

      pjax.state.url = url.href
      window.history.replaceState(pjax.state, container.title, url.href)

      var target = $(url.hash)
      if (target.length) $(window).scrollTop(target.offset().top)
    }

    fire('pjax:success', [data, status, xhr, options])
  }


  // Initialize pjax.state for the initial page load. Assume we're
  // using the container and options of the link we're loading for the
  // back button to the initial page. This ensures good back button
  // behavior.
  if (!pjax.state) {
    pjax.state = {
      id: uniqueId(),
      url: window.location.href,
      title: document.title,
      container: context.selector,
      fragment: options.fragment,
      timeout: options.timeout
    }
    window.history.replaceState(pjax.state, document.title)
  }

  // Cancel the current request if we're already pjaxing
  var xhr = pjax.xhr
  if ( xhr && xhr.readyState < 4) {
    xhr.onreadystatechange = $.noop
    xhr.abort()
  }

  pjax.options = options
  var xhr = pjax.xhr = $.ajax(options)

  if (xhr.readyState > 0) {
    if (options.push && !options.replace) {
      // Cache current container element before replacing it
      cachePush(pjax.state.id, context.clone().contents())

      window.history.pushState(null, "", stripPjaxParam(options.requestUrl))
    }

    fire('pjax:start', [xhr, options])
    fire('pjax:send', [xhr, options])
  }

  return pjax.xhr
}

// Public: Reload current page with pjax.
//
// Returns whatever $.pjax returns.
function pjaxReload(container, options) {
  var defaults = {
    url: window.location.href,
    push: false,
    replace: true,
    scrollTo: false
  }

  return pjax($.extend(defaults, optionsFor(container, options)))
}

// Internal: Hard replace current state with url.
//
// Work for around WebKit
//   https://bugs.webkit.org/show_bug.cgi?id=93506
//
// Returns nothing.
function locationReplace(url) {
  window.history.replaceState(null, "", "#")
  window.location.replace(url)
}


var initialPop = true
var initialURL = window.location.href
var initialState = window.history.state

// Initialize $.pjax.state if possible
// Happens when reloading a page and coming forward from a different
// session history.
if (initialState && initialState.container) {
  pjax.state = initialState
}

// Non-webkit browsers don't fire an initial popstate event
if ('state' in window.history) {
  initialPop = false
}

// popstate handler takes care of the back and forward buttons
//
// You probably shouldn't use pjax on pages with other pushState
// stuff yet.
function onPjaxPopstate(event) {
  var state = event.state

  if (state && state.container) {
    // When coming forward from a separate history session, will get an
    // initial pop with a state we are already at. Skip reloading the current
    // page.
    if (initialPop && initialURL == state.url) return

    // If popping back to the same state, just skip.
    // Could be clicking back from hashchange rather than a pushState.
    if (pjax.state.id === state.id) return

    var container = $(state.container)
    if (container.length) {
      var direction, contents = cacheMapping[state.id]

      if (pjax.state) {
        // Since state ids always increase, we can deduce the history
        // direction from the previous state.
        direction = pjax.state.id < state.id ? 'forward' : 'back'

        // Cache current container before replacement and inform the
        // cache which direction the history shifted.
        cachePop(direction, pjax.state.id, container.clone().contents())
      }

      var popstateEvent = $.Event('pjax:popstate', {
        state: state,
        direction: direction
      })
      container.trigger(popstateEvent)

      var options = {
        id: state.id,
        url: state.url,
        container: container,
        push: false,
        fragment: state.fragment,
        timeout: state.timeout,
        scrollTo: false
      }

      if (contents) {
        container.trigger('pjax:start', [null, options])

        if (state.title) document.title = state.title
        container.html(contents)
        pjax.state = state

        container.trigger('pjax:end', [null, options])
      } else {
        pjax(options)
      }

      // Force reflow/relayout before the browser tries to restore the
      // scroll position.
      container[0].offsetHeight
    } else {
      locationReplace(location.href)
    }
  }
  initialPop = false
}

// Fallback version of main pjax function for browsers that don't
// support pushState.
//
// Returns nothing since it retriggers a hard form submission.
function fallbackPjax(options) {
  var url = $.isFunction(options.url) ? options.url() : options.url,
      method = options.type ? options.type.toUpperCase() : 'GET'

  var form = $('<form>', {
    method: method === 'GET' ? 'GET' : 'POST',
    action: url,
    style: 'display:none'
  })

  if (method !== 'GET' && method !== 'POST') {
    form.append($('<input>', {
      type: 'hidden',
      name: '_method',
      value: method.toLowerCase()
    }))
  }

  var data = options.data
  if (typeof data === 'string') {
    $.each(data.split('&'), function(index, value) {
      var pair = value.split('=')
      form.append($('<input>', {type: 'hidden', name: pair[0], value: pair[1]}))
    })
  } else if (typeof data === 'object') {
    for (key in data)
      form.append($('<input>', {type: 'hidden', name: key, value: data[key]}))
  }

  $(document.body).append(form)
  form.submit()
}

// Internal: Generate unique id for state object.
//
// Use a timestamp instead of a counter since ids should still be
// unique across page loads.
//
// Returns Number.
function uniqueId() {
  return (new Date).getTime()
}

// Internal: Strips _pjax param from url
//
// url - String
//
// Returns String.
function stripPjaxParam(url) {
  return url
    .replace(/\?_pjax=[^&]+&?/, '?')
    .replace(/_pjax=[^&]+&?/, '')
    .replace(/[\?&]$/, '')
}

// Internal: Parse URL components and returns a Locationish object.
//
// url - String URL
//
// Returns HTMLAnchorElement that acts like Location.
function parseURL(url) {
  var a = document.createElement('a')
  a.href = url
  return a
}

// Internal: Build options Object for arguments.
//
// For convenience the first parameter can be either the container or
// the options object.
//
// Examples
//
//   optionsFor('#container')
//   // => {container: '#container'}
//
//   optionsFor('#container', {push: true})
//   // => {container: '#container', push: true}
//
//   optionsFor({container: '#container', push: true})
//   // => {container: '#container', push: true}
//
// Returns options Object.
function optionsFor(container, options) {
  // Both container and options
  if ( container && options )
    options.container = container

  // First argument is options Object
  else if ( $.isPlainObject(container) )
    options = container

  // Only container
  else
    options = {container: container}

  // Find and validate container
  if (options.container)
    options.container = findContainerFor(options.container)

  return options
}

// Internal: Find container element for a variety of inputs.
//
// Because we can't persist elements using the history API, we must be
// able to find a String selector that will consistently find the Element.
//
// container - A selector String, jQuery object, or DOM Element.
//
// Returns a jQuery object whose context is `document` and has a selector.
function findContainerFor(container) {
  container = $(container)

  if ( !container.length ) {
    throw "no pjax container for " + container.selector
  } else if ( container.selector !== '' && container.context === document ) {
    return container
  } else if ( container.attr('id') ) {
    return $('#' + container.attr('id'))
  } else {
    throw "cant get selector for pjax container!"
  }
}

// Internal: Filter and find all elements matching the selector.
//
// Where $.fn.find only matches descendants, findAll will test all the
// top level elements in the jQuery object as well.
//
// elems    - jQuery object of Elements
// selector - String selector to match
//
// Returns a jQuery object.
function findAll(elems, selector) {
  return elems.filter(selector).add(elems.find(selector));
}

function parseHTML(html) {
  return $.parseHTML(html, document, true)
}

// Internal: Extracts container and metadata from response.
//
// 1. Extracts X-PJAX-URL header if set
// 2. Extracts inline <title> tags
// 3. Builds response Element and extracts fragment if set
//
// data    - String response data
// xhr     - XHR response
// options - pjax options Object
//
// Returns an Object with url, title, and contents keys.
function extractContainer(data, xhr, options) {
  var obj = {}

  // Prefer X-PJAX-URL header if it was set, otherwise fallback to
  // using the original requested url.
  obj.url = stripPjaxParam(xhr.getResponseHeader('X-PJAX-URL') || options.requestUrl)

  // Attempt to parse response html into elements
  if (/<html/i.test(data)) {
    var $head = $(parseHTML(data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]))
    var $body = $(parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))
  } else {
    var $head = $body = $(parseHTML(data))
  }

  // If response data is empty, return fast
  if ($body.length === 0)
    return obj

  // If there's a <title> tag in the header, use it as
  // the page's title.
  obj.title = findAll($head, 'title').last().text()

  if (options.fragment) {
    // If they specified a fragment, look for it in the response
    // and pull it out.
    if (options.fragment === 'body') {
      var $fragment = $body
    } else {
      var $fragment = findAll($body, options.fragment).first()
    }

    if ($fragment.length) {
      obj.contents = $fragment.contents()

      // If there's no title, look for data-title and title attributes
      // on the fragment
      if (!obj.title)
        obj.title = $fragment.attr('title') || $fragment.data('title')
    }

  } else if (!/<html/i.test(data)) {
    obj.contents = $body
  }

  // Clean up any <title> tags
  if (obj.contents) {
    // Remove any parent title elements
    obj.contents = obj.contents.not(function() { return $(this).is('title') })

    // Then scrub any titles from their descendants
    obj.contents.find('title').remove()

    // Gather all script[src] elements
    obj.scripts = findAll(obj.contents, 'script[src]').remove()
    obj.contents = obj.contents.not(obj.scripts)
  }

  // Trim any whitespace off the title
  if (obj.title) obj.title = $.trim(obj.title)

  return obj
}

// Load an execute scripts using standard script request.
//
// Avoids jQuery's traditional $.getScript which does a XHR request and
// globalEval.
//
// scripts - jQuery object of script Elements
//
// Returns nothing.
function executeScriptTags(scripts) {
  if (!scripts) return

  var existingScripts = $('script[src]')

  scripts.each(function() {
    var src = this.src
    var matchedScripts = existingScripts.filter(function() {
      return this.src === src
    })
    if (matchedScripts.length) return

    var script = document.createElement('script')
    script.type = $(this).attr('type')
    script.src = $(this).attr('src')
    document.head.appendChild(script)
  })
}

// Internal: History DOM caching class.
var cacheMapping      = {}
var cacheForwardStack = []
var cacheBackStack    = []

// Push previous state id and container contents into the history
// cache. Should be called in conjunction with `pushState` to save the
// previous container contents.
//
// id    - State ID Number
// value - DOM Element to cache
//
// Returns nothing.
function cachePush(id, value) {
  cacheMapping[id] = value
  cacheBackStack.push(id)

  // Remove all entires in forward history stack after pushing
  // a new page.
  while (cacheForwardStack.length)
    delete cacheMapping[cacheForwardStack.shift()]

  // Trim back history stack to max cache length.
  while (cacheBackStack.length > pjax.defaults.maxCacheLength)
    delete cacheMapping[cacheBackStack.shift()]
}

// Shifts cache from directional history cache. Should be
// called on `popstate` with the previous state id and container
// contents.
//
// direction - "forward" or "back" String
// id        - State ID Number
// value     - DOM Element to cache
//
// Returns nothing.
function cachePop(direction, id, value) {
  var pushStack, popStack
  cacheMapping[id] = value

  if (direction === 'forward') {
    pushStack = cacheBackStack
    popStack  = cacheForwardStack
  } else {
    pushStack = cacheForwardStack
    popStack  = cacheBackStack
  }

  pushStack.push(id)
  if (id = popStack.pop())
    delete cacheMapping[id]
}

// Public: Find version identifier for the initial page load.
//
// Returns String version or undefined.
function findVersion() {
  return $('meta').filter(function() {
    var name = $(this).attr('http-equiv')
    return name && name.toUpperCase() === 'X-PJAX-VERSION'
  }).attr('content')
}

// Install pjax functions on $.pjax to enable pushState behavior.
//
// Does nothing if already enabled.
//
// Examples
//
//     $.pjax.enable()
//
// Returns nothing.
function enable() {
  $.fn.pjax = fnPjax
  $.pjax = pjax
  $.pjax.enable = $.noop
  $.pjax.disable = disable
  $.pjax.click = handleClick
  $.pjax.submit = handleSubmit
  $.pjax.reload = pjaxReload
  $.pjax.defaults = {
    timeout: 650,
    push: true,
    replace: false,
    type: 'GET',
    dataType: 'html',
    scrollTo: 0,
    maxCacheLength: 20,
    version: findVersion
  }
  $(window).on('popstate.pjax', onPjaxPopstate)
}

// Disable pushState behavior.
//
// This is the case when a browser doesn't support pushState. It is
// sometimes useful to disable pushState for debugging on a modern
// browser.
//
// Examples
//
//     $.pjax.disable()
//
// Returns nothing.
function disable() {
  $.fn.pjax = function() { return this }
  $.pjax = fallbackPjax
  $.pjax.enable = enable
  $.pjax.disable = $.noop
  $.pjax.click = $.noop
  $.pjax.submit = $.noop
  $.pjax.reload = function() { window.location.reload() }

  $(window).off('popstate.pjax', onPjaxPopstate)
}


// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
if ( $.inArray('state', $.event.props) < 0 )
  $.event.props.push('state')

// Is pjax supported by this browser?
$.support.pjax =
  window.history && window.history.pushState && window.history.replaceState &&
  // pushState isn't reliable on iOS until 5.
  !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)

$.support.pjax ? enable() : disable()

})(jQuery);
},{}],18:[function(require,module,exports){
/*!
 * Smooth Scroll - v1.4.11 - 2013-07-15
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2013 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */
(function(l){function t(l){return l.replace(/(:|\.)/g,"\\$1")}var e="1.4.11",o={exclude:[],excludeWithin:[],offset:0,direction:"top",scrollElement:null,scrollTarget:null,beforeScroll:function(){},afterScroll:function(){},easing:"swing",speed:400,autoCoefficent:2,preventDefault:!0},r=function(t){var e=[],o=!1,r=t.dir&&"left"==t.dir?"scrollLeft":"scrollTop";return this.each(function(){if(this!=document&&this!=window){var t=l(this);t[r]()>0?e.push(this):(t[r](1),o=t[r]()>0,o&&e.push(this),t[r](0))}}),e.length||this.each(function(){"BODY"===this.nodeName&&(e=[this])}),"first"===t.el&&e.length>1&&(e=[e[0]]),e};l.fn.extend({scrollable:function(l){var t=r.call(this,{dir:l});return this.pushStack(t)},firstScrollable:function(l){var t=r.call(this,{el:"first",dir:l});return this.pushStack(t)},smoothScroll:function(e){e=e||{};var o=l.extend({},l.fn.smoothScroll.defaults,e),r=l.smoothScroll.filterPath(location.pathname);return this.unbind("click.smoothscroll").bind("click.smoothscroll",function(e){var n=this,s=l(this),c=o.exclude,i=o.excludeWithin,a=0,f=0,h=!0,u={},d=location.hostname===n.hostname||!n.hostname,m=o.scrollTarget||(l.smoothScroll.filterPath(n.pathname)||r)===r,p=t(n.hash);if(o.scrollTarget||d&&m&&p){for(;h&&c.length>a;)s.is(t(c[a++]))&&(h=!1);for(;h&&i.length>f;)s.closest(i[f++]).length&&(h=!1)}else h=!1;h&&(o.preventDefault&&e.preventDefault(),l.extend(u,o,{scrollTarget:o.scrollTarget||p,link:n}),l.smoothScroll(u))}),this}}),l.smoothScroll=function(t,e){var o,r,n,s,c=0,i="offset",a="scrollTop",f={},h={};"number"==typeof t?(o=l.fn.smoothScroll.defaults,n=t):(o=l.extend({},l.fn.smoothScroll.defaults,t||{}),o.scrollElement&&(i="position","static"==o.scrollElement.css("position")&&o.scrollElement.css("position","relative"))),o=l.extend({link:null},o),a="left"==o.direction?"scrollLeft":a,o.scrollElement?(r=o.scrollElement,c=r[a]()):r=l("html, body").firstScrollable(),o.beforeScroll.call(r,o),n="number"==typeof t?t:e||l(o.scrollTarget)[i]()&&l(o.scrollTarget)[i]()[o.direction]||0,f[a]=n+c+o.offset,s=o.speed,"auto"===s&&(s=f[a]||r.scrollTop(),s/=o.autoCoefficent),h={duration:s,easing:o.easing,complete:function(){o.afterScroll.call(o.link,o)}},o.step&&(h.step=o.step),r.length?r.stop().animate(f,h):o.afterScroll.call(o.link,o)},l.smoothScroll.version=e,l.smoothScroll.filterPath=function(l){return l.replace(/^\//,"").replace(/(index|default).[a-zA-Z]{3,4}$/,"").replace(/\/$/,"")},l.fn.smoothScroll.defaults=o})(jQuery);
},{}]},{},[7])
;