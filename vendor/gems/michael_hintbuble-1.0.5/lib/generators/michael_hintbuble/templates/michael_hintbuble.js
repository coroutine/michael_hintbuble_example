/**
 * Michael Hintbuble creates pretty hint bubbles using prototype and 
 * scriptaculous. These functions work with ActionView helpers 
 * to provide hint bubble components using the syntax defined 
 * for rendering rails templates.
 *
 * 
 * Brought to you by the good folks at Coroutine.  Hire us!
 * http://coroutine.com
 */
var MichaelHintbuble = {}


/**
 * This property governs whether or not Michael bothers creating and
 * managing a blocking iframe to accommodate ie6.
 * 
 * Defaults to false, but override if you must.
 */
MichaelHintbuble.SUPPORT_IE6_BULLSHIT = false;   



//-----------------------------------------------------------------------------
// Bubble class
//-----------------------------------------------------------------------------

/**
 * This function lets you come fly with Michael by defining
 * the hint bubble class.
 */
MichaelHintbuble.Bubble = function(target_id, content, options) {
    this._target        = $(target_id);
    this._element       = null;
    this._positioner    = null;
    this._isShowing     = null;
    
    this._class         = options["class"]      || "";
    this._eventNames    = options["eventNames"] || ["mouseover"]
    this._position      = options["position"]   || "right";
    this._beforeShow    = options["beforeShow"] || Prototype.emptyFunction
    this._afterShow     = options["afterShow"]  || Prototype.emptyFunction
    this._beforeHide    = options["beforeHide"] || Prototype.emptyFunction
    this._afterHide     = options["afterHide"]  || Prototype.emptyFunction
    
    this._makeBubble();
    this._makePositioner();
    this._attachObservers();
    this.setContent(content);
    this.setPosition();
    
    if (MichaelHintbuble.SUPPORT_IE6_BULLSHIT) {
        this._makeFrame();
    }
};


/**
 * This hash maps the bubble id to the bubble object itself. It allows the Rails 
 * code a way to specify the js object it wishes to invoke.
 */ 
MichaelHintbuble.Bubble.instances = {};


/**
 * This method destroys the bubble with the corresponding target id.
 *
 * @param {String} id   The target id value of the bubble element (also the key 
 *                      in the instances hash.)
 */
MichaelHintbuble.Bubble.destroy = function(id) {
    var bubble = this.instances[id];
    if (bubble) {
        bubble.finalize();
    }
    this.instances[id] = null;
};


/**
 * This method hides the bubble with the corresponding target id.
 *
 * @param {String} id   The target id value of the bubble element (also the key 
 *                      in the instances hash.)
 *
 * @return {Object} an instance of MichaelHintbuble.Bubble
 *
 */
MichaelHintbuble.Bubble.hide = function(id) {
    var bubble = this.instances[id];
    if (bubble) {
        bubble.hide();
    }
    return bubble;
};


/**
 * This method returns a boolean indiciating whether or not the 
 * bubble with the corresponding target id is showing.
 *
 * @param {String} id   The target id value of the bubble element (also the key 
 *                      in the instances hash.)
 *
 * @return {Boolean}    Whether or not the bubble with the corresponding 
 *                      id is showing.
 *
 */
MichaelHintbuble.Bubble.isShowing = function(id) {
    var bubble = this.instances[id];
    if (!bubble) {
        throw "No bubble cound be found for the supplied id.";
    }
    return bubble.isShowing();
};


/**
 * This method shows the bubble with the corresponding target id.
 *
 * @param {String} id   The target id value of the bubble element (also the key 
 *                      in the instances hash.)
 *
 * @return {Object} an instance of MichaelHintbuble.Bubble
 *
 */
MichaelHintbuble.Bubble.show = function(id) {
    var bubble = this.instances[id];
    if (bubble) {
        bubble.show();
    }
    return bubble;
};


/**
 * This function establishes all of the observations specified in the options.
 */
