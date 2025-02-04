import Table from "./Table.js";
import Group from "./Group.js";
import Utils from "./Utils.js";



/**
 * The Storage
 */
export default class Storage {

    #currentID = 0;
    #nextID    = 1;
    #schemas   = [];


    /**
     * Storage constructor
     */
    constructor() {
        this.#currentID = this.getNumber("currentID", 0);
        this.#nextID    = this.getNumber("nextID", 1);
        this.#schemas   = this.getData("schemas") || [];
    }

    /**
     * Returns true if there is an item
     * @param {...(String|Number)} keys
     * @returns {Boolean}
     */
    hasItem(...keys) {
        return !!localStorage.getItem(keys.join("-"));
    }

    /**
     * Returns a stored String for the current Schema
     * @param {...(String|Number)} keys
     * @returns {String}
     */
    getString(...keys) {
        return localStorage.getItem(keys.join("-")) || "";
    }

    /**
     * Saves a String to the current Schema
     * @param {...*} items
     * @returns {Void}
     */
    setString(...items) {
        const value = items.pop();
        localStorage.setItem(items.join("-"), value);
    }

    /**
     * Returns a stored Number for the current Schema
     * @param {...*} items
     * @returns {Number}
     */
    getNumber(...items) {
        const defValue = items.pop();
        return Number(localStorage.getItem(items.join("-"))) || defValue;
    }

    /**
     * Saves a Number to the current Schema
     * @param {...*} items
     * @returns {Void}
     */
    setNumber(...items) {
        const value = items.pop();
        localStorage.setItem(items.join("-"), String(value));
    }

    /**
     * Returns a stored Object for the current Schema
     * @param {...(String|Number)} keys
     * @returns {?Object}
     */
    getData(...keys) {
        const data = localStorage.getItem(keys.join("-"));
        return data ? JSON.parse(data) : null;
    }

    /**
     * Saves an Object to the current Schema
     * @param {...*} items
     * @returns {Void}
     */
    setData(...items) {
        const value = items.pop();
        localStorage.setItem(items.join("-"), JSON.stringify(value));
    }

    /**
     * Removes an Item from the current Schema
     * @param {...(String|Number)} keys
     * @returns {Void}
     */
    removeItem(...keys) {
        localStorage.removeItem(keys.join("-"));
    }



    /**
     * Returns true if there a Schema selected
     * @returns {Boolean}
     */
    get hasSchema() {
        return this.#currentID > 0 && this.hasItem(this.#currentID, "data");
    }

    /**
     * Returns a list of Schemas
     * @returns {Object[]}
     */
    getSchemas() {
        const result = [];
        if (!this.#schemas.length) {
            return result;
        }

        for (const [ index, schemaID ] of this.#schemas.entries()) {
            const data = this.getData(schemaID, "data");
            result.push({
                schemaID,
                name       : data.name,
                position   : index + 1,
                isSelected : schemaID === this.#currentID,
            });
        }
        return result;
    }

    /**
     * Returns the Schema Data
     * @param {Number} schemaID
     * @returns {Object}
     */
    getSchemaData(schemaID) {
        const position = this.#schemas.findIndex((id) => id === schemaID) + 1;
        if (position <= 0) {
            return {};
        }
        const data = this.getData(schemaID, "data");
        data.position = position;
        return data;
    }

    /**
     * Returns the Schema
     * @param {Number=}  schemaID
     * @param {Boolean=} fetchNew
     * @returns {Promise}
     */
    async getSchema(schemaID = this.#currentID, fetchNew = true) {
        const position = this.#schemas.findIndex((id) => id === schemaID) + 1;
        if (position <= 0) {
            return {};
        }

        const data   = this.getSchemaData(schemaID);
        const result = { schemaID, position, name : data.name };

        if (fetchNew) {
            result.schema = await this.fetchSchemas(data);
            this.setData(data.schemaID, "data", data);
        } else {
            result.schema = this.mergeSchemas(data);
        }
        return result;
    }



