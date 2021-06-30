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
        this.tableCount  = 0;
        this.tables      = {};
        this.links       = [];

        this.container   = document.querySelector("main");
        this.canvas      = document.querySelector(".canvas");
        this.bounds      = this.container.getBoundingClientRect();
        this.center();
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
     * Destroys the Canvas
     * @returns {Void}
     */
    destroy() {
        for (const table of Object.values(this.tables)) {
            Utils.removeElement(table.tableElem);
        }
        for (const link of this.links) {
            Utils.removeElement(link.element);
        }
        this.tableCount  = 0;
        this.tables      = {};
        this.links       = [];
        this.center();
    }

    /**
     * Centers the Canvas
     * @returns {Void}
     */
    center() {
        const bounds = this.canvas.getBoundingClientRect();
        const top    = (bounds.height - this.bounds.height) / 2;
        const left   = (bounds.width  - this.bounds.width)  / 2;
        this.container.scrollTo(left, top);
    }



    /**
     * Adds a Table to the Canvas
     * @param {Table} table
     * @returns {Void}
     */
    addTable(table) {
        this.tables[table.name] = table;
        this.tableCount += 1;

        // Place and set the Table
        table.addToCanvas();
        this.canvas.appendChild(table.tableElem);
        table.setBounds();
        if (!table.top && !table.left) {
            table.translate({
                top  : this.container.scrollTop  + 10,
                left : this.container.scrollLeft + 10,
            });
        }

        // Adds links to/from the given Table
        for (const otherTable of Object.values(this.tables)) {
            if (!otherTable.hasLinks) {
                continue;
            }
            for (const [ key, field ] of Object.entries(otherTable.links)) {
                if (field.onTable) {
                    continue;
                }
                if ((otherTable.name === table.name && this.tables[field.table]) || field.table === table.name) {
                    this.createLink(otherTable, key, field);
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
