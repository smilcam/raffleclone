// page init
jQuery(function(){
	initSlideShow();
	initOpenClose();
	initInputs();
	initBackgroundResize();
	initSmoothScroll();
	initCounter();
	mobileNav();
	initModalWindow();
});

jQuery(window).load(function() {
	jQuery('.scroll-icon').delay(3000).fadeOut();
});

//initModalWindow
function initModalWindow() {
	jQuery('a.open-popup').modalWindow();
}

/*
 * ModalWindow
 */
;(function($) {
	function ModalWindow(link, options) {
		this.btnOpen = $(link);
		this.options = {
			attr: 'hash',
			btnClose: '.close',
			animSpeed: 400,
			
			overlayColor: '#fff',
			overlayOpacity: 0.9
		}
		$.extend(this.options, options);
		this.init();
	}
	ModalWindow.prototype = {
		init: function() {
			this.findElements();
			this.setStructure();
			this.addEvents();
		},
		findElements: function() {
			this.popup = $(this.btnOpen.prop(this.options.attr));
			this.btnClose = this.popup.find(this.options.btnClose);
			
			this.resizeHandler = this.bind(this.resizeHandler, this);
			this.overlayClickHandler = this.bind(this.overlayClickHandler, this);
		},
		setStructure: function() {
			this.popupAnchor = this.popup.data('popupAnchor');
			if (!this.popupAnchor) {
				this.popupAnchor = $('<div>', {'class': 'anchor'});
				this.popupAnchor.insertBefore(this.popup);
				this.popup.css({
					position: 'absolute',
					zIndex: 1000
				});
				this.popup.data('popupAnchor', this.popupAnchor);
			}
		},
		addEvents: function() {
			var that = this;
			that.btnOpen.bind('click', function(e) {
				e.preventDefault();
				that.showPopup();
			});
			that.btnClose.bind('click', function(e) {
				e.preventDefault();
				that.hidePopup();
			});
		},
		showPopup: function() {
			this.resizeOverlay();
			overlay.css({
				opacity: this.options.overlayOpacity,
				background: this.options.overlayColor
			});
			overlay.fadeIn(this.options.animSpeed);
			this.popup.show().appendTo('body');
			this.positionPopup();
			this.popup.css({
				marginTop: - (Math.max((winH - this.popup.outerHeight()) / 2, 0) + this.popup.outerHeight())
			}).animate({
				marginTop: 0
			}, {
				duration: this.options.animSpeed
			});
			if (isTouchDevice) {
				win.bind('orientationchange', this.resizeHandler);
				overlay.bind('touchstart', this.overlayClickHandler);
			} else {
				win.bind('resize', this.resizeHandler);
				overlay.bind('click', this.overlayClickHandler);
			}
		},
		hidePopup: function() {
			var that = this;
			overlay.fadeOut(that.options.animSpeed);
			that.popup.animate({
				marginTop: - (Math.max((winH - that.popup.outerHeight()) / 2, 0) + this.popup.outerHeight())
			}, {
				duration: that.options.animSpeed,
				complete: function() {
					$(this).insertAfter(that.popupAnchor).css({
						top: '',
						left: '',
						marginTop: ''
					});
				}
			});
			if (isTouchDevice) {
				win.unbind('orientationchange', this.resizeHandler);
				overlay.unbind('touchstart', this.overlayClickHandler);
			} else {
				win.unbind('resize', this.resizeHandler);
				overlay.unbind('click', this.overlayClickHandler);
			}
		},
		resizeOverlay: function() {
			overlay.css({
				width: '',
				height: ''
			});
			docH = doc.height();
			docW = doc.width();
			winH = win.height();
			winW = win.width();
			overlay.css({
				width: winW > docW ? winW : docW,
				height: winH > docH ? winH : docH
			});
		},
		positionPopup: function() {
			this.popup.css({
				top: win.scrollTop() + Math.max((winH - this.popup.outerHeight()) / 2, 0),
				left: Math.max((winW - this.popup.outerWidth()) / 2, 0)
			});
		},
		resizeHandler: function() {
			this.resizeOverlay();
			this.positionPopup();
		},
		overlayClickHandler: function() {
			this.hidePopup();
		},
		bind: function(f, scope, forceArgs){
			return function() {return f.apply(scope, forceArgs ? [forceArgs] : arguments);};
		}
	}
	
	var win = $(window);
	var doc = $(document);
	var docH;
	var docW;
	var winH;
	var winW;
	var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	var overlay = $('<div>', {
		id: 'modal-overlay',
		css: {
			position: 'fixed',
			top: 0,
			left: 0,
			zIndex: 999,
			display: 'none'
		}
	});
	
	$(function() {
		overlay.appendTo('#wrapper');
	});
	
	$.fn.modalWindow = function(options) {
		return this.each(function() {
			if (!$(this).data('ModalWindow')) {
				$(this).data('ModalWindow', new ModalWindow(this, options));
			}
		});
	}
}(jQuery));

//mobileNav
var mobileNav = (function($) {
	function MobileNav(options) {
		if (!(this instanceof MobileNav)) {
			return new MobileNav(arguments[0]);
		}
		this.options = {
			navHolder: '#open-close-nav',
			navBlock: '.nav-block',
			opener: '.opener',
			runElements: '#header, #content, #bottom-nav, #nav-section',
			openStateClass: 'active',
			width: 951
		}
		$.extend(this.options, options);
		this.init();
	}
	MobileNav.prototype = {
		init: function() {
			this.findElements();
			this.setStructure();
			this.bindEvents();
			this.navHolder.data('MobileNav', this);
		},
		findElements: function() {
			this.navHolder = $(this.options.navHolder);
			this.navBlock = this.navHolder.find(this.options.navBlock);
			this.opener = this.navHolder.find(this.options.opener);
			this.runElements = $(this.options.runElements);
			
			this.openState = false;
		},
		bindEvents: function() {
			var that = this;
			
			that.opener.bind('click', function(e) {
				e.preventDefault();
				that.toggleNav();
			});
			
			win.bind('resize orientationchange', function() {
				if (win.width() + scrollSize.getWidth() > that.options.width) {
					that.openState = false;
					that.setStructure();
				}
			});
		},
		setStructure: function() {
			if (this.openState) {
				this.navHolder.addClass(this.options.openStateClass);
				this.runElements.css({
					marginLeft: - this.navBlock.outerWidth()
				});
			} else {
				this.navHolder.removeClass(this.options.openStateClass);
				this.runElements.css({
					marginLeft: ''
				});
			}
		},
		toggleNav: function() {
			if (this.openState) {
				this.hideNav();
			} else {
				this.showNav();
			}
		},
		showNav: function() {
			this.openState = true;
			this.navHolder.addClass(this.options.openStateClass);
			this.runElements.animate({
				marginLeft: - this.navBlock.outerWidth()
			});
		},
		hideNav: function() {
			this.openState = false;
			this.navHolder.removeClass(this.options.openStateClass);
			this.runElements.animate({
				marginLeft: ''
			});
		}
	}
	var win = $(window);
	
	return MobileNav;
}(jQuery));

