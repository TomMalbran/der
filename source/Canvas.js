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
        this.tables     = {};
        this.links      = [];

        this.container  = document.querySelector("main");
        this.bounds     = this.container.getBoundingClientRect();

        /** @type {HTMLElement} */
        this.canvas     = document.querySelector(".canvas");

        this.zoom       = 100;
        this.percent    = document.querySelector(".zoom-percent");
        this.zoomInBtn  = document.querySelector(".zoom-in");
        this.zoomOutBtn = document.querySelector(".zoom-out");

        /** @type {Table} */
        this.currTable  = null;

        this.center();
    }

    /**
     * Destroys the Canvas
     * @returns {Void}
     */
    destroy() {
        for (const table of Object.values(this.tables)) {
            table.destroy();
        }
        for (const link of this.links) {
            Utils.removeElement(link.element);
        }
        this.tables = {};
        this.links  = [];
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
     * Sets the initial Zoom
     * @param {Number} value
     * @returns {Void}
     */
    setInitialZoom(value) {
        this.zoom = value;
        this.setZoom();
    }

    /**
     * Increases the Canvas Zoom
     * @returns {Number}
     */
    zoomIn() {
        if (this.zoom >= 150) {
            return this.zoom;
        }
        this.zoom += 10;
        this.setZoom();
        return this.zoom;
    }

    /**
     * Decreases the Canvas Zoom
     * @returns {Number}
     */
    zoomOut() {
        if (this.zoom <= 50) {
            return this.zoom;
        }
        this.zoom -= 10;
        this.setZoom();
        return this.zoom;
    }

    /**
     * Resets the Canvas Zoom
     * @returns {Number}
     */
    resetZoom() {
        this.zoom = 100;
        this.setZoom();
        return this.zoom;
    }

    /**
     * Sets the Canvas Zoom
     * @returns {Void}
     */
    setZoom() {
        this.percent.innerHTML = `${this.zoom}%`;
        this.canvas.style.transform = `scale(${this.zoom / 100})`;
        this.zoomInBtn.classList.toggle("zoom-disabled", this.zoom === 150);
        this.zoomOutBtn.classList.toggle("zoom-disabled", this.zoom === 50);
    }



    /**
     * Adds a Table to the Canvas
     * @param {Table} table
     * @returns {Void}
     */
    addTable(table) {
        this.tables[table.name] = table;

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



    /**
     * Picks a Table
     * @param {MouseEvent} event
     * @param {Table}      table
     * @returns {Void}
     */
    pickTable(event, table) {
        this.currTable  = table;
        this.startMouse = { top : event.pageY, left : event.pageX };
        this.startPos   = { top : table.top,   left : table.left  };
        table.pick();
    }

    /**
     * Drags the Table
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragTable(event) {
        if (!this.currTable) {
            return false;
        }
        const mult = this.zoom / 100;
        this.currTable.translate({
            top  : this.startPos.top + (event.pageY - this.startMouse.top) / mult,
            left : this.startPos.left + (event.pageX - this.startMouse.left) / mult,
        });
        this.connect();
        return true;
    }

    /**
     * Drops the Table
     * @returns {?Table}
     */
    dropTable() {
        if (!this.currTable) {
            return null;
        }
        let result = this.currTable;
        this.currTable.drop();
        this.connect();
        this.currTable = null;
        return result;
    }
}
