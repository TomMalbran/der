import Table from "./Table.js";
import Utils from "./Utils.js";



/**
 * The Schema Group
 */
export default class Group {

    /**
     * Groups constructor
     * @param {Number}  id
     * @param {String}  name
     * @param {Table[]} tables
     */
    constructor(id, name, tables) {
        this.id      = id;
        this.name    = name;
        this.tables  = tables;
        this.padding = 20;

        this.setGroup(this);
    }

    /**
     * Updates te Group
     * @param {String}  name
     * @param {Table[]} tables
     * @returns {Void}
     */
    update(name, tables) {
        this.setGroup(null);

        this.name   = name;
        this.tables = tables;

        this.setGroup(this);
        if (!this.isEmptyInCanvas) {
            this.header.innerText = this.name;
            this.position();
        }
    }

    /**
     * Sets the Group of the Tables
     * @param {Group?} group
     * @returns {Void}
     */
    setGroup(group) {
        for (const table of this.tables) {
            table.setGroup(group);
        }
    }



    /**
     * Returns true if the group is empty
     * @return {Boolean}
     */
    get isEmpty() {
        return this.tables.length === 0;
    }

    /**
     * Returns true if the group is empty in the canvas
     * @return {Boolean}
     */
    get isEmptyInCanvas() {
        return this.canvasTables.length === 0;
    }

    /**
     * Returns a list of table names
     * @return {String[]}
     */
    get tableNames() {
        return this.tables.map((table) => table.name);
    }

    /**
     * Returns a list of tables
     * @return {Table[]}
     */
    get canvasTables() {
        return this.tables.filter((table) => table.onCanvas);
    }

    /**
     * Returns true if all the given table appear in the group
     * @param {Table} table
     * @returns {Boolean}
     */
    contains(table) {
        return this.tables.findIndex((elem) => elem.name === table.name) > -1;
    }

    /**
     * Returns true if all the given tables appear in the group
     * @param {Table[]} tables
     * @returns {Boolean}
     */
    containsAll(tables) {
        if (tables.length !== this.tables.length) {
            return false;
        }
        for (const table of tables) {
            if (!this.contains(table)) {
                return false;
            }
        }
        return true;
    }



    /**
     * @returns {Void}
     */
    addToCanvas(container) {
        this.onCanvas = true;
        if (!this.canvasElem) {
        }
        if (!found) {
            return false;
        }

        container.appendChild(this.canvasElem);
    }



    /**
     * Creates the HTML element
     * @returns {Void}
     */
    create() {
        this.element = document.createElement("div");
    createCanvasElem() {
        this.canvasElem = document.createElement("div");
        this.canvasElem.className = "group";

        this.header = document.createElement("header");
        this.header.innerHTML      = this.name;
        this.header.dataset.action = "drag-group";
        this.header.dataset.group  = String(this.id);
        this.canvasElem.appendChild(this.header);

        const remove = document.createElement("a");
        remove.href           = "#";
        remove.className      = "close";
        remove.dataset.action = "remove-group";
        remove.dataset.group  = String(this.id);
        this.canvasElem.appendChild(remove);
    }

    /**
     * Destroys the Canvas Element
     * @returns {Void}
     */
    destroy() {
        Utils.removeElement(this.canvasElem);
        this.canvasElem = null;
    }

    /**
     * Positions the HTML element
     * @returns {Void}
     */
    position() {
        this.top    = 0;
        this.left   = 0;
        this.right  = 0;
        this.bottom = 0;

        for (const table of this.canvasTables) {
            if (!this.top || table.top < this.top) {
                this.top = table.top;
            }
            if (!this.left || table.left < this.left) {
                this.left = table.left;
            }
            if (!this.right || table.right > this.right) {
                this.right = table.right;
            }
            if (!this.bottom || table.bottom > this.bottom) {
                this.bottom = table.bottom;
            }
        }

        this.top    -= this.padding * 2;
        this.left   -= this.padding;
        this.right  += this.padding;
        this.bottom += this.padding;
        this.width   = Math.abs(this.right  - this.left);
        this.height  = Math.abs(this.bottom - this.top);

        this.canvasElem.style.transform = `translate(${this.left}px, ${this.top}px)`;
        this.canvasElem.style.width     = `${this.width}px`;
        this.canvasElem.style.height    = `${this.height}px`;
    }

    /**
     * Selects the Canvas Element
     * @returns {Void}
     */
    select() {
        this.canvasElem.classList.add("selected");
    }

    /**
     * Unselects the Canvas Element
     * @returns {Void}
     */
    unselect() {
        this.canvasElem.classList.remove("selected");
    }

    /**
     * Picks the Canvas Element
     * @returns {Void}
     */
    pick() {
        this.canvasElem.classList.add("dragging");
    }

    /**
     * Drops the Canvas Element
     * @returns {Void}
     */
    drop() {
        this.canvasElem.classList.remove("dragging");
    }
}
