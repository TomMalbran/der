import Table from "./Table.js";

// Constants
const SELF_WIDTH    = 70;
const DOWN_WIDTH    = 70;
const ROW_HEIGHT    = 26;
const HEADER_HEIGHT = 33;
const ARROW_SIZE    = 10;



/**
 * The Schema Link
 */
export default class Link {

    /**
     * Link constructor
     * @param {Table}  thisTable
     * @param {String} thisField
     * @param {Table}  otherTable
     * @param {String} otherField
     */
    constructor(thisTable, thisField, otherTable, otherField) {
        this.thisTable  = thisTable;
        this.thisField  = thisField;
        this.otherTable = otherTable;
        this.otherField = otherField;

        this.create();
        this.connect();
    }

    /**
     * Creates the SVG element
     * @returns {Void}
     */
    create() {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.element.classList.add("schema-link");
        this.element.setAttribute("width", "100%");
        this.element.setAttribute("height", "100%");

        this.path  = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        this.element.appendChild(this.arrow);
        this.element.appendChild(this.path);
    }



    /**
     * Returns true if this link is from or the given Table
     * @param {Table} table
     * @returns {Boolean}
     */
    isLinkedTo(table) {
        return this.thisTable.name === table.name || this.otherTable.name === table.name;
    }

    getField(table) {
        if (this.thisTable.name === table.name) {
            return this.thisField;
        }
        return this.otherField;
    }

    /**
     * Disables the Link
     * @returns {Void}
     */
    disable() {
        this.element.classList.add("disabled");
        this.removeColor();
    }

    /**
     * Un-selects the Link
     * @returns {Void}
     */
    unselect() {
        this.element.classList.remove("disabled");
        this.removeColor();
    }

    /**
     * Sets the Link color
     * @param {Number} color
     * @returns {Void}
     */
    setColor(color) {
        this.colorClass = `color${color}`;
        this.element.classList.add(this.colorClass);
    }

    /**
     * Removes the Link color
     * @returns {Void}
     */
    removeColor() {
        if (this.colorClass) {
            this.element.classList.remove(this.colorClass);
            this.colorClass = "";
        }
    }



    /**
     * Connects the Tables
     * @returns {Void}
     */
    connect() {
        const thisPosition  = this.thisTable.getFieldIndex(this.thisField);
        const otherPosition = this.otherTable.getFieldIndex(this.otherField);

        let topTable      = null;
        let bottomTable   = null;
        let leftTable     = null;
        let rightTable    = null;
        let leftPosition  = null;
        let rightPosition = null;
        let toEnd         = false;

        if (this.thisTable.top >= this.otherTable.top) {
            topTable    = this.thisTable;
            bottomTable = this.otherTable;
        } else {
            topTable    = this.otherTable;
            bottomTable = this.thisTable;
        }

        if (this.thisTable.left <= this.otherTable.left) {
            leftTable     = this.thisTable;
            rightTable    = this.otherTable;
            leftPosition  = thisPosition;
            rightPosition = otherPosition;
            toEnd         = true;
        } else {
            leftTable     = this.otherTable;
            rightTable    = this.thisTable;
            leftPosition  = otherPosition;
            rightPosition = thisPosition;
            toEnd         = false;
        }

        const top    = Math.min(this.thisTable.top, this.otherTable.top);
        const height = Math.max(this.otherTable.bottom, this.thisTable.bottom) - top;
        const startY = leftTable.top - top + leftPosition * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;
        const endY   = rightTable.top - top + rightPosition * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;

        if (this.thisTable.name === this.otherTable.name) {
            this.connectToSelf(top, height, startY, endY);
        } else {
            if (leftTable.right + 50 > rightTable.left) {
                if (topTable.left + 10 < bottomTable.left) {
                    this.connectLeftToLeft(leftTable, rightTable, top, height, startY, endY, toEnd);
                } else if (leftTable.right + 50 > rightTable.left) {
                    this.connectRightToRight(leftTable, rightTable, top, height, startY, endY, toEnd);
                }
            } else {
                this.connectLeftToRight(leftTable, rightTable, top, height, startY, endY, toEnd);
            }
        }
    }

    /**
     * Connects to the same Table
     * @param {Number} top
     * @param {Number} height
     * @param {Number} startY
     * @param {Number} endY
     * @returns {Void}
     */
    connectToSelf(top, height, startY, endY) {
        const left   = this.thisTable.right;
        const width  = SELF_WIDTH;

        const startX = 0;
        const endX   = ARROW_SIZE;

        const BX = width * 0.05 + startX;
        const BY = startY;
        const CX = width + startX;
        const CY = startY;
        const DX = width + startX;
        const DY = endY;
        const EX = width * 0.05 + endX;
        const EY = endY;

        this.setBounds(left, top, width, height);
        this.setPath(startX, startY, BX, BY, CX, CY, DX, DY, EX, EY, endX, endY);
        this.setArrow(startX, startY, endX, endY, true, false);
    }

