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
        this.tables      = {};

        /** @type {Link[]} */
        this.links       = [];

        /** @type {HTMLElement} */
        this.container   = document.querySelector("main");
        this.bounds      = this.container.getBoundingClientRect();

        /** @type {HTMLElement} */
        this.canvas      = document.querySelector(".canvas");


        // Scroll
        this.isScrolling = false;

        // Selection
        this.selection   = {};
        this.isSelecting = false;
        this.isDragging  = false;
        this.isMoving    = false;

        /** @type {HTMLElement} */
        this.selector    = document.querySelector(".selector");

        // Zoom
        this.zoom        = 100;
        this.percent     = document.querySelector(".zoom-percent");
        this.zoomInBtn   = document.querySelector(".zoom-in");
        this.zoomOutBtn  = document.querySelector(".zoom-out");

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
     * Picks the Scroll
     * @param {MouseEvent} event
     * @returns {Void}
     */
    pickScroll(event) {
        if (this.isScrolling || this.isSelecting || this.isDragging) {
            return;
        }
        this.isScrolling = true;
        this.startMouse  = Utils.getMousePos(event);
    }

    /**
     * Drags the Scroll
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragScroll(event) {
        if (!this.isScrolling) {
            return false;
        }
        const currMouse = Utils.getMousePos(event);
        const top       = this.scroll.top  - (currMouse.top  - this.startMouse.top);
        const left      = this.scroll.left - (currMouse.left - this.startMouse.left);
        this.startMouse = Utils.getMousePos(event);
        this.container.scrollTo(left, top);
        return true;
    }

    /**
     * Drops the Scroll
     * @returns {Boolean}
     */
    dropScroll() {
        if (!this.isScrolling) {
            return false;
        }
        this.isScrolling = false;
        return true;
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
        this.dontUnselect = true;
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
        // Remove the links to/from the table
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i];
            if (link.isLinkedTo(table)) {
                Utils.removeElement(link.element);
                this.links.splice(i, 1);
            }
        }

        // Remove the table
        table.removeFromCanvas();
        Utils.removeElement(table.tableElem);
        delete this.tables[table.name];
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
     * Returns true if there are Selected Tables
     * @returns {Boolean}
     */
    get hasSelection() {
        return Object.values(this.selection).length > 0;
    }

    /**
     * Returns the Selected Tables
     * @returns {Object[]}
     */
    get selectedTables() {
        return Object.values(this.selection);
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
     * Returns true if the tables should unselect
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    shouldUnselect(event) {
        if (this.dontUnselect) {
            this.dontUnselect = false;
            return false;
        }
        const mouse = Utils.getMousePos(event);
        return Utils.inBounds(mouse, this.bounds);
    }

    /**
     * Selects the given Table
     * @param {Table}    table
     * @param {Boolean=} addToSelection
     * @returns {Void}
     */
    selectTable(table, addToSelection = false) {
        this.dontUnselect = true;
        if (!this.tables[table.name] || this.selection[table.name]) {
            return;
        }
        if (!addToSelection) {
            this.unselectTables();
        }
        this.selection[table.name] = table;
        this.markSelection();
    }

    /**
     * Marks the selected Tables
     * @returns {Void}
     */
    markSelection() {
        // Disable all the Tables
        for (const otherTable of Object.values(this.tables)) {
            otherTable.disable();
            otherTable.removeColors();
        }

        // Disable all the Links
        for (const link of this.links) {
            link.disable();
        }

        // Add colors to the Links and Fields
        let   lastColor = 0;
        const colors    = {};
        for (const link of this.links) {
            for (const selectedTable of this.selectedTables) {
                if (link.isLinkedTo(selectedTable)) {
                    const field = link.getFieldName(selectedTable);
                    if (!colors[field]) {
                        colors[field] = lastColor + 1;
                        lastColor     = (lastColor + 1) % COLOR_AMOUNT;
                    }
                    link.toTable.unselect();
                    link.fromTable.unselect();
                    link.fromField.setColor(colors[field]);
                    link.toField.setColor(colors[field]);
                    link.setColor(colors[field]);
                }
            }
        }

        // Select the Table
        for (const selectedTable of Object.values(this.selection)) {
            selectedTable.select();
        }
    }

    /**
     * Unselects the selected Tables
     * @returns {Void}
     */
    unselectTables() {
        if (!this.hasSelection) {
            return;
        }
        for (const table of Object.values(this.tables)) {
            table.unselect();
            table.removeColors();
        }
        for (const link of this.links) {
            link.unselect();
        }
        this.selection = {};
    }



    /**
     * Picks the Selector
     * @param {MouseEvent} event
     * @returns {Void}
     */
    pickSelector(event) {
        if (this.isScrolling || this.isSelecting || this.isDragging) {
            return;
        }
        this.isSelecting = true;
        this.isMoving    = false;
        this.startMouse  = Utils.getMousePos(event);
    }

    /**
     * Drags the Selector
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragSelector(event) {
        if (!this.isSelecting) {
            return false;
        }
        const currMouse = Utils.getMousePos(event);
        if (!this.isMoving) {
            if (Utils.dist(this.startMouse, currMouse) < 20) {
                return true;
            }
            this.isMoving = true;
            this.selector.style.display = "block";
        }
        const bounds = Utils.createBounds(this.startMouse, currMouse);
        this.selector.style.top    = Utils.toPX(bounds.top);
        this.selector.style.left   = Utils.toPX(bounds.left);
        this.selector.style.width  = Utils.toPX(bounds.width);
        this.selector.style.height = Utils.toPX(bounds.height);
        return true;
    }

    /**
     * Drops the Selector
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dropSelector(event) {
        if (!this.isSelecting) {
            return false;
        }
        this.isSelecting = false;
        if (!this.isMoving) {
            return false;
        }

        this.isMoving = false;
        this.selector.style.display = "none";

        const currMouse = Utils.getMousePos(event);
        const bounds    = Utils.createBounds(this.startMouse, currMouse);

        this.unselectTables();
        for (const table of Object.values(this.tables)) {
            if (Utils.intersectsBounds(bounds, table.bounds)) {
                this.selection[table.name] = table;
            }
        }
        if (this.hasSelection) {
            this.dontUnselect = true;
            this.markSelection();
        }
        return true;
    }



    /**
     * Picks a Table
     * @param {MouseEvent} event
     * @param {Table}      table
     * @returns {Void}
     */
    pickTable(event, table) {
        if (this.isScrolling || this.isSelecting || this.isDragging || !this.tables[table.name]) {
            return;
        }
        if (!this.selection[table.name]) {
            this.selectTable(table);
        }

        this.isDragging = true;
        this.startPos   = {};
        this.startMouse = Utils.getMousePos(event);
        for (const selectedTable of this.selectedTables) {
            this.startPos[selectedTable.name] = selectedTable.pos;
            selectedTable.pick();
        }
    }

    /**
     * Drags the Table
     * @param {MouseEvent} event
     * @returns {Boolean}
     */
    dragTable(event) {
        if (!this.isDragging) {
            return false;
        }
        const mult      = this.zoom / 100;
        const currMouse = Utils.getMousePos(event);
        for (const selectedTable of this.selectedTables) {
            const startPos = this.startPos[selectedTable.name];
            selectedTable.translate({
                top  : startPos.top  + (currMouse.top  - this.startMouse.top)  / mult,
                left : startPos.left + (currMouse.left - this.startMouse.left) / mult,
            });
            this.reconnect(selectedTable);
        }
        return true;
    }

    /**
     * Drops the Table
     * @returns {Boolean}
     */
    dropTable() {
        if (!this.isDragging) {
            return false;
        }
        for (const selectedTable of this.selectedTables) {
            selectedTable.drop();
            this.reconnect(selectedTable);
        }
        this.isDragging = false;
        return true;
    }
}
