/**
 * The Selection
 */
export default class Selection {

    /**
     * Selection constructor
     */
    constructor() {
        /** @type {HTMLElement} */
        this.selectDialog = document.querySelector(".select-dialog");
        /** @type {HTMLElement} */
        this.selectEmpty  = document.querySelector(".select-empty");
        /** @type {HTMLElement} */
        this.selectList   = document.querySelector(".select-list");

        /** @type {HTMLElement} */
        this.schemaDialog = document.querySelector(".schema-dialog");
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
            li.innerHTML        = schema.name;
            li.dataset.action   = "select-schema";
            li.dataset.schemaID = schema.id;
            if (schema.isSelected) {
                li.className = "selected";
            }
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
     * @returns {Void}
     */
    openSchema() {
        this.schemaDialog.style.display = "block";
    }

    /**
     * Closes the Schema Dialog
     * @returns {Void}
     */
    closeSchema() {
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
                onDone(name, json);
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
}
