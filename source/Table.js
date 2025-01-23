import Field from "./Field.js";
import Link  from "./Link.js";
import Group from "./Group.js";
import Utils from "./Utils.js";



/**
 * The Schema Table
 */
export default class Table {

    /** @type {Field[]} */
    #fields = [];

    /** @type {Link[]} */
    links = [];

    /** @type {Group} */
    group = null;

    /** @type {Boolean} */
    #onList;

    /** @type {HTMLElement} */
    #listElem;
    /** @type {HTMLElement} */
    #listInner;
    /** @type {HTMLAnchorElement} */
    #listArrow;
    /** @type {HTMLElement} */
    #listText;
    /** @type {HTMLElement} */
    #listButton;

    /** @type {HTMLElement} */
    #canvasElem;
    /** @type {HTMLElement} */
    #hiddenElem;
    /** @type {Number} */
    #hiddenFields;



    /**
     * Schema Table constructor
     * @param {String} name
     * @param {Object} data
     */
    constructor(name, data) {
        this.name       = name;
        this.data       = data;

        this.#onList    = false;
        this.showOnList = false;
        this.isExpanded = false;

        this.onCanvas   = false;
        this.top        = 0;
        this.left       = 0;
        this.maxFields  = 15;
        this.showAll    = false;

        this.setFields();
        this.setLinks();
    }

    /**
     * Destroys the Table
     * @returns {Void}
     */
    destroy() {
        this.removeFromCanvas();
        this.removeFromList();
        this.reset();
    }

    /**
     * Rests the Table data
     * @returns {Void}
     */
    reset() {
        this.onCanvas  = false;
        this.top       = 0;
        this.left      = 0;
        this.maxFields = 15;
        this.showAll   = false;
    }

    /**
     * Restores the Table data
     * @param {Object} data
     * @returns {Void}
     */
    restore(data) {
        this.onCanvas   = data.onCanvas;
        this.isExpanded = data.isExpanded;
        this.top        = data.top;
        this.left       = data.left;
        this.showAll    = data.showAll;

        if (this.isExpanded) {
            this.createExpandElem();
            this.#listElem.classList.add("expanded");
        }
    }



    /**
     * Returns the Table Name
     * @returns {String}
     */
    get tableName() {
        return this.name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    }

    /**
     * Returns the Table Position
     * @returns {{top: Number, left: Number}}
     */
    get pos() {
        return { top : this.top, left : this.left };
    }

    /**
     * Returns the Table Bounds
     * @returns {{top: Number, left: Number, bottom: Number, right: Number}}
     */
    get bounds() {
        return this.#canvasElem.getBoundingClientRect();
    }

    /**
     * Returns the Field with the given Name
     * @param {String} name
     * @returns {Field}
     */
    getField(name) {
        return this.#fields.find((field) => field.name === name);
    }

    /**
     * Returns the Field index with the given Name
     * @param {String} name
     * @returns {Number}
     */
    getFieldIndex(name) {
        const index = this.#fields.findIndex((field) => field.name === name);
        return (index > this.maxFields && !this.showAll) ? this.maxFields : index;
    }



    /**
     * Sets the Fields
     * @returns {Void}
     */
    setFields() {
        if (!this.data.fields) {
            return;
        }

        let index = 0;
        for (const [ name, data ] of Object.entries(this.data.fields)) {
            this.#fields.push(new Field(index, name, data));
            index++;
        }
        if (this.data.hasPositions) {
            this.#fields.push(new Field(index, "position", { type : "number" }));
            index++;
        }
        if (this.data.canCreate && this.data.hasTimestamps) {
            this.#fields.push(new Field(index, "createdTime", { type : "date" }));
            index++;
        }
        if (this.data.canCreate && this.data.hasUsers) {
            this.#fields.push(new Field(index, "createdUser", { type : "number" }));
            index++;
        }
        if (this.data.canEdit && this.data.hasTimestamps) {
            this.#fields.push(new Field(index, "modifiedTime", { type : "date" }));
            index++;
        }
        if (this.data.canEdit && this.data.hasUsers) {
            this.#fields.push(new Field(index, "modifiedUser", { type : "number" }));
            index++;
        }
        if (this.data.canDelete) {
            this.#fields.push(new Field(index, "isDeleted", { type : "boolean" }));
            index++;
        }
    }

