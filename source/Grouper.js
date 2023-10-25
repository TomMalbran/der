import Group  from "./Group.js";
import Dialog from "./Dialog.js";
import Table  from "./Table.js";



/**
 * The Grouper
 */
 export default class Grouper {

    /** @type {HTMLElement} */
    #empty;
    /** @type {HTMLElement} */
    #content;
    /** @type {HTMLElement} */
    #checks;

    /** @type {Dialog} */
    #removeDialog;


    /**
     * Grouper constructor
     */
    constructor() {
        this.group        = null;
        this.groupDialog  = new Dialog("group");

        this.#empty        = this.groupDialog.getElement(".group-empty");
        this.#content      = this.groupDialog.getElement(".group-content");
        this.#checks       = this.groupDialog.getElement(".group-tables");

        // Remove
        this.#removeDialog = new Dialog("remove");
    }

    /**
     * Opens the Dialog
     * @param {Number}  groupID
     * @param {Group?}  group
     * @param {Table[]} selectedTables
     * @returns {Void}
     */
    openDialog(groupID, group, selectedTables) {
        this.isEdit  = Boolean(group);
        this.group   = this.isEdit ? group    : null;
        this.groupID = this.isEdit ? group.id : groupID;

        this.groupDialog.setTitle(this.isEdit ? "Edit the Group" : "Create a Group");
        this.groupDialog.setButton(this.isEdit ? "Edit Group" : "Create Group");
        this.groupDialog.setInput("name", this.isEdit ? group.name : "");

        const showEmpty = !this.isEdit && !selectedTables.length;
        this.#empty.style.display   = showEmpty  ? "block" : "none";
        this.#content.style.display = !showEmpty ? "block" : "none";

        const tables = {};
        this.inputs  = [];
        this.#checks.innerHTML = "";
        if (this.isEdit) {
            for (const table of group.tables) {
                this.createCheckbox(table.name, true);
                tables[table.name] = true;
            }
        }
        for (const table of selectedTables) {
            if (!tables[table.name]) {
                this.createCheckbox(table.name, !this.isEdit);
            }
        }

        this.groupDialog.open();
    }

    /**
     * Creates a Checkbox Input
     * @param {String}  name
     * @param {Boolean} isChecked
     * @returns {Void}
     */
    createCheckbox(name, isChecked) {
        const check = document.createElement("label");
        check.className = "checkbox-input";

        const input = document.createElement("input");
        input.type    = "checkbox";
        input.name    = name;
        input.value   = name;
        input.checked = isChecked;
        check.appendChild(input);
        this.inputs.push(input);

        const div = document.createElement("div");
        div.innerText = name;
        check.appendChild(div);
        this.#checks.appendChild(check);
    }

    /**
     * Updates the Group
     * @param {Object.<String, Table>} tables
     * @returns {Object?}
     */
    updateGroup(tables) {
        if (!this.groupDialog.isOpen) {
            return null;
        }

        const name = this.groupDialog.getInput("name");
        if (!name) {
            this.groupDialog.showError("name");
            return null;
        }

        const tableNames  = [];
        const tableErrors = [];
        for (const input of this.inputs) {
            if (input.checked && tables[input.value]) {
                const table = tables[input.value];
                if (table.group && table.group.id !== this.groupID) {
                    tableErrors.push(table.name);
                } else {
                    tableNames.push(table.name);
                }
            }
        }
        if (tableErrors.length) {
            const message = tableErrors.length === 1 ? `The table '${tableErrors[0]}' is in another group.` : `The tables '${tableErrors.join("' , '")}' are in another group.`;
            this.groupDialog.showError("repeated", message);
            return null;
        } else if (!tableNames.length) {
            this.groupDialog.showError("table");
            return null;
        }

        this.groupDialog.close();
        return {
            name,
            isEdit : this.isEdit,
            id     : this.groupID,
            tables : tableNames,
        };
    }

    /**
     * Closes the Dialog
     * @returns {Void}
     */
    closeDialog() {
        this.group = null;
        this.groupDialog.close();
    }



    /**
     * Opens the Remove Dialog
     * @param {Group} group
     * @returns {Void}
     */
    openRemove(group) {
        if (group) {
            this.group = group;
            this.#removeDialog.open();
        }
    }

    /**
     * Closes the Remove Dialog
     * @returns {Void}
     */
    closeRemove() {
        this.group = null;
        this.#removeDialog.close();
    }
}
