import Table from "./Table.js";
import Group from "./Group.js";
import Utils from "./Utils.js";

// Constantes
const INITIAL_WIDTH = 300;
const MIN_WIDTH     = 200;
const SHRINK_WIDTH  = 60;



/**
 * The Schema
 */
export default class Schema {

    /**
     * The Schema constructor
     * @param {Object} data
     */
    constructor(data) {
        this.schemaID = data.schemaID;
        this.data     = data.schema;
        this.width    = INITIAL_WIDTH;
        this.oldWidth = INITIAL_WIDTH;

        /** @type {Object.<String, Table>} */
        this.tables   = {};

        /** @type {Object.<Number, Group>} */
        this.groups   = {};

        /** @type {HTMLElement} */
        this.aside    = document.querySelector("aside");
        /** @type {HTMLElement} */
        this.main     = document.querySelector("main");

        /** @type {HTMLElement} */
        this.header   = document.querySelector(".schema-header");
        /** @type {HTMLElement} */
        this.filter   = document.querySelector(".schema-filter");
        /** @type {HTMLInputElement} */
        this.input    = document.querySelector(".schema-filter input");
        /** @type {HTMLElement} */
        this.clear    = document.querySelector(".schema-filter .close");
        /** @type {HTMLElement} */
        this.total    = document.querySelector(".schema-total");
        /** @type {HTMLElement} */
        this.list     = document.querySelector(".schema-list ol");

        this.header.innerHTML     = data.name;
        this.header.style.display = "block";

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
     * Returns a Table
     * @param {HTMLElement} element
     * @returns {Table?}
     */
    getTable(element) {
        const table = element.dataset.table;
        if (table && this.tables[table]) {
            return this.tables[table];
        }
        return null;
    }

    /**
     * Returns all the Tables with the given names
     * @param {String[]} tableNames
     * @returns {Object[]}
     */
    getTables(tableNames) {
        const result = [];
        for (const name of tableNames) {
            if (this.tables[name]) {
                result.push(this.tables[name]);
            }
        }
        return result;
    }

    /**
     * Sets a Group
     * @param {Object} data
     * @returns {Group}
     */
    setGroup(data) {
        let group;
        const tables = this.getTables(data.tables);
        if (data.isEdit) {
            group = this.groups[data.id];
            group.update(data.name, tables);
        } else {
            group = new Group(data.id, data.name, tables);
        }
        if (!group.isEmpty) {
            this.groups[group.id] = group;
        }
        return group;
    }

    /**
     * Removes the Group
     * @param {Group} group
     * @returns {Void}
     */
    removeGroup(group) {
        group.destroy();
        delete this.groups[group.id];
    }



    /**
     * Filters the List
     * @returns {String}
     */
    filterList() {
        const value = String(this.input.value).toLocaleLowerCase();
        let   count = 0;
        for (const table of Object.values(this.tables)) {
            if (value && !table.name.includes(value)) {
                table.hideInList();
            } else {
                table.showInList();
                count++;
            }
        }

        this.clear.style.display = value ? "block" : "none";
        this.total.innerHTML     = `${count} table${count !== 1 ? "s" : ""}`;

        return value;
    }

    /**
     * Sets the initial Filter
     * @param {String} value
     * @returns {Void}
     */
    setInitialFilter(value) {
        this.filter.style.display = "flex";
        if (value) {
            this.input.value = value;
        }
        this.filterList();
    }

    /**
     * Clears the Filter
     * @returns {Void}
     */
    clearFilter() {
        this.input.value = "";
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
        this.aside.classList.add("aside-dragging");
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
        window.setTimeout(() => {
            this.aside.classList.remove("aside-dragging");
        }, 50);
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
