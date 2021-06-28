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
        this.schemaDialog = document.querySelector(".schema-dialog");
    }

    /**
     * Opens the Select Dialog
     * @returns {Void}
     */
    open() {
        this.selectDialog.style.display = "block";
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
    selectFile(element) {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = ".json";
        input.onchange = () => {
            this.file  = input.files[0];
            const span = element.parentNode.querySelector("span");
            span.innerHTML = this.file.name;
        };
        input.click();
    }

    /**
     * Imports a Schema
     * @param {Function} onDone
     * @returns {Void}
     */
    importSchema(onDone) {
        const reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = () => {
            onDone(String(reader.result));
        };
        this.closeSchema();
    }
}
