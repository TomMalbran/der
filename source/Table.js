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
        this.fields    = [];

        this.top       = 0;
        this.left      = 0;
        this.maxFields = 15;
        this.showAll   = false;

        this.setFields();
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
     * Returns true if the Table has Joins or Foreigns
     * @returns {Boolean}
     */
    get hasLinks() {
        return this.data.joins || this.data.foreigns;
    }

    /**
     * Returns the Table Joins and Foreigns
     * @returns {Object}
     */
    get links() {
        let result = [];
        if (this.data.joins) {
            result = this.data.joins;
        }
        if (this.data.foreigns) {
            result = { ...result, ...this.data.foreigns };
        }
        return result;
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

        for (const [ name, field ] of Object.entries(this.data.fields)) {
            this.fields.push({ name, type : field.type, isPrimary : field.type === "id" || field.isPrimary });
        }
        if (this.data.hasPositions) {
            this.fields.push({ name : "position", type : "number" });
        }
        if (this.data.canCreate && this.data.hasTimestamps) {
            this.fields.push({ name : "createdTime", type : "date" });
        }
        if (this.data.canCreate && this.data.hasUsers) {
            this.fields.push({ name : "createdUser", type : "number" });
        }
        if (this.data.canEdit && this.data.hasTimestamps) {
            this.fields.push({ name : "modifiedTime", type : "date" });
        }
        if (this.data.canEdit && this.data.hasUsers) {
            this.fields.push({ name : "modifiedUser", type : "number" });
        }
        if (this.data.canDelete) {
            this.fields.push({ name : "isDeleted", type : "boolean" });
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

        this.tableHeader = document.createElement("header");
        this.tableHeader.innerHTML      = this.name;
        this.tableHeader.dataset.action = "drag-table";
        this.tableHeader.dataset.table  = this.name;

        const remove = document.createElement("a");
        remove.href           = "#";
        remove.className      = "close";
        remove.dataset.action = "remove-table";
        remove.dataset.table  = this.name;
        this.tableHeader.appendChild(remove);

        this.tableList  = document.createElement("ol");
        this.tableElems = [];
        for (const field of this.fields) {
            this.addFieldElem(field);
        }

        if (this.fields.length > this.maxFields) {
            this.hiddenFields = this.fields.length - this.maxFields;

            this.tableHidden = document.createElement("li");
            this.tableHidden.className      = "schema-hidden";
            this.tableHidden.innerHTML      = this.showAll ? "Hide fields" : `+${this.hiddenFields} hidden fields`;
            this.tableHidden.dataset.action = "toggle-fields";
            this.tableHidden.dataset.table  = this.name;

            this.tableList.appendChild(this.tableHidden);
        }

        this.tableElem.appendChild(this.tableHeader);
        this.tableElem.appendChild(this.tableList);
    }

    /**
     * Adds a Table Field Elem
     * @param {Object} field
     * @returns {Void}
     */
    addFieldElem(field) {
        const li   = document.createElement("li");
        const name = document.createElement(field.isPrimary ? "b" : "span");
        const type = document.createElement("span");

        name.innerHTML = field.name;
        type.innerHTML = field.type;

        li.appendChild(name);
        li.appendChild(type);

        if (!this.showAll && this.tableElems.length >= this.maxFields) {
            li.className = "schema-hide";
        }
        this.tableList.appendChild(li);
        this.tableElems.push(li);
    }

    /**
     * Toggle the Visible Fields
     * @returns {Void}
     */
    toggleFields() {
        if (!this.showAll) {
            for (const elem of this.tableElems) {
                elem.className = "";
            }
            this.tableHidden.innerHTML = "Hide fields";
            this.showAll = true;
        } else {
            for (const [ index, elem ] of this.tableElems.entries()) {
                if (index >= this.maxFields) {
                    elem.className = "schema-hide";
                }
            }
            this.tableHidden.innerHTML = `+${this.hiddenFields} hidden fields`;
            this.showAll = false;
        }
        this.setBounds();
    }



    /**
     * Selects the Table
     * @returns {Void}
     */
    select() {
        this.tableElem.classList.remove("disabled");
        this.tableElem.classList.add("selected");
    }

    /**
     * Disables the Table
     * @returns {Void}
     */
    disable() {
        this.tableElem.classList.remove("selected");
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
     * Picks the Table
     * @returns {Void}
     */
    pick() {
        this.tableElem.classList.add("schema-dragging");
    }

    /**
     * Drops the Table
     * @returns {Void}
     */
    drop() {
        this.tableElem.classList.remove("schema-dragging");
    }

    /**
     * Sets the Table Width and Height
     * @returns {Void}
     */
    setBounds() {
        const bounds = this.tableElem.getBoundingClientRect();
        this.width  = bounds.width;
        this.height = bounds.height;
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
