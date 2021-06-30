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

/** @type {Table} */
let dragTable = null;



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
        setSchema(storage.getCurrentSchema());
    }
}

/**
 * Creates the Schema and restores the Tables
 * @param {Object} data
 * @returns {Void}
 */
 function setSchema(data) {
    schema = new Schema(data);
    for (const table of Object.values(schema.tables)) {
        const data = storage.getTable(table);
        if (data) {
            table.restore(data);
            canvas.addTable(table);
        }
    }
}

/**
 * Selects a new Schema
 * @param {Number} schemaID
 * @returns {Void}
 */
function selectSchema(schemaID) {
    const data = storage.getSchema(schemaID);
    if (data) {
        selection.close();
        canvas.destroy();
        schema.destroy();
        storage.selectSchema(schemaID);
        setSchema(data);
    }
}



/**
 * The Click Event Handler
 */
document.addEventListener("click", (e) => {
    const target = Utils.getTarget(e);
    switch (target.dataset.action) {
    case "open-select":
        selection.open(storage.getSchemas());
        break;
    case "close-select":
        selection.close();
        break;
    case "select-schema":
        selectSchema(Number(target.dataset.schemaID));
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
                storage.setTable(table);
                break;
            case "remove-table":
                canvas.removeTable(table);
                storage.removeTable(table);
                break;
            case "toggle-fields":
                table.toggleFields();
                storage.setTable(table);
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

/**
 * The Pick Event Handler
 */
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

/**
 * The Drag Event Handler
 */
document.addEventListener("mousemove", (e) => {
    if (dragTable) {
        dragTable.drag(e, canvas);
        canvas.connect();
        e.preventDefault();
    }
});

/**
 * The Drop Event Handler
 */
document.addEventListener("mouseup", (e) => {
    if (dragTable) {
        dragTable.drop();
        storage.setTable(dragTable);
        canvas.connect();
        dragTable = null;
        e.preventDefault();
    }
});




// Start
main();
