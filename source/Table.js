import Field from "./Field.js";
import Link  from "./Link.js";
import Utils from "./Utils.js";



/**
 * The Schema Table
 */
export default class Table {

    /**
     * Schema Table constructor
     * @param {Object} data
     */
    constructor(data) {
        this.data       = data;
        this.isExpanded = false;

        this.onCanvas   = false;
        this.top        = 0;
        this.left       = 0;
        this.maxFields  = 15;
        this.showAll    = false;

        /** @type {Field[]} */
        this.fields     = [];
        this.setFields();

        /** @type {Link[]} */
        this.links      = [];
        this.setLinks();

        this.createListElem();
    }

    /**
     * Destroys the Table
     * @returns {Void}
     */
    destroy() {
        this.onCanvas  = false;
        this.top       = 0;
        this.left      = 0;
        this.maxFields = 15;
        this.showAll   = false;

        Utils.removeElement(this.canvasElem);
    }

    /**
     * Restores the Table
     * @param {Object} data
     * @returns {Void}
     */
    restore(data) {
        this.onCanvas   = data.onCanvas;
        this.isExpanded = data.isExpanded;
        this.top        = data.top;
        this.left       = data.left;
        this.showAll    = data.showAll;
    }



    /**
     * Returns the Table Name
     * @returns {String}
     */
    get name() {
        return this.data.table;
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
        return this.canvasElem.getBoundingClientRect();
    }

    /**
     * Returns the Field with the given Name
     * @param {String} name
     * @returns {Field}
     */
    getField(name) {
        return this.fields.find((field) => field.name === name);
    }

    /**
     * Returns the Field index with the given Name
     * @param {String} name
     * @returns {Number}
     */
    getFieldIndex(name) {
        const index = this.fields.findIndex((field) => field.name === name);
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
            this.fields.push(new Field(index, name, data));
            index++;
        }
        if (this.data.hasPositions) {
            this.fields.push(new Field(index, "position", { type : "number" }));
            index++;
        }
        if (this.data.canCreate && this.data.hasTimestamps) {
            this.fields.push(new Field(index, "createdTime", { type : "date" }));
            index++;
        }
        if (this.data.canCreate && this.data.hasUsers) {
            this.fields.push(new Field(index, "createdUser", { type : "number" }));
            index++;
        }
        if (this.data.canEdit && this.data.hasTimestamps) {
            this.fields.push(new Field(index, "modifiedTime", { type : "date" }));
            index++;
        }
        if (this.data.canEdit && this.data.hasUsers) {
            this.fields.push(new Field(index, "modifiedUser", { type : "number" }));
            index++;
        }
        if (this.data.canDelete) {
            this.fields.push(new Field(index, "isDeleted", { type : "boolean" }));
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
            if (this.data.canCreate && !this.data.joins["createdUser"]) {
                this.links.push(new Link(this.name, "createdUser", data));
            }
            if (this.data.canEdit && !this.data.joins["modifiedUser"]) {
                this.links.push(new Link(this.name, "modifiedUser", data));
            }
        }
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

        this.listInner.className       = "schema-item";

        this.listArrow.href            = "#";
        this.listArrow.className       = "arrow";
        this.listArrow.dataset.action  = "expand-table";
        this.listArrow.dataset.table   = this.data.table;

        this.listText.innerHTML        = this.data.table;
        this.listText.dataset.action   = "show-table";
        this.listText.dataset.table    = this.data.table;

        this.listButton.innerHTML      = "Add";
        this.listButton.className      = "btn";
        this.listButton.dataset.action = "add-table";
        this.listButton.dataset.table  = this.data.table;

