import Table from "./Table.js";



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
            const table = new Table(elem);
            this.tables[elem.table] = table;
            this.list.appendChild(table.listElem);
        }
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
