import Options from "./Options.js";



/**
 * The Zoom
 */
export default class Zoom {

    /**
     * Canvas constructor
     * @param {HTMLElement} canvas
     */
    constructor(canvas) {
        this.value   = 100;
        this.canvas  = canvas;
        this.percent = document.querySelector(".zoom-percent");
        this.inBtn   = document.querySelector(".zoom-in");
        this.outBtn  = document.querySelector(".zoom-out");
    }

    /**
     * Returns the Zoom scale
     * @returns {Number}
     */
    get scale() {
        return this.value / Options.DEFAULT_ZOOM;
    }

    /**
     * Sets the initial Zoom
     * @param {Number} value
     * @returns {Void}
     */
    setInitialValue(value) {
        this.zoom = value;
        this.setValue();
    }

    /**
     * Increases the Canvas Zoom
     * @returns {Number}
     */
    increase() {
        if (this.zoom >= Options.MAX_ZOOM) {
            return this.zoom;
        }
        this.zoom += Options.ZOOM_INTERVAL;
        this.setValue();
        return this.zoom;
    }

    /**
     * Decreases the Canvas Zoom
     * @returns {Number}
     */
    decrease() {
        if (this.zoom <= Options.MIN_ZOOM) {
            return this.zoom;
        }
        this.zoom -= Options.ZOOM_INTERVAL;
        this.setValue();
        return this.zoom;
    }

    /**
     * Resets the Canvas Zoom
     * @returns {Number}
     */
    reset() {
        this.zoom = Options.DEFAULT_ZOOM;
        this.setValue();
        return this.zoom;
    }

    /**
     * Sets the Canvas Zoom
     * @returns {Void}
     */
    setValue() {
        this.percent.innerHTML      = `${this.zoom}%`;
        this.canvas.style.transform = `scale(${this.scale})`;
        this.inBtn.classList.toggle("zoom-disabled",  this.zoom === Options.MAX_ZOOM);
        this.outBtn.classList.toggle("zoom-disabled", this.zoom === Options.MIN_ZOOM);
        // this.stopUnselect();
    }
}