    /**
     * Selects a Schema
     * @param {Number} schemaID
     * @returns {Void}
     */
    selectSchema(schemaID) {
        this.#currentID = schemaID;
        this.setNumber("currentID", this.#currentID);
    }

    /**
     * Saves the Schema
     * @param {Object} data
     * @returns {Promise}
     */
    async setSchema(data) {
        const isEdit = Boolean(data.schemaID);

        // Update the next ID if this is a new Schema
        if (!isEdit) {
            data.schemaID = this.#nextID;
            this.#nextID += 1;
            this.setNumber("nextID", this.#nextID);
        }

        if (data.schemas && isEdit) {
            // Fetch the Schemas
            const newSchema = await this.fetchSchemas(data);
            const oldSchema = this.getSchema(data.schemaID, false);

            // Remove the deleted Tables
            for (const oldKey of Object.keys(oldSchema)) {
                let found = false;
                for (const newKey of Object.keys(newSchema)) {
                    if (newKey === oldKey) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.removeItem(data.schemaID, "table", oldKey);
                }
            }
        } else if (!data.schemas) {
            const schemaData = this.getSchemaData(data.schemaID);
            data.schemas = schemaData;
        }

        // Save the Schema data
        this.setData(data.schemaID, "data", data);

        // Save the Schema ID in the correct order
        const index = Math.min(Math.max(data.position - 1, 0), this.#schemas.length);
        if (isEdit) {
            this.#schemas = this.#schemas.filter((id) => id !== data.schemaID);
        }
        this.#schemas.splice(index, 0, data.schemaID);
        this.setData("schemas", this.#schemas);
    }

    /**
     * Fetches and Merges the Schemas
     * @const {Object} data
     * @returns {Promise}
     */
    async fetchSchemas(data) {
        if (!data.useUrls) {
            return this.mergeSchemas(data);
        }

        await fetch(data.url0).then((response) => response.json()).then((response) => {
            data.schemas[0] = response;
        });
        if (data.url1) {
            await fetch(data.url1).then((response) => response.json()).then((response) => {
                data.schemas[1] = response;
            });
        }
        return this.mergeSchemas(data);
    }

    /**
     * Merges the Schemas
     * @const {Object} data
     * @returns {Object}
     */
    mergeSchemas(data) {
        const appSchemas = Utils.clone(data.schemas[0]);
        if (data.schemas.length === 1) {
            return appSchemas;
        }

        const frameSchemas = data.schemas[1];
        for (const [ key, table ] of Object.entries(frameSchemas)) {
            if (appSchemas[key]) {
                appSchemas[key] = Utils.extend(table, appSchemas[key]);
            } else {
                appSchemas[key] = Utils.clone(table);
            }
        }
        return appSchemas;
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

        // Remove the Data
        this.removeItem(schemaID, "data");
        this.removeItem(schemaID, "filter");
        this.removeItem(schemaID, "scroll");
        this.removeItem(schemaID, "zoom");

        // Remove the Tables
        for (const elem of Object.values(schema)) {
            if (elem.table) {
                this.removeItem(schemaID, "table", elem.table);
            }
        }

        // Remove the Groups
        const groupIDs = this.getData(schemaID, "groups");
        if (groupIDs) {
            for (const groupID of groupIDs) {
                this.removeItem(schemaID, "group", groupID);
            }
            this.removeItem(schemaID, "groups");
        }

        // Save the order
        this.#schemas = this.#schemas.filter((id) => id !== schemaID);
        this.setData("schemas", this.#schemas);

        // Remove as the current Project
        if (this.#currentID === schemaID) {
            this.setNumber("currentID", 0);
        }
    }



    /**
     * Returns the stored filter, or empty
     * @returns {String}
     */
    getFilter() {
        return this.getString(this.#currentID, "filter");
    }

    /**
     * Saves the current filter
     * @param {String} value
     * @returns {Void}
     */
    setFilter(value) {
        this.setString(this.#currentID, "filter", value);
    }

    /**
     * Removes the current filter
     * @returns {Void}
     */
    removeFilter() {
        this.removeItem(this.#currentID, "filter");
    }



    /**
     * Returns the stored width, or empty
     * @returns {Number}
     */
    getWidth() {
        return this.getNumber(this.#currentID, "width", 0);
    }

    /**
     * Saves the current width
     * @param {Number} value
     * @returns {Void}
     */
    setWidth(value) {
        this.setNumber(this.#currentID, "width", value);
    }

    /**
     * Removes the current width
     * @returns {Void}
     */
    removeWidth() {
        this.removeItem(this.#currentID, "width");
    }



    /**
     * Returns the stored scroll, or empty
     * @returns {Object}
     */
    getScroll() {
        return this.getData(this.#currentID, "scroll");
    }

    /**
     * Saves the current scroll
     * @param {Object} value
     * @returns {Void}
     */
    setScroll(value) {
        if (value && this.#currentID) {
            this.setData(this.#currentID, "scroll", value);
        }
    }



    /**
     * Returns the Mode
     * @returns {String}
     */
    getMode() {
        return this.getString("mode") || "light";
    }

    /**
     * Sets the Dark Mode
     * @returns {Void}
     */
    setDarkMode() {
        this.setString("mode", "dark");
    }

    /**
     * Sets the Light Mode
     * @returns {Void}
     */
    setLightMode() {
        this.setString("mode", "light");
    }



    /**
     * Returns the stored zoom, or empty
     * @returns {Number}
     */
    getZoom() {
        return this.getNumber(this.#currentID, "zoom", 100);
    }

    /**
     * Saves the current zoom
     * @param {Number} value
     * @returns {Void}
     */
    setZoom(value) {
        this.setNumber(this.#currentID, "zoom", value);
    }

    /**
     * Removes the current zoom
     * @returns {Void}
     */
    removeZoom() {
        this.removeItem(this.#currentID, "zoom");
    }



    /**
     * Returns the stored Table data, or null
     * @param {Table} table
     * @returns {(Object|null)}
     */
    getTable(table) {
        return this.getData(this.#currentID, "table", table.name);
    }

    /**
     * Adds/Edits a Table to the Storage
     * @param {Table} table
     * @returns {Void}
     */
    setTable(table) {
        this.setData(this.#currentID, "table", table.name, {
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
        this.removeItem(this.#currentID, "table", table.name);
    }



    /**
     * Returns the next Group ID
     * @returns {Number}
     */
    get nextGroup() {
        return this.getNumber(this.#currentID, "nextGroup", 1);
    }

    /**
     * Returns the Group IDs
     * @returns {Number[]}
     */
    get groupIDs() {
        const groups = this.getData(this.#currentID, "groups");
        return groups || [];
    }

    /**
     * Returns the stored Groups data
     * @returns {Object[]}
     */
    getGroups() {
        const result = [];
        for (const groupID of this.groupIDs) {
            const group = this.getData(this.#currentID, "group", groupID);
            result.push(group);
        }
        return result;
    }

    /**
     * Stores a Group to the Storage
     * @param {Group} group
     * @returns {Void}
     */
    setGroup(group) {
        this.setData(this.#currentID, "group", group.id, {
            id         : group.id,
            name       : group.name,
            tables     : group.tableNames,
            isExpanded : group.isExpanded,
        });
    }

    /**
     * Adds a Group to the Storage
     * @param {Group} group
     * @returns {Void}
     */
    addGroup(group) {
        const groups = this.groupIDs;
        groups.push(group.id);
        this.setData(this.#currentID, "groups", groups);
        this.setNumber(this.#currentID, "nextGroup", group.id + 1);
    }

    /**
     * Removes a Group from the Storage
     * @param {Number} groupID
     * @returns {Void}
     */
    removeGroup(groupID) {
        const groups = this.groupIDs;
        groups.splice(groups.indexOf(groupID), 1);
        this.setData(this.#currentID, "groups", groups);
        this.removeItem(this.#currentID, "group", groupID);
    }

    /**
     * Removes a Group from the Storage
     * @param {Group[]} groups
     * @returns {Void}
     */
    updateGroups(groups) {
        for (const group of groups) {
            if (group.isEmpty) {
                this.removeGroup(group.id);
            } else {
                this.setGroup(group);
            }
        }
    }
}