MichaelHintbuble.Bubble.prototype._attachObservers = function() {
    if (this._eventNames.indexOf("focus") > -1) {
        this._target.observe("focus", function() {
            this.show();
        }.bind(this));
        this._target.observe("blur", function() {
            this.hide();
        }.bind(this));
    }
    if (this._eventNames.indexOf("mouseover") > -1) {
        this._target.observe("mouseover", function() {
            this.show();
        }.bind(this));
        this._target.observe("mouseout", function() {
            this.hide();
        }.bind(this));
    }
    Event.observe(window, "resize", function() {
        if (this.isShowing()) {
            this.setPosition();
        }
    }.bind(this));
    Event.observe(window, "scroll", function() {
        if (this.isShowing()) {
            this.setPosition();
        }
    }.bind(this));
};


/**
 * This function creates the bubble element and hides it by default.
 */
MichaelHintbuble.Bubble.prototype._makeBubble = function() {
    if (!this._element) {
        this._container = new Element("DIV");
        this._container.addClassName("container");
        
        this._element = new Element("DIV");
        this._element.addClassName("michael_hintbuble_bubble");
        this._element.addClassName(this._class);
        this._element.update(this._container);
        this._element.hide();
        document.body.insert(this._element);
    }
};


/**
 * This function creates the blocking frame element and hides it by default.
 */
MichaelHintbuble.Bubble.prototype._makeFrame = function() {
    if (!this._frame) {
        this._frame = new Element("IFRAME");
        this._frame.addClassName("michael_hintbuble_bubble_frame");
        this._frame.addClassName(this._class + "_frame");
        this._frame.setAttribute("src", "about:blank");
        this._frame.hide();
        document.body.insert(this._frame);
    }
};


/**
 * This function creates the bubble positioner object.
 */
MichaelHintbuble.Bubble.prototype._makePositioner = function() {
    if (!this._positioner) {
        this._positioner = new MichaelHintbuble.BubblePositioner(this._target, this._element, this._position);
    }
};


/**
 * This method updates the container element by applying an additional style
 * class representing the relative position of the bubble to the target.
 */
MichaelHintbuble.Bubble.prototype._updateContainerClass = function() {
    this._container.removeClassName();
    this._container.addClassName("container");
    this._container.addClassName(this._positioner.styleClassForPosition());
};


/**
 * This function allows the bubble object to be destroyed without
 * creating memory leaks.
 */
MichaelHintbuble.Bubble.prototype.finalize = function() {
    this._positioner.finalize();
    this._container.remove();
    this._element.remove();
    if (this._frame) {
        this._frame.remove();
    }
       
    this._target        = null;
    this._element       = null;
    this._container     = null;
    this._positioner    = null;
    this._frame         = null;
};


/**
 * This function shows the hint bubble container (and the blocking frame, if
 * required).
 */
MichaelHintbuble.Bubble.prototype.hide = function() {
    new Effect.Fade(this._element, {
        duration: 0.2,
        beforeStart:    this._beforeHide,
        afterFinish:    function() {
            this._isShowing = false;
            this._afterHide();
        }.bind(this)
    });
    
    if (this._frame) {
        new Effect.Fade(this._frame, {
            duration: 0.2
        });
    }
};


/**
 * This function returns a boolean indicating whether or not the bubble is
 * showing.
 *
 * @returns {Boolean} Whether or not the bubble is showing.
 */
MichaelHintbuble.Bubble.prototype.isShowing = function() {
    return this._isShowing;
};


/**
 * This function sets the content of the hint bubble container.
 *
 * @param {String} content  A string representation of the content to be added
 *                          to the hint bubble container.
 */
MichaelHintbuble.Bubble.prototype.setContent = function(content) {
    var content_container = new Element("DIV");
    content_container.className = "content";
    content_container.update(content);
    
    this._container.update(content_container);
};


/**
 * This method sets the position of the hint bubble.  It should be noted that the 
 * position simply states a preferred location for the bubble within the viewport.
 * If the supplied position results in the bubble overrunning the viewport,
 * the bubble will be repositioned to the opposite side to avoid viewport 
 * overrun.
 *
 * @param {String} position A string representation of the preferred position of 
 *                          the bubble element.
 */
