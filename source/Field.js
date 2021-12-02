
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
        this.isIndex   = data.isIndex
    }

    /**
     * Creates a Table Field Elem
     * @returns {Void}
     */
    createListElem() {
        this.listElem = document.createElement("li");
        const name = document.createElement(this.isPrimary ? "b" : "span");
        const type = document.createElement("span");

        name.innerHTML = this.name;
        type.innerHTML = this.type;

        this.listElem.appendChild(name);
        this.listElem.appendChild(type);
    }

    /**
     * Creates a Table Field Elem
     * @param {Boolean} isHidden
     * @returns {Void}
     */
    createTableElem(isHidden) {
        this.tableElem = document.createElement("li");
        const name = document.createElement(this.isPrimary ? "b" : "span");
        const type = document.createElement("span");

        name.innerHTML = this.name;
        type.innerHTML = this.type;

        this.tableElem.appendChild(name);
        this.tableElem.appendChild(type);

        if (isHidden) {
            this.tableElem.className = "schema-hide";
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
        this.tableElem.classList.toggle("schema-hide", this.isHidden);
    }

    /**
     * Sets the Field Color
     * @param {Number} color
     * @returns {Void}
     */
    setColor(color) {
        this.color = color;
        this.tableElem.classList.add("colored", `color${color}`);
    }

    /**
     * Removes the Field Color
     * @returns {Void}
     */
    removeColor() {
        this.tableElem.classList.remove("colored", `color${this.color}`);
        this.color = 0;
    }
}
