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


/**
 * This property governs which Javascript framework
 * to use with this plugin.
 * 
 * Defaults to JQuery, but also supports Prototype
 */
MichaelHintbuble.JS_FRAMEWORK = 'jQuery';



//-----------------------------------------------------------------------------
// Bubble class
//-----------------------------------------------------------------------------

/**
 * This function lets you come fly with Michael by defining
 * the hint bubble class.
 */
MichaelHintbuble.Bubble = function(target_id, content, options) {
    this._target        = document.getElementById(target_id);
    this._element       = null;
    this._positioner    = null;
    this._isShowing     = null;
    
    this._class         = options["class"]      || "";
    this._eventNames    = options["eventNames"] || ["mouseover"]
    this._position      = options["position"]   || "right";
    this._beforeShow    = options["beforeShow"] || function() {}
    this._afterShow     = options["afterShow"]  || function() {}
    this._beforeHide    = options["beforeHide"] || function() {}
    this._afterHide     = options["afterHide"]  || function() {}
    
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
	MichaelHintbuble.Adapter._attachObservers(this);
};


/**
 * This function creates the bubble element and hides it by default.
 */
MichaelHintbuble.Bubble.prototype._makeBubble = function() {
    if (!this._element) {
        this._container			   = document.createElement("DIV");
        this._container.className  = "container";
        
        this._element			   = document.createElement("DIV");
		this._element.className    = (this._class) ? "michael_hintbuble_bubble " + this._class : "michael_hintbuble_bubble";
        this._element.appendChild(this._container);

        this._element.style.display = "none";
        document.body.appendChild(this._element);
    }

};


/**
 * This function creates the blocking frame element and hides it by default.
 */
