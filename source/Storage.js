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
     * Saves the Schema
     * @param {String} name
     * @param {Object} schema
     * @returns {Void}
     */
    saveSchema(name, schema) {
        localStorage.setItem(`${this.nextID}-name`,   name);
        localStorage.setItem(`${this.nextID}-schema`, JSON.stringify(schema));

        this.currentID = this.nextID;
        this.nextID   += 1;

        localStorage.setItem("currentID", String(this.currentID));
        localStorage.setItem("nextID",    String(this.nextID));
    }
}
