/**
 * Clones an Object
 * @param {Object} object
 * @returns {Object}
 */
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Extends the first array replacing values from the second array
 * @param {Object} object1
 * @param {Object} object2
 * @return {Object}
 */
function extend(object1, object2) {
    const result = clone(object1);
    for (const [ key, value ] of Object.entries(object2)) {
        if (Object.keys(value).length && result[key] && Object.keys(result[key]).length) {
            result[key] = extend(value, result[key]);
        } else {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Returns an element from the Target with an action
 * @param {MouseEvent} event
 * @returns {HTMLElement}
 */
function getTarget(event) {
    /** @type {HTMLElement} */
    // @ts-ignore
    let element = event.target;
    while (element.parentElement && !element.dataset.action) {
        element = element.parentElement;
    }
    return element;
}

/**
 * Removes the Element from the DOM
 * @param {(HTMLElement|SVGSVGElement)} element
 * @returns {Void}
 */
function removeElement(element) {
    const parent = element.parentNode;
    if (parent) {
        parent.removeChild(element);
    }
}

/**
 * Returns true if the given Position is in the Bounds
 * @param {{top: Number, left: Number}} pos
 * @param {Object}                      bounds
 * @param {Number=}                     scrollTop
 * @param {Number=}                     scrollLeft
 * @returns {Boolean}
 */
function inBounds(pos, bounds, scrollTop = 0, scrollLeft = 0) {
    const top  = pos.top  - scrollTop;
    const left = pos.left - scrollLeft;
    return (
        top  > bounds.top  && top  < bounds.bottom &&
        left > bounds.left && left < bounds.right
    );
}

/**
 * Returns true if the given Position is in the Element
 * @param {{top: Number, left: Number}} pos
 * @param {HTMLElement}                 element
 * @param {Number=}                     scrollTop
 * @param {Number=}                     scrollLeft
 * @returns {Boolean}
 */
function inElement(pos, element, scrollTop = 0, scrollLeft = 0) {
    const bounds = element.getBoundingClientRect();
    return inBounds(pos, bounds, scrollTop, scrollLeft);
}

/**
 * Returns the Mouse Position
 * @param {MouseEvent} event
 * @param {Boolean=}   withScroll
 * @returns {{top: Number, left: Number}}
 */
function getMousePos(event, withScroll = true) {
    let top  = 0;
    let left = 0;
    if (event.pageX) {
        top  = event.pageY;
        left = event.pageX;
    } else if (event.clientX) {
        top  = event.clientY;
        left = event.clientX;
        if (withScroll) {
            top  += document.documentElement.scrollTop  || document.body.scrollTop;
            left += document.documentElement.scrollLeft || document.body.scrollLeft;
        }
    }
    return { top, left };
}

/**
 * Unselects the elements
 * @returns {Void}
 */
function unselect() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    // @ts-ignore
    } else if (document.selection) {
        // @ts-ignore
        document.selection.empty();
    }
}




// The public API
export default {
    clone,
    extend,

    getTarget,
    removeElement,
    inBounds,
    inElement,
    getMousePos,
    unselect,
};
