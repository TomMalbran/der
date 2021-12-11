import Group  from "./Group.js";
import Dialog from "./Dialog.js";
import Table  from "./Table.js";



/**
 * The Grouper
 */
 export default class Grouper {

    /**
     * Grouper constructor
     */
    constructor() {
        this.dialog = new Dialog("group");

        /** @type {HTMLElement} */
        this.empty   = this.dialog.container.querySelector(".group-empty");
        /** @type {HTMLElement} */
        this.content = this.dialog.container.querySelector(".group-content");
        /** @type {HTMLElement} */
        this.checks  = this.dialog.container.querySelector(".group-tables");
    }

    /**
     * Opens the Dialog
     * @param {Number}  groupID
     * @param {Group?}  group
     * @param {Table[]} tables
     * @returns {Void}
     */
    openDialog(groupID, group, tables) {
        this.isEdit  = Boolean(group);
        this.groupID = this.isEdit ? group.id : groupID;

        this.dialog.setTitle(this.isEdit ? "Edit the Group" : "Create a Group");
        this.dialog.setButton(this.isEdit ? "Edit Group" : "Create Group");
        this.dialog.setInput("name", this.isEdit ? group.name : "");

        this.empty.style.display   = tables.length ? "none" : "block";
        this.content.style.display = !tables.length ? "none" : "block";

        this.inputs = [];
        this.checks.innerHTML = "";
        for (const table of tables) {
            const check = document.createElement("label");
            check.className = "checkbox-input";

            const input = document.createElement("input");
            input.type    = "checkbox";
            input.name    = table.name;
            input.value   = table.name;
            input.checked = this.isEdit ? group.contains(table) : true;
            check.appendChild(input);
            this.inputs.push(input);

            const div = document.createElement("div");
            div.innerText = table.name;
            check.appendChild(div);

            this.checks.appendChild(check);
        }
        this.dialog.open();
    }

    /**
     * Updates the Group
     * @returns {Object?}
     */
    updateGroup() {
        if (!this.dialog.isOpen) {
            return null;
        }

        const name = this.dialog.getInput("name");
        if (!name) {
            this.dialog.showError("name");
            return null;
        }

        const tables = [];
        for (const input of this.inputs) {
            if (input.checked) {
                tables.push(input.value);
            }
        }
        if (!tables.length) {
            this.dialog.showError("table");
            return null;
        }

        this.dialog.close();
        return {
            isEdit : this.isEdit,
            id     : this.groupID,
            name,
            tables,
        };
    }

    /**
     * Closes the Dialog
     * @returns {Void}
     */
    closeDialog() {
        this.dialog.close();
    }
}
