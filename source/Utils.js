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




// The public API
export default {
    clone,
    extend,
    getTarget,
    removeElement,
}
