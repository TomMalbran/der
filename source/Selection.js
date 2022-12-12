import Dialog from "./Dialog.js";



/**
 * The Selection
 */
export default class Selection {

    /**
     * Selection constructor
     */
    constructor() {
        // Selecion
        this.selectDialog = new Dialog("select");
        /** @type {HTMLElement} */
        this.selectEmpty  = document.querySelector(".select-empty");
        /** @type {HTMLElement} */
        this.selectList   = document.querySelector(".select-list");

        // Add/Edit
        this.schemaDialog = new Dialog("schema");
        /** @type {NodeListOf<HTMLElement>} */
        this.fileFields   = document.querySelectorAll(".schema-file");
        /** @type {NodeListOf<HTMLElement>} */
        this.urlFields    = document.querySelectorAll(".schema-url");

        // Error
        this.errorDialog = new Dialog("error");

        // Delete
        this.deleteDialog = new Dialog("delete");
    }

    /**
     * Opens the Select Dialog
     * @param {Object[]} schemas
     * @returns {Void}
     */
    open(schemas) {
        this.selectDialog.open();
        this.selectEmpty.style.display = schemas.length ? "none" : "block";
        this.selectList.innerHTML = "";

        for (const schema of schemas) {
            const li = document.createElement("li");
            li.dataset.action = "select-schema";
            li.dataset.schema = schema.schemaID;
            if (schema.isSelected) {
                li.className = "selected";
            }

            const name = document.createElement("div");
            name.innerHTML = schema.name;
            name.className = "select-name";
            li.appendChild(name);

            const buttons = document.createElement("div");
            li.appendChild(buttons);

            const editBtn = document.createElement("button");
            editBtn.innerHTML      = "Edit";
            editBtn.className      = "btn";
            editBtn.dataset.action = "open-edit";
            editBtn.dataset.schema = schema.schemaID;
            buttons.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML      = "Delete";
            deleteBtn.className      = "btn";
            deleteBtn.dataset.action = "open-delete";
            deleteBtn.dataset.schema = schema.schemaID;
            buttons.appendChild(deleteBtn);

            this.selectList.appendChild(li);
        }
    }

    /**
     * Closes the Select Dialog
     * @returns {Void}
     */
    close() {
        this.selectDialog.close();
    }



    /**
     * Opens the Schema Dialog
     * @param {Object} data
     * @returns {Void}
     */
    openSchema(data) {
        const isEdit  = Boolean(data.schemaID);
        const useUrls = Boolean(data.useUrls);
        this.data     = data;
        this.files    = [];

        this.toggleUrls(useUrls);

        this.schemaDialog.open();
        this.schemaDialog.setTitle(isEdit ? "Edit the Schema" : "Add a Schema");
        this.schemaDialog.setButton(isEdit ? "Edit Schema" : "Add Schema");

        this.schemaDialog.setInput("urls",  useUrls);
        this.schemaDialog.setInput("name",  isEdit ? data.name : "");
        this.schemaDialog.setInput("file0", isEdit && !useUrls ? this.data.file0 : "");
        this.schemaDialog.setInput("file1", isEdit && !useUrls ? this.data.file1 : "");
        this.schemaDialog.setInput("url0",  isEdit && useUrls  ? this.data.url0  : "");
        this.schemaDialog.setInput("url1",  isEdit && useUrls  ? this.data.url1  : "");
    }

    /**
     * Closes the Add/Edit Dialog
     * @returns {Void}
     */
    closeSchema() {
        this.schemaDialog.close();
    }

    /**
     * Selects a File in the Add/Edit Dialog
     * @param {Number} index
     * @returns {Void}
     */
    selectFile(index) {
        const name = `file${index}`;
        this.schemaDialog.selectFile(name, (file) => {
            this.files[index] = file;
            this.data[name]   = file.name;
        });
    }

    /**
     * Removes a File in the Add/Edit Dialog
     * @param {Number} index
     * @returns {Void}
     */
    removeFile(index) {
        const name = `file${index}`;
        this.files[index] = null;
        this.data[name]   = "";
        this.schemaDialog.setInput(name, "");

        if (index === 1) {
            this.data.schemas.pop();
        } else {
            this.data.schemas[index] = null;
        }
    }

    /**
     * Toggles between Files and Urls in the Add/Edit Dialog
     * @returns {Void}
     */
    toggleUrls(isChecked) {
        this.useUrls = isChecked;
        this.fileFields[0].style.display = !this.useUrls ? "flex" : "none";
        this.fileFields[1].style.display = !this.useUrls ? "flex" : "none";
        this.urlFields[0].style.display  = this.useUrls  ? "flex" : "none";
        this.urlFields[1].style.display  = this.useUrls  ? "flex" : "none";
    }

    /**
     * Imports a Schema
     * @returns {Promise}
     */
    importSchema() {
        return new Promise((resolve, reject) => {
            this.data.useUrls = this.schemaDialog.getInput("urls");
            this.data.name    = this.schemaDialog.getInput("name");
            this.data.url0    = this.schemaDialog.getInput("url0");
            this.data.url1    = this.schemaDialog.getInput("url1");
            if (!this.data.schemas) {
                this.data.schemas = [];
            }

            this.schemaDialog.hideErrors();
            if (!this.data.name) {
                this.schemaDialog.showError("name");
            }
            if (!this.data.useUrls && !this.files[0]) {
                this.schemaDialog.showError("file");
            }
            if (this.data.useUrls && !this.data.url0) {
                this.schemaDialog.showError("url");
            }
            if (this.schemaDialog.hasError) {
                reject();
                return;
            }

            if (!this.data.useUrls && (this.files[0] || this.files[1])) {
                let count = 0;
                for (let i = 0; i < this.files.length; i++) {
                    if (!this.files[i]) {
                        count += 1;
                        continue;
                    }
                    const reader = new FileReader();
                    reader.readAsText(this.files[i]);
                    reader.onload = () => {
                        const text = String(reader.result);
                        try {
                            this.data.schemas[i] = JSON.parse(text);
                            count += 1;
                            if (!this.schemaDialog.hasError && count === this.files.length) {
                                this.closeSchema();
                                resolve(this.data);
                            }
                        } catch {
                            this.schemaDialog.showError(`json${i}`);
                        }
                    };
                }
            } else {
                fetch(this.data.url0).then(() => {
                    this.closeSchema();
                    resolve(this.data);
                }, () => {
                    reject();
                });
            }
        });
    }



    /**
     * Opens the Error Dialog
     * @returns {Void}
     */
    openError() {
        this.errorDialog.open();
    }

    /**
     * Closes the Error Dialog
     * @returns {Void}
     */
    closeError() {
        this.errorDialog.close();
    }



    /**
     * Opens the Delete Dialog
     * @param {Number} schemaID
     * @returns {Void}
     */
    openDelete(schemaID) {
        this.schemaID = schemaID;
        this.deleteDialog.open();
    }

    /**
     * Closes the Delete Dialog
     * @returns {Void}
     */
    closeDelete() {
        this.schemaID = 0;
        this.deleteDialog.close();
    }
}
