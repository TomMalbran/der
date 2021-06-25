/**
 * The Schema Table
 */
export default class Table {

    /**
     * Schema Table constructor
     * @param {Object} data
     */
    constructor(data) {
        this.data        = data;
        this.totalFields = Object.keys(data.fields).length;

        this.top         = 10;
        this.left        = 10;

        this.createListElem();
    }

    /**
     * Returns the Table Name
     * @returns {String}
     */
    get name() {
        return this.data.table;
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
        this.listButton.innerHTML      = "Add";
        this.listButton.dataset.action = "add";
        this.listButton.dataset.table  = this.data.table;

        this.listElem.appendChild(this.listText);
        this.listElem.appendChild(this.listButton);
    }



    /**
     * Adds a Table Element to the Content
     * @returns {Void}
     */
    addToCanvas() {
        this.listButton.style.display = "none";

        if (!this.tableElem) {
            this.createTableElem();
        }
    }

    /**
     * Creates the Table element
     * @returns {Void}
     */
    createTableElem() {
        this.tableElem = document.createElement("div");
        this.tableElem.className       = "schema-table";
        this.tableElem.style.transform = `translate(${this.left}px, ${this.top}px)`;

        this.tableHeader = document.createElement("header");
        this.tableHeader.innerHTML = this.data.table;

        this.tableList  = document.createElement("ol");
        this.tableElems = [];
        for (const field of Object.keys(this.data.fields)) {
            this.addFieldElem(field);
        }
        if (this.data.hasPositions) {
            this.addFieldElem("position");
        }
        if (this.data.canCreate && this.data.hasTimestamps) {
            this.addFieldElem("createdTime");
        }
        if (this.data.canCreate && this.data.hasUsers) {
            this.addFieldElem("createdUser");
        }
        if (this.data.canEdit && this.data.hasTimestamps) {
            this.addFieldElem("modifiedTime");
        }
        if (this.data.canEdit && this.data.hasUsers) {
            this.addFieldElem("modifiedUser");
        }
        if (this.data.canDelete) {
            this.addFieldElem("isDeleted");
        }

        this.tableElem.appendChild(this.tableHeader);
        this.tableElem.appendChild(this.tableList);
    }

    /**
     * Adds a Table Field Elem
     * @param {String} field
     * @returns {Void}
     */
    addFieldElem(field) {
        const li = document.createElement("li");
        li.innerHTML = field;

        this.tableList.appendChild(li);
        this.tableElems.push(li);
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
        this.top    = pos.top;
        this.left   = pos.left;
        this.right  = this.left + this.width;
        this.bottom = this.top  + this.height;
        this.tableElem.style.transform = `translate(${this.left}px, ${this.top}px)`;
    }
}
