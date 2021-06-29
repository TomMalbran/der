import Canvas from "./Canvas.js";



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

        this.top       = 10;
        this.left      = 10;
        this.maxFields = 15;
        this.showAll   = false;

        this.setFields();
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
     * @param {String} field
     * @returns {Number}
     */
    getFieldIndex(field) {
        const index = this.fields.findIndex((key) => key === field);
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

        for (const field of Object.keys(this.data.fields)) {
            this.fields.push(field);
        }
        if (this.data.hasPositions) {
            this.fields.push("position");
        }
        if (this.data.canCreate && this.data.hasTimestamps) {
            this.fields.push("createdTime");
        }
        if (this.data.canCreate && this.data.hasUsers) {
            this.fields.push("createdUser");
        }
        if (this.data.canEdit && this.data.hasTimestamps) {
            this.fields.push("modifiedTime");
        }
        if (this.data.canEdit && this.data.hasUsers) {
            this.fields.push("modifiedUser");
        }
        if (this.data.canDelete) {
            this.fields.push("isDeleted");
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
        this.listButton.innerHTML      = "Add";
        this.listButton.className      = "btn";
        this.listButton.dataset.action = "add-table";
        this.listButton.dataset.table  = this.data.table;

        this.listElem.appendChild(this.listText);
        this.listElem.appendChild(this.listButton);
    }



    /**
     * Adds a Table Element to the Canvas
     * @returns {Void}
     */
    addToCanvas() {
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
        this.listButton.style.display = "block";
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
        this.tableHeader.innerHTML      = this.name;
        this.tableHeader.dataset.action = "drag";
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
            this.tableHidden.innerHTML      = `+${this.hiddenFields} hidden fields`;
            this.tableHidden.dataset.action = "toggle-fields";
            this.tableHidden.dataset.table  = this.name;

            this.tableList.appendChild(this.tableHidden);
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

        if (this.tableElems.length >= this.maxFields) {
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
     * Picks the Table
     * @param {MouseEvent} event
     * @param {Canvas}     canvas
     * @returns {Void}
     */
    pick(event, canvas) {
        const bounds  = this.tableHeader.getBoundingClientRect();
        const pos     = { top : event.pageY, left : event.pageX };
        this.startPos = { top : pos.top - bounds.top, left : pos.left - bounds.left };
        this.move(event, canvas);
        this.tableElem.classList.add("schema-dragging");
    }

    /**
     * Drags the Table
     * @param {MouseEvent} event
     * @param {Canvas}     canvas
     * @returns {Void}
     */
    drag(event, canvas) {
        this.move(event, canvas);
    }

    /**
     * Drops the Table
     * @returns {Void}
     */
    drop() {
        this.tableElem.classList.remove("schema-dragging");
    }

    /**
     * Moves the Table
     * @param {MouseEvent} event
     * @param {Canvas}     canvas
     * @returns {Void}
     */
    move(event, canvas) {
        this.translate({
            top  : event.pageY - this.startPos.top  - canvas.bounds.top  + canvas.scroll.top,
            left : event.pageX - this.startPos.left - canvas.bounds.left + canvas.scroll.left,
        });
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