//initCounter
function initCounter() {
	var box = jQuery('#flip-counter');
	var counterBox = jQuery('.counter-block');
	
	if (box.length) {
		var time = parseInt(box.text(), 10);
		box.empty();
		
		var myCounter = new flipCounter('flip-counter', {
			value: timer(time),
			auto: false,
			fW: 21,
			tFH: 14,
			bFH: 28,
			bOffset: 140
		});
		
		runTimer(time, myCounter);
	}
	
	function runTimer(time, counter) {
		if (time > 0) {
			time--;
			counter.setValue(timer(time));
			
			setTimeout(function() {
				runTimer.apply(this, [time, counter]);
			}, 1000);
		}
	}
	
	function timer(time) {
		var seconds = (time % 60).toString();
		var minutes = (Math.floor(time / 60) % 60).toString();
		var hours = (Math.floor(time / 3600) % 24).toString();
		var days = (Math.floor(time / 86400)).toString();
		return parseInt(('1' + formatedNum(days) + formatedNum(hours) + formatedNum(minutes) + formatedNum(seconds)), 10);
	}
	
	function formatedNum(num) {
		if (num.length < 2) {
			num = '0' + num;
		}
		return num;
	}
	
	counterBox.each(function() {
		var box = jQuery(this);
		var drop = box.find('.drop').show();
		var timer;
		
		box.bind({
			mouseenter: function() {
				clearTimeout(timer);
				drop.stop(true, true).slideDown();
			},
			mouseleave: function() {
				drop.stop(true, true).slideUp();
			}
		});
		
		jQuery(window).load(function() {
			timer = setTimeout(function() {
				drop.stop(true, true).slideUp();
			}, 7500);
		});
	});
}

//initSmoothScroll
function initSmoothScroll() {
	var fake = jQuery('<div>');
	var logo = jQuery('#logo');
	fake.insertAfter(logo);
	logo.prependTo('#nav');
	jQuery('#nav').onePageNav();
	logo.insertAfter(fake);
	fake.remove();
	logo.click(function(e) {
		e.preventDefault();
		setTimeout(function() {
			logo.removeClass('current');
		}, 1000);
	});
	
	jQuery('.add-nav a').each(function() {
		var link = jQuery(this);
		var target = jQuery(this.hash);
		
		if (target.length) {
			link.click(function(e) {
				e.preventDefault();
				jQuery.scrollTo(target, 750);
			});
		}
	});
	jQuery('#nav a').bind('click', function() {
		var mobileNavData = jQuery('#open-close-nav').data('MobileNav');
		if (mobileNavData) {
			mobileNavData.hideNav();
		}
	});
	jQuery('.price-list a').each(function() {
		var link = jQuery(this);
		var target = jQuery(this.hash);
		
		if (target.length) {
			link.click(function(e) {
				e.preventDefault();
				jQuery.scrollTo(target, 750);
			});
		}
	});
}

// clear inputs on focus
function initInputs() {
	PlaceholderInput.replaceByOptions({
		// filter options
		clearInputs: true,
		clearTextareas: false,
		clearPasswords: false,
		skipClass: 'default',
		
		// input options
		wrapWithElement: false,
		showUntilTyping: false,
		getParentByClass: false,
		placeholderAttr: 'value'
	});
}

// fade gallery init
function initSlideShow() {
	jQuery('div.gallery').fadeGallery({
		slides: 'div.frame li',
		pagerLinks: '.pagination li',
		event: 'click',
		disableFadeIE: true,
		autoRotation: true,
		pauseOnHover: false,
		autoHeight: true,
		switchTime: 5000,
		animSpeed: 1000
	});
}

// open-close init
function initOpenClose() {
	jQuery('div.bottom-nav').openClose({
		activeClass: 'active',
		opener: '.opener, .close',
		slider: '.slide',
		animSpeed: 600,
		effect: 'slide',
		onInit: function(that) {
			jQuery('a.open-bottom-nav').click(function(e) {
				e.preventDefault();
				that.eventHandler(e);
			});
		}
	});
}

// stretch background to fill blocks
function initBackgroundResize() {
	jQuery('.bg span').each(function() {
		ImageStretcher.add({
			container: this,
			image: 'img'
		});
	});
}

/*
 * Image Stretch module
 */
var ImageStretcher = {
	getDimensions: function(data) {
		// calculate element coords to fit in mask
		var ratio = data.imageRatio || (data.imageWidth / data.imageHeight),
			slideWidth = data.maskWidth,
			slideHeight = slideWidth / ratio;

		if(slideHeight < data.maskHeight) {
			slideHeight = data.maskHeight;
			slideWidth = slideHeight * ratio;
		}
		return {
			width: slideWidth,
			height: slideHeight,
			top: (data.maskHeight - slideHeight) / 2,
			left: (data.maskWidth - slideWidth) / 2
		};
	},
	getRatio: function(image) {
		if(image.prop('naturalWidth')) {
			return image.prop('naturalWidth') / image.prop('naturalHeight');
		} else {
			var img = new Image();
			img.src = image.prop('src');
			return img.width / img.height;
		}
	},
	imageLoaded: function(image, callback) {
		var self = this;
		var loadHandler = function() {
			callback.call(self);
		};
		if(image.prop('complete')) {
			loadHandler();
		} else {
			image.one('load', loadHandler);
		}
	},
	resizeHandler: function() {
		var self = this;
		jQuery.each(this.imgList, function(index, item) {
			if(item.image.prop('complete')) {
				self.resizeImage(item.image, item.container);
			}
		});
	},
	resizeImage: function(image, container) {
		this.imageLoaded(image, function() {
			var styles = this.getDimensions({
				imageRatio: this.getRatio(image),
				maskWidth: container.width(),
				maskHeight: container.height()
			});
			image.css({
				width: styles.width,
				height: styles.height,
				marginTop: styles.top,
				marginLeft: styles.left
			});
		});
	},
	add: function(options) {
		var container = jQuery(options.container ? options.container : window),
			image = typeof options.image === 'string' ? container.find(options.image) : jQuery(options.image);

		// resize image
		this.resizeImage(image, container);

		// add resize handler once if needed
		if(!this.win) {
			this.resizeHandler = jQuery.proxy(this.resizeHandler, this);
			this.imgList = [];
			this.win = jQuery(window);
			this.win.on('resize orientationchange', this.resizeHandler);
		}

		// store item in collection
		this.imgList.push({
			container: container,
			image: image
		});
	}
};

