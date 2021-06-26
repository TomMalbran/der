import Table from "./Table.js";
import Link  from "./Link.js";
import Utils from "./Utils.js";



/**
 * The Canvas
 */
export default class Canvas {

    /**
     * Canvas constructor
     */
    constructor() {
        this.tables      = {};
        this.tableCount  = 0;
        this.links       = [];

        this.container   = document.querySelector("main");
        this.canvas      = document.querySelector(".canvas");

        this.bounds      = this.container.getBoundingClientRect();
        const canvBounds = this.canvas.getBoundingClientRect();
        const top        = (canvBounds.height - this.bounds.height) / 2;
        const left       = (canvBounds.width  - this.bounds.width)  / 2;

        this.container.scrollTo(left, top);
    }

    /**
     * Returns the Table scroll
     * @return {{top: Number, left: Number}}
     */
    get scroll() {
        return {
            top  : this.container.scrollTop,
            left : this.container.scrollLeft,
        };
    }



    /**
     * Adds a Table to the Canvas
     * @param {Table} table
     * @returns {Void}
     */
    addTable(table) {
        table.addToCanvas();
        this.canvas.appendChild(table.tableElem);
        table.setBounds();
        table.translate({
            top  : this.container.scrollTop  + 10,
            left : this.container.scrollLeft + 10,
        });
        this.tables[table.name] = table;
        this.tableCount += 1;

        // Adds links to/from the given Table
        if (table.joins) {
            for (const [ thisKey, thisField ] of Object.entries(table.joins)) {
                if (!thisField.onTable && this.tables[thisField.table]) {
                    this.createLink(table, thisKey, thisField);
                }
            }
        }
        for (const [ tableName, otherTable ] of Object.entries(this.tables)) {
            if (tableName !== table.name && otherTable.joins) {
                for (const [ otherKey, otherField ] of Object.entries(otherTable.joins)) {
                    if (!otherField.onTable && otherField.table === table.name) {
                        this.createLink(otherTable, otherKey, otherField);
                    }
                }
            }
        }

        if (table.foreigns) {
            for (const [ thisKey, thisField ] of Object.entries(table.foreigns)) {
                if (this.tables[thisField.table]) {
                    this.createLink(table, thisKey, thisField);
                }
            }
        }
        for (const [ tableName, otherTable ] of Object.entries(this.tables)) {
            if (tableName !== table.name && otherTable.foreigns) {
                for (const [ otherKey, otherField ] of Object.entries(otherTable.foreigns)) {
                    if (otherField.table === table.name) {
                        this.createLink(otherTable, otherKey, otherField);
                    }
                }
            }
        }
    }

    /**
     * Creates a Link
     * @param {Table}  table
     * @param {String} key
     * @param {Object} field
     * @returns {Void}
     */
    createLink(table, key, field) {
        const otherTable = this.tables[field.table];
        const thisKey    = field.rightKey || key;
        const otherKey   = field.leftKey  || key;
        const link       = new Link(table, thisKey, otherTable, otherKey);

        this.links.push(link);
        this.canvas.appendChild(link.element);
    }

    /**
     * Re-connects the Links
     * @returns {Void}
     */
    connect() {
        for (const link of this.links) {
            link.connect();
        }
    }



    /**
     * Removes a Table from the Canvas
     * @param {Table} table
     * @returns {Void}
     */
    removeTable(table) {
        table.removeFromCanvas();
        Utils.removeElement(table.tableElem);

        // Remove the links to/from the table
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i];
            if (link.thisTable.name === table.name || link.otherTable.name === table.name) {
                Utils.removeElement(link.element);
                this.links.splice(i, 1);
            }
        }
    }
}
