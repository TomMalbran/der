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
        this.data      = data;

        this.top       = 0;
        this.left      = 0;
        this.maxFields = 15;
        this.showAll   = false;

        /** @type {Field[]} */
        this.fields    = [];
        this.setFields();

        /** @type {Link[]} */
        this.links     = [];
        this.setLinks();

        this.createListElem();
    }

    /**
     * Destroys the Table
     * @returns {Void}
     */
    destroy() {
        this.top       = 0;
        this.left      = 0;
        this.maxFields = 15;
        this.showAll   = false;

        Utils.removeElement(this.tableElem);
    }

    /**
     * Restores the Table
     * @param {Object} data
     * @returns {Void}
     */
    restore(data) {
        this.top     = data.top;
        this.left    = data.left;
        this.showAll = data.showAll;
    }



    /**
     * Returns the Table Name
     * @returns {String}
     */
    get name() {
        return this.data.table;
    }

    /**
     * Returns the Field Position
     * @param {String} name
     * @returns {Field}
     */
    getField(name) {
        return this.fields.find((field) => field.name === name);
    }

    /**
     * Returns the Field Position
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
    }



    /**
     * Creates the List element
     * @returns {Void}
     */
    createListElem() {
        this.listElem   = document.createElement("li");
        this.listText   = document.createElement("span");
        this.listButton = document.createElement("button");

        this.listText.innerHTML        = this.data.table;
        this.listText.dataset.action   = "show-table";
        this.listText.dataset.table    = this.data.table;

        this.listButton.innerHTML      = "Add";
        this.listButton.className      = "btn";
        this.listButton.dataset.action = "add-table";
        this.listButton.dataset.table  = this.data.table;

        this.listElem.appendChild(this.listText);
        this.listElem.appendChild(this.listButton);
    }

    /**
     * Shows the List element
     * @returns {Void}
     */
    showInList() {
        this.listElem.style.display = "flex";
    }

    /**
     * Hides the List element
     * @returns {Void}
     */
    hideInList() {
        this.listElem.style.display = "none";
    }



    /**
     * Adds a Table Element to the Canvas
     * @returns {Void}
     */
    addToCanvas() {
        this.listText.classList.add("selectable");
        this.listButton.style.display = "none";

        if (!this.tableElem) {
            this.createTableElem();
        }
    }

    /**
     * Removes a Table Element from the Canvas
     * @returns {Void}
     */
    removeFromCanvas() {
        this.listText.classList.remove("selectable");
        this.listButton.style.display = "block";
    }

    /**
     * Creates the Table element
     * @returns {Void}
     */
    createTableElem() {
        this.tableElem = document.createElement("div");
        this.tableElem.className       = "schema-table";
        this.tableElem.dataset.action  = "select-table";
        this.tableElem.dataset.table   = this.name;
        this.tableElem.style.transform = `translate(${this.left}px, ${this.top}px)`;

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
            field.createTableElem(!this.showAll && index >= this.maxFields);
            list.appendChild(field.tableElem);
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

        this.tableElem.appendChild(header);
        this.tableElem.appendChild(list);
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
        this.tableElem.scrollIntoView({
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
        this.tableElem.classList.add("selected");
    }

    /**
     * Disables the Table
     * @returns {Void}
     */
    disable() {
        this.unselect();
        this.tableElem.classList.add("disabled");
    }

    /**
     * Un-selects the Table
     * @returns {Void}
     */
    unselect() {
        this.tableElem.classList.remove("selected");
        this.tableElem.classList.remove("disabled");
    }



    /**
     * Picks the Table
     * @returns {Void}
     */
    pick() {
        this.tableElem.classList.add("dragging");
    }

    /**
     * Drops the Table
     * @returns {Void}
     */
    drop() {
        this.tableElem.classList.remove("dragging");
    }

    /**
     * Sets the Table Width and Height
     * @returns {Void}
     */
    setBounds() {
        this.width  = this.tableElem.offsetWidth;
        this.height = this.tableElem.offsetHeight;
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
        this.tableElem.style.transform = `translate(${this.left}px, ${this.top}px)`;
    }
}