// placeholder class
;(function(){
	var placeholderCollection = [];
	PlaceholderInput = function() {
		this.options = {
			element:null,
			showUntilTyping:false,
			wrapWithElement:false,
			getParentByClass:false,
			showPasswordBullets:false,
			placeholderAttr:'value',
			inputFocusClass:'focus',
			inputActiveClass:'text-active',
			parentFocusClass:'parent-focus',
			parentActiveClass:'parent-active',
			labelFocusClass:'label-focus',
			labelActiveClass:'label-active',
			fakeElementClass:'input-placeholder-text'
		};
		placeholderCollection.push(this);
		this.init.apply(this,arguments);
	};
	PlaceholderInput.refreshAllInputs = function(except) {
		for(var i = 0; i < placeholderCollection.length; i++) {
			if(except !== placeholderCollection[i]) {
				placeholderCollection[i].refreshState();
			}
		}
	};
	PlaceholderInput.replaceByOptions = function(opt) {
		var inputs = [].concat(
			convertToArray(document.getElementsByTagName('input')),
			convertToArray(document.getElementsByTagName('textarea'))
		);
		for(var i = 0; i < inputs.length; i++) {
			if(inputs[i].className.indexOf(opt.skipClass) < 0) {
				var inputType = getInputType(inputs[i]);
				var placeholderValue = inputs[i].getAttribute('placeholder');
				if(opt.focusOnly || (opt.clearInputs && (inputType === 'text' || inputType === 'email' || placeholderValue)) ||
					(opt.clearTextareas && inputType === 'textarea') ||
					(opt.clearPasswords && inputType === 'password')
				) {
					new PlaceholderInput({
						element:inputs[i],
						focusOnly: opt.focusOnly,
						wrapWithElement:opt.wrapWithElement,
						showUntilTyping:opt.showUntilTyping,
						getParentByClass:opt.getParentByClass,
						showPasswordBullets:opt.showPasswordBullets,
						placeholderAttr: placeholderValue ? 'placeholder' : opt.placeholderAttr
					});
				}
			}
		}
	};
	PlaceholderInput.prototype = {
		init: function(opt) {
			this.setOptions(opt);
			if(this.element && this.element.PlaceholderInst) {
				this.element.PlaceholderInst.refreshClasses();
			} else {
				this.element.PlaceholderInst = this;
				if(this.elementType !== 'radio' || this.elementType !== 'checkbox' || this.elementType !== 'file') {
					this.initElements();
					this.attachEvents();
					this.refreshClasses();
				}
			}
		},
		setOptions: function(opt) {
			for(var p in opt) {
				if(opt.hasOwnProperty(p)) {
					this.options[p] = opt[p];
				}
			}
			if(this.options.element) {
				this.element = this.options.element;
				this.elementType = getInputType(this.element);
				if(this.options.focusOnly) {
					this.wrapWithElement = false;
				} else {
					if(this.elementType === 'password' && this.options.showPasswordBullets) {
						this.wrapWithElement = false;
					} else {
						this.wrapWithElement = this.elementType === 'password' || this.options.showUntilTyping ? true : this.options.wrapWithElement;
					}
				}
				this.setPlaceholderValue(this.options.placeholderAttr);
			}
		},
		setPlaceholderValue: function(attr) {
			this.origValue = (attr === 'value' ? this.element.defaultValue : (this.element.getAttribute(attr) || ''));
			if(this.options.placeholderAttr !== 'value') {
				this.element.removeAttribute(this.options.placeholderAttr);
			}
		},
		initElements: function() {
			// create fake element if needed
			if(this.wrapWithElement) {
				this.fakeElement = document.createElement('span');
				this.fakeElement.className = this.options.fakeElementClass;
				this.fakeElement.innerHTML += this.origValue;
				this.fakeElement.style.color = getStyle(this.element, 'color');
				this.fakeElement.style.position = 'absolute';
				this.element.parentNode.insertBefore(this.fakeElement, this.element);
				
				if(this.element.value === this.origValue || !this.element.value) {
					this.element.value = '';
					this.togglePlaceholderText(true);
				} else {
					this.togglePlaceholderText(false);
				}
			} else if(!this.element.value && this.origValue.length) {
				this.element.value = this.origValue;
			}
			// get input label
			if(this.element.id) {
				this.labels = document.getElementsByTagName('label');
				for(var i = 0; i < this.labels.length; i++) {
					if(this.labels[i].htmlFor === this.element.id) {
						this.labelFor = this.labels[i];
						break;
					}
				}
			}
			// get parent node (or parentNode by className)
			this.elementParent = this.element.parentNode;
			if(typeof this.options.getParentByClass === 'string') {
				var el = this.element;
				while(el.parentNode) {
					if(hasClass(el.parentNode, this.options.getParentByClass)) {
						this.elementParent = el.parentNode;
						break;
					} else {
						el = el.parentNode;
					}
				}
			}
		},
		attachEvents: function() {
			this.element.onfocus = bindScope(this.focusHandler, this);
			this.element.onblur = bindScope(this.blurHandler, this);
			if(this.options.showUntilTyping) {
				this.element.onkeydown = bindScope(this.typingHandler, this);
				this.element.onpaste = bindScope(this.typingHandler, this);
			}
			if(this.wrapWithElement) this.fakeElement.onclick = bindScope(this.focusSetter, this);
		},
		togglePlaceholderText: function(state) {
			if(!this.element.readOnly && !this.options.focusOnly) {
				if(this.wrapWithElement) {
					this.fakeElement.style.display = state ? '' : 'none';
				} else {
					this.element.value = state ? this.origValue : '';
				}
			}
		},
		focusSetter: function() {
			this.element.focus();
		},
		focusHandler: function() {
			clearInterval(this.checkerInterval);
			this.checkerInterval = setInterval(bindScope(this.intervalHandler,this), 1);
			this.focused = true;
			if(!this.element.value.length || this.element.value === this.origValue) {
				if(!this.options.showUntilTyping) {
					this.togglePlaceholderText(false);
				}
			}
			this.refreshClasses();
		},
		blurHandler: function() {
			clearInterval(this.checkerInterval);
			this.focused = false;
			if(!this.element.value.length || this.element.value === this.origValue) {
				this.togglePlaceholderText(true);
			}
			this.refreshClasses();
			PlaceholderInput.refreshAllInputs(this);
		},
		typingHandler: function() {
			setTimeout(bindScope(function(){
				if(this.element.value.length) {
					this.togglePlaceholderText(false);
					this.refreshClasses();
				}
			},this), 10);
		},
		intervalHandler: function() {
			if(typeof this.tmpValue === 'undefined') {
				this.tmpValue = this.element.value;
			}
			if(this.tmpValue != this.element.value) {
				PlaceholderInput.refreshAllInputs(this);
			}
		},
		refreshState: function() {
			if(this.wrapWithElement) {
				if(this.element.value.length && this.element.value !== this.origValue) {
					this.togglePlaceholderText(false);
				} else if(!this.element.value.length) {
					this.togglePlaceholderText(true);
				}
			}
			this.refreshClasses();
		},
		refreshClasses: function() {
			this.textActive = this.focused || (this.element.value.length && this.element.value !== this.origValue);
			this.setStateClass(this.element, this.options.inputFocusClass,this.focused);
			this.setStateClass(this.elementParent, this.options.parentFocusClass,this.focused);
			this.setStateClass(this.labelFor, this.options.labelFocusClass,this.focused);
			this.setStateClass(this.element, this.options.inputActiveClass, this.textActive);
			this.setStateClass(this.elementParent, this.options.parentActiveClass, this.textActive);
			this.setStateClass(this.labelFor, this.options.labelActiveClass, this.textActive);
		},
		setStateClass: function(el,cls,state) {
			if(!el) return; else if(state) addClass(el,cls); else removeClass(el,cls);
		}
	};
	
	// utility functions
	function convertToArray(collection) {
		var arr = [];
		for (var i = 0, ref = arr.length = collection.length; i < ref; i++) {
			arr[i] = collection[i];
		}
		return arr;
	}
	function getInputType(input) {
		return (input.type ? input.type : input.tagName).toLowerCase();
	}
	function hasClass(el,cls) {
		return el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
	}
	function addClass(el,cls) {
		if (!hasClass(el,cls)) el.className += " "+cls;
	}
	function removeClass(el,cls) {
		if (hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
	}
	function bindScope(f, scope) {
		return function() {return f.apply(scope, arguments);};
	}
	function getStyle(el, prop) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null)[prop];
		} else if (el.currentStyle) {
			return el.currentStyle[prop];
		} else {
			return el.style[prop];
		}
	}
}());

/*
 * jQuery SlideShow plugin
 */
