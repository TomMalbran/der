import Table from "./Table.js";
import Link  from "./Link.js";
import Utils from "./Utils.js";

// Constants
const COLOR_AMOUNT = 6;



/**
 * The Canvas
 */
export default class Canvas {

    /**
     * Canvas constructor
     */
    constructor() {
        /** @type {Object.<String, Table>} */
        this.tables        = {};

        /** @type {Link[]} */
        this.links         = [];

        /** @type {HTMLElement} */
        this.container     = document.querySelector("main");
        this.bounds        = this.container.getBoundingClientRect();

        /** @type {HTMLElement} */
        this.canvas        = document.querySelector(".canvas");

        // Zoom
        this.zoom          = 100;
        this.percent       = document.querySelector(".zoom-percent");
        this.zoomInBtn     = document.querySelector(".zoom-in");
        this.zoomOutBtn    = document.querySelector(".zoom-out");

        /** @type {Table} */
        this.selectedTable = null;

        /** @type {Table} */
        this.grabbedTable  = null;

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
     * Returns the current scroll
     * @return {{top: Number, left: Number}}
     */
    get scroll() {
        return {
            top  : this.container.scrollTop,
            left : this.container.scrollLeft,
        };
    }

    /**
     * Sets the Initial scroll
     * @param {{top: Number, left: Number}} scroll
     * @returns {Void}
     */
    setInitialScroll(scroll) {
        if (scroll) {
            this.container.scrollTo(scroll.left, scroll.top);
        } else {
            this.center();
        }
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
        for (const toTable of Object.values(this.tables)) {
            for (const link of toTable.links) {
                if ((toTable.name === table.name && this.tables[link.toTableName]) || link.toTableName === table.name) {
                    link.create(this.tables[link.fromTableName], this.tables[link.toTableName]);
                    this.links.push(link);
                    this.canvas.appendChild(link.element);
                }
            }
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
            if (link.isLinkedTo(table)) {
                Utils.removeElement(link.element);
                this.links.splice(i, 1);
            }
        }
    }



    /**
     * Shows the given Table
     * @param {Table} table
     * @returns {Void}
     */
    showTable(table) {
        if (this.tables[table.name]) {
            table.scrollIntoView();
            this.selectTable(table);
        }
    }

    /**
     * Selects the given Table
     * @param {Table} table
     * @returns {Void}
     */
    selectTable(table) {
        if (!this.tables[table.name] || (this.selectedTable !== null && this.selectTable.name === table.name)) {
            return;
        }
        this.selectedTable = table;

        // Disable all the Tables
        for (const otherTable of Object.values(this.tables)) {
            otherTable.disable();
        }

        // Add colors or disable the Links
        let   lastColor = 0;
        const colors    = {};
        for (const link of this.links) {
            if (link.isLinkedTo(table)) {
                const field = link.getFieldName(table);
                if (!colors[field]) {
                    colors[field] = lastColor + 1;
                    lastColor     = (lastColor + 1) % COLOR_AMOUNT;
                }
                link.toTable.unselect();
                link.fromTable.unselect();
                link.fromField.setColor(colors[field]);
                link.toField.setColor(colors[field]);
                link.setColor(colors[field]);
            } else {
                link.disable();
            }
        }

        // Select the Table
        table.select();
    }

    /**
     * Unselects the selected Table
     * @returns {Void}
     */
    unselectTable() {
        if (!this.selectedTable) {
            return;
        }
        for (const table of Object.values(this.tables)) {
            table.unselect();
            for (const field of table.fields) {
                field.removeColor();
            }
        }
        for (const link of this.links) {
            link.unselect();
        }
    }

    /**
     * Re-connects the Links
     * @param {Table} table
     * @returns {Void}
     */
    reconnect(table) {
        for (const link of this.links) {
            if (link.isLinkedTo(table)) {
                link.connect();
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
        if (!this.tables[table.name]) {
            return;
        }
        this.unselectTable();
        this.selectTable(table);

        this.grabbedTable = table;
        this.startMouse   = { top : event.pageY, left : event.pageX };
        this.startPos     = { top : table.top,   left : table.left  };
        table.pick();
    }

    /**
     * Drags the Table
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragTable(event) {
        if (!this.grabbedTable) {
            return false;
        }
        const mult = this.zoom / 100;
        this.grabbedTable.translate({
            top  : this.startPos.top + (event.pageY - this.startMouse.top) / mult,
            left : this.startPos.left + (event.pageX - this.startMouse.left) / mult,
        });
        this.reconnect(this.grabbedTable);
        return true;
    }

    /**
     * Drops the Table
     * @returns {?Table}
     */
    dropTable() {
        if (!this.grabbedTable) {
            return null;
        }
        let result = this.grabbedTable;
        this.grabbedTable.drop();
        this.reconnect(this.grabbedTable);
        this.grabbedTable = null;
        return result;
    }
}
