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




// The public API
export default {
    getTarget,
}