;(function($){
	function FadeGallery(options) {
		this.options = $.extend({
			slides: 'ul.slideset > li',
			activeClass:'active',
			disabledClass:'disabled',
			btnPrev: 'a.btn-prev',
			btnNext: 'a.btn-next',
			generatePagination: false,
			pagerList: '<ul>',
			pagerListItem: '<li><a href="#"></a></li>',
			pagerListItemText: 'a',
			pagerLinks: '.pagination li',
			currentNumber: 'span.current-num',
			totalNumber: 'span.total-num',
			btnPlay: '.btn-play',
			btnPause: '.btn-pause',
			btnPlayPause: '.btn-play-pause',
			galleryReadyClass: 'gallery-js-ready',
			autorotationActiveClass: 'autorotation-active',
			autorotationDisabledClass: 'autorotation-disabled',
			autorotationStopAfterClick: false,
			circularRotation: true,
			switchSimultaneously: true,
			disableWhileAnimating: false,
			disableFadeIE: false,
			autoRotation: false,
			pauseOnHover: true,
			autoHeight: false,
			useSwipe: false,
			switchTime: 4000,
			animSpeed: 600,
			event:'click'
		}, options);
		this.init();
	}
	FadeGallery.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.initStructure();
				this.attachEvents();
				this.refreshState(true);
				this.autoRotate();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			// control elements
			this.gallery = $(this.options.holder).addClass(this.options.galleryReadyClass);
			this.slides = this.gallery.find(this.options.slides);
			this.slidesHolder = this.slides.eq(0).parent();
			this.stepsCount = this.slides.length;
			this.btnPrev = this.gallery.find(this.options.btnPrev);
			this.btnNext = this.gallery.find(this.options.btnNext);
			this.currentIndex = 0;
			
			// disable fade effect in old IE
			if(this.options.disableFadeIE && !$.support.opacity) {
				this.options.animSpeed = 0;
			}
			
			// create gallery pagination
			if(typeof this.options.generatePagination === 'string') {
				this.pagerHolder = this.gallery.find(this.options.generatePagination).empty();
				this.pagerList = $(this.options.pagerList).appendTo(this.pagerHolder);
				for(var i = 0; i < this.stepsCount; i++) {
					$(this.options.pagerListItem).appendTo(this.pagerList).find(this.options.pagerListItemText).text(i+1);
				}
				this.pagerLinks = this.pagerList.children();
			} else {
				this.pagerLinks = this.gallery.find(this.options.pagerLinks);
			}
			
			// get start index
			var activeSlide = this.slides.filter('.'+this.options.activeClass);
			if(activeSlide.length) {
				this.currentIndex = this.slides.index(activeSlide);
			}
			this.prevIndex = this.currentIndex;
			
			// autorotation control buttons
			this.btnPlay = this.gallery.find(this.options.btnPlay);
			this.btnPause = this.gallery.find(this.options.btnPause);
			this.btnPlayPause = this.gallery.find(this.options.btnPlayPause);
			
			// misc elements
			this.curNum = this.gallery.find(this.options.currentNumber);
			this.allNum = this.gallery.find(this.options.totalNumber);
			
			// handle flexible layout
			$(window).bind('load resize orientationchange', $.proxy(this.onWindowResize, this));
		},
		initStructure: function() {
			this.slides.css({display:'block',opacity:0}).eq(this.currentIndex).css({
				opacity:''
			});
		},
		attachEvents: function() {
			var self = this;
			this.btnPrev.bind(this.options.event, function(e){
				self.prevSlide();
				if(self.options.autorotationStopAfterClick) {
					self.stopRotation();
				}
				e.preventDefault();
			});
			this.btnNext.bind(this.options.event, function(e){
				self.nextSlide();
				if(self.options.autorotationStopAfterClick) {
					self.stopRotation();
				}
				e.preventDefault();
			});
			this.pagerLinks.each(function(ind, obj){
				$(obj).bind(self.options.event, function(e){
					self.numSlide(ind);
					if(self.options.autorotationStopAfterClick) {
						self.stopRotation();
					}
					e.preventDefault();
				});
			});
			
			// autorotation buttons handler
			this.btnPlay.bind(this.options.event, function(e){
				self.startRotation();
				e.preventDefault();
			});
			this.btnPause.bind(this.options.event, function(e){
				self.stopRotation();
				e.preventDefault();
			});
			this.btnPlayPause.bind(this.options.event, function(e){
				if(!self.gallery.hasClass(self.options.autorotationActiveClass)) {
					self.startRotation();
				} else {
					self.stopRotation();
				}
				e.preventDefault();
			});

			// swipe gestures handler
			if(this.options.useSwipe && $.fn.swipe) {
				this.gallery.swipe({
					excludedElements: '',
					fallbackToMouseEvents: false,
					swipeLeft: function() {
						self.nextSlide();
					},
					swipeRight: function() {
						self.prevSlide();
					}
				});
			}
			
			// pause on hover handling
			if(this.options.pauseOnHover) {
				this.gallery.hover(function(){
					if(self.options.autoRotation) {
						self.galleryHover = true;
						self.pauseRotation();
					}
				}, function(){
					if(self.options.autoRotation) {
						self.galleryHover = false;
						self.resumeRotation();
					}
				});
			}
		},
		onWindowResize: function(){
			if(this.options.autoHeight) {
				this.slidesHolder.css({height: this.slides.eq(this.currentIndex).outerHeight(true) });
			}
		},
		prevSlide: function() {
			if(!(this.options.disableWhileAnimating && this.galleryAnimating)) {
				this.prevIndex = this.currentIndex;
				if(this.currentIndex > 0) {
					this.currentIndex--;
					this.switchSlide();
				} else if(this.options.circularRotation) {
					this.currentIndex = this.stepsCount - 1;
					this.switchSlide();
				}
			}
		},
		nextSlide: function(fromAutoRotation) {
			if(!(this.options.disableWhileAnimating && this.galleryAnimating)) {
				this.prevIndex = this.currentIndex;
				if(this.currentIndex < this.stepsCount - 1) {
					this.currentIndex++;
					this.switchSlide();
				} else if(this.options.circularRotation || fromAutoRotation === true) {
					this.currentIndex = 0;
					this.switchSlide();
				}
			}
		},
		numSlide: function(c) {
			if(this.currentIndex != c) {
				this.prevIndex = this.currentIndex;
				this.currentIndex = c;
				this.switchSlide();
			}
		},
		switchSlide: function() {
			var self = this;
			if(this.slides.length > 1) {
				this.galleryAnimating = true;
				if(!this.options.animSpeed) {
					this.slides.eq(this.prevIndex).css({opacity:0});
				} else {
					this.slides.eq(this.prevIndex).stop().animate({opacity:0},{duration: this.options.animSpeed});
				}
				
				this.switchNext = function() {
					if(!self.options.animSpeed) {
						self.slides.eq(self.currentIndex).css({opacity:''});
					} else {
						self.slides.eq(self.currentIndex).stop().animate({opacity:1},{duration: self.options.animSpeed});
					}
					setTimeout(function() {
						self.slides.eq(self.currentIndex).css({opacity:''});
						self.galleryAnimating = false;
						self.autoRotate();
						
						// onchange callback
						self.makeCallback('onChange', self);
					}, self.options.animSpeed);
				}
				
				if(this.options.switchSimultaneously) {
					self.switchNext();
				} else {
					clearTimeout(this.switchTimer);
					this.switchTimer = setTimeout(function(){
						self.switchNext();
					}, this.options.animSpeed);
				}
				this.refreshState();
				
				// onchange callback
				this.makeCallback('onBeforeChange', this);
			}
		},
		refreshState: function(initial) {
			this.slides.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);
			this.pagerLinks.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);
			this.curNum.html(this.currentIndex+1);
			this.allNum.html(this.stepsCount);
			
			// initial refresh
			if(this.options.autoHeight) {
				if(initial) {
					this.slidesHolder.css({height: this.slides.eq(this.currentIndex).outerHeight(true) });
				} else {
					this.slidesHolder.stop().animate({height: this.slides.eq(this.currentIndex).outerHeight(true)}, {duration: this.options.animSpeed});
				}
			}
			
			// disabled state
			if(!this.options.circularRotation) {
				this.btnPrev.add(this.btnNext).removeClass(this.options.disabledClass);
				if(this.currentIndex === 0) this.btnPrev.addClass(this.options.disabledClass);
				if(this.currentIndex === this.stepsCount - 1) this.btnNext.addClass(this.options.disabledClass);
			}
		},
		startRotation: function() {
			this.options.autoRotation = true;
			this.galleryHover = false;
			this.autoRotationStopped = false;
			this.resumeRotation();
		},
		stopRotation: function() {
			this.galleryHover = true;
			this.autoRotationStopped = true;
			this.pauseRotation();
		},
		pauseRotation: function() {
			this.gallery.addClass(this.options.autorotationDisabledClass);
			this.gallery.removeClass(this.options.autorotationActiveClass);
			clearTimeout(this.timer);
		},
		resumeRotation: function() {
			if(!this.autoRotationStopped) {
				this.gallery.addClass(this.options.autorotationActiveClass);
				this.gallery.removeClass(this.options.autorotationDisabledClass);
				this.autoRotate();
			}
		},
		autoRotate: function() {
			var self = this;
			clearTimeout(this.timer);
			if(this.options.autoRotation && !this.galleryHover && !this.autoRotationStopped) {
				this.gallery.addClass(this.options.autorotationActiveClass);
				this.timer = setTimeout(function(){
					self.nextSlide(true);
				}, this.options.switchTime);
			} else {
				this.pauseRotation();
			}
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	}

	// jquery plugin
	$.fn.fadeGallery = function(opt){
		return this.each(function(){
			$(this).data('FadeGallery', new FadeGallery($.extend(opt,{holder:this})));
		});
	}
}(jQuery));