    /**
     * Sets the Links using the Joins and Foreigns data
     * @returns {Void}
     */
    setLinks() {
        if (this.data.joins) {
            for (const [ key, data ] of Object.entries(this.data.joins)) {
                if (!data.onTable) {
                    this.links.push(new Link(this.name, key, data));
                }
            }
        }
        if (this.data.foreigns) {
            for (const [ key, data ] of Object.entries(this.data.foreigns)) {
                this.links.push(new Link(this.name, key, data));
            }
        }
        if (this.data.hasUsers) {
            const data = { table : "credentials", leftKey : "CREDENTIAL_ID" };
            if (this.data.canCreate && (!this.data.joins || !this.data.joins.createdUser)) {
                this.links.push(new Link(this.name, "createdUser", data));
            }
            if (this.data.canEdit && (!this.data.joins || !this.data.joins.modifiedUser)) {
                this.links.push(new Link(this.name, "modifiedUser", data));
            }
        }

        for (const link of this.links) {
            for (const field of this.#fields) {
                if (link.fromFieldName === field.name) {
                    field.hasLink = true;
                }
            }
        }
    }



    /**
     * Adds the Table to the List
     * @param {HTMLElement} container
     * @returns {Void}
     */
    addToList(container) {
        if (this.#onList) {
            return;
        }

        this.#onList = true;
        if (!this.#listElem) {
            this.createListElem();
            this.restoreExpanded();
        }
        container.appendChild(this.#listElem);
    }

    /**
     * Removes the Group from the List
     * @returns {Void}
     */
    removeFromList() {
        if (!this.#onList) {
            return;
        }
        Utils.removeElement(this.#listElem);
        this.#onList   = false;
        this.#listElem = null;
    }

    /**
     * Creates the List Element
     * @returns {Void}
     */
    createListElem() {
        this.#listElem   = document.createElement("li");
        this.#listInner  = document.createElement("div");
        this.#listArrow  = document.createElement("a");
        this.#listText   = document.createElement("span");
        this.#listButton = document.createElement("button");

        this.#listElem.className        = "schema-table";
        this.#listInner.className       = "schema-item";
        this.#listInner.dataset.table   = this.name;

        this.#listArrow.href            = "#";
        this.#listArrow.className       = "arrow";
        this.#listArrow.dataset.action  = "expand-table";
        this.#listArrow.dataset.table   = this.name;

        this.#listText.innerHTML        = this.tableName;

        this.#listButton.innerHTML      = "Add";
        this.#listButton.className      = "btn btn-small";
        this.#listButton.dataset.action = "add-table";
        this.#listButton.dataset.table  = this.name;

        if (this.onCanvas) {
            this.#listInner.classList.add("selectable");
            this.#listInner.dataset.action = "select-list-table";
            this.#listButton.style.display = "none";
        }

        this.#listElem.appendChild(this.#listInner);
        this.#listInner.appendChild(this.#listArrow);
        this.#listInner.appendChild(this.#listText);
        this.#listInner.appendChild(this.#listButton);
    }

    /**
     * Shows the List Element
     * @returns {Void}
     */
    showInList() {
        this.showOnList = true;
        this.#listElem.style.display = "block";
    }

    /**
     * Hides the List Element
     * @returns {Void}
     */
    hideInList() {
        this.showOnList = false;
        this.#listElem.style.display = "none";
    }



    /**
     * Toggles the List expanded
     * @returns {Void}
     */
    toggleExpand() {
        if (!this.expandElem) {
            this.createExpandElem();
        }
        this.isExpanded = !this.isExpanded;
        this.#listElem.classList.toggle("expanded", this.isExpanded);
    }

    /**
     * Restores the List expanded
     * @returns {Void}
     */
    restoreExpanded() {
        if (this.isExpanded) {
            this.createExpandElem();
            this.#listElem.classList.add("expanded");
        }
    }

    /**
     * Creates the Expand element
     * @returns {Void}
     */
    createExpandElem() {
        this.expandElem = document.createElement("ol");

        for (const field of this.#fields) {
            this.expandElem.appendChild(field.createListElem());
        }
        this.#listElem.appendChild(this.expandElem);
    }



    /**
     * Adds the Table to the Canvas
     * @param {HTMLElement} canvas
     * @param {HTMLElement} container
     * @param {Number}      mult
     * @returns {Void}
     */
    addToCanvas(canvas, container, mult) {
        this.onCanvas = true;
        this.#listInner.classList.add("selectable");
        this.#listInner.dataset.action = "select-list-table";
        this.#listButton.style.display = "none";

        if (!this.#canvasElem) {
            this.createCanvasElem();
        }
        canvas.appendChild(this.#canvasElem);
        this.setBounds();

        if (!this.top && !this.left) {
            if (this.group && this.group.onCanvas) {
                this.translate({
                    top  : this.group.top  + this.group.height / 2 - this.height / 2,
                    left : this.group.left + this.group.width  / 2 - this.width  / 2,
                });
                this.scrollCanvasIntoView();
            } else {
                const canvasBounds = canvas.getBoundingClientRect();
                const contBounds   = container.getBoundingClientRect();
                this.translate({
                    top  : (-canvasBounds.top  + contBounds.height / 2 - this.height / 2) / mult,
                    left : (-canvasBounds.left + contBounds.width  / 2 - this.width  / 2 + contBounds.left) / mult,
                });
            }
        }
    }

    /**
     * Removes the Table from the Canvas
     * @returns {Void}
     */
    removeFromCanvas() {
        if (!this.onCanvas) {
            return;
        }

        this.onCanvas = false;
        this.#listInner.classList.remove("selectable");
        this.#listInner.dataset.action = "";
        this.#listButton.style.display = "block";

        Utils.removeElement(this.#canvasElem);
        this.#canvasElem = null;
        this.reset();
    }

    /**
     * Creates the Canvas Element
     * @returns {Void}
     */
    createCanvasElem() {
        this.#canvasElem = document.createElement("div");
        this.#canvasElem.className       = "canvas-table";
        this.#canvasElem.dataset.action  = "select-canvas-table";
        this.#canvasElem.dataset.table   = this.name;
        this.#canvasElem.style.transform = `translate(${this.left}px, ${this.top}px)`;

        const header = document.createElement("header");
        header.innerHTML      = this.tableName;
        header.dataset.action = "drag-table";
        header.dataset.table  = this.name;

        const remove = document.createElement("a");
        remove.href           = "#";
        remove.className      = "close";
        remove.dataset.action = "remove-table";
        remove.dataset.table  = this.name;
        header.appendChild(remove);

        const list = document.createElement("ol");
        for (const [ index, field ] of this.#fields.entries()) {
            field.createCanvasElem(list, !this.showAll && index >= this.maxFields);
        }

        if (this.#fields.length > this.maxFields) {
            this.#hiddenFields = this.#fields.length - this.maxFields;

            this.#hiddenElem = document.createElement("li");
            this.#hiddenElem.className      = "schema-hidden";
            this.#hiddenElem.innerHTML      = this.showAll ? "Hide fields" : `+${this.#hiddenFields} hidden fields`;
            this.#hiddenElem.dataset.action = "toggle-fields";
            this.#hiddenElem.dataset.table  = this.name;

            list.appendChild(this.#hiddenElem);
        }

        this.#canvasElem.appendChild(header);
        this.#canvasElem.appendChild(list);
    }

    /**
     * Toggle the Visible Fields
     * @returns {Void}
     */
    toggleFields() {
        if (!this.showAll) {
            for (const field of this.#fields) {
                field.toggleVisibility(false);
            }
            this.#hiddenElem.innerHTML = "Hide fields";
            this.showAll = true;
        } else {
            for (const [ index, field ] of this.#fields.entries()) {
                if (index >= this.maxFields) {
                    field.toggleVisibility(true);
                }
            }
            this.#hiddenElem.innerHTML = `+${this.#hiddenFields} hidden fields`;
            this.showAll = false;
        }
        this.setBounds();
    }



    /**
     * Scrolls the List into view
     * @returns {Void}
     */
    scrollListIntoView() {
        this.#listElem.scrollIntoView({
            behavior : "smooth",
            block    : "center",
            inline   : "center",
        });
    }

    /**
     * Scrolls the Canvas into view
     * @returns {Void}
     */
    scrollCanvasIntoView() {
        this.#canvasElem.scrollIntoView({
            behavior : "smooth",
            block    : "center",
            inline   : "center",
        });
    }

    /**
     * Selects the Table
     * @returns {Void}
     */
    select() {
        this.unselect();
        this.#canvasElem.classList.add("selected");
        this.#listInner.classList.add("selected");
    }

    /**
     * Disables the Table
     * @returns {Void}
     */
    disable() {
        this.unselect();
        this.#canvasElem.classList.add("disabled");
    }

    /**
     * Un-selects the Table
     * @returns {Void}
     */
    unselect() {
        this.#canvasElem.classList.remove("selected");
        this.#canvasElem.classList.remove("disabled");
        this.#listInner.classList.remove("selected");
    }

    /**
     * Removes the Table field colors
     * @returns {Void}
     */
    removeColors() {
        for (const field of this.#fields) {
            field.removeColor();
        }
    }



    /**
     * Picks the Table
     * @returns {Void}
     */
    pick() {
        this.#canvasElem.classList.add("dragging");
    }

    /**
     * Drops the Table
     * @returns {Void}
     */
    drop() {
        this.#canvasElem.classList.remove("dragging");
    }

    /**
     * Sets the Table Width and Height
     * @returns {Void}
     */
    setBounds() {
        this.width  = this.#canvasElem.offsetWidth;
        this.height = this.#canvasElem.offsetHeight;
        this.right  = this.left + this.width;
        this.bottom = this.top  + this.height;
    }

    /**
     * Translates the Table
     * @param {{top: Number, left: Number}} pos
     * @returns {Void}
     */
    translate(pos) {
        this.top    = Math.round(pos.top);
        this.left   = Math.round(pos.left);
        this.right  = this.left + this.width;
        this.bottom = this.top  + this.height;

        this.#canvasElem.style.transform = `translate(${this.left}px, ${this.top}px)`;
    }
}
