import Table from "./Table.js";
import Utils from "./Utils.js";

// Constantes
const INITIAL_WIDTH = 240;
const MIN_WIDTH     = 170;
const SHRINK_WIDTH  = 60;



/**
 * The Schema
 */
export default class Schema {

    /**
     * The Schema constructor
     * @param {Number} schemaID
     * @param {Object} data
     */
    constructor(schemaID, data) {
        this.schemaID = schemaID;
        this.data     = data;
        this.tables   = {};

        this.width    = INITIAL_WIDTH;
        this.oldWidth = INITIAL_WIDTH;

        /** @type {HTMLElement} */
        this.aside    = document.querySelector("aside");
        /** @type {HTMLElement} */
        this.main     = document.querySelector("main");

        /** @type {HTMLElement} */
        this.list     = document.querySelector(".schema-list ol");
        /** @type {HTMLInputElement} */
        this.filter   = document.querySelector(".schema-filter input");
        /** @type {HTMLElement} */
        this.clear    = document.querySelector(".schema-filter .close");

        this.createList();
    }

    /**
     * Creates the Table List
     * @returns {Void}
     */
    createList() {
        for (const elem of Object.values(this.data)) {
            if (elem.table) {
                const table = new Table(elem);
                this.tables[elem.table] = table;
                this.list.appendChild(table.listElem);
            }
        }
    }

    /**
     * Destroys the Schema
     * @returns {Void}
     */
    destroy() {
        for (const table of Object.values(this.tables)) {
            if (table.listElem) {
                Utils.removeElement(table.listElem);
            }
        }
        this.tables = {};
        this.data   = null;
    }



    /**
     * Picks a Table
     * @param {HTMLElement} element
     * @returns {Table}
     */
    getTable(element) {
        const table = element.dataset.table;
        if (table && this.tables[table]) {
            return this.tables[table];
        }
        return null;
    }



    /**
     * Filters the List
     * @returns {String}
     */
    filterList() {
        const value = String(this.filter.value).toLocaleLowerCase();
        for (const table of Object.values(this.tables)) {
            if (value && !table.name.includes(value)) {
                table.hideInList();
            } else {
                table.showInList();
            }
        }
        this.clear.style.display = value ? "block" : "none";
        return value;
    }

    /**
     * Sets the initial Filter
     * @param {String} value
     * @returns {Void}
     */
    setInitialFilter(value) {
        if (value) {
            this.clear.style.display = "block";
            this.filter.value        = value;
            this.filterList();
        } else {
            this.clear.style.display = "none";
            this.filter.value        = "";
        }
    }

    /**
     * Clears the Filter
     * @returns {Void}
     */
    clearFilter() {
        this.clear.style.display = "none";
        this.filter.value        = "";
        this.filterList();
    }



    /**
     * Picks the Resizer
     * @param {MouseEvent} event
     * @returns {Void}
     */
    pickResizer(event) {
        this.isResizing = true;
        this.startLeft  = event.pageX;
        this.startWidth = this.width;
    }

    /**
     * Drags the Resizer
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragResizer(event) {
        if (!this.isResizing) {
            return false;
        }
        this.setWidth(this.startWidth + (event.pageX - this.startLeft));
        return true;
    }

    /**
     * Drops the Resizer
     * @returns {Boolean}
     */
    dropResizer() {
        if (!this.isResizing) {
            return false;
        }
        this.isResizing = false;
        if (this.width < MIN_WIDTH) {
            this.setWidth(SHRINK_WIDTH);
        }
        return true;
    }

    /**
     * Sets the initial Width
     * @param {Number} width
     * @returns {Void}
     */
    setInitialWidth(width) {
        const initialWidth = width || INITIAL_WIDTH;
        if (this.width !== initialWidth) {
            this.setWidth(initialWidth);
        }
    }

    /**
     * Toggles the minimize of the aside
     * @returns {Void}
     */
    toggleMinimize() {
        if (this.width === SHRINK_WIDTH) {
            const newWidth = this.oldWidth === SHRINK_WIDTH ? INITIAL_WIDTH : this.oldWidth;
            this.setWidth(newWidth);
        } else {
            this.oldWidth = this.width;
            this.setWidth(SHRINK_WIDTH);
        }
    }

    /**
     * Sets the Aside width
     * @param {Number} width
     * @returns {Void}
     */
    setWidth(width) {
        this.width    = width;
        this.oldWidth = width;

        this.aside.style.width = `${width}px`;
        this.main.style.left   = `${width}px`;

        if (width < MIN_WIDTH) {
            this.aside.classList.add("aside-small");
        } else {
            this.aside.classList.remove("aside-small");
        }
    }
}