/*
 * jQuery Open/Close plugin
 */
;(function($) {
	function OpenClose(options) {
		this.options = $.extend({
			addClassBeforeAnimation: true,
			activeClass:'active',
			opener:'.opener',
			slider:'.slide',
			animSpeed: 400,
			effect:'fade',
			event:'click'
		}, options);
		this.init();
	}
	OpenClose.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			this.holder = $(this.options.holder);
			this.opener = this.holder.find(this.options.opener);
			this.slider = this.holder.find(this.options.slider);
			
			if (!this.holder.hasClass(this.options.activeClass)) {
				this.slider.addClass(slideHiddenClass);
			}
		},
		attachEvents: function() {
			// add handler
			var self = this;
			this.eventHandler = function(e) {
				e.preventDefault();
				if (self.slider.hasClass(slideHiddenClass)) {
					self.showSlide();
				} else {
					self.hideSlide();
				}
			};
			self.opener.bind(self.options.event, this.eventHandler);

			// hove mode handler
			if(self.options.event === 'over') {
				self.opener.bind('mouseenter', function() {
					self.holder.removeClass(self.options.activeClass);
					self.opener.trigger(self.options.event);
				});
				self.holder.bind('mouseleave', function() {
					self.holder.addClass(self.options.activeClass);
					self.opener.trigger(self.options.event);
				});
			}
		},
		showSlide: function() {
			var self = this;
			if (self.options.addClassBeforeAnimation) {
				self.holder.addClass(self.options.activeClass);
			}
			self.slider.removeClass(slideHiddenClass);

			self.makeCallback('animStart', true);
			toggleEffects[self.options.effect].show({
				box: self.slider,
				speed: self.options.animSpeed,
				complete: function() {
					if (!self.options.addClassBeforeAnimation) {
						self.holder.addClass(self.options.activeClass);
					}
					self.makeCallback('animEnd', true);
				}
			});
		},
		hideSlide: function() {
			var self = this;
			if (self.options.addClassBeforeAnimation) {
				self.holder.removeClass(self.options.activeClass);
			}
			
			self.makeCallback('animStart', false);
			toggleEffects[self.options.effect].hide({
				box: self.slider,
				speed: self.options.animSpeed,
				complete: function() {
					if (!self.options.addClassBeforeAnimation) {
						self.holder.removeClass(self.options.activeClass);
					}
					self.slider.addClass(slideHiddenClass);
					self.makeCallback('animEnd', false);
				}
			});
		},
		destroy: function() {
			this.slider.removeClass(slideHiddenClass);
			this.opener.unbind(this.options.event, this.eventHandler);
			this.holder.removeClass(this.options.activeClass).removeData('OpenClose');
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};
	
	// add stylesheet for slide on DOMReady
	var slideHiddenClass = 'js-slide-hidden';
	$(function() {
		var tabStyleSheet = $('<style type="text/css">')[0];
		var tabStyleRule = '.' + slideHiddenClass;
		tabStyleRule += '{position:absolute !important;left:-9999px !important;top:-9999px !important;display:block !important}';
		if (tabStyleSheet.styleSheet) {
			tabStyleSheet.styleSheet.cssText = tabStyleRule;
		} else {
			tabStyleSheet.appendChild(document.createTextNode(tabStyleRule));
		}
		$('head').append(tabStyleSheet);
	});
	
	// animation effects
	var toggleEffects = {
		slide: {
			show: function(o) {
				o.box.stop(true).hide().slideDown(o.speed, o.complete);
			},
			hide: function(o) {
				o.box.stop(true).slideUp(o.speed, o.complete);
			}
		},
		fade: {
			show: function(o) {
				o.box.stop(true).hide().fadeIn(o.speed, o.complete);
			},
			hide: function(o) {
				o.box.stop(true).fadeOut(o.speed, o.complete);
			}
		},
		none: {
			show: function(o) {
				o.box.hide().show(0, o.complete);
			},
			hide: function(o) {
				o.box.hide(0, o.complete);
			}
		}
	};
	
	// jQuery plugin interface
	$.fn.openClose = function(opt) {
		return this.each(function() {
			jQuery(this).data('OpenClose', new OpenClose($.extend(opt, {holder: this})));
		});
	};
}(jQuery));

/*
 * jQuery FontResize Event
 */
jQuery.onFontResize = (function($) {
	$(function() {
		var randomID = 'font-resize-frame-' + Math.floor(Math.random() * 1000);
		var resizeFrame = $('<iframe>').attr('id', randomID).addClass('font-resize-helper');

		// required styles
		resizeFrame.css({
			width: '100em',
			height: '10px',
			position: 'absolute',
			borderWidth: 0,
			top: '-9999px',
			left: '-9999px'
		}).appendTo('body');

		// use native IE resize event if possible
		if (window.attachEvent && !window.addEventListener) {
			resizeFrame.bind('resize', function () {
				$.onFontResize.trigger(resizeFrame[0].offsetWidth / 100);
			});
		}
		// use script inside the iframe to detect resize for other browsers
		else {
			var doc = resizeFrame[0].contentWindow.document;
			doc.open();
			doc.write('<scri' + 'pt>window.onload = function(){var em = parent.jQuery("#' + randomID + '")[0];window.onresize = function(){if(parent.jQuery.onFontResize){parent.jQuery.onFontResize.trigger(em.offsetWidth / 100);}}};</scri' + 'pt>');
			doc.close();
		}
		jQuery.onFontResize.initialSize = resizeFrame[0].offsetWidth / 100;
	});
	return {
		// public method, so it can be called from within the iframe
		trigger: function (em) {
			$(window).trigger("fontresize", [em]);
		}
	};
}(jQuery));


