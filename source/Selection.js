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
        this.useUrlsInput = document.querySelector(".schema-urls");
        /** @type {HTMLInputElement} */
        this.nameInput    = document.querySelector(".schema-name");
        /** @type {NodeListOf<HTMLElement>} */
        this.fileFields   = document.querySelectorAll(".schema-file");
        /** @type {NodeListOf<HTMLElement>} */
        this.fileInputs   = document.querySelectorAll(".schema-file-name");
        /** @type {NodeListOf<HTMLElement>} */
        this.urlFields    = document.querySelectorAll(".schema-url");
        /** @type {NodeListOf<HTMLInputElement>} */
        this.urlInputs    = document.querySelectorAll(".schema-url input");

        /** @type {HTMLElement} */
        this.nameError    = document.querySelector(".schema-name-error");
        /** @type {HTMLElement} */
        this.fileError    = document.querySelector(".schema-file-error");
        /** @type {NodeListOf<HTMLElement>} */
        this.jsonErrors   = document.querySelectorAll(".schema-json-error");
        /** @type {HTMLElement} */
        this.urlError     = document.querySelector(".schema-url-error");

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
        this.selectDialog.style.display = "none";
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
        this.hideErrors();

        this.schemaDialog.style.display = "block";
        this.schemaTitle.innerText      = isEdit ? "Edit the Schema" : "Add a Schema";
        this.schemaButton.innerText     = isEdit ? "Edit Schema"     : "Add Schema";
        this.nameInput.value            = isEdit ? data.name         : "";

        this.useUrlsInput.checked       = useUrls;
        this.fileInputs[0].innerHTML    = isEdit && !useUrls ? this.data.file1 : "";
        this.fileInputs[1].innerHTML    = isEdit && !useUrls ? this.data.file2 : "";
        this.urlInputs[0].value         = isEdit && useUrls  ? this.data.url1  : "";
        this.urlInputs[1].value         = isEdit && useUrls  ? this.data.url2  : "";
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
     * Selects a File in the Add/Edit Dialog
     * @param {Number} index
     * @returns {Void}
     */
    selectFile(index) {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = ".json";
        input.onchange = () => {
            this.files[index]                = input.files[0];
            this.fileInputs[index].innerHTML = this.files[index].name;
            this.data[`file${index + 1}`]    = this.files[index].name;
        };
        input.click();
    }

    /**
     * Removes a File in the Add/Edit Dialog
     * @param {Number} index
     * @returns {Void}
     */
    removeFile(index) {
        this.files[index]                = null;
        this.fileInputs[index].innerHTML = "";
        this.data[`file${index + 1}`]    = "";

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
     * @param {Function} onDone
     * @returns {Void}
     */
    importSchema(onDone) {
        const isEdit   = Boolean(this.data.schemaID);
        let   hasError = false;
        let   count    = 0;

        this.data.useUrls = this.useUrlsInput.checked;
        this.data.name    = this.nameInput.value;
        this.data.url1    = this.urlInputs[0].value;
        this.data.url2    = this.urlInputs[1].value;
        if (!this.data.schemas) {
            this.data.schemas = [];
        }

        this.hideErrors();
        if (!this.data.name) {
            hasError = true;
            this.nameError.style.display = "block";
        }
        if (!isEdit && !this.data.useUrls && !this.files[0]) {
            hasError = true;
            this.fileError.style.display = "block";
        }
        if (this.data.useUrls && !this.urlInputs[0].value) {
            hasError = true;
            this.urlError.style.display = "block";
        }
        if (hasError) {
            return;
        }

        if (!this.data.useUrls && (this.files[0] || this.files[1])) {
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
                        if (!hasError && count === this.files.length) {
                            onDone(this.data);
                            this.closeSchema();
                        }
                    } catch {
                        hasError = true;
                        this.jsonErrors[i].style.display = "block";
                    }
                };
            }
        } else {
            onDone(this.data);
            this.closeSchema();
        }
    }

    /**
     * Hides the Errors
     * @returns {Void}
     */
    hideErrors() {
        this.nameError.style.display     = "none";
        this.urlError.style.display      = "none";
        this.fileError.style.display     = "none";
        this.jsonErrors[0].style.display = "none";
        this.jsonErrors[1].style.display = "none";
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
