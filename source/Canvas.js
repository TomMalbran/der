import Table   from "./Table.js";
import Link    from "./Link.js";
import Group   from "./Group.js";
import Zoom    from "./Zoom.js";
import Options from "./Options.js";
import Utils   from "./Utils.js";



/**
 * The Canvas
 */
export default class Canvas {

    /** @type {Zoom} */
    zoom;

    /** @type {Object.<String, Table>} */
    #tables = {};

    /** @type {Link[]} */
    #links = [];

    /** @type {Object.<Number, Group>} */
    #groups = {};

    /** @type {HTMLElement} */
    #canvas;
    /** @type {HTMLElement} */
    #container;
    /** @type {HTMLElement} */
    #center;

    /** @type {DOMRect} */
    #bounds;

    /** @type {HTMLElement} */
    #selector;

    /** @type {Object.<String, Table>} */
    selection;


    /**
     * Canvas constructor
     */
    constructor() {
        this.#canvas       = document.querySelector(".canvas");
        this.#container    = this.#canvas.parentElement;
        this.#bounds       = this.#container.getBoundingClientRect();
        this.#selector     = document.querySelector(".selector");

        // Zoom
        this.zoom          = new Zoom(this.#canvas);

        // Scroll
        this.isScrolling   = false;

        // Selection
        this.selection     = {};
        this.selectedGroup = null;
        this.isSelecting   = false;
        this.isDragging    = false;
        this.isMoving      = false;

        // Center
        this.#center = document.createElement("div");
        this.#center.className = "center";
        this.#canvas.appendChild(this.#center);
    }

    /**
     * Destroys the Canvas
     * @returns {Void}
     */
    destroy() {
        for (const link of this.#links) {
            link.destroy();
        }

        this.#tables = {};
        this.#links  = [];
        this.#groups = {};
        this.center();
    }



    /**
     * Returns all the Tables with the given names
     * @param {String[]} tableNames
     * @returns {Object[]}
     */
    getTables(tableNames) {
        const result = [];
        for (const name of tableNames) {
            if (this.#tables[name]) {
                result.push(this.#tables[name]);
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
        this.#tables[table.name] = table;
        table.addToCanvas(this.#canvas, this.#container, this.zoom.percent);

        // Adds links to/from the given Table
        for (const toTable of Object.values(this.#tables)) {
            for (const link of toTable.links) {
                if ((toTable.name === table.name && this.#tables[link.toTableName]) || link.toTableName === table.name) {
                    link.create(this.#tables[link.fromTableName], this.#tables[link.toTableName]);
                    this.#links.push(link);
                    this.#canvas.appendChild(link.element);
                }
            }
        }

        // Add the group or position it
        if (table.group) {
            if (!table.group.onCanvas) {
                this.addGroup(table.group);
            } else {
                table.group.position();
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
        for (let i = this.#links.length - 1; i >= 0; i--) {
            const link = this.#links[i];
            if (link.isLinkedTo(table)) {
                link.destroy();
                this.#links.splice(i, 1);
            }
        }

        // Remove the table
        table.removeFromCanvas();
        delete this.#tables[table.name];

        // Remove the group if empty, or position it
        if (table.group) {
            if (table.group.isEmptyInCanvas) {
                this.removeGroup(table.group);
            } else {
                table.group.position();
            }
        }
    }

    /**
     * Adds a Group to the Canvas
     * @param {Group} group
     * @returns {Void}
     */
    addGroup(group) {
        if (!this.#groups[group.id] && !group.isEmpty) {
            this.#groups[group.id] = group;
            group.addToCanvas(this.#canvas);
        }
    }

    /**
     * Removes a Group from the Canvas
     * @param {Group} group
     * @returns {Void}
     */
    removeGroup(group) {
        group.removeFromCanvas();
        delete this.#groups[group.id];
        if (this.selectedGroup && this.selectedGroup.isEqual(group)) {
            this.selectedGroup = null;
        }
    }

    /**
     * Re-connects the Links
     * @param {Table} table
     * @returns {Void}
     */
    reconnect(table) {
        for (const link of this.#links) {
            if (link.isLinkedTo(table)) {
                link.connect();
            }
        }
    }



    /**
     * Returns the current scroll
     * @return {{top: Number, left: Number}}
     */
    get scroll() {
        return {
            top  : this.#container.scrollTop,
            left : this.#container.scrollLeft,
        };
    }

    /**
     * Sets the Initial scroll
     * @param {{top: Number, left: Number}} scroll
     * @returns {Void}
     */
    setInitialScroll(scroll) {
        // if (scroll) {
        //     this.#container.scrollTo(scroll.left, scroll.top);
        // } else {
        //     this.center();
        // }
        // console.log(scroll);
        this.center();
    }

    /**
     * Centers the Canvas
     * @returns {Void}
     */
    center() {
        // this.#center.style.translate = "500vw 500vh";
        this.#center.style.transform = "translate(500vw, 500vh)";
        this.#center.scrollIntoView({ block : "center", inline : "center" });
    }

    reCenter() {
        this.#center.scrollIntoView({ block : "center", inline : "center" });
    }

    setCenter() {
        const scrollTop  = this.#container.scrollTop  + this.#bounds.height / 2;
        const scrollLeft = this.#container.scrollLeft + this.#bounds.width  / 2;

        const percentTop  = scrollTop  / this.#canvas.clientHeight;
        const percentLeft = scrollLeft / this.#canvas.clientWidth;

        // console.log(this.#canvas.clientWidth, scrollLeft, percentLeft);
        // this.#center.style.translate = `calc(1000vw * ${percentLeft}) calc(1000vh * ${percentTop})`;
        this.#center.style.transform = `scale(1) translate(calc(1000vw * ${percentLeft}), calc(1000vh * ${percentTop}))`;

        // console.log(this.#bounds);
        // console.log(this.#container.scrollTop / this.zoom.scale);
        // const scale = 1;//this.zoom.scale;
        // const elem = this.#canvas.querySelector(".group.selected");
        // if (elem) {
        //     elem.scrollIntoView({ block : "center", inline : "center" });
        // }
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
        this.#container.scrollTo(left, top);
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
     * Returns true if there are Selected Tables
     * @returns {Boolean}
     */
    get hasSelection() {
        return Object.values(this.selection).length > 0;
    }

    /**
     * Returns the Selected Tables
     * @returns {Table[]}
     */
    get selectedTables() {
        return Object.values(this.selection);
    }

    /**
     * Returns the Selected Group or the Group of the selected Tables
     * @returns {?Group}
     */
    get currentGroup() {
        let result = null;
        if (this.selectedGroup) {
            return this.selectedGroup;
        }
        if (this.hasSelection) {
            for (const table of this.selectedTables) {
                if (table.group) {
                    if (!result) {
                        result = table.group;
                    } else if (!result.isEqual(table.group)) {
                        return null;
                    }
                }
            }
        }
        return result;
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

        const target = Utils.getClosest(event, "aside", "backdrop", "zoom");
        if (target) {
            return false;
        }

        const mouse = Utils.getMousePos(event);
        return Utils.inBounds(mouse, this.#bounds);
    }

    /**
     * Selects the given Table from the List
     * @param {Table} table
     * @returns {Void}
     */
    selectTableFromList(table) {
        table.scrollCanvasIntoView();
        this.#selectTable(table);
    }

    /**
     * Selects the given Table from the Canvas
     * @param {Table}    table
     * @param {Boolean=} addToSelection
     * @returns {Void}
     */
    selectTableFromCanvas(table, addToSelection = false) {
        table.scrollListIntoView();
        this.#selectTable(table, addToSelection);

        if (table.group && !table.group.isExpanded) {
            this.selectedGroup = table.group.select();
            table.group.scrollListIntoView();
        }
    }

    /**
     * Selects the given Table internally
     * @param {Table}    table
     * @param {Boolean=} addToSelection
     * @returns {Void}
     */
    #selectTable(table, addToSelection = false) {
        this.stopUnselect();
        if (!addToSelection) {
            this.unselect();
        }
        this.selection[table.name] = table;
        this.trySelectGroup();
        this.markSelection();
    }

    /**
     * Shows the given Group
     * @param {Group} group
     * @returns {Void}
     */
    showGroup(group) {
        group.scrollCanvasIntoView();
        this.selectGroup(group);
    }

    /**
     * Selects the given Group
     * @param {Group} group
     * @returns {Void}
     */
    selectGroup(group) {
        this.unselect();
        this.selectedGroup = group.select();
        for (const table of group.tables) {
            if (table.onCanvas) {
                this.selection[table.name] = table;
            }
        }
        this.markSelection();
        this.stopUnselect();
    }

    /**
     * Tries to select a group if all the tables are part of it
     * @returns {Void}
     */
    trySelectGroup() {
        this.unselectGroup();
        let group;
        for (const selectedTable of this.selectedTables) {
            if (!selectedTable.group) {
                return;
            }
            if (!group) {
                group = selectedTable.group;
            } else if (!selectedTable.group.isEqual(group)) {
                return;
            }
        }
        if (group.canvasTables.length === this.selectedTables.length) {
            this.selectedGroup = group.select();
        }
    }

    /**
     * Marks the selected Tables
     * @returns {Void}
     */
    markSelection() {
        // Disable all the Tables
        for (const otherTable of Object.values(this.#tables)) {
            otherTable.disable();
            otherTable.removeColors();
        }

        // Disable all the Links
        for (const link of this.#links) {
            link.disable();
        }

        // Add colors to the Links and Fields
        let   lastColor = 0;
        const colors    = {};
        for (const link of this.#links) {
            for (const selectedTable of this.selectedTables) {
                if (link.isLinkedTo(selectedTable)) {
                    const field = link.getFieldName(selectedTable);
                    if (!colors[field]) {
                        colors[field] = lastColor + 1;
                        lastColor     = (lastColor + 1) % Options.COLOR_AMOUNT;
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
        for (const selectedTable of this.selectedTables) {
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
        for (const table of Object.values(this.#tables)) {
            table.unselect();
            table.removeColors();
        }
        for (const link of this.#links) {
            link.unselect();
        }
        this.selection = {};
        this.unselectGroup();
    }

    /**
     * Unselects the selected Group
     * @returns {Void}
     */
    unselectGroup() {
        if (this.selectedGroup) {
            this.selectedGroup = this.selectedGroup.unselect();
        }
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
            this.#selector.style.display = "block";
        }
        const bounds = Utils.createBounds(this.startMouse, currMouse);
        this.#selector.style.top    = `${bounds.top}px`;
        this.#selector.style.left   = `${bounds.left}px`;
        this.#selector.style.width  = `${bounds.width}px`;
        this.#selector.style.height = `${bounds.height}px`;
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
        this.#selector.style.display = "none";

        const currMouse = Utils.getMousePos(event);
        const bounds    = Utils.createBounds(this.startMouse, currMouse);

        this.unselect();
        for (const table of Object.values(this.#tables)) {
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
            table.scrollListIntoView();
            this.#selectTable(table, addToSelection);
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
        group.scrollListIntoView();
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

        const scale     = this.zoom.scale;
        const currMouse = Utils.getMousePos(event);

        for (const selectedTable of this.selectedTables) {
            const startPos = this.startPos[selectedTable.name];
            selectedTable.translate({
                top  : startPos.top  + (currMouse.top  - this.startMouse.top)  / scale,
                left : startPos.left + (currMouse.left - this.startMouse.left) / scale,
            });
            this.reconnect(selectedTable);
            if (selectedTable.group) {
                selectedTable.group.position();
            }
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