var scrollSize = (function(){
	var content, hold, sizeBefore, sizeAfter;
	function buildSizer(){
		if(hold) removeSizer();
		content = document.createElement('div');
		hold = document.createElement('div');
		hold.style.cssText = 'position:absolute;overflow:hidden;width:100px;height:100px';
		hold.appendChild(content);
		document.body.appendChild(hold);
	}
	function removeSizer(){
		document.body.removeChild(hold);
		hold = null;
	}
	function calcSize(vertical) {
		buildSizer();
		content.style.cssText = 'height:'+(vertical ? '100%' : '200px');
		sizeBefore = (vertical ? content.offsetHeight : content.offsetWidth);
		hold.style.overflow = 'scroll'; content.innerHTML = 1;
		sizeAfter = (vertical ? content.offsetHeight : content.offsetWidth);
		if(vertical && hold.clientHeight) sizeAfter = hold.clientHeight;
		removeSizer();
		return sizeBefore - sizeAfter;
	}
	return {
		getWidth:function(){
			return calcSize(false);
		},
		getHeight:function(){
			return calcSize(true)
		}
	}
}());

/*
* touchSwipe - jQuery Plugin
* https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
* http://labs.skinkers.com/touchSwipe/
* http://plugins.jquery.com/project/touchSwipe
*
* Copyright (c) 2010 Matt Bryson (www.skinkers.com)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* $version: 1.6.0
*/;(function(d){+"use strict";var n="left",m="right",c="up",u="down",b="in",v="out",k="none",q="auto",j="swipe",r="pinch",e="click",x="horizontal",s="vertical",h="all",f="start",i="move",g="end",o="cancel",a="ontouchstart" in window,w="TouchSwipe";var l={fingers:1,threshold:75,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,triggerOnTouchEnd:true,triggerOnTouchLeave:false,allowPageScroll:"auto",fallbackToMouseEvents:true,excludedElements:"button, input, select, textarea, a, .noSwipe"};d.fn.swipe=function(A){var z=d(this),y=z.data(w);if(y&&typeof A==="string"){if(y[A]){return y[A].apply(this,Array.prototype.slice.call(arguments,1))}else{d.error("Method "+A+" does not exist on jQuery.swipe")}}else{if(!y&&(typeof A==="object"||!A)){return t.apply(this,arguments)}}return z};d.fn.swipe.defaults=l;d.fn.swipe.phases={PHASE_START:f,PHASE_MOVE:i,PHASE_END:g,PHASE_CANCEL:o};d.fn.swipe.directions={LEFT:n,RIGHT:m,UP:c,DOWN:u,IN:b,OUT:v};d.fn.swipe.pageScroll={NONE:k,HORIZONTAL:x,VERTICAL:s,AUTO:q};d.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,ALL:h};function t(y){if(y&&(y.allowPageScroll===undefined&&(y.swipe!==undefined||y.swipeStatus!==undefined))){y.allowPageScroll=k}if(!y){y={}}y=d.extend({},d.fn.swipe.defaults,y);return this.each(function(){var A=d(this);var z=A.data(w);if(!z){z=new p(this,y);A.data(w,z)}})}function p(S,af){var aF=(a||!af.fallbackToMouseEvents),ax=aF?"touchstart":"mousedown",U=aF?"touchmove":"mousemove",au=aF?"touchend":"mouseup",D=aF?null:"mouseleave",R="touchcancel";var ac=0;var N=null;var ag=0;var aB=0;var A=0;var ai=1;var aH=0;var H=d(S);var O="start";var aE=0;var ah=null;var I=0;var Y=0;var aA=0;var aJ=0;try{H.bind(ax,ar);H.bind(R,M)}catch(aC){d.error("events not supported "+ax+","+R+" on jQuery.swipe")}this.enable=function(){H.bind(ax,ar);H.bind(R,M);return H};this.disable=function(){Q();return H};this.destroy=function(){Q();H.data(w,null);return H};function ar(aM){if(X()){return}if(d(aM.target).closest(af.excludedElements,H).length>0){return}var aN=aM.originalEvent;var aL,aK=a?aN.touches[0]:aN;O=f;if(a){aE=aN.touches.length}else{aM.preventDefault()}ac=0;N=null;aH=null;ag=0;aB=0;A=0;ai=1;pinchDistance=0;ah=T();z();if(!a||(aE===af.fingers||af.fingers===h)||ao()){aI(0,aK);I=B();if(aE==2){aI(1,aN.touches[1]);aB=A=Z(ah[0].start,ah[1].start)}if(af.swipeStatus||af.pinchStatus){aL=aD(aN,O)}}else{aL=false}if(aL===false){O=o;aD(aN,O);return aL}else{aj(true)}}function P(aN){var aQ=aN.originalEvent;if(O===g||O===o||ae()){return}var aM,aL=a?aQ.touches[0]:aQ;var aO=V(aL);Y=B();if(a){aE=aQ.touches.length}O=i;if(aE==2){if(aB==0){aI(1,aQ.touches[1]);aB=A=Z(ah[0].start,ah[1].start)}else{V(aQ.touches[1]);A=Z(ah[0].end,ah[1].end);aH=an(ah[0].end,ah[1].end)}ai=y(aB,A);pinchDistance=Math.abs(aB-A)}if((aE===af.fingers||af.fingers===h)||!a||ao()){N=aq(aO.start,aO.end);C(aN,N);ac=G(aO.start,aO.end);ag=L();if(af.swipeStatus||af.pinchStatus){aM=aD(aQ,O)}if(!af.triggerOnTouchEnd||af.triggerOnTouchLeave){var aK=true;if(af.triggerOnTouchLeave){var aP=at(this);aK=az(aO.end,aP)}if(!af.triggerOnTouchEnd&&aK){O=aG(i)}else{if(af.triggerOnTouchLeave&&!aK){O=aG(g)}}if(O==o||O==g){aD(aQ,O)}}}else{O=o;aD(aQ,O)}if(aM===false){O=o;aD(aQ,O)}}function aa(aM){var aO=aM.originalEvent;if(a){if(aO.touches.length>0){av();return true}}if(ae()){aE=aJ}aM.preventDefault();Y=B();if(af.triggerOnTouchEnd||(af.triggerOnTouchEnd==false&&O===i)){O=g;var aL=((aE===af.fingers||af.fingers===h)||!a);var aK=ah[0].end.x!==0;var aN=aL&&aK&&(am()||ay());if(aN){aD(aO,O)}else{O=o;aD(aO,O)}}else{if(O===i){O=o;aD(aO,O)}}aj(false)}function M(){aE=0;Y=0;I=0;aB=0;A=0;ai=1;z();aj(false)}function W(aK){var aL=aK.originalEvent;if(af.triggerOnTouchLeave){O=aG(g);aD(aL,O)}}function Q(){H.unbind(ax,ar);H.unbind(R,M);H.unbind(U,P);H.unbind(au,aa);if(D){H.unbind(D,W)}aj(false)}function aG(aN){var aM=aN;var aL=ap();var aK=ad();if(!aL){aM=o}else{if(aK&&aN==i&&(!af.triggerOnTouchEnd||af.triggerOnTouchLeave)){aM=g}else{if(!aK&&aN==g&&af.triggerOnTouchLeave){aM=o}}}return aM}function aD(aM,aK){var aL=undefined;if(ab()){aL=al(aM,aK,j)}if(ao()&&aL!==false){aL=al(aM,aK,r)}if(K()&&aL!==false){aL=al(aM,aK,e)}if(aK===o){M(aM)}if(aK===g){if(a){if(aM.touches.length==0){M(aM)}}else{M(aM)}}return aL}function al(aN,aK,aM){var aL=undefined;if(aM==j){if(af.swipeStatus){aL=af.swipeStatus.call(H,aN,aK,N||null,ac||0,ag||0,aE);if(aL===false){return false}}if(aK==g&&ay()){if(af.swipe){aL=af.swipe.call(H,aN,N,ac,ag,aE);if(aL===false){return false}}switch(N){case n:if(af.swipeLeft){aL=af.swipeLeft.call(H,aN,N,ac,ag,aE)}break;case m:if(af.swipeRight){aL=af.swipeRight.call(H,aN,N,ac,ag,aE)}break;case c:if(af.swipeUp){aL=af.swipeUp.call(H,aN,N,ac,ag,aE)}break;case u:if(af.swipeDown){aL=af.swipeDown.call(H,aN,N,ac,ag,aE)}break}}}if(aM==r){if(af.pinchStatus){aL=af.pinchStatus.call(H,aN,aK,aH||null,pinchDistance||0,ag||0,aE,ai);if(aL===false){return false}}if(aK==g&&am()){switch(aH){case b:if(af.pinchIn){aL=af.pinchIn.call(H,aN,aH||null,pinchDistance||0,ag||0,aE,ai)}break;case v:if(af.pinchOut){aL=af.pinchOut.call(H,aN,aH||null,pinchDistance||0,ag||0,aE,ai)}break}}}if(aM==e){if(aK===o){if(af.click&&(aE===1||!a)&&(isNaN(ac)||ac===0)){aL=af.click.call(H,aN,aN.target)}}}return aL}function ad(){if(af.threshold!==null){return ac>=af.threshold}return true}function ak(){if(af.pinchThreshold!==null){return pinchDistance>=af.pinchThreshold}return true}function ap(){var aK;if(af.maxTimeThreshold){if(ag>=af.maxTimeThreshold){aK=false}else{aK=true}}else{aK=true}return aK}function C(aK,aL){if(af.allowPageScroll===k||ao()){aK.preventDefault()}else{var aM=af.allowPageScroll===q;switch(aL){case n:if((af.swipeLeft&&aM)||(!aM&&af.allowPageScroll!=x)){aK.preventDefault()}break;case m:if((af.swipeRight&&aM)||(!aM&&af.allowPageScroll!=x)){aK.preventDefault()}break;case c:if((af.swipeUp&&aM)||(!aM&&af.allowPageScroll!=s)){aK.preventDefault()}break;case u:if((af.swipeDown&&aM)||(!aM&&af.allowPageScroll!=s)){aK.preventDefault()}break}}}function am(){return ak()}function ao(){return !!(af.pinchStatus||af.pinchIn||af.pinchOut)}function aw(){return !!(am()&&ao())}function ay(){var aK=ap();var aM=ad();var aL=aM&&aK;return aL}function ab(){return !!(af.swipe||af.swipeStatus||af.swipeLeft||af.swipeRight||af.swipeUp||af.swipeDown)}function E(){return !!(ay()&&ab())}function K(){return !!(af.click)}function av(){aA=B();aJ=event.touches.length+1}function z(){aA=0;aJ=0}function ae(){var aK=false;if(aA){var aL=B()-aA;if(aL<=af.fingerReleaseThreshold){aK=true}}return aK}function X(){return !!(H.data(w+"_intouch")===true)}function aj(aK){if(aK===true){H.bind(U,P);H.bind(au,aa);if(D){H.bind(D,W)}}else{H.unbind(U,P,false);H.unbind(au,aa,false);if(D){H.unbind(D,W,false)}}H.data(w+"_intouch",aK===true)}function aI(aL,aK){var aM=aK.identifier!==undefined?aK.identifier:0;ah[aL].identifier=aM;ah[aL].start.x=ah[aL].end.x=aK.pageX;ah[aL].start.y=ah[aL].end.y=aK.pageY;return ah[aL]}function V(aK){var aM=aK.identifier!==undefined?aK.identifier:0;var aL=J(aM);aL.end.x=aK.pageX;aL.end.y=aK.pageY;return aL}function J(aL){for(var aK=0;aK<ah.length;aK++){if(ah[aK].identifier==aL){return ah[aK]}}}function T(){var aK=[];for(var aL=0;aL<=5;aL++){aK.push({start:{x:0,y:0},end:{x:0,y:0},identifier:0})}return aK}function L(){return Y-I}function Z(aN,aM){var aL=Math.abs(aN.x-aM.x);var aK=Math.abs(aN.y-aM.y);return Math.round(Math.sqrt(aL*aL+aK*aK))}function y(aK,aL){var aM=(aL/aK)*1;return aM.toFixed(2)}function an(){if(ai<1){return v}else{return b}}function G(aL,aK){return Math.round(Math.sqrt(Math.pow(aK.x-aL.x,2)+Math.pow(aK.y-aL.y,2)))}function F(aN,aL){var aK=aN.x-aL.x;var aP=aL.y-aN.y;var aM=Math.atan2(aP,aK);var aO=Math.round(aM*180/Math.PI);if(aO<0){aO=360-Math.abs(aO)}return aO}function aq(aL,aK){var aM=F(aL,aK);if((aM<=45)&&(aM>=0)){return n}else{if((aM<=360)&&(aM>=315)){return n}else{if((aM>=135)&&(aM<=225)){return m}else{if((aM>45)&&(aM<135)){return u}else{return c}}}}}function B(){var aK=new Date();return aK.getTime()}function at(aK){aK=d(aK);var aM=aK.offset();var aL={left:aM.left,right:aM.left+aK.outerWidth(),top:aM.top,bottom:aM.top+aK.outerHeight()};return aL}function az(aK,aL){return(aK.x>aL.left&&aK.x<aL.right&&aK.y>aL.top&&aK.y<aL.bottom)}}})(jQuery);

