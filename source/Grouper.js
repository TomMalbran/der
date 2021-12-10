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
    }

    /**
     * Opens the Dialog
     * @param {Boolean} isEdit
     * @returns {Void}
     */
    openDialog(isEdit) {
        this.dialog.setTitle(isEdit ? "Edit the Group" : "Create a Group");
        this.dialog.setButton(isEdit ? "Edit Group" : "Create Group");
        this.dialog.setInput("name", "");
        this.dialog.open();
    }

    /**
     * Creates a Group
     * @param {Number}  groupID
     * @param {Table[]} tables
     * @returns {Group?}
     */
    createGroup(groupID, tables) {
        if (!this.dialog.isOpen) {
            return null;
        }
        const name = this.dialog.getInput("name");
        if (!name) {
            this.dialog.showError("name");
            return null;
        }
        const group = new Group(groupID, String(name), tables);
        this.dialog.close();
        return group;
    }

    /**
     * Closes the Dialog
     * @returns {Void}
     */
    closeDialog() {
        this.dialog.close();
    }
}
