import Dialog from "./Dialog.js";



/**
 * The Selection
 */
export default class Selection {

    /** @type {Dialog} */
    #selectDialog;
    /** @type {HTMLElement} */
    #selectEmpty;
    /** @type {HTMLElement} */
    #selectList;

    /** @type {Dialog} */
    #schemaDialog;
    /** @type {HTMLElement} */
    #fileField;
    /** @type {HTMLElement} */
    #urlField;

    /** @type {Dialog} */
    #deleteDialog;


    /**
     * Selection constructor
     */
    constructor() {
        // Selection
        this.#selectDialog = new Dialog("select");
        this.#selectEmpty  = document.querySelector(".select-empty");
        this.#selectList   = document.querySelector(".select-list");

        // Add/Edit
        this.#schemaDialog = new Dialog("schema");
        this.#fileField    = document.querySelector(".schema-file");
        this.#urlField     = document.querySelector(".schema-url");

        // Delete
        this.#deleteDialog = new Dialog("delete");
    }

    /**
     * Opens the Select Dialog
     * @param {Object[]} schemas
     * @returns {Void}
     */
    open(schemas) {
        this.#selectDialog.open();
        this.#selectEmpty.style.display = schemas.length ? "none" : "block";
        this.#selectList.innerHTML = "";

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

            this.#selectList.appendChild(li);
        }
    }

    /**
     * Closes the Select Dialog
     * @returns {Void}
     */
    close() {
        this.#selectDialog.close();
    }



    /**
     * Opens the Schema Dialog
     * @param {Object} data
     * @returns {Void}
     */
    openEdit(data) {
        const isEdit  = Boolean(data.schemaID);
        const useUrl  = Boolean(data.useUrl);
        this.schemaID = data.schemaID || 0;
        this.data     = data;
        this.file     = null;

        this.toggleUrls(useUrl);

        this.#schemaDialog.open();
        this.#schemaDialog.setTitle(isEdit ? "Edit the Schema" : "Add a Schema");
        this.#schemaDialog.setButton(isEdit ? "Edit" : "Add");

        this.#schemaDialog.setInput("url",      useUrl);
        this.#schemaDialog.setInput("name",     isEdit ? data.name : "");
        this.#schemaDialog.setInput("file",     isEdit && !useUrl ? data.file || "" : "");
        this.#schemaDialog.setInput("url",      isEdit && useUrl  ? data.url  || "" : "");
        this.#schemaDialog.setInput("position", isEdit ? data.position : "");
    }

    /**
     * Closes the Add/Edit Dialog
     * @returns {Void}
     */
    closeEdit() {
        this.#schemaDialog.close();
    }

    /**
     * Selects a File in the Add/Edit Dialog
     * @returns {Void}
     */
    selectFile() {
        this.#schemaDialog.selectFile("file", (file) => {
            this.file      = file;
            this.data.file = file.name;
        });
    }

    /**
     * Removes a File in the Add/Edit Dialog
     * @returns {Void}
     */
    removeFile() {
        this.file        = null;
        this.data.file   = "";
        this.data.schema = null;
        this.#schemaDialog.setInput("file", "");
    }

    /**
     * Toggles between Files and Urls in the Add/Edit Dialog
     * @returns {Void}
     */
    toggleUrls(isChecked) {
        this.useUrl = isChecked;
        this.#fileField.style.display = !this.useUrl ? "flex" : "none";
        this.#urlField.style.display  = this.useUrl  ? "flex" : "none";
    }

    /**
     * Edit/Add a Schema
     * @returns {Promise}
     */
    editSchema() {
        return new Promise((resolve) => {
            const isEdit = Boolean(this.schemaID);
            this.data.useUrl  = this.#schemaDialog.getInput("url");
            this.data.name     = this.#schemaDialog.getInput("name");
            this.data.url      = this.#schemaDialog.getInput("url");
            this.data.position = this.#schemaDialog.getInput("position");

            if (!this.data.schemas) {
                this.data.schemas = [];
            }

            this.#schemaDialog.hideErrors();
            if (!this.data.name) {
                this.#schemaDialog.showError("name");
            }
            if (!isEdit && !this.data.useUrl && !this.file) {
                this.#schemaDialog.showError("file");
            }
            if (this.data.useUrl && !this.data.url) {
                this.#schemaDialog.showError("url");
            }
            if (this.#schemaDialog.hasError) {
                resolve();
                return null;
            }

            if (!this.data.useUrl && this.file) {
                const reader = new FileReader();
                reader.readAsText(this.file);
                reader.onload = () => {
                    const text = String(reader.result);
                    try {
                        this.data.schema = JSON.parse(text);
                        if (!this.#schemaDialog.hasError) {
                            resolve(this.data);
                        }
                    } catch {
                        this.#schemaDialog.showError("json");
                    }
                };
            } else if (this.data.useUrl) {
                fetch(this.data.url).then(() => {
                    resolve(this.data);
                }, () => {
                    resolve();
                });
            } else {
                resolve(this.data);
            }
        });
    }



    /**
     * Opens the Delete Dialog
     * @param {Number} schemaID
     * @returns {Void}
     */
    openDelete(schemaID) {
        this.schemaID = schemaID;
        this.#deleteDialog.open();
    }

    /**
     * Closes the Delete Dialog
     * @returns {Void}
     */
    closeDelete() {
        this.schemaID = 0;
        this.#deleteDialog.close();
    }
}
