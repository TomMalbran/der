/**
 * The Selection
 */
export default class Selection {

    /**
     * Selection constructor
     */
    constructor() {
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
        /** @type {NodeListOf<HTMLElement>} */
        this.fileFields   = document.querySelectorAll(".schema-file");

        /** @type {HTMLElement} */
        this.nameError    = document.querySelector(".schema-name-error");
        /** @type {NodeListOf<HTMLElement>} */
        this.fileErrors   = document.querySelectorAll(".schema-file-error");
        /** @type {NodeListOf<HTMLElement>} */
        this.jsonErrors   = document.querySelectorAll(".schema-json-error");

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
        this.files    = [];
        this.schemas  = [];

        this.hideErrors();
        this.schemaDialog.style.display = "block";
        this.schemaTitle.innerText      = schemaID ? "Edit the Schema" : "Add a Schema";
        this.schemaButton.innerText     = schemaID ? "Edit Schema"     : "Add Schema";
        this.nameField.value            = schemaID ? schema.name       : "";
        this.fileFields[0].innerHTML    = "";
        this.fileFields[1].innerHTML    = "";
    }

    /**
     * Closes the Schema Dialog
     * @returns {Void}
     */
    closeSchema() {
        this.schemaDialog.style.display = "none";
        this.hideErrors();
    }

    /**
     * Selects a File in the Add Dialog
     * @param {Number} index
     * @returns {Void}
     */
    selectFile(index) {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = ".json";
        input.onchange = () => {
            this.files[index]                = input.files[0];
            this.fileFields[index].innerHTML = this.files[index].name;
        };
        input.click();
    }

    /**
     * Imports a Schema
     * @param {Function} onDone
     * @returns {Void}
     */
    importSchema(onDone) {
        const isEdit   = this.schemaID;
        const name     = this.nameField.value;
        let   hasError = false;
        let   count    = 0;

        this.hideErrors();
        if (!name) {
            hasError = true;
            this.nameError.style.display = "block";
        }
        if (!isEdit && !this.files[0]) {
            hasError = true;
            this.fileErrors[0].style.display = "block";
        }
        if (hasError) {
            return;
        }

        if (this.files[0]) {
            for (let i = 0; i < this.files.length; i++) {
                const reader = new FileReader();
                reader.readAsText(this.files[i]);
                reader.onload = () => {
                    const text = String(reader.result);
                    try {
                        this.schemas[i] = JSON.parse(text);
                        count += 1;
                        if (!hasError && count === this.files.length) {
                            const data = this.generateSchemaData();
                            onDone(this.schemaID, name, data);
                            this.closeSchema();
                        }
                    } catch {
                        hasError = true;
                        this.jsonErrors[i].style.display = "block";
                    }
                };

            }
        } else {
            onDone(this.schemaID, name);
            this.closeSchema();
        }
    }

    /**
     * Generates the Schema Data
     * @returns {Void}
     */
    generateSchemaData() {
        if (!this.schemas.length) {
            return null;
        }
        if (this.schemas.length === 1) {
            return this.schemas[0];
        }

        let   hasEmpty = false;
        const result   = this.schemas[0];
        for (const [ key, table ] of Object.entries(result)) {
            if (!table.table) {
                hasEmpty = true;
            }
            if (!table.table && this.schemas[1][key]) {
                result[key] = this.schemas[1][key];
            }
        }
        if (!hasEmpty) {
            for (const key of Object.keys(this.schemas[1])) {
                result[key] = this.schemas[1][key];
            }
        }
        return result;
    }

    /**
     * Hides the Errors
     * @returns {Void}
     */
    hideErrors() {
        this.nameError.style.display = "none";
        for (let i = 0; i < this.fileErrors.length; i++) {
            this.fileErrors[i].style.display = "none";
        }
        for (let i = 0; i < this.jsonErrors.length; i++) {
            this.jsonErrors[i].style.display = "none";
        }
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