/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.3.1
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

/*
 * jQuery One Page Nav Plugin
 * http://github.com/davist11/jQuery-One-Page-Nav
 *
 * Copyright (c) 2010 Trevor Davis (http://trevordavis.net)
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 0.2
 */
(function(e){e.fn.onePageNav=function(l){var g=e.extend({},e.fn.onePageNav.defaults,l),c={};c.sections={};c.bindNav=function(a,b,d,f){a.find("a").bind("click",function(m){var h=e(this),i=h.parent(),j=h.attr("href"),k=e(document);if(!i.hasClass(b)){c.adjustNav(a,i,b);k.unbind(".onePageNav");e.scrollTo(j,f,{onAfter:function(){if(d)window.location.hash=j;k.bind("scroll.onePageNav",function(){c.scrollChange(a,b)})}})}m.preventDefault()})};c.adjustNav=function(a,b,d){a.find("."+d).removeClass(d);b.addClass(d)};
c.getPositions=function(a){a.find("a").each(function(){var b=e(this).attr("href"),d=e(b).offset();d=d.top;c.sections[b.substr(1)]=Math.round(d)})};c.getSection=function(a){var b="",d=Math.round(e(window).height()/2);for(var f in c.sections)if(c.sections[f]-d<a)b=f;return b};c.scrollChange=function(a,b){c.getPositions(a);var d=e(window).scrollTop();d=c.getSection(d);d!==""&&c.adjustNav(a,a.find("a[href=#"+d+"]").parent(),b)};c.init=function(a,b){c.bindNav(a,b.currentClass,b.changeHash,b.scrollSpeed);
c.getPositions(a);e(document).bind("scroll.onePageNav",function(){c.scrollChange(a,b.currentClass)})};return this.each(function(){var a=e(this),b=e.meta?e.extend({},g,a.data()):g;c.init(a,b)})};e.fn.onePageNav.defaults={currentClass:"current",changeHash:false,scrollSpeed:750}})(jQuery);

