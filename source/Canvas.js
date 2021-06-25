import Table from "./Table.js";



/**
 * The Canvas
 */
export default class Canvas {

    /**
     * Canvas constructor
     */
    constructor() {
        this.tables      = {};
        this.tableCount  = 0;
        this.links       = [];

        this.container   = document.querySelector("main");
        this.canvas      = document.querySelector(".canvas");

        this.bounds      = this.container.getBoundingClientRect();
        const canvBounds = this.canvas.getBoundingClientRect();
        const top        = (canvBounds.height - this.bounds.height) / 2;
        const left       = (canvBounds.width  - this.bounds.width)  / 2;

        this.container.scrollTo(left, top);
    }



    /**
     * Adds a Table to the Canvas
     * @param {Table} table
     * @returns {Void}
     */
    addTable(table) {
        table.addToCanvas();
        this.canvas.appendChild(table.tableElem);
        table.setBounds();
        table.translate({
            top  : this.container.scrollTop  + 10,
            left : this.container.scrollLeft + 10,
        });
        this.tables[table.name] = table;
        this.tableCount += 1;
    }
}