MichaelHintbuble.Bubble.prototype._makeFrame = function() {
    if (!this._frame) {
        this._frame 			    = document.createElement("IFRAME");
		this._frame.className       = (this._class) ? this._class + "_frame michael_hintbuble_bubble_frame" : "michael_hintbuble_bubble_frame";
		this._frame.src             = "about:blank";
        this._frame.style.display   = "none";
        document.body.appendChild(this._frame);
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
	this._container.className = "container " + this._positioner.styleClassForPosition();
	
};


/**
 * This function allows the bubble object to be destroyed without
 * creating memory leaks.
 */
MichaelHintbuble.Bubble.prototype.finalize = function() {
    this._positioner.finalize();
    document.body.removeChild(this._container);
	document.body.removeChild(this._element);
    if (this._frame) {
        document.body.removeChild(this._frame);
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
	MichaelHintbuble.Adapter.hide(this);
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
	var content_container	     = document.createElement("DIV");
    content_container.className  = "content";

	content_container.innerHTML  = content;
	this._container.appendChild(content_container);
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
    MichaelHintbuble.Adapter.show(this);
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
	MichaelHintbuble.Adapter._bottom(this);
};


/**
 * This function centers the positioning of the element for whichever
 * axis it is on.
 */
MichaelHintbuble.BubblePositioner.prototype._center = function() {
    MichaelHintbuble.Adapter._center(this);
};


/**
 * This function returns a boolean indicating whether or not the element is
 * contained within the viewport.
 *
 * @returns {Boolean} whether or not the element is contained within the viewport.
 */
MichaelHintbuble.BubblePositioner.prototype._isElementWithinViewport = function() {
	return MichaelHintbuble.Adapter._isElementWithinViewport(this);
};


/**
 * This function positions the element to the left of the target.
 */
MichaelHintbuble.BubblePositioner.prototype._left = function() {
    MichaelHintbuble.Adapter._left(this);
};


/**
 * This function positions the element to the right of the target.
 */
MichaelHintbuble.BubblePositioner.prototype._right = function() {
   MichaelHintbuble.Adapter._right(this);
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
	return MichaelHintbuble.Adapter._targetAdjustedOffset(this);
};


/**
 * This function positions the element above the target.
 */
MichaelHintbuble.BubblePositioner.prototype._top = function() {
    MichaelHintbuble.Adapter._top(this);
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



// ----------------------------------------------------------------------------
// JQuery Adapter 
// ----------------------------------------------------------------------------

MichaelHintbuble.JQueryAdapter = function() {};

// for the Bubble class

MichaelHintbuble.JQueryAdapter.prototype._attachObservers = function(bubble) {
	
	var target = $(bubble._target);
	
	if (jQuery.inArray("focus", bubble._eventNames) > -1) {
		target.focus(function() {
			bubble.show();
		});
		target.blur(function() {
			bubble.hide();
		});
    }
    if (jQuery.inArray("mouseover", bubble._eventNames) > -1) {
		target.mouseover(function() {
			bubble.show();
		});
		target.mouseout(function() {
			bubble.hide();
		});
    }
	$(window).resize(function() {
		if (bubble.isShowing()) {
            bubble.setPosition();
        }
	});
	$(window).scroll(function() {
		if (bubble.isShowing()) {
            bubble.setPosition();
        }
	});	
}

MichaelHintbuble.JQueryAdapter.prototype.hide = function(bubble) {
	bubble._beforeHide;
	$(bubble._element).fadeOut(200);
	bubble._isShowing = false;
	    bubble._afterHide();
	
	
	
	if (bubble._frame) {  									     	
		$(bubble._frame).fadeOut(200)  ;                     	
	}

};

MichaelHintbuble.JQueryAdapter.prototype.show = function(bubble) {
	bubble.setPosition();
    
	var frame = $(bubble._frame);
	var element = $(bubble._element);

    if (bubble._frame) {
        frame.css('top',     element.css('top'));
        frame.css('left',    element.css('left'));
        frame.css('width',   element.innerWidth() + "px");
        frame.css('height',  element.innerHeight() + "px");
        
		frame.fadeIn(200);
    }


	
	bubble._beforeShow;
	element.fadeIn(200,function() { 				  	 
		bubble._isShowing = true;                  			
	    bubble._afterShow;   	                                 
	});

};

// for the BubblePositioner class

MichaelHintbuble.JQueryAdapter.prototype._bottom = function(bubble) {
	var to = bubble._targetAdjustedOffset();

	$(bubble._element).css('top', (to.top + $(bubble._target).outerHeight() + "px" ));
}

MichaelHintbuble.JQueryAdapter.prototype._top = function(bubble) {
	var to = bubble._targetAdjustedOffset();

	$(bubble._element).css('top', (to.top - $(bubble._element).innerHeight() + "px" ));
}

MichaelHintbuble.JQueryAdapter.prototype._left = function(bubble) {
	var to = bubble._targetAdjustedOffset();

	$(bubble._element).css('left', (to.left - $(bubble._element).innerWidth() + "px" ));
}

MichaelHintbuble.JQueryAdapter.prototype._right = function(bubble) {
	var to = bubble._targetAdjustedOffset();

	$(bubble._element).css('left', (to.left + $(bubble._target).outerWidth() + "px" ));
}

MichaelHintbuble.JQueryAdapter.prototype._center = function(bubble) {
	var to = bubble._targetAdjustedOffset();
    
    if (bubble._axis === MichaelHintbuble.BubblePositioner.X_AXIS) {
		$(bubble._element).css('top', (to.top + Math.ceil(($(bubble._target).outerHeight())/2) - Math.ceil(($(bubble._element).innerHeight())/2)) + "px" );
    }
    else if (bubble._axis === MichaelHintbuble.BubblePositioner.Y_AXIS) {
		$(bubble._element).css('left', (to.left + Math.ceil(($(bubble._target).outerWidth())/2) - Math.ceil(($(bubble._element).innerWidth())/2)) + "px" );
    }
}

MichaelHintbuble.JQueryAdapter.prototype._targetAdjustedOffset = function(bubble) {
    return  $(bubble._target).offset();
}

MichaelHintbuble.JQueryAdapter.prototype._isElementWithinViewport = function(bubble) {
	var isWithinViewport    = true;
	var fnMap               = MichaelHintbuble.BubblePositioner.POSITION_FN_MAP;
	var method              = null;
	var viewPortMinEdge     = null;
	var viewPortMaxEdge     = null;
	var elementMinEdge      = null;
	var elementMaxEdge      = null;

	var scrollOffsets = {"top": $(window).scrollTop(), "left": $(window).scrollLeft() };
	var jqueryMethodMap = { left: "width", top: "height" };

	
	for (var prop in fnMap) {
	    method              = jqueryMethodMap[prop];
	    viewportMinEdge     = scrollOffsets[prop];
	    viewportMaxEdge     = viewportMinEdge + $(window)[method]();
	    elementMinEdge      = parseInt($(bubble._element).css(prop) || 0);
	    elementMaxEdge      = elementMinEdge + $(bubble._element)[method]();
	    
	    if ((elementMaxEdge > viewportMaxEdge) || (elementMinEdge < viewportMinEdge)) {
	        isWithinViewport = false;
		
	        break;
	    }

	}


	return isWithinViewport;
}


// ----------------------------------------------------------------------------
// Prototype Adapter 
// ----------------------------------------------------------------------------

MichaelHintbuble.PrototypeAdapter = function() {};

// for the Bubble class

MichaelHintbuble.PrototypeAdapter.prototype._attachObservers = function(bubble) {
	if (bubble._eventNames.indexOf("focus") > -1) {
        bubble._target.observe("focus", function() {
            bubble.show();
        }.bind(bubble));
        bubble._target.observe("blur", function() {
            bubble.hide();
        }.bind(bubble));
    }
    if (bubble._eventNames.indexOf("mouseover") > -1) {
        bubble._target.observe("mouseover", function() {
            bubble.show();
        }.bind(bubble));
        bubble._target.observe("mouseout", function() {
            bubble.hide();
        }.bind(bubble));
    }
    Event.observe(window, "resize", function() {
        if (bubble.isShowing()) {
            bubble.setPosition();
        }
    }.bind(bubble));
    Event.observe(window, "scroll", function() {
        if (bubble.isShowing()) {
            bubble.setPosition();
        }
    }.bind(bubble));
	
}

MichaelHintbuble.PrototypeAdapter.prototype.hide = function(bubble) {
	new Effect.Fade(bubble._element, {
        duration: 0.2,
        beforeStart:    bubble._beforeHide,
        afterFinish:    function() {
            bubble._isShowing = false;
            bubble._afterHide();
        }.bind(bubble)
    });
    
    if (bubble._frame) {
        new Effect.Fade(bubble._frame, {
            duration: 0.2
        });
    }
};

MichaelHintbuble.PrototypeAdapter.prototype.show = function(bubble) {
	bubble.setPosition();
    
    if (bubble._frame) {
        var layout                    = new Element.Layout(bubble._element);
        bubble._frame.style.top       = bubble._element.style.top;
        bubble._frame.style.left      = bubble._element.style.left;
        bubble._frame.style.width     = layout.get("padding-box-width") + "px";
        bubble._frame.style.height    = layout.get("padding-box-height") + "px";
        
        new Effect.Appear(bubble._frame, {
            duration: 0.2
        });
    }
    
    new Effect.Appear(bubble._element, { 
        duration:       0.2,
        beforeStart:    bubble._beforeShow,
        afterFinish:    function() {
            bubble._isShowing = true;
            bubble._afterShow();
        }.bind(bubble)
    });
};

// for the BubblePositioner class

MichaelHintbuble.PrototypeAdapter.prototype._bottom = function(bubble) {
	var to = bubble._targetAdjustedOffset();
	var tl = new Element.Layout(bubble._target);

	bubble._element.style.top = (to.top + tl.get("border-box-height")) + "px";
}

MichaelHintbuble.PrototypeAdapter.prototype._top = function(bubble) {
	var to = bubble._targetAdjustedOffset();
    var el = new Element.Layout(bubble._element);
    
    bubble._element.style.top = (to.top - el.get("padding-box-height")) + "px";

}

MichaelHintbuble.PrototypeAdapter.prototype._left = function(bubble) {
	var to = bubble._targetAdjustedOffset();
    var el = new Element.Layout(bubble._element);
    
    bubble._element.style.left = (to.left - el.get("padding-box-width")) + "px";
}

MichaelHintbuble.PrototypeAdapter.prototype._right = function(bubble) {
	var to = bubble._targetAdjustedOffset();
    var tl = new Element.Layout(bubble._target);

    bubble._element.style.left = (to.left + tl.get("border-box-width")) + "px";
}

MichaelHintbuble.PrototypeAdapter.prototype._center = function(bubble) {
	var to = bubble._targetAdjustedOffset();
    var tl = new Element.Layout(bubble._target);
    var el = new Element.Layout(bubble._element);
    
    if (bubble._axis === MichaelHintbuble.BubblePositioner.X_AXIS) {
        bubble._element.style.top = (to.top + Math.ceil(tl.get("border-box-height")/2) - Math.ceil(el.get("padding-box-height")/2)) + "px";
    }
    else if (bubble._axis === MichaelHintbuble.BubblePositioner.Y_AXIS) {
        bubble._element.style.left = (to.left + Math.ceil(tl.get("border-box-width")/2) - Math.ceil(el.get("padding-box-width")/2)) + "px";
    }
}

MichaelHintbuble.PrototypeAdapter.prototype._targetAdjustedOffset = function(bubble) {
	var bs = $$("body").first().cumulativeScrollOffset();
    var to = bubble._target.cumulativeOffset();
    var ts = bubble._target.cumulativeScrollOffset();
    
    return {
        "top": to.top - ts.top + bs.top,
        "left": to.left - ts.left + bs.left
    }
}

MichaelHintbuble.PrototypeAdapter.prototype._isElementWithinViewport = function(bubble) {
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
        elementMinEdge      = parseInt(bubble._element.style[prop] || 0);
        elementMaxEdge      = elementMinEdge + bubble._element[method]();
        
        if ((elementMaxEdge > viewportMaxEdge) || (elementMinEdge < viewportMinEdge)) {
            isWithinViewport = false;
            break;
        }
    }
    
    return isWithinViewport;
}
	


// ----------------------------------------------------------------------------
// Set adapter
// ----------------------------------------------------------------------------

if (MichaelHintbuble.JS_FRAMEWORK.toLowerCase() == 'prototype') {
	MichaelHintbuble.Adapter = new MichaelHintbuble.PrototypeAdapter();
} else {
	MichaelHintbuble.Adapter = new MichaelHintbuble.JQueryAdapter();
}



