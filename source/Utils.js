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
 * @param {HTMLElement} element
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
    getTarget,
    removeElement,
}
