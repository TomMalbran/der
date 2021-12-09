import Table from "./Table.js";



/**
 * The Group
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

        this.create();
        this.position();
    }

    /**
     * Returns a list of table names
     * @return {String[]}
     */
    get tableNames() {
        return this.tables.map((table) => table.name);
    }



    /**
     * Creates the HTML element
     * @returns {Void}
     */
    create() {
        this.element = document.createElement("div");
        this.element.className = "group";

        const name = document.createElement("div");
        name.className      = "group-name";
        name.innerHTML      = this.name;
        name.dataset.action = "select-group";
        name.dataset.group  = String(this.id);

        this.element.appendChild(name);

        const remove = document.createElement("a");
        remove.href           = "#";
        remove.className      = "close";
        remove.dataset.action = "remove-group";
        remove.dataset.group  = String(this.id);
        this.element.appendChild(remove);
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

        for (const table of this.tables) {
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

        this.element.style.transform = `translate(${this.left}px, ${this.top}px)`;
        this.element.style.width     = `${this.width}px`;
        this.element.style.height    = `${this.height}px`;
    }
}
