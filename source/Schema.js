import Table from "./Table.js";
import Utils from "./Utils.js";



/**
 * The Schema
 */
export default class Schema {

    /**
     * The Schema constructor
     * @param {Object} data
     */
    constructor(data) {
        this.data   = data;
        this.tables = {};
        this.list   = document.querySelector(".schema-list ol");

        for (const elem of Object.values(data)) {
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
}
