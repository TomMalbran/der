import Selection from "./Selection.js";
import Storage   from "./Storage.js";
import Canvas    from "./Canvas.js";
import Grouper   from "./Grouper.js";
import Group     from "./Group.js";
import Schema    from "./Schema.js";
import Utils     from "./Utils.js";

// Variables
let timer     = null;

/** @type {Selection} */
let selection = null;

/** @type {Storage} */
let storage   = null;

/** @type {Canvas} */
let canvas    = null;

/** @type {Grouper} */
let grouper   = null;

/** @type {Schema} */
let schema    = null;



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

    const groups = schema.createGroups(storage.getGroups());
    storage.updateGroups(groups);

    schema.createList();
    schema.setInitialFilter(storage.getFilter());
    schema.setInitialWidth(storage.getWidth());

    for (const table of Object.values(schema.tables)) {
        const data = storage.getTable(table);
        if (data) {
            table.restore(data);
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
        schema.destroy();
        canvas.destroy();
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
 * Opens the Group Dialog
 * @param {Group?} group
 * @returns {Void}
 */
function openGroup(group) {
    if (group) {
        canvas.stopUnselect();
        grouper.openDialog(storage.nextGroup, group, canvas.selectedTables);
    }
}



/**
 * The Click Event Handler
 */
document.addEventListener("click", (e) => {
    const target     = Utils.getTarget(e);
    const action     = target.dataset.action;
    const schemaID   = Number(target.dataset.schema);
    const table      = schema ? schema.getTable(target) : null;
    const group      = schema ? schema.getGroup(target) : null;
    const specialKey = e.ctrlKey || e.metaKey || e.shiftKey;
    let   dontStop   = false;

    switch (action) {
    // Selection Actions
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

    // Schema Actions
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
        selection.importSchema().then((data) => {
            storage.setSchema(data).then(() => {
                selection.open(storage.getSchemas());
                if (schema && data && schema.schemaID === data.schemaID) {
                    selectSchema(schemaID);
                }
            });
        }, () => {
            selection.openError();
        });
        break;
    case "close-error":
        selection.closeError();
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

    // Group Actions
    case "open-group":
        canvas.stopUnselect();
        grouper.openDialog(storage.nextGroup, canvas.currentGroup, canvas.selectedTables);
        break;
    case "close-group":
        grouper.closeDialog();
        break;
    case "update-group":
        const data = grouper.updateGroup(schema.tables);
        if (data) {
            const group = schema.setGroup(data);
            canvas.addGroup(group);
            canvas.selectGroup(group);
            storage.setGroup(group);
            if (!data.isEdit) {
                storage.addGroup(group);
            }
        }
        break;
    case "open-remove":
        grouper.openRemove(group || grouper.group);
        break;
    case "close-remove":
        grouper.closeRemove();
        break;
    case "remove-group":
        if (grouper.group) {
            schema.removeGroup(grouper.group);
            canvas.removeGroup(grouper.group);
            storage.removeGroup(grouper.group.id);
            grouper.closeDialog();
            grouper.closeRemove();
        }
        break;

    // Aside Actions
    case "toggle-aside":
        schema.toggleMinimize();
        storage.setWidth(schema.width);
        break;
    case "clear-filter":
        schema.clearFilter();
        storage.removeFilter();
        break;

    // Zoom Actions
    case "zoom-in":
        const zoomIn = canvas.zoomIn();
        storage.setZoom(zoomIn);
        Utils.unselect();
        break;
    case "zoom-out":
        const zoomOut = canvas.zoomOut();
        storage.setZoom(zoomOut);
        Utils.unselect();
        break;
    case "reset-zoom":
        canvas.resetZoom();
        storage.removeZoom();
        Utils.unselect();
        break;
    default:
    }

    // Group Actions
    if (group) {
        switch (action) {
        case "expand-group":
            group.toggleExpand();
            storage.setGroup(group);
            break;
        case "show-group":
            canvas.showGroup(group);
            break;
        case "edit-group":
            openGroup(group);
            break;
        default:
        }
    }

    // Table Actions
    if (table) {
        switch (action) {
        case "expand-table":
            table.toggleExpand();
            storage.setTable(table);
            break;
        case "show-table":
            canvas.showTable(table);
            break;
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

    if (canvas.shouldUnselect(e)) {
        canvas.unselect();
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
    const group  = schema ? schema.getGroup(target) : null;

    switch (action) {
    case "resize-aside":
        schema.toggleMinimize();
        storage.setWidth(schema.width);
        break;
    case "drag-group":
        openGroup(group);
        break;
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
    const target     = Utils.getTarget(e);
    const action     = target.dataset.action;
    const specialKey = e.ctrlKey || e.metaKey || e.shiftKey;

    if (e.button !== 0) {
        return;
    }
    switch (action) {
    case "drag-table":
        const table = schema.getTable(target);
        if (table) {
            canvas.pickTable(e, table, specialKey);
            e.preventDefault();
        }
        break;
    case "drag-group":
        const group = schema.getGroup(target);
        if (group) {
            canvas.pickGroup(e, group);
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
