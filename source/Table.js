/**
 * The Schema Table
 */
export default class Table {

    /**
     * Schema Table constructor
     * @param {Object} data
     */
    constructor(data) {
        this.data = data;

        this.createListElem();
    }



    /**
     * Creates the List element
     * @returns {Void}
     */
    createListElem() {
        this.listElem   = document.createElement("li");
        this.listText   = document.createElement("span");
        this.listButton = document.createElement("button");

        this.listText.innerHTML   = this.data.table;
        this.listButton.innerHTML = "Add";

        this.listElem.appendChild(this.listText);
        this.listElem.appendChild(this.listButton);
    }
}
