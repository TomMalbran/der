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
     * Returns a stored String for the current Schema
     * @param {String}  name
     * @param {String=} defValue
     * @returns {String}
     */
    getString(name, defValue = "") {
        return localStorage.getItem(`${this.currentID}-${name}`) || defValue;
    }

    /**
     * Saves a String to the current Schema
     * @param {String} name
     * @param {String} value
     * @returns {Void}
     */
    setString(name, value) {
        localStorage.setItem(`${this.currentID}-${name}`, value);
    }

    /**
     * Returns a stored Number for the current Schema
     * @param {String}  name
     * @param {Number=} defValue
     * @returns {Number}
     */
    getNumber(name, defValue = 0) {
        return Number(localStorage.getItem(`${this.currentID}-${name}`)) || defValue;
    }

    /**
     * Saves a Number to the current Schema
     * @param {String} name
     * @param {Number} value
     * @returns {Void}
     */
    setNumber(name, value) {
        localStorage.setItem(`${this.currentID}-${name}`, String(value));
    }

    /**
     * Returns a stored Object for the current Schema
     * @param {String} name
     * @returns {?Object}
     */
    getData(name) {
        const data = localStorage.getItem(`${this.currentID}-${name}`);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Saves an Object to the current Schema
     * @param {String} name
     * @param {Object} value
     * @returns {Void}
     */
    setData(name, value) {
        localStorage.setItem(`${this.currentID}-${name}`, JSON.stringify(value));
    }

    /**
     * Removes an Item from the current Schema
     * @param {String} name
     * @returns {Void}
     */
    removeItem(name) {
        localStorage.removeItem(`${this.currentID}-${name}`);
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
        return this.getData("schema");
    }

    /**
     * Returns the current Schema
     * @param {Number} schemaID
     * @returns {Object}
     */
    getSchema(schemaID) {
        const schema = localStorage.getItem(`${schemaID}-schema`);
        return schema ? JSON.parse(schema) : null;
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
        localStorage.removeItem(`${schemaID}-scroll`);
        localStorage.removeItem(`${schemaID}-zoom`);

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
        return this.getString("filter");
    }

    /**
     * Saves the current filter
     * @param {String} value
     * @returns {Void}
     */
    setFilter(value) {
        this.setString("filter", value);
    }

    /**
     * Removes the current filter
     * @returns {Void}
     */
    removeFilter() {
        this.removeItem("filter");
    }



    /**
     * Returns the stored width, or empty
     * @returns {Number}
     */
    getWidth() {
        return this.getNumber("width");
    }

    /**
     * Saves the current width
     * @param {Number} value
     * @returns {Void}
     */
    setWidth(value) {
        this.setNumber("width", value);
    }

    /**
     * Removes the current width
     * @returns {Void}
     */
    removeWidth() {
        this.removeItem("width");
    }



    /**
     * Returns the stored scroll, or empty
     * @returns {Object}
     */
    getScroll() {
        return this.getData("scroll");
    }

    /**
     * Saves the current scroll
     * @param {Object} value
     * @returns {Void}
     */
    setScroll(value) {
        this.setData("scroll", value);
    }



    /**
     * Returns the stored zoom, or empty
     * @returns {Number}
     */
    getZoom() {
        return this.getNumber("zoom", 100);
    }

    /**
     * Saves the current zoom
     * @param {Number} value
     * @returns {Void}
     */
    setZoom(value) {
        this.setNumber("zoom", value);
    }

    /**
     * Removes the current zoom
     * @returns {Void}
     */
    removeZoom() {
        this.removeItem("zoom");
    }



    /**
     * Returns the stored Table data, or null
     * @param {Table} table
     * @returns {(Object|null)}
     */
    getTable(table) {
        return this.getData(`table-${table.name}`);
    }

    /**
     * Adds/Edits a Table to the Storage
     * @param {Table} table
     * @returns {Void}
     */
    setTable(table) {
        this.setData(`table-${table.name}`, {
            isExpanded : table.isExpanded,
            onCanvas   : table.onCanvas,
            top        : table.top,
            left       : table.left,
            showAll    : table.showAll,
        });
    }

    /**
     * Removes a Table from the Storage
     * @param {Table} table
     * @returns {Void}
     */
    removeTable(table) {
        this.removeItem(`table-${table.name}`);
    }
}
