/**
 * The Dialog
 */
export default class Dialog {

    /**
     * The Dialog constructor
     * @param {String} name
     */
    constructor(name) {
        /** @type {HTMLElement} */
        this.container = document.querySelector(`[data-dialog="${name}"]`);
    }

    /**
     * Opens the Dialog
     * @returns {Void}
     */
    open() {
        this.container.style.display = "block";
        this.hideErrors();
    }

    /**
     * Closes the Dialog
     * @returns {Void}
     */
    close() {
        this.container.style.display = "none";
        this.hideErrors();
    }



    /**
     * Set the Dialog title
     * @returns {Void}
     */
    setTitle(text) {
        const element = this.container.querySelector(".dialog-title");
        if (element) {
            element.innerHTML = text;
        }
    }

    /**
     * Set the Dialog button
     * @returns {Void}
     */
    setButton(text) {
        const element = this.container.querySelector(".dialog-btn");
        if (element) {
            element.innerHTML = text;
        }
    }

    /**
     * Returns the Input value
     * @param {String} name
     * @returns {(Boolean|String)}
     */
    getInput(name) {
        /** @type {HTMLInputElement} */
        const input = this.container.querySelector(`[data-field=${name}] input`);
        if (input.type === "checkbox") {
            return input.checked;
        }
        return input.value;
    }

    /**
     * Sets the Input value
     * @param {String} name
     * @param {*}      value
     * @returns {Void}
     */
    setInput(name, value) {
        const element = this.container.querySelector(`[data-field=${name}]`);
        if (!element) {
            return;
        }
        if (element.classList.contains("file-input")) {
            const name = element.querySelector(".file-name");
            name.innerHTML = value;
            return;
        }
        const input = element.querySelector("input");
        if (input.type === "checkbox") {
            input.checked = Boolean(value);
            return;
        }
        input.value = value;
    }

    /**
     * Selects a File in the Dialog
     * @param {String}   name
     * @param {Function} onSelect
     * @returns {Void}
     */
    selectFile(name, onSelect) {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = ".json";
        input.onchange = () => {
            const file = input.files[0];
            this.setInput(name, file.name);
            onSelect(file);
        };
        input.click();
    }

    /**
     * Hides the Errors
     * @param {String} error
     * @returns {Void}
     */
    showError(error) {
        this.hasError = true;

        /** @type {HTMLElement} */
        const element = this.container.querySelector(`[data-error=${error}]`);
        if (element) {
            element.style.display = "block";
        }
    }

    /**
     * Hides the Errors
     * @returns {Void}
     */
    hideErrors() {
        this.hasError = false;
        const errors = this.container.querySelectorAll(".error");
        // @ts-ignore
        for (const error of errors) {
            error.style.display = "none";
        }
    }
}
