import Schema from "./Schema.js";

// Variables
let canvas = null;
let schema = null;



/**
 * The main Function
 * @returns {Void}
 */
function main() {
    const data = localStorage.getItem("schema");
    if (data) {
        schema = new Schema(JSON.parse(data));
    }

    const open = document.querySelector(".open");
    open.addEventListener("click", () => importSchema());

}

/**
 * Imports a Schema
 * @returns {Void}
 */
function importSchema() {
    const input    = document.createElement("input");
    input.type     = "file";
    input.accept   = ".json";
    input.onchange = () => {
        const file   = input.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            const text = String(reader.result);
            localStorage.setItem("schema", text);
            schema = new Schema(JSON.parse(text));
        };
    };
    input.click();
}



// Start
main();
