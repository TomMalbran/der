import Table   from "./Table.js";
import Group   from "./Group.js";
import Options from "./Options.js";




/**
 * The Schema
 */
export default class Schema {

    /** @type {HTMLElement} */
    #aside;
    /** @type {HTMLInputElement} */
    #input;
    /** @type {HTMLElement} */
    #clear;
    /** @type {HTMLElement} */
    #total;
    /** @type {HTMLElement} */
    #list;

    /** @type {Object.<String, Table>} */
    tables = {};
    /** @type {Object.<Number, Group>} */
    groups = {};


    /**
     * The Schema constructor
     * @param {Object} data
     */
    constructor(data) {
        this.schemaID = data.schemaID;
        this.data     = data.schema;
        this.width    = Options.INITIAL_WIDTH;
        this.oldWidth = Options.INITIAL_WIDTH;

        this.tables   = {};
        this.groups   = {};

        this.#aside   = document.querySelector("aside");
        this.#input   = document.querySelector(".schema-filter input");
        this.#clear   = document.querySelector(".schema-filter .close");
        this.#total   = document.querySelector(".schema-total");
        this.#list    = document.querySelector(".schema-list ol");

        const title = document.querySelector("header h1");
        title.innerHTML = data.name;

        this.createTables();
    }

    /**
     * Creates the Table
     * @returns {Void}
     */
    createTables() {
        for (const [ name, data ] of Object.entries(this.data)) {
            this.tables[name] = new Table(name, data);
        }
    }

    /**
     * Creates the Groups
     * @param {Object[]} data
     * @returns {Group[]}
     */
    createGroups(data) {
        const groups = [];
        for (const groupData of data) {
            const tables = this.getTables(groupData.tables);
            const group  = new Group(groupData.id, groupData.name, tables, groupData.isExpanded);
            if (!group.isEmpty) {
                this.groups[group.id] = group;
            }
            groups.push(group);
        }
        return groups;
    }

    /**
     * Creates the Table List
     * @returns {Void}
     */
    createList() {
        for (const table of Object.values(this.tables)) {
            if (table.group) {
                table.group.removeFromList();
            }
            table.removeFromList();
        }

        for (const table of Object.values(this.tables)) {
            if (table.group) {
                table.group.addToList(this.#list);
            }
            table.addToList(this.#list);
        }
    }

    /**
     * Destroys the Schema
     * @returns {Void}
     */
    destroy() {
        for (const group of Object.values(this.groups)) {
            group.destroy();
        }
        for (const table of Object.values(this.tables)) {
            table.destroy();
        }

        this.tables = {};
        this.groups = {};
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
     * Returns a Group
     * @param {HTMLElement} element
     * @returns {Group?}
     */
    getGroup(element) {
        const groupID = element.dataset.group;
        if (groupID && this.groups[groupID]) {
            return this.groups[groupID];
        }
        return null;
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
            group = new Group(data.id, data.name, tables, data.isExpanded);
        }
        if (!group.isEmpty) {
            this.groups[group.id] = group;
        }
        this.createList();
        return group;
    }

    /**
     * Removes the Group
     * @param {Group} group
     * @returns {Void}
     */
    removeGroup(group) {
        group.removeFromList();
        group.destroy();
        delete this.groups[group.id];
        this.createList();
    }



    /**
     * Filters the List
     * @returns {String}
     */
    filterList() {
        const value = String(this.#input.value).toLocaleLowerCase();
        let   count = 0;
        for (const table of Object.values(this.tables)) {
            if (value && !table.name.includes(value)) {
                table.hideInList();
            } else {
                table.showInList();
                count++;
            }
        }
        for (const group of Object.values(this.groups)) {
            group.setListVisibility();
        }

        this.#clear.style.display = value ? "block" : "none";
        this.#total.innerHTML     = `${count} table${count !== 1 ? "s" : ""}`;

        return value;
    }

    /**
     * Sets the initial Filter
     * @param {String} value
     * @returns {Void}
     */
    setInitialFilter(value) {
        if (value) {
            this.#input.value = value;
        }
        this.filterList();
    }

    /**
     * Clears the Filter
     * @returns {Void}
     */
    clearFilter() {
        this.#input.value = "";
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
        this.#aside.classList.add("aside-dragging");
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
        if (this.width < Options.MIN_WIDTH) {
            this.setWidth(Options.SHRINK_WIDTH);
        }
        window.setTimeout(() => {
            this.#aside.classList.remove("aside-dragging");
        }, 50);
        return true;
    }

    /**
     * Sets the initial Width
     * @param {Number} width
     * @returns {Void}
     */
    setInitialWidth(width) {
        const initialWidth = width || Options.INITIAL_WIDTH;
        if (this.width !== initialWidth) {
            this.setWidth(initialWidth);
        }
    }

    /**
     * Toggles the minimize of the aside
     * @returns {Void}
     */
    toggleMinimize() {
        if (this.width === Options.SHRINK_WIDTH) {
            const newWidth = this.oldWidth === Options.SHRINK_WIDTH ? Options.INITIAL_WIDTH : this.oldWidth;
            this.setWidth(newWidth);
        } else {
            this.oldWidth = this.width;
            this.setWidth(Options.SHRINK_WIDTH);
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

        this.#aside.style.width = `${width}px`;

        if (width < Options.MIN_WIDTH) {
            this.#aside.classList.add("aside-small");
        } else {
            this.#aside.classList.remove("aside-small");
        }
    }
}
