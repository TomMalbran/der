import Table from "./Table.js";



/**
 * The Storage
 */
export default class Storage {

    /**
     * Storage constructor
     */
    constructor() {
        this.currentID = Number(localStorage.getItem("currentID")) || 0;
        this.nextID    = Number(localStorage.getItem("nextID"))    || 1;
    }

    /**
     * Returns true if there is at least one Schema
     * @returns {Boolean}
     */
    get hasSchema() {
        return this.currentID > 0 && !!localStorage.getItem(`${this.currentID}-name`);
    }

    /**
     * Returns a list of Schemas
     * @returns {Object[]}
     */
    getSchemas() {
        const result = [];
        for (let id = 1; id < this.nextID; id++) {
            const name = localStorage.getItem(`${id}-name`);
            if (name) {
                result.push({ id, name, isSelected : id === this.currentID });
            }
        }
        return result;
    }

    /**
     * Returns the current Schema
     * @returns {Object}
     */
    getCurrentSchema() {
        const schema = localStorage.getItem(`${this.currentID}-schema`);
        return JSON.parse(schema);
    }

    /**
     * Returns the current Schema
     * @param {Number} schemaID
     * @returns {Object}
     */
    getSchema(schemaID) {
        const schema = localStorage.getItem(`${schemaID}-schema`);
        if (schema) {
            return JSON.parse(schema);
        }
        return null;
    }



    /**
     * Selects a Schema
     * @param {Number} schemaID
     * @returns {Void}
     */
    selectSchema(schemaID) {
        this.currentID = schemaID;
        localStorage.setItem("currentID", String(this.currentID));
    }

    /**
     * Saves the Schema
     * @param {String} name
     * @param {Object} schema
     * @returns {Void}
     */
    setSchema(name, schema) {
        localStorage.setItem(`${this.nextID}-name`,   name);
        localStorage.setItem(`${this.nextID}-schema`, JSON.stringify(schema));

        this.nextID += 1;
        localStorage.setItem("nextID", String(this.nextID));
    }

    /**
     * Removes a Schema
     * @param {Number} schemaID
     * @returns {Void}
     */
    removeSchema(schemaID) {
        const schema = this.getSchema(schemaID);
        if (!schema) {
            return;
        }

        localStorage.removeItem(`${schemaID}-name`);
        localStorage.removeItem(`${schemaID}-schema`);
        localStorage.removeItem(`${schemaID}-filter`);
        for (const elem of Object.values(schema)) {
            if (elem.table) {
                localStorage.removeItem(`${schemaID}-table-${elem.table}`);
            }
        }
        if (this.currentID === schemaID) {
            localStorage.setItem("currentID", "0");
        }
    }



    /**
     * Returns the stored filter, or empty
     * @returns {String}
     */
    getFilter() {
        return localStorage.getItem(`${this.currentID}-filter`) || "";
    }

    /**
     * Saves the current filter
     * @param {String} value
     * @returns {Void}
     */
    setFilter(value) {
        localStorage.setItem(`${this.currentID}-filter`, value);
    }

    /**
     * Removes the current filter
     * @returns {Void}
     */
    removeFilter() {
        localStorage.removeItem(`${this.currentID}-filter`);
    }



    /**
     * Returns the stored zoom, or empty
     * @returns {Number}
     */
    getZoom() {
        return Number(localStorage.getItem(`${this.currentID}-zoom`)) || 100;
    }

    /**
     * Saves the current zoom
     * @param {Number} value
     * @returns {Void}
     */
    setZoom(value) {
        localStorage.setItem(`${this.currentID}-zoom`, String(value));
    }

    /**
     * Removes the current zoom
     * @returns {Void}
     */
    removeZoom() {
        localStorage.removeItem(`${this.currentID}-zoom`);
    }



    /**
     * Returns the stored Table data, or null
     * @param {Table} table
     * @returns {(Object|null)}
     */
    getTable(table) {
        const data = localStorage.getItem(this.getTableID(table));
        return data ? JSON.parse(data) : null;
    }

    /**
     * Adds/Edits a Table to the Storage
     * @param {Table} table
     * @returns {Void}
     */
    setTable(table) {
        const data = {
            top     : table.top,
            left    : table.left,
            showAll : table.showAll,
        };
        localStorage.setItem(this.getTableID(table), JSON.stringify(data));
    }

    /**
     * Removes a Table from the Storage
     * @param {Table} table
     * @returns {Void}
     */
    removeTable(table) {
        localStorage.removeItem(this.getTableID(table));
    }

    /**
     * Returns the id used for the Table
     * @param {Table} table
     * @returns {String}
     */
    getTableID(table) {
        return `${this.currentID}-table-${table.name}`;
    }
}