        this.listElem.appendChild(this.listInner);
        this.listInner.appendChild(this.listArrow);
        this.listInner.appendChild(this.listText);
        this.listInner.appendChild(this.listButton);
    }

    /**
     * Shows the List Element
     * @returns {Void}
     */
    showInList() {
        this.listElem.style.display = "block";
    }

    /**
     * Hides the List Element
     * @returns {Void}
     */
    hideInList() {
        this.listElem.style.display = "none";
    }



    /**
     * Toggles the List expanded
     * @returns {Void}
     */
    toggleExpand() {
        if (!this.expandElem) {
            this.createExpandElem();
        }
        if (this.isExpanded) {
            this.listElem.classList.remove("schema-expanded");
        } else {
            this.listElem.classList.add("schema-expanded");
        }
        this.isExpanded = !this.isExpanded;
    }

    /**
     * Restores the List expanded
     * @returns {Void}
     */
    restoreExpanded() {
        this.createExpandElem();
        this.listElem.classList.add("schema-expanded");
    }

    /**
     * Creates the Expand element
     * @returns {Void}
     */
    createExpandElem() {
        this.expandElem = document.createElement("ol");
        this.expandElem.className = "schema-expand";

        for (const field of this.fields) {
            field.createListElem();
            this.expandElem.appendChild(field.listElem);
        }
        this.listElem.appendChild(this.expandElem);
    }



    /**
     * Adds the Table to the Canvas
     * @param {HTMLElement} container
     * @returns {Void}
     */
    addToCanvas(container) {
        this.onCanvas = true;
        this.listText.classList.add("selectable");
        this.listButton.style.display = "none";

        if (!this.canvasElem) {
            this.createCanvasElem();
        }
        container.appendChild(this.canvasElem);
        this.setBounds();
        if (!this.top && !this.left) {
            this.translate({
                top  : container.scrollTop  + 10,
                left : container.scrollLeft + 10,
            });
        }
    }

    /**
     * Removes the Table from the Canvas
     * @returns {Void}
     */
    removeFromCanvas() {
        this.onCanvas = false;
        this.listText.classList.remove("selectable");
        this.listButton.style.display = "block";
        this.destroy();
    }

    /**
     * Creates the Canvas Element
     * @returns {Void}
     */
    createCanvasElem() {
        this.canvasElem = document.createElement("div");
        this.canvasElem.className       = "schema-table";
        this.canvasElem.dataset.action  = "select-table";
        this.canvasElem.dataset.table   = this.name;
        this.canvasElem.style.transform = `translate(${this.left}px, ${this.top}px)`;

        const header = document.createElement("header");
        header.innerHTML      = this.name;
        header.dataset.action = "drag-table";
        header.dataset.table  = this.name;

        const remove = document.createElement("a");
        remove.href           = "#";
        remove.className      = "close";
        remove.dataset.action = "remove-table";
        remove.dataset.table  = this.name;
        header.appendChild(remove);

        const list = document.createElement("ol");
        for (const [ index, field ] of this.fields.entries()) {
            field.createCanvasElem(!this.showAll && index >= this.maxFields);
            list.appendChild(field.canvasElem);
        }

        if (this.fields.length > this.maxFields) {
            this.hiddenFields = this.fields.length - this.maxFields;

            this.hiddenElem = document.createElement("li");
            this.hiddenElem.className      = "schema-hidden";
            this.hiddenElem.innerHTML      = this.showAll ? "Hide fields" : `+${this.hiddenFields} hidden fields`;
            this.hiddenElem.dataset.action = "toggle-fields";
            this.hiddenElem.dataset.table  = this.name;

            list.appendChild(this.hiddenElem);
        }

        this.canvasElem.appendChild(header);
        this.canvasElem.appendChild(list);
    }

    /**
     * Toggle the Visible Fields
     * @returns {Void}
     */
    toggleFields() {
        if (!this.showAll) {
            for (const field of this.fields) {
                field.toggleVisibility(false);
            }
            this.hiddenElem.innerHTML = "Hide fields";
            this.showAll = true;
        } else {
            for (const [ index, field ] of this.fields.entries()) {
                if (index >= this.maxFields) {
                    field.toggleVisibility(true);
                }
            }
            this.hiddenElem.innerHTML = `+${this.hiddenFields} hidden fields`;
            this.showAll = false;
        }
        this.setBounds();
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
     * Selects the Table
     * @returns {Void}
     */
    select() {
        this.unselect();
        this.canvasElem.classList.add("selected");
    }

    /**
     * Disables the Table
     * @returns {Void}
     */
    disable() {
        this.unselect();
        this.canvasElem.classList.add("disabled");
    }

    /**
     * Un-selects the Table
     * @returns {Void}
     */
    unselect() {
        this.canvasElem.classList.remove("selected");
        this.canvasElem.classList.remove("disabled");
    }

    /**
     * Removes the Table field colors
     * @returns {Void}
     */
    removeColors() {
        for (const field of this.fields) {
            field.removeColor();
        }
    }



    /**
     * Picks the Table
     * @returns {Void}
     */
    pick() {
        this.canvasElem.classList.add("dragging");
    }

    /**
     * Drops the Table
     * @returns {Void}
     */
    drop() {
        this.canvasElem.classList.remove("dragging");
    }

    /**
     * Sets the Table Width and Height
     * @returns {Void}
     */
    setBounds() {
        this.width  = this.canvasElem.offsetWidth;
        this.height = this.canvasElem.offsetHeight;
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
        this.canvasElem.style.transform = `translate(${this.left}px, ${this.top}px)`;
    }
}
