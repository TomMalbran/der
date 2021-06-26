import Canvas from "./Canvas.js";
import Schema from "./Schema.js";
import Table  from "./Table.js";
import Utils  from "./Utils.js";

// Variables
let canvas = null;
let schema = null;



/**
 * The main Function
 * @returns {Void}
 */
function main() {
    canvas = new Canvas();

    const data = localStorage.getItem("schema");
    if (data) {
        schema = new Schema(JSON.parse(data));
    }

    initDomListeners();
}

/**
 * Initializes the Event Handlers
 * @returns {Void}
 */
function initDomListeners() {
    document.addEventListener("click", (e) => {
        const target = Utils.getTarget(e);
        const table  = schema.getTable(target);
        switch (target.dataset.action) {
        case "open":
            importSchema();
            break;
        case "add":
            if (table) {
                canvas.addTable(table);
            }
            break;
        case "remove":
            if (table) {
                canvas.removeTable(table);
            }
            break;
        case "hidden":
            if (table) {
                table.toggleFields();
                canvas.connect();
                break;
            }
        }
    });

    /** @type {Table} */
    let dragTable = null;
    document.body.addEventListener("mousedown", (e) => {
        const target = Utils.getTarget(e);
        if (e.button === 0 && !dragTable && target.dataset.action === "drag") {
            dragTable = schema.getTable(target);
            if (dragTable) {
                dragTable.pick(e, canvas);
            }
        }
        e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
        if (dragTable) {
            dragTable.drag(e, canvas);
            canvas.connect();
        }
        e.preventDefault();
    });
    document.addEventListener("mouseup", (e) => {
        if (dragTable) {
            dragTable.drop();
            canvas.connect();
            dragTable = null;
        }
        e.preventDefault();
    });
}

/**
 * Imports a Schema
 * @returns {Void}
 */
function importSchema() {
    const input    = document.createElement("input");
    input.type     = "file";
    input.accept   = ".json";
    input.onchange = () => {
        const file   = input.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            const text = String(reader.result);
            localStorage.setItem("schema", text);
            schema = new Schema(JSON.parse(text));
        };
    };
    input.click();
}



// Start
main();
