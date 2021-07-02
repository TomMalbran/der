import Table from "./Table.js";
import Utils from "./Utils.js";



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
}
