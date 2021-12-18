import Table from "./Table.js";
import Utils from "./Utils.js";



/**
 * The Schema Group
 */
export default class Group {

    /**
     * Groups constructor
     * @param {Number}   id
     * @param {String}   name
     * @param {Table[]}  tables
     * @param {Boolean=} isExpanded
     */
    constructor(id, name, tables, isExpanded = true) {
        this.id         = id;
        this.name       = name;
        this.tables     = tables;
        this.padding    = 20;

        this.onList     = false;
        this.isExpanded = isExpanded;
        this.onCanvas   = false;

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
     * Destroys the Group
     * @returns {Void}
     */
    destroy() {
        this.setGroup(null);
        this.removeFromCanvas();
        this.removeFromList();
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
     * Returns true if the group is equal to the given one
     * @param {Group} group
     * @return {Boolean}
     */
    isEqual(group) {
        return this.id === group.id;
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
     * Adds the Group to the List
     * @param {HTMLElement} container
     * @returns {Void}
     */
    addToList(container) {
        if (this.onList) {
            return;
        }
        this.onList = true;
        if (!this.listElem) {
            this.createListElem();
        }
        container.appendChild(this.listElem);
        for (const table of this.tables) {
            table.addToList(this.listTables);
        }
        this.listElem.classList.toggle("expanded", this.isExpanded);
    }

    /**
     * Removes the Group from the List
     * @returns {Void}
     */
    removeFromList() {
        if (!this.onList) {
            return;
        }
        for (const table of this.tables) {
            table.removeFromList();
        }
        Utils.removeElement(this.listElem);
        this.onList   = false;
        this.listElem = null;
    }

    /**
     * Creates the List Element
     * @returns {Void}
     */
    createListElem() {
        this.listElem   = document.createElement("li");
        this.listInner  = document.createElement("div");
        this.listArrow  = document.createElement("a");
        this.listText   = document.createElement("span");
        this.listButton = document.createElement("button");
        this.listTables = document.createElement("ol");

        this.listElem.className        = "schema-group";
        this.listInner.className       = "schema-item";

        this.listArrow.href            = "#";
        this.listArrow.className       = "arrow";
        this.listArrow.dataset.action  = "expand-group";
        this.listArrow.dataset.group   = String(this.id);

        this.listText.innerHTML        = this.name;
        this.listText.dataset.action   = "show-group";
        this.listText.dataset.group    = String(this.id);

        this.listButton.innerHTML      = "Edit";
        this.listButton.className      = "btn";
        this.listButton.dataset.action = "edit-group";
        this.listButton.dataset.group  = String(this.id);

        this.listElem.appendChild(this.listInner);
        this.listElem.appendChild(this.listTables);

        this.listInner.appendChild(this.listArrow);
        this.listInner.appendChild(this.listText);
        this.listInner.appendChild(this.listButton);
    }

    /**
     * Toggles the List expanded
     * @returns {Void}
     */
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.listElem.classList.toggle("expanded", this.isExpanded);
    }

    /**
     * Sets the List Element visibility
     * @returns {Void}
     */
    setListVisibility() {
        const tables = this.tables.filter((elem) => elem.showOnList);
        this.listElem.style.display = !tables.length ? "none" : "block";
    }



    /**
     * Adds the Group to the Canvas
     * @param {HTMLElement} container
     * @returns {Void}
     */
    addToCanvas(container) {
        this.onCanvas = true;
        this.listText.classList.add("selectable");

        if (!this.canvasElem) {
            this.createCanvasElem();
        }
        container.appendChild(this.canvasElem);
        this.position();
    }

    /**
     * Removes the Group from the Canvas
     * @returns {Void}
     */
    removeFromCanvas() {
        if (!this.onCanvas) {
            return;
        }
        this.onCanvas = false;
        Utils.removeElement(this.canvasElem);
        this.canvasElem = null;
    }

    /**
     * Creates the Canvas Element
     * @returns {Void}
     */
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
     * Scrolls the Table into view
     * @returns {Void}
     */
    scrollIntoView() {
        this.canvasElem.scrollIntoView({
            behavior : "smooth",
            block    : "center",
            inline   : "center",
        });
    }

    /**
     * Selects the Canvas Element
     * @returns {Group}
     */
    select() {
        this.canvasElem.classList.add("selected");
        return this;
    }

    /**
     * Unselects the Canvas Element
     * @returns {Null}
     */
    unselect() {
        this.canvasElem.classList.remove("selected");
        return null;
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
