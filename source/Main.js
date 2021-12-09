import Selection from "./Selection.js";
import Storage   from "./Storage.js";
import Canvas    from "./Canvas.js";
import Grouper   from "./Grouper.js";
import Schema    from "./Schema.js";
import Utils     from "./Utils.js";

// Variables
let selection = null;
let storage   = null;
let canvas    = null;
let grouper   = null;
let schema    = null;
let timer     = null;



/**
 * The main Function
 * @returns {Promise}
 */
async function main() {
    selection = new Selection();
    storage   = new Storage();
    canvas    = new Canvas();
    grouper   = new Grouper();

    if (!storage.hasSchema) {
        selection.open(storage.getSchemas());
    } else {
        const data = await storage.getSchema();
        setSchema(data);
    }
}

/**
 * Creates the Schema and restores the Tables
 * @param {Object} data
 * @returns {Void}
 */
function setSchema(data) {
    canvas.setInitialZoom(100);

    schema = new Schema(data);
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

    canvas.setInitialZoom(storage.getZoom());
    canvas.setInitialScroll(storage.getScroll());
}

/**
 * Selects the given Schema
 * @param {Number} schemaID
 * @returns {Promise}
 */
async function selectSchema(schemaID) {
    const data = await storage.getSchema(schemaID);
    if (!data) {
        return false;
    }
    if (schema) {
        canvas.destroy();
        schema.destroy();
    }
    storage.selectSchema(schemaID);
    setSchema(data);
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
    const target     = Utils.getTarget(e);
    const action     = target.dataset.action;
    const schemaID   = Number(target.dataset.schema);
    const specialKey = e.ctrlKey || e.metaKey || e.shiftKey;
    let   dontStop   = false;

    switch (action) {
    // Selection Dialog
    case "open-select":
        selection.open(storage.getSchemas());
        break;
    case "close-select":
        selection.close();
        break;
    case "select-schema":
        selectSchema(schemaID);
        selection.close();
        break;

    // Schema Dialog
    case "open-add":
        selection.openSchema({});
        break;
    case "open-edit":
        const schemaData = storage.getSchemaData(schemaID);
        if (schemaData) {
            selection.openSchema(schemaData);
        }
        break;
    case "close-schema":
        selection.closeSchema();
        break;
    case "upload-main-file":
        selection.selectFile(0);
        break;
    case "upload-sec-file":
        selection.selectFile(1);
        break;
    case "remove-main-file":
        selection.removeFile(0);
        break;
    case "remove-sec-file":
        selection.removeFile(1);
        break;
    case "schema-urls":
        // @ts-ignore
        selection.toggleUrls(target.checked);
        dontStop = true;
        break;
    case "import-schema":
        selection.importSchema((data) => {
            storage.setSchema(data);
            selection.open(storage.getSchemas());
            if (schema && data && schema.schemaID === data.schemaID) {
                selectSchema(schemaID);
            }
        });
        break;

    // Delete Dialog
    case "open-delete":
        selection.openDelete(schemaID);
        break;
    case "close-delete":
        selection.closeDelete();
        break;
    case "delete-schema":
        deleteSchema(selection.schemaID);
        break;

    // Aside
    case "toggle-aside":
        schema.toggleMinimize();
        storage.setWidth(schema.width);
        break;
    case "clear-filter":
        schema.clearFilter();
        storage.removeFilter();
        break;

    // Zoom
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

    // Groups
    case "open-group":
        canvas.stopUnselect();
        if (canvas.hasSelection) {
            grouper.openDialog(false);
        }
        break;
    case "manage-group":
        const group = grouper.createGroup(storage.nextGroup, canvas.selectedTables);
        if (group) {
            canvas.addGroup(group);
        }
        break;
    case "close-group":
        grouper.closeDialog();
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
                Utils.unselect();
                canvas.selectTable(table, specialKey);
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
                canvas.selectTable(table, specialKey);
                storage.setTable(table);
                break;
            default:
            }
        }
    }

    if (canvas.shouldUnselect(e)) {
        canvas.unselectTables();
    }
    if (action && !dontStop) {
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
    default:
        // @ts-ignore
        if (e.target.classList.contains("canvas")) {
            canvas.pickSelector(e);
            e.preventDefault();
        }
    }
});

/**
 * The Context Menu Event Handler
 */
document.addEventListener("contextmenu", (e) => {
    // @ts-ignore
    if (e.target.classList.contains("canvas")) {
        canvas.pickScroll(e);
        e.preventDefault();
    }
});

/**
 * The Drag Event Handler
 */
document.addEventListener("mousemove", (e) => {
    if (canvas) {
        if (canvas.dragScroll(e)) {
            e.preventDefault();
        } else if (canvas.dragSelector(e)) {
            e.preventDefault();
        } else if (canvas.dragTable(e)) {
            e.preventDefault();
        }
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
        if (canvas.dropScroll()) {
            e.preventDefault();
        } else if (canvas.dropSelector(e)) {
            e.preventDefault();
        } else if (canvas.dropTable()) {
            for (const selectedTable of canvas.selectedTables) {
                storage.setTable(selectedTable);
            }
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
