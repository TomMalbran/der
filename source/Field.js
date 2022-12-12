/**
 * The Table Field
 */
export default class Field {

    /**
     * Table Field constructor
     * @param {Number} index
     * @param {String} name
     * @param {Object} data
     */
    constructor(index, name, data) {
        this.index     = index;
        this.name      = name;
        this.type      = data.type;
        this.length    = data.length || 0;
        this.isPrimary = data.type === "id" || data.isPrimary;
        this.isKey     = data.isKey
        this.hasLink   = false;
    }

    /**
     * Returns the Element Tag depending on the Properties
     * @returns {String}
     */
    getElementTag() {
        return this.isPrimary ? "b" : (this.hasLink ? "i" : "span");
    }

    /**
     * Creates the List Element
     * @returns {Void}
     */
    createListElem() {
        this.listElem = document.createElement("li");
        const name = document.createElement(this.getElementTag());
        const type = document.createElement("span");

        name.innerHTML = this.name + (this.isKey ? "*" : "");
        type.innerHTML = this.type;

        this.listElem.appendChild(name);
        this.listElem.appendChild(type);
    }

    /**
     * Creates the Canvas Element
     * @param {Boolean} isHidden
     * @returns {Void}
     */
    createCanvasElem(isHidden) {
        this.canvasElem = document.createElement("li");
        const name = document.createElement(this.getElementTag());
        const type = document.createElement("span");

        name.innerHTML = this.name + (this.isKey ? "*" : "");
        type.innerHTML = this.type;

        this.canvasElem.appendChild(name);
        this.canvasElem.appendChild(type);

        if (isHidden) {
            this.canvasElem.className = "schema-hide";
        }
        this.isHidden = isHidden;
    }

    /**
     * Toggles the visibility of the Field
     * @param {Boolean} isHidden
     * @returns {Void}
     */
    toggleVisibility(isHidden) {
        this.isHidden = isHidden;
        this.canvasElem.classList.toggle("schema-hide", this.isHidden);
    }

    /**
     * Sets the Field Color
     * @param {Number} color
     * @returns {Void}
     */
    setColor(color) {
        if (this.color) {
            return;
        }
        this.color = color;
        this.canvasElem.classList.add("colored", `color${color}`);
    }

    /**
     * Removes the Field Color
     * @returns {Void}
     */
    removeColor() {
        this.canvasElem.classList.remove("colored", `color${this.color}`);
        this.color = 0;
    }
}
