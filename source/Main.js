import Canvas from "./Canvas.js";
import Schema from "./Schema.js";
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
        }
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