MichaelHintbuble.Bubble.prototype.setPosition = function(position) {
    if (position) {
        this._position = position.toLowerCase();
    }
    this._positioner.setPosition(this._position);
    this._updateContainerClass();
};


/**
 * This function shows the hint bubble container (and the blocking frame, if
 * required).
 */
MichaelHintbuble.Bubble.prototype.show = function() {
    this.setPosition();
    
    if (this._frame) {
        var layout                  = new Element.Layout(this._element);
        this._frame.style.top       = this._element.style.top;
        this._frame.style.left      = this._element.style.left;
        this._frame.style.width     = layout.get("padding-box-width") + "px";
        this._frame.style.height    = layout.get("padding-box-height") + "px";
        
        new Effect.Appear(this._frame, {
            duration: 0.2
        });
    }
    
    new Effect.Appear(this._element, { 
        duration:       0.2,
        beforeStart:    this._beforeShow,
        afterFinish:    function() {
            this._isShowing = true;
            this._afterShow();
        }.bind(this)
    });
};




//-----------------------------------------------------------------------------
// BubblePositioner class
//-----------------------------------------------------------------------------

/**
 * This class encapsulates the positioning logic for bubble classes.
 *
 * @param {Element} target      the dom element to which the bubble is anchored.
 * @param {Element} element     the bubble element itself.
 */
MichaelHintbuble.BubblePositioner = function(target, element, position) {
    this._target    = target;
    this._element   = element;
    this._position  = position;
    this._axis      = null
};


/**
 * These properties establish numeric values for the x and y axes.
 */
MichaelHintbuble.BubblePositioner.X_AXIS = 1;
MichaelHintbuble.BubblePositioner.Y_AXIS = 2;


/**
 * This property maps position values to one or the other axis.
 */
MichaelHintbuble.BubblePositioner.AXIS_MAP = {
    left:   MichaelHintbuble.BubblePositioner.X_AXIS,
    right:  MichaelHintbuble.BubblePositioner.X_AXIS,
    top:    MichaelHintbuble.BubblePositioner.Y_AXIS,
    bottom: MichaelHintbuble.BubblePositioner.Y_AXIS
};


/**
 * This property maps position values to their opposite value.
 */
MichaelHintbuble.BubblePositioner.COMPLEMENTS = {
    left:   "right",
    right:  "left",
    top:    "bottom",
    bottom: "top"
};


/**
 * This hash is a convenience that allows us to write slightly denser code when 
 * calculating the bubble's position.
 */
MichaelHintbuble.BubblePositioner.POSITION_FN_MAP = {
    left:   "getWidth",
    top:    "getHeight"
};



/**
 * This function positions the element below the target.
 */
MichaelHintbuble.BubblePositioner.prototype._bottom = function() {
    var to = this._targetAdjustedOffset();
    var tl = new Element.Layout(this._target);
    
    this._element.style.top = (to.top + tl.get("border-box-height")) + "px";
};


/**
 * This function centers the positioning of the element for whichever
 * axis it is on.
 */
MichaelHintbuble.BubblePositioner.prototype._center = function() {
    var to = this._targetAdjustedOffset();
    var tl = new Element.Layout(this._target);
    var el = new Element.Layout(this._element);
    
    if (this._axis === MichaelHintbuble.BubblePositioner.X_AXIS) {
        this._element.style.top = (to.top + Math.ceil(tl.get("border-box-height")/2) - Math.ceil(el.get("padding-box-height")/2)) + "px";
    }
    else if (this._axis === MichaelHintbuble.BubblePositioner.Y_AXIS) {
        this._element.style.left = (to.left + Math.ceil(tl.get("border-box-width")/2) - Math.ceil(el.get("padding-box-width")/2)) + "px";
    }
};


/**
 * This function returns a boolean indicating whether or not the element is
 * contained within the viewport.
 *
 * @returns {Boolean} whether or not the element is contained within the viewport.
 */
