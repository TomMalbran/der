/**
 * The Selection
 */
export default class Selection {

    /**
     * Selection constructor
     */
    constructor() {
        this.schemaID = 0;
        this.file     = null;

        // Selecion
        /** @type {HTMLElement} */
        this.selectDialog = document.querySelector(".select-dialog");
        /** @type {HTMLElement} */
        this.selectEmpty  = document.querySelector(".select-empty");
        /** @type {HTMLElement} */
        this.selectList   = document.querySelector(".select-list");

        // Add/Edit
        /** @type {HTMLElement} */
        this.schemaDialog = document.querySelector(".schema-dialog");
        /** @type {HTMLElement} */
        this.schemaTitle  = document.querySelector(".schema-title");
        /** @type {HTMLElement} */
        this.schemaButton = document.querySelector(".schema-btn");
        /** @type {HTMLInputElement} */
        this.nameField    = document.querySelector(".schema-name");
        /** @type {HTMLInputElement} */
        this.fileField    = document.querySelector(".schema-file");

        /** @type {HTMLElement} */
        this.nameError    = document.querySelector(".schema-name-error");
        /** @type {HTMLElement} */
        this.fileError    = document.querySelector(".schema-file-error");
        /** @type {HTMLElement} */
        this.jsonError    = document.querySelector(".schema-json-error");

        // Delete
        /** @type {HTMLElement} */
        this.deleteDialog = document.querySelector(".delete-dialog");
    }

    /**
     * Opens the Select Dialog
     * @param {Object[]} schemas
     * @returns {Void}
     */
    open(schemas) {
        this.selectDialog.style.display = "block";
        this.selectEmpty.style.display  = schemas.length ? "none" : "block";

        this.selectList.innerHTML = "";
        for (const schema of schemas) {
            const li = document.createElement("li");
            li.dataset.action = "select-schema";
            li.dataset.schema = schema.id;
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
            editBtn.dataset.schema = schema.id;
            buttons.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML      = "Delete";
            deleteBtn.className      = "btn";
            deleteBtn.dataset.action = "open-delete";
            deleteBtn.dataset.schema = schema.id;
            buttons.appendChild(deleteBtn);

            this.selectList.appendChild(li);
        }
    }

    /**
     * Closes the Select Dialog
     * @returns {Void}
     */
    close() {
        this.selectDialog.style.display = "none";
    }



    /**
     * Opens the Schema Dialog
     * @param {Number} schemaID
     * @param {Object} schema
     * @returns {Void}
     */
    openSchema(schemaID, schema) {
        this.schemaID = schemaID;

        this.schemaDialog.style.display = "block";
        this.schemaTitle.innerText      = schemaID ? "Edit the Schema" : "Add a Schema";
        this.schemaButton.innerText     = schemaID ? "Edit Schema" : "Add Schema";
        this.nameField.value            = schemaID ? schema.name : "";
    }

    /**
     * Closes the Schema Dialog
     * @returns {Void}
     */
    closeSchema() {
        this.schemaID = 0;
        this.schemaDialog.style.display = "none";
    }

    /**
     * Selects a File in the Add Dialog
     * @returns {Void}
     */
    selectFile() {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = ".json";
        input.onchange = () => {
            this.file = input.files[0];
            this.fileField.innerHTML = this.file.name;
        };
        input.click();
    }

    /**
     * Imports a Schema
     * @param {Function} onDone
     * @returns {Void}
     */
    importSchema(onDone) {
        let   hasError = false;
        const name     = this.nameField.value;

        this.fileError.style.display = "none";
        this.nameError.style.display = "none";
        this.jsonError.style.display = "none";

        if (!name) {
            hasError = true;
            this.nameError.style.display = "block";
        }
        if (!this.file) {
            hasError = true;
            this.fileError.style.display = "block";
        }
        if (hasError) {
            return;
        }

        const reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = () => {
            const text = String(reader.result);
            try {
                const json = JSON.parse(text);
                onDone(this.schemaID, name, json);
            } catch {
                hasError = true;
                this.jsonError.style.display = "block";
            }

            if (!hasError) {
                this.file                = null;
                this.nameField.value     = "";
                this.fileField.innerHTML = "";
                this.closeSchema();
            }
        };
    }



    /**
     * Opens the Delete Dialog
     * @param {Number} schemaID
     * @returns {Void}
     */
    openDelete(schemaID) {
        this.schemaID = schemaID;
        this.deleteDialog.style.display = "block";
    }

    /**
     * Closes the Delete Dialog
     * @returns {Void}
     */
    closeDelete() {
        this.schemaID = 0;
        this.deleteDialog.style.display = "none";
    }
}
