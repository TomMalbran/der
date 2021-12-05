import Selection from "./Selection.js";
import Storage   from "./Storage.js";
import Canvas    from "./Canvas.js";
import Schema    from "./Schema.js";
import Utils     from "./Utils.js";

// Variables
let selection = null;
let storage   = null;
let canvas    = null;
let schema    = null;
let timer     = null;



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
        setSchema(storage.currentID, storage.getCurrentSchema());
    }
}

/**
 * Creates the Schema and restores the Tables
 * @param {Number} schemaID
 * @param {Object} data
 * @returns {Void}
 */
function setSchema(schemaID, data) {
    canvas.setInitialZoom(100);

    schema = new Schema(schemaID, data);
    schema.setInitialFilter(storage.getFilter());
    schema.setInitialWidth(storage.getWidth());

    for (const table of Object.values(schema.tables)) {
        const data = storage.getTable(table);
        if (data) {
            table.restore(data);
        }
        if (table.isExpanded) {
            table.restoreExpanded();
        }
        if (table.onCanvas) {
            canvas.addTable(table);
        }
    }

    canvas.setInitialScroll(storage.getScroll());
    canvas.setInitialZoom(storage.getZoom());
}

/**
 * Selects the given Schema
 * @param {Number} schemaID
 * @returns {Boolean}
 */
function selectSchema(schemaID) {
    const data = storage.getSchema(schemaID);
    if (!data) {
        return false;
    }
    if (schema) {
        canvas.destroy();
        schema.destroy();
    }
    storage.selectSchema(schemaID);
    setSchema(schemaID, data);
    return true;
}

/**
 * Deletes the given Schema
 * @param {Number} schemaID
 * @returns {Void}
 */
function deleteSchema(schemaID) {
    if (schema.schemaID === schemaID) {
        canvas.destroy();
        schema.destroy();
    }
    storage.removeSchema(schemaID);
    selection.closeDelete();
    selection.open(storage.getSchemas());
}



/**
 * The Click Event Handler
 */
document.addEventListener("click", (e) => {
    const target   = Utils.getTarget(e);
    const action   = target.dataset.action;
    const schemaID = Number(target.dataset.schema);
    canvas.unselectTable();

    switch (action) {
    case "open-select":
        selection.open(storage.getSchemas());
        break;
    case "close-select":
        selection.close();
        break;
    case "select-schema":
        if (selectSchema(schemaID)) {
            selection.close();
        }
        break;

    case "open-add":
        selection.openSchema();
        break;
    case "open-edit":
        const schemaData = storage.getSchemaData(schemaID);
        if (schemaData) {
            selection.openSchema(schemaID, schemaData);
        }
        break;
    case "close-schema":
        selection.closeSchema();
        break;
    case "main-file":
        selection.selectFile(0);
        break;
    case "secondary-file":
        selection.selectFile(1);
        break;
    case "import-schema":
        selection.importSchema((schemaID, name, data) => {
            storage.setSchema(schemaID, name, data);
            selection.open(storage.getSchemas());
            if (schema && schema.schemaID === schemaID) {
                selectSchema(schemaID);
            }
        });
        break;

    case "open-delete":
        selection.openDelete(schemaID);
        break;
    case "close-delete":
        selection.closeDelete();
        break;
    case "delete-schema":
        deleteSchema(selection.schemaID);
        break;

    case "toggle-aside":
        schema.toggleMinimize();
        storage.setWidth(schema.width);
        break;
    case "clear-filter":
        schema.clearFilter();
        storage.removeFilter();
        break;
    case "zoom-in":
        const zoomIn = canvas.zoomIn();
        storage.setZoom(zoomIn);
        break;
    case "zoom-out":
        const zoomOut = canvas.zoomOut();
        storage.setZoom(zoomOut);
        break;
    case "reset-zoom":
        canvas.resetZoom();
        storage.removeZoom();
        break;
    default:
    }

    if (schema) {
        const table = schema.getTable(target);
        if (table) {
            switch (action) {
            case "expand-table":
                table.toggleExpand();
                storage.setTable(table);
                break;
            case "show-table":
                canvas.showTable(table);
                break;
            case "drag-table":
            case "select-table":
                canvas.selectTable(table);
                break;
            case "add-table":
                canvas.addTable(table);
                canvas.selectTable(table);
                storage.setTable(table);
                break;
            case "remove-table":
                canvas.removeTable(table);
                table.destroy();
                storage.setTable(table);
                break;
            case "toggle-fields":
                table.toggleFields();
                canvas.reconnect(table);
                canvas.selectTable(table);
                storage.setTable(table);
                break;
            default:
            }
        }
    }

    if (action) {
        e.preventDefault();
    }
});

/**
 * The Double Click Event Handler
 */
document.addEventListener("dblclick", (e) => {
    const target = Utils.getTarget(e);
    const action = target.dataset.action;

    if (action === "resize-aside") {
        schema.toggleMinimize();
        storage.setWidth(schema.width);
    }
});

/**
 * The Filter Event Handler
 */
document.querySelector(".schema-filter input").addEventListener("input", () => {
    const value = schema.filterList();
    storage.setFilter(value);
});

/**
 * The Scroll Event Handler
 */
document.querySelector("main").addEventListener("scroll", () => {
    if (timer) {
        window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
        storage.setScroll(canvas.scroll);
    }, 500);
});

/**
 * The Pick Event Handler
 */
document.addEventListener("mousedown", (e) => {
    const target = Utils.getTarget(e);
    const action = target.dataset.action;

    if (e.button !== 0) {
        return;
    }
    switch (action) {
    case "drag-table":
        if (!canvas.currTable) {
            const table = schema.getTable(target);
            if (table) {
                canvas.pickTable(e, table);
            }
            e.preventDefault();
        }
        break;
    case "resize-aside":
        schema.pickResizer(e);
        e.preventDefault();
        break;
    }
});

/**
 * The Drag Event Handler
 */
document.addEventListener("mousemove", (e) => {
    if (canvas && canvas.dragTable(e)) {
        e.preventDefault();
    }
    if (schema && schema.dragResizer(e)) {
        e.preventDefault();
    }
});

/**
 * The Drop Event Handler
 */
document.addEventListener("mouseup", (e) => {
    if (canvas) {
        const table = canvas.dropTable();
        if (table) {
            storage.setTable(table);
            e.preventDefault();
        }
    }
    if (schema && schema.dropResizer()) {
        storage.setWidth(schema.width);
        e.preventDefault();
    }
});




// Start
main();