/**
* Apple-Style Flip Counter
* Version 0.5.3 - May 7, 2011
*
* Copyright (c) 2010 Chris Nanney
* http://cnanney.com/journal/code/apple-style-counter-revisited/
*
* Licensed under MIT
* http://www.opensource.org/licenses/mit-license.php
*/
var flipCounter=function(E,c){var p={value:0,inc:1,pace:1000,auto:true,tFH:39,bFH:64,fW:53,bOffset:390};var G=window.document,h=typeof E!=="undefined"&&E!==""?E:"flip-counter",s=G.getElementById(h);var w={};for(var a in p){w[a]=(a in c)?c[a]:p[a]}var f=[],F=[],C,i,n,l,m=null,j,B,b={q:null,pace:0,inc:0};this.setValue=function(d){if(q(d)){n=w.value;l=d;w.value=d;k(n,l)}return this};this.setIncrement=function(d){w.inc=q(d)?d:p.inc;return this};this.setPace=function(d){w.pace=q(d)?d:p.pace;return this};this.setAuto=function(d){if(d&&!w.auto){w.auto=true;e()}if(!d&&w.auto){if(m){t()}w.auto=false}return this};this.step=function(){if(!w.auto){e()}return this};this.add=function(d){if(q(d)){n=w.value;w.value+=d;l=w.value;k(n,l)}return this};this.subtract=function(d){if(q(d)){n=w.value;w.value-=d;if(w.value>=0){l=w.value}else{l="0";w.value=0}k(n,l)}return this};this.incrementTo=function(y,M,x){if(m){t()}if(typeof M!="undefined"){var H=q(M)?M*1000:10000,d=typeof x!="undefined"&&q(x)?x:w.pace,L=typeof y!="undefined"&&q(y)?y-w.value:0,J,I,o,K=0;b.q=null;d=(H/L>d)?Math.round((H/L)/10)*10:d;J=Math.floor(H/d);I=Math.floor(L/J);o=D(L,J,I,d,H);if(L>0){while(o.result===false&&K<100){d+=10;J=Math.floor(H/d);I=Math.floor(L/J);o=D(L,J,I,d,H);K++}if(K==100){w.inc=b.inc;w.pace=b.pace}else{w.inc=I;w.pace=d}A(y,true,J)}}else{A(y)}};this.getValue=function(){return w.value};this.stop=function(){if(m){t()}return this};function e(){n=w.value;w.value+=w.inc;l=w.value;k(n,l);if(w.auto===true){m=setTimeout(e,w.pace)}}function A(I,d,H){var y=w.value,x=(typeof d=="undefined")?false:d,o=(typeof H=="undefined")?1:H;if(x===true){o--}if(y!=I){n=w.value,w.auto=true;if(y+w.inc<=I&&o!=0){y+=w.inc}else{y=I}w.value=y;l=w.value;k(n,l);m=setTimeout(function(){A(I,x,o)},w.pace)}else{w.auto=false}}function k(o,K){f=u(o);F=u(K);var J,H=f.length,d=F.length;if(d>H){J=d-H;while(J>0){r(d-J+1,F[d-J]);J--}}if(d<H){J=H-d;while(J>0){v(H-J);J--}}for(var I=0;I<H;I++){if(F[I]!=f[I]){g(I,f[I],F[I])}}}function g(y,L,o){var I,H=0,K,J,d=["-"+w.fW+"px -"+(L*w.tFH)+"px",(w.fW*-2)+"px -"+(L*w.tFH)+"px","0 -"+(o*w.tFH)+"px","-"+w.fW+"px -"+(L*w.bFH+w.bOffset)+"px",(w.fW*-2)+"px -"+(o*w.bFH+w.bOffset)+"px",(w.fW*-3)+"px -"+(o*w.bFH+w.bOffset)+"px","0 -"+(o*w.bFH+w.bOffset)+"px"];if(w.auto===true&&w.pace<=300){switch(y){case 0:I=w.pace/6;break;case 1:I=w.pace/5;break;case 2:I=w.pace/4;break;case 3:I=w.pace/3;break;default:I=w.pace/1.5;break}}else{I=80}I=(I>80)?80:I;function x(){if(H<7){K=H<3?"t":"b";J=G.getElementById(h+"_"+K+"_d"+y);if(J){J.style.backgroundPosition=d[H]}H++;if(H!=3){setTimeout(x,I)}else{x()}}}x()}function u(d){return d.toString().split("").reverse()}function r(o,x){var d=Number(o)-1;j=G.createElement("ul");j.className="cd";j.id=h+"_d"+d;j.innerHTML='<li class="t" id="'+h+"_t_d"+d+'"></li><li class="b" id="'+h+"_b_d"+d+'"></li>';if(d%3==0){B=G.createElement("ul");B.className="cd";B.innerHTML='<li class="s"></li>';s.insertBefore(B,s.firstChild)}s.insertBefore(j,s.firstChild);G.getElementById(h+"_t_d"+d).style.backgroundPosition="0 -"+(x*w.tFH)+"px";G.getElementById(h+"_b_d"+d).style.backgroundPosition="0 -"+(x*w.bFH+w.bOffset)+"px"}function v(x){var d=G.getElementById(h+"_d"+x);s.removeChild(d);var o=s.firstChild.firstChild;if((" "+o.className+" ").indexOf(" s ")>-1){d=o.parentNode;s.removeChild(d)}}function z(I){var d=I.toString(),x=d.length,H=1,o;for(o=0;o<x;o++){j=G.createElement("ul");j.className="cd";j.id=h+"_d"+o;j.innerHTML=j.innerHTML='<li class="t" id="'+h+"_t_d"+o+'"></li><li class="b" id="'+h+"_b_d"+o+'"></li>';s.insertBefore(j,s.firstChild);if(H!=(x)&&H%3==0){B=G.createElement("ul");B.className="cd";B.innerHTML='<li class="s"></li>';s.insertBefore(B,s.firstChild)}H++}var y=u(d);for(o=0;o<x;o++){G.getElementById(h+"_t_d"+o).style.backgroundPosition="0 -"+(y[o]*w.tFH)+"px";G.getElementById(h+"_b_d"+o).style.backgroundPosition="0 -"+(y[o]*w.bFH+w.bOffset)+"px"}if(w.auto===true){m=setTimeout(e,w.pace)}}function D(J,I,H,K,y){var o={result:true},x;o.cond1=(J/I>=1)?true:false;o.cond2=(I*H<=J)?true:false;o.cond3=(Math.abs(I*H-J)<=10)?true:false;o.cond4=(Math.abs(I*K-y)<=100)?true:false;o.cond5=(I*K<=y)?true:false;if(o.cond1&&o.cond2&&o.cond4&&o.cond5){x=Math.abs(J-(I*H))+Math.abs(I*K-y);if(b.q===null){b.q=x}if(x<=b.q){b.pace=K;b.inc=H}}for(var d=1;d<=5;d++){if(o["cond"+d]===false){o.result=false}}return o}function q(d){return !isNaN(parseFloat(d))&&isFinite(d)}function t(){clearTimeout(m);m=null}z(w.value)};