MichaelHintbuble.BubblePositioner.prototype._isElementWithinViewport = function() {
    var isWithinViewport    = true;
    var fnMap               = MichaelHintbuble.BubblePositioner.POSITION_FN_MAP;
    var method              = null;
    var viewPortMinEdge     = null;
    var viewPortMaxEdge     = null;
    var elementMinEdge      = null;
    var elementMaxEdge      = null;
    
    for (var prop in fnMap) {
        method              = fnMap[prop];
        viewportMinEdge     = document.viewport.getScrollOffsets()[prop];
        viewportMaxEdge     = viewportMinEdge + document.viewport[method]();
        elementMinEdge      = parseInt(this._element.style[prop] || 0);
        elementMaxEdge      = elementMinEdge + this._element[method]();
        
        if ((elementMaxEdge > viewportMaxEdge) || (elementMinEdge < viewportMinEdge)) {
            isWithinViewport = false;
            break;
        }
    }
    
    return isWithinViewport;
};


/**
 * This function positions the element to the left of the target.
 */
MichaelHintbuble.BubblePositioner.prototype._left = function() {
    var to = this._targetAdjustedOffset();
    var el = new Element.Layout(this._element);
    
    this._element.style.left = (to.left - el.get("padding-box-width")) + "px";
};


/**
 * This function positions the element to the right of the target.
 */
MichaelHintbuble.BubblePositioner.prototype._right = function() {
    var to = this._targetAdjustedOffset();
    var tl = new Element.Layout(this._target);
    
    this._element.style.left = (to.left + tl.get("border-box-width")) + "px";
};


/**
 * This function positions the element relative to the target according to the
 * position value supplied. Because this function is private, it assumes a 
 * safe position value.
 *
 * @param {String} position  the desired relative position of the element to the 
 *                           target.
 */
MichaelHintbuble.BubblePositioner.prototype._setPosition = function(position) {
    this._axis     = MichaelHintbuble.BubblePositioner.AXIS_MAP[position];
    this._position = position;
    this["_" + position]();
    this._center();
};


/**
 * This function returns a hash with the adjusted offset positions for the target
 * element.
 */
MichaelHintbuble.BubblePositioner.prototype._targetAdjustedOffset = function() {
    var bs = $$("body").first().cumulativeScrollOffset();
    var to = this._target.cumulativeOffset();
    var ts = this._target.cumulativeScrollOffset();
    
    return {
        "top": to.top - ts.top + bs.top,
        "left": to.left - ts.left + bs.left
    }
};


/**
 * This function positions the element above the target.
 */
MichaelHintbuble.BubblePositioner.prototype._top = function() {
    var to = this._targetAdjustedOffset();
    var el = new Element.Layout(this._element);
    
    this._element.style.top = (to.top - el.get("padding-box-height")) + "px";
};


/**
 * This function allows the bubble positioner object to be destroyed without
 * creating memory leaks.
 */
MichaelHintbuble.BubblePositioner.prototype.finalize = function() {
    this._target    = null;
    this._element   = null;
    this._axis      = null;
    this._position  = null;
};
 
 
/**
 * This function positions the element relative to the target according to the
 * position value supplied.  Invalid position values are ignored.  If the new
 * position runs off the viewport, the complement is tried.  If that fails too,
 * it gives up and does what was asked.
 *
 * @param {String} position  the desired relative position of the element to the 
 *                           target.
 */
MichaelHintbuble.BubblePositioner.prototype.setPosition = function(position) {
    var axis = MichaelHintbuble.BubblePositioner.AXIS_MAP[position];
    if (axis) {
        this._setPosition(position);
        if (!this._isElementWithinViewport()) {
            this._setPosition(MichaelHintbuble.BubblePositioner.COMPLEMENTS[position]);
            if (!this._isElementWithinViewport()) {
                this._setPosition(position);
            }
        }
    }
};


/**
 * This function returns a string representation of the current logical positioning that
 * can be used as a stylesheet class for physical positioning.
 *
 * @returns {String} a styleclass name appropriate for the current position.
 */
MichaelHintbuble.BubblePositioner.prototype.styleClassForPosition = function() {
    return this._position.toLowerCase();
};