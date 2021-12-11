import Table from "./Table.js";
import Link  from "./Link.js";
import Group from "./Group.js";
import Utils from "./Utils.js";

// Constants
const COLOR_AMOUNT = 8;



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

        /** @type {Object.<Number, Group>} */
        this.groups        = {};

        /** @type {HTMLElement} */
        this.container     = document.querySelector("main");
        this.bounds        = this.container.getBoundingClientRect();

        /** @type {HTMLElement} */
        this.canvas        = document.querySelector(".canvas");


        // Scroll
        this.isScrolling   = false;

        // Selection
        this.selection     = {};
        this.selectedGroup = null;
        this.isSelecting   = false;
        this.isDragging    = false;
        this.isMoving      = false;

        /** @type {HTMLElement} */
        this.selector      = document.querySelector(".selector");

        // Zoom
        this.zoom          = 100;
        this.percent       = document.querySelector(".zoom-percent");
        this.zoomInBtn     = document.querySelector(".zoom-in");
        this.zoomOutBtn    = document.querySelector(".zoom-out");

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
            link.destroy();
        }
        for (const group of Object.values(this.groups)) {
            group.destroy();
        }
        this.tables = {};
        this.links  = [];
        this.groups = {};
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
        this.stopUnselect();
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
     * @returns {Group[]}
     */
    removeTable(table) {
        // Remove the links to/from the table
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i];
            if (link.isLinkedTo(table)) {
                link.destroy();
                this.links.splice(i, 1);
            }
        }

        // Remove the table from the groups
        const groups = [];
        for (const group of Object.values(this.groups)) {
            if (group.removeTable(table)) {
                groups.push(group);
                if (group.isEmpty) {
                    this.removeGroup(group);
                }
            }
        }

        // Remove the table
        table.removeFromCanvas();
        table.destroy();
        delete this.tables[table.name];
        return groups;
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
     * Adds a Group to the Canvas
     * @param {Object} data
     * @returns {Group}
     */
    addGroup(data) {
        let group;
        const tables = this.getTables(data.tables);
        if (data.isEdit) {
            group = this.groups[data.id];
            group.update(data.name, tables);
        } else {
            group = new Group(data.id, data.name, tables);
        }
        if (!group.isEmpty) {
            this.groups[group.id] = group;
            this.canvas.appendChild(group.element);
        }
        return group;
    }

    /**
     * Removes a Group from the Canvas
     * @param {Group} group
     * @returns {Void}
     */
    removeGroup(group) {
        group.destroy();
        delete this.groups[group.id];
        if (this.selectedGroup && this.selectedGroup.id === group.id) {
            this.selectedGroup = null;
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
     * Stops the unselect
     * @returns {Void}
     */
    stopUnselect() {
        this.dontUnselect = true;
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
        const closest = Utils.getClosest(event, "backdrop");
        if (closest) {
            return false;
        }
        const mouse = Utils.getMousePos(event);
        return Utils.inBounds(mouse, this.bounds);
    }

    /**
     * Shows the given Table
     * @param {Table} table
     * @returns {Void}
     */
    showTable(table) {
        table.scrollIntoView();
        this.selectTable(table);
    }

    /**
     * Selects the given Table
     * @param {Table}    table
     * @param {Boolean=} addToSelection
     * @returns {Void}
     */
    selectTable(table, addToSelection = false) {
        this.stopUnselect();
        if (this.selection[table.name]) {
            return;
        }
        if (!addToSelection) {
            this.unselect();
        }
        this.selection[table.name] = table;
        this.trySelectGroup();
        this.markSelection();
    }

    /**
     * Selects the given Group
     * @param {Group} group
     * @returns {Void}
     */
    selectGroup(group) {
        this.unselect();
        group.select();
        this.selectedGroup = group;
        for (const table of group.tables) {
            this.selection[table.name] = table;
        }
        this.markSelection();
        this.stopUnselect();
    }

    /**
     * Tries to select a group if all the tables are part of it
     * @returns {Void}
     */
    trySelectGroup() {
        for (const group of Object.values(this.groups)) {
            if (group.containsAll(this.selectedTables)) {
                group.select();
                this.selectedGroup = group;
                break;
            }
        }
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
     * Unselects the selected Tables/Group
     * @returns {Void}
     */
    unselect() {
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
        if (this.selectedGroup) {
            this.selectedGroup.unselect();
            this.selectedGroup = null;
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
        this.selector.style.top    = `${bounds.top}px`;
        this.selector.style.left   = `${bounds.left}px`;
        this.selector.style.width  = `${bounds.width}px`;
        this.selector.style.height = `${bounds.height}px`;
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

        this.unselect();
        for (const table of Object.values(this.tables)) {
            if (Utils.intersectsBounds(bounds, table.bounds)) {
                this.selection[table.name] = table;
            }
        }
        if (this.hasSelection) {
            this.stopUnselect();
            this.trySelectGroup();
            this.markSelection();
        }
        return true;
    }



    /**
     * Picks a Table
     * @param {MouseEvent} event
     * @param {Table}      table
     * @param {Boolean=}   addToSelection
     * @returns {Void}
     */
    pickTable(event, table, addToSelection = false) {
        if (this.isScrolling || this.isSelecting || this.isDragging) {
            return;
        }
        if (!this.selection[table.name]) {
            this.selectTable(table, addToSelection);
        }
        this.startDrag(event);
    }

    /**
     * Picks a Group
     * @param {MouseEvent} event
     * @param {Group}      group
     * @returns {Void}
     */
    pickGroup(event, group) {
        if (this.isScrolling || this.isSelecting || this.isDragging) {
            return;
        }
        group.pick();
        this.selectGroup(group);
        this.startDrag(event);
    }

    /**
     * Starts the Drag
     * @param {MouseEvent} event
     * @returns {Void}
     */
    startDrag(event) {
        this.stopUnselect();
        this.isDragging = true;
        this.startMouse = Utils.getMousePos(event);
        this.startPos   = {};
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
        for (const group of Object.values(this.groups)) {
            group.position();
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
        if (this.selectedGroup) {
            this.selectedGroup.drop();
        }
        this.isDragging = false;
        return true;
    }
}
