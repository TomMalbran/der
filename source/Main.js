import Selection from "./Selection.js";
import Storage   from "./Storage.js";
import Canvas    from "./Canvas.js";
import Schema    from "./Schema.js";
import Table     from "./Table.js";
import Utils     from "./Utils.js";

// Variables
let selection = null;
let storage   = null;
let canvas    = null;
let schema    = null;



/**
 * The main Function
 * @returns {Void}
 */
function main() {
    selection = new Selection();
    storage   = new Storage();
    canvas    = new Canvas();

    if (!storage.hasSchema) {
        selection.open(storage.getSchemas());
    } else {
        schema = new Schema(storage.getCurrentSchema());
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
        switch (target.dataset.action) {
        case "open-select":
            selection.open(storage.getSchemas());
            break;
        case "close-select":
            selection.close();
            break;
        case "open-schema":
            selection.openSchema();
            break;
        case "close-schema":
            selection.closeSchema();
            break;
        case "schema-file":
            selection.selectFile();
            break;
        case "import-schema":
            selection.importSchema((name, data) => {
                storage.saveSchema(name, data);
                selection.open(storage.getSchemas());
                schema = new Schema(data);
            });
            break;
        default:
        }

        if (schema) {
            const table = schema.getTable(target);
            if (table) {
                switch (target.dataset.action) {
                case "add-table":
                    canvas.addTable(table);
                    break;
                case "remove-table":
                    canvas.removeTable(table);
                    break;
                case "toggle-fields":
                    table.toggleFields();
                    canvas.connect();
                    break;
                default:
                }
            }
        }

        if (target.dataset.action) {
            e.preventDefault();
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
            e.preventDefault();
        }
    });
    document.addEventListener("mousemove", (e) => {
        if (dragTable) {
            dragTable.drag(e, canvas);
            canvas.connect();
            e.preventDefault();
        }
    });
    document.addEventListener("mouseup", (e) => {
        if (dragTable) {
            dragTable.drop();
            canvas.connect();
            dragTable = null;
            e.preventDefault();
        }
    });
}




// Start
main();
