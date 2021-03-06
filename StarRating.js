define([
    "dcl/dcl",
	"dojo/_base/lang",
	"dojo/string",
	"dojo/has",
	"dojo/on",
	"dojo/touch",
	"dojo/keys",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"./register",
	"./Widget",
	"./Invalidating",
	"dojo/has!dojo-bidi?dui/bidi/StarRating",
	"dojo/i18n!./nls/StarRating",
	"./themes/load!./themes/{{theme}}/StarRating",
	"dojo/has!dojo-bidi?./themes/load!./themes/{{theme}}/StarRating_rtl"
], function (dcl, lang, string, has, on, touch, keys, domConstruct, domClass, domGeometry,
			register, Widget, Invalidating, BidiStarRating, messages) {

	// module:
	//		dui/StarRating
	var StarRating = dcl([Widget, Invalidating], {
		// summary:
		//		A widget that displays a rating, usually with stars, and that allows setting a different rating value
		//		by touching the stars.
		// description:
		//		This widget shows the rating using an image sprite that contains full stars, half stars and
		//		empty stars.
		//		The star displayed can be fully customized by redefining the following css classes in
		//		your application:
		//		- duiStarRatingStarIcon: defines the size of each star icon, and the css sprite to use as
		//		the background image stars;
		//		- duiStarRatingFullStar: defines the background-position of the css sprite to display
		//		a full star icon;
		//		- duiStarRatingHalfStar: defines the background-position of the css sprite to display
		//		a half star icon (ltr);
		//		- duiStarRatingHalfStarRtl: defines the background-position of the css sprite to display
		//		a half star icon (rtl);
		//		- duiStarRatingEmptyStar: defines the background-position of the css sprite to display
		//		an empty star icon.
		//		Note that if your using a different baseClass than the default one "duiStarRating",
		//		you should replace 'duiStarRating' in the previous css class names with your
		//		baseClass value (for example, with a baseClass of 'myClass', the css classes to use
		//		will be myClassStarIcon, myClassFullStar, myClassHalfStar, myClassHalfStarRtl, myClassEmptyStar).
		//
		//		The widget can be used in read-only or in editable mode. In editable mode, the widget allows
		//		to set the rating to 0 stars or not using the zeroAreaWidth property. In this mode, it also allows
		//		to set half values or not using the editHalfValues property.
		//
		//		This widget supports right to left direction.


		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "duiStarRating",

		// max: Number
		//		The maximum rating, that is also the number of stars to show.
		max: 5,

		// value: Number
		//		The current value of the Rating.
		value: 0,

		// readOnly: Boolean
		//		If false, the widget is editable and allows editing the value of the Rating by touching / clicking the stars
		readOnly: false,

		// name: String
		//		mandatory if using the star rating widget in a form, in order to have it value submited
		name: "",

		// disabled: Boolean
		//		if true, the widget is disabled (its value will not be submited if it is included in a form)
		disabled: false,

		// editHalfValues: Boolean
		//		If the Rating is not read only, define if the user allowed to edit half values (0.5, 1.5, ...)
		editHalfValues: false,

		// zeroAreaWidth: Number
		//		The number of pixel to add to the left of the widget (or right if the direction is rtl) to allow
		//		setting the value to 0 when readOnly is set to falsy. Default value is 0 if the widget is read only,
		//		20 if the widget is not read only.
		//		Set this value to 0 to forbid the user from setting the value to zero during edition.
		//		Setting this attribute to a negative value is not supported.
		zeroAreaWidth: -1,

		_getZeroAreaWidthAttr: function () {
			var val = this._get("zeroAreaWidth");
			return val === -1 ? (this.readOnly ? 0 : 20) : val;
		},

		/* internal properties */

		_enterValue: null,
		_hovering: false,
		_hoveredValue: null,
		_startHandlers: null,
		_otherEventsHandlers: [],
		_keyDownHandler: null,
		_incrementKeyCodes: [keys.RIGHT_ARROW, keys.UP_ARROW, keys.NUMPAD_PLUS], // keys to press to increment value
		_decrementKeyCodes: [keys.LEFT_ARROW, keys.DOWN_ARROW, keys.NUMPAD_MINUS], // keys to press to decrement value

		preCreate: function () {
			this.addInvalidatingProperties("max",
					"name",
					"value",
					"readOnly",
					"disabled",
					"editHalfValues",
					"zeroAreaWidth");
		},

		buildRendering: function () {
			this.style.display = "inline-block";

			// init WAI-ARIA attributes
			this.setAttribute("role", "slider");
			this.setAttribute("aria-label", messages["aria-label"]);
			this.setAttribute("aria-valuemin", 0);
            // init tabIndex if not explicitly set
            if (!this.hasAttribute("tabindex")) {
                this.setAttribute("tabindex", "0");
            }

			this.refreshRendering(this);
		},

		refreshRendering: function (props) {
			console.log(props);
			var passive;
			if (props.disabled !== undefined) {
				if (this.disabled) {
					domClass.add(this, this.baseClass + "Disabled");
				} else {
					domClass.remove(this, this.baseClass + "Disabled");
				}
			}
			if (props.max !== undefined) {
				this.setAttribute("aria-valuemax", this.max);
			}
			if (props.max !== undefined || props.value !== undefined) {
				var createChildren = this.children.length - 1 !== this.max;
				if (createChildren) {
					domConstruct.empty(this);
				}
				this._updateStars(this.value, createChildren);
			}
			if (props.value !== undefined) {
				this.setAttribute("aria-valuenow", this.value);
				this.setAttribute("aria-valuetext", string.substitute(messages["aria-valuetext"], this));
				this.valueNode.value = this.value;
			}
			if (props.name !== undefined) {
				this.valueNode.name = this.name;
			}
			if (props.readOnly !== undefined || props.disabled !== undefined) {
				passive = this.disabled ? true : this.readOnly;
				this.setAttribute("aria-disabled", passive);
				if (!passive && !this._keyDownHandler) {
					this._keyDownHandler = this.on("keydown", lang.hitch(this, "_onKeyDown"));
				} else if (passive && this._keyDownHandler) {
					this._keyDownHandler.remove();
					this._keyDownHandler = null;
				}
				if (!passive && !this._startHandlers) {
					this._startHandlers = [this.on(touch.enter, lang.hitch(this, "_onTouchEnter")),
										   this.on(touch.press, lang.hitch(this, "_wireHandlers"))];
				} else if (passive && this._startHandlers) {
					while (this._startHandlers.length) {
						this._startHandlers.pop().remove();
					}
					this._startHandlers = null;
				}
			}
			if (props.readOnly !== undefined || props.disabled !== undefined || props.zeroAreaWidth !== undefined) {
				this._updateZeroArea();
			}
		},

		_removeEventsHandlers: function () {
			while (this._otherEventsHandlers.length) {
				this._otherEventsHandlers.pop().remove();
			}
		},

		_wireHandlers: function (/*Event*/ event) {
			event.preventDefault();
			if (!this._otherEventsHandlers.length) {
				// handle move on the stars strip
				this._otherEventsHandlers.push(this.on(touch.move, lang.hitch(this, "_onTouchMove")));
				// handle the end of the value editing
				this._otherEventsHandlers.push(this.on(touch.release, lang.hitch(this, "_onTouchRelease")));
				this._otherEventsHandlers.push(this.on(touch.leave, lang.hitch(this, "_onTouchLeave")));
				this._otherEventsHandlers.push(this.on(touch.cancel, lang.hitch(this, "_onTouchLeave")));
			}
		},

		_onTouchEnter: function (/*Event*/ event) {
			this._wireHandlers(event);
			if (event.type !== "dojotouchover") { // Note: this will be replaced by a test on event.pointerType when we'll implement the pointer event spec in dojo.
				this._hovering = true;
				domClass.add(this, this.baseClass + "Hovered");
			}
			this._enterValue = this.value;
		},

		_onTouchMove: function (/*Event*/ event) {
			var newValue = this._coordToValue(event);
			if (this._hovering) {
				if (newValue !== this._hoveredValue) {
					domClass.add(this, this.baseClass + "Hovered");
					this._updateStars(newValue, false);
					this._hoveredValue = newValue;
				}
			} else {
				this.value = newValue;
			}
		},

		_onTouchRelease: function (/*Event*/ event) {
			this.value = this._coordToValue(event);
			this._enterValue = this.value;
			if (!this._hovering) {
				this._removeEventsHandlers();
			} else {
				domClass.remove(this, this.baseClass + "Hovered");
			}
		},

		_onTouchLeave: function (/*Event*/ event) { // jshint ignore
			if (this._hovering) {
				this._hovering = false;
				this._hoveredValue = null;
				domClass.remove(this, this.baseClass + "Hovered");
				this.value = this._enterValue;
			}
			this._removeEventsHandlers();
		},

		_onKeyDown: function (/*Event*/ event) {
			if (this._incrementKeyCodes.indexOf(event.keyCode) !== -1) {
				event.preventDefault();
				this._incrementValue();
			} else if (this._decrementKeyCodes.indexOf(event.keyCode) !== -1) {
				event.preventDefault();
				this._decrementValue();
			}
		},

		_incrementValue: function () {
			if (this.value < this.max) {
				this.value = this.value + (this.editHalfValues ? 0.5 : 1);
			}
		},

		_decrementValue: function () {
			if (this.value > (this.zeroAreaWidth ? 0 : (this.editHalfValues ? 0.5 : 1))) {
				this.value = this.value - (this.editHalfValues ? 0.5 : 1);
			}
		},

		_coordToValue: function (/*Event*/event) {
			var box = domGeometry.position(this, false);
			var xValue = event.clientX - box.x;
			var rawValue = null, discreteValue;
			// fix off values observed on leave event
			if (xValue < 0) {
				xValue = 0;
			} else if (xValue > box.w) {
				xValue = box.w;
			}
			if (this._inZeroSettingArea(xValue, box.w)) {
				return 0;
			} else {
				rawValue = this._xToRawValue(xValue, box.w);
			}
			if (rawValue != null) {
				if (rawValue === 0) {
					rawValue = 0.1; // do not allow setting the value to 0 when clicking on a star
				}
				discreteValue = Math.ceil(rawValue);
				if (this.editHalfValues && (discreteValue - rawValue) > 0.5) {
					discreteValue -= 0.5;
				}
				return discreteValue;
			}
		},

		_inZeroSettingArea: function (/*Number*/x, /*Number*/domNodeWidth) { // jshint ignore
			return x < this.zeroAreaWidth;
		},

		_xToRawValue: function (/*Number*/x, /*Number*/domNodeWidth) {
			var starStripLength = domNodeWidth - this.zeroAreaWidth;
			return (x - this.zeroAreaWidth) / (starStripLength / this.max);
		},

		_updateStars: function (/*Number*/value, /*Boolean*/create) {
			var i, parent, starClass;
			for (i = 0; i < this.max; i++) {
				if (i <= value - 1) {
					starClass = this.baseClass + "FullStar";
				} else if (i >= value) {
					starClass = this.baseClass + "EmptyStar";
				} else {
					starClass = this.baseClass + "HalfStar";
				}
				if (create) {
					parent = domConstruct.create("div", {
						style: {"float": "left"}
					}, this);
				} else {
					parent = this.children[i];
				}
				parent.className = this.baseClass +  "StarIcon " + starClass;
			}
			if (create) {
	            this.valueNode = domConstruct.create("input", {type: "number", name: this.name, readOnly: this.readOnly, disabled: this.disabled, value: this.value}, this, "last");
			}
		},

		_updateZeroArea: function () {
			if (this.readOnly) {
				this.style.paddingLeft = "0px";
			} else {
				this.style.paddingLeft = this.zeroAreaWidth + "px";
			}
		}
	});

	return register("d-star-rating",
			has("dojo-bidi") ? [HTMLElement, StarRating, BidiStarRating] : [HTMLElement, StarRating]);
});