    /**
     * Connects to from the Left side of the left Table to the Left side of the right Table
     * @param {Table}   leftTable
     * @param {Table}   rightTable
     * @param {Number}  top
     * @param {Number}  height
     * @param {Number}  startY
     * @param {Number}  endY
     * @param {Boolean} toEnd
     * @returns {Void}
     */
    connectLeftToLeft(leftTable, rightTable, top, height, startY, endY, toEnd) {
        const left   = leftTable.left - DOWN_WIDTH;
        const width  = rightTable.left - left;

        const startX = leftTable.left - left - (!toEnd ? ARROW_SIZE : 0);
        const endX   = width - (toEnd ? ARROW_SIZE : 0);

        const BX = - DOWN_WIDTH * 0.05 + startX;
        const BY = startY;
        const CX = - DOWN_WIDTH + startX;
        const CY = startY;
        const DX = - DOWN_WIDTH + startX;
        const DY = endY;
        const EX = - DOWN_WIDTH * 0.05 + endX;
        const EY = endY;

        this.setBounds(left, top, width, height);
        this.setPath(startX, startY, BX, BY, CX, CY, DX, DY, EX, EY, endX, endY);
        this.setArrow(startX, startY, endX, endY, toEnd, true);
    }

    /**
     * Connects to from the Right side of the left Table to the Right side of the right Table
     * @param {Table}   leftTable
     * @param {Table}   rightTable
     * @param {Number}  top
     * @param {Number}  height
     * @param {Number}  startY
     * @param {Number}  endY
     * @param {Boolean} toEnd
     * @returns {Void}
     */
    connectRightToRight(leftTable, rightTable, top, height, startY, endY, toEnd) {
        const left   = Math.min(leftTable.right, rightTable.right);
        const width  = Math.abs(leftTable.right - rightTable.right) + DOWN_WIDTH;

        const startX = leftTable.right - left + (!toEnd ? ARROW_SIZE : 0);
        const endX   = rightTable.right - left + (toEnd ? ARROW_SIZE : 0);

        const BX = DOWN_WIDTH * 0.05 + startX;
        const BY = startY;
        const CX = DOWN_WIDTH + endX;
        const CY = startY;
        const DX = DOWN_WIDTH + endX;
        const DY = endY;
        const EX = DOWN_WIDTH * 0.05 + endX;
        const EY = endY;

        this.setBounds(left, top, width, height);
        this.setPath(startX, startY, BX, BY, CX, CY, DX, DY, EX, EY, endX, endY);
        this.setArrow(startX, startY, endX, endY, toEnd, false);
    }

    /**
     * Connects to from the Right side of the left Table to the Left side of the right Table
     * @param {Table}   leftTable
     * @param {Table}   rightTable
     * @param {Number}  top
     * @param {Number}  height
     * @param {Number}  startY
     * @param {Number}  endY
     * @param {Boolean} toEnd
     * @returns {Void}
     */
    connectLeftToRight(leftTable, rightTable, top, height, startY, endY, toEnd) {
        const left   = leftTable.right;
        const width  = rightTable.left - left;

        const startX = !toEnd ? ARROW_SIZE : 0;
        const endX   = width - (toEnd ? ARROW_SIZE : 0);

        const BX = width * 0.05 + startX;
        const BY = startY;
        const CX = width * 0.66 + startX;
        const CY = startY;
        const DX = width * 0.33 + startX;
        const DY = endY;
        const EX = width * -0.05 + endX;
        const EY = endY;

        this.setBounds(left, top, width, height);
        this.setPath(startX, startY, BX, BY, CX, CY, DX, DY, EX, EY, endX, endY);
        this.setArrow(startX, startY, endX, endY, toEnd, toEnd);
    }



    /**
     * Set the Bounds
     * @param {Number} left
     * @param {Number} top
     * @param {Number} width
     * @param {Number} height
     * @returns {Void}
     */
    setBounds(left, top, width, height) {
        if (this.left === left && this.top === top && this.width === width && this.height === height) {
            return;
        }

        this.left   = left;
        this.top    = top;
        this.width  = width;
        this.height = height;

        this.element.style.transform = `translate(${this.left}px, ${this.top}px)`;
        this.element.style.width     = `${this.width}px`;
        this.element.style.height    = `${this.height}px`;
    }

    /**
     * Sets the Path
     * @param {Number} startX
     * @param {Number} startY
     * @param {Number} BX
     * @param {Number} BY
     * @param {Number} CX
     * @param {Number} CY
     * @param {Number} DX
     * @param {Number} DY
     * @param {Number} EX
     * @param {Number} EY
     * @param {Number} endX
     * @param {Number} endY
     * @returns {Void}
     */
    setPath(startX, startY, BX, BY, CX, CY, DX, DY, EX, EY, endX, endY) {
        const path = `M${startX},${startY} L${BX},${BY} C${CX},${CY} ${DX},${DY} ${EX},${EY} L${endX},${endY}`;
        this.path.setAttribute("d", path);
    }

    /**
     * Sets the Arraw
     * @param {Number}  startX
     * @param {Number}  startY
     * @param {Number}  endX
     * @param {Number}  endY
     * @param {Boolean} toEnd
     * @param {Boolean} toRight
     * @returns {Void}
     */
    setArrow(startX, startY, endX, endY, toEnd, toRight) {
        const AX     = toEnd ? endX : startX;
        const AY     = toEnd ? endY : startY;
        const width  = toRight ? ARROW_SIZE : -ARROW_SIZE;
        const half   = ARROW_SIZE / 2;
        const points = `${AX} ${AY - half}, ${AX + width} ${AY}, ${AX} ${AY + half}`;
        this.arrow.setAttribute("points", points);
    }
}
