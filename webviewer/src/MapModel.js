"use strict";

export default class MapModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.layers = [];
    }

    getLayers() {
        this.apiWrapper.sendGetRequest("/results", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.layers = res.results;
                this.dispatchEvent(new Event("layersupdated"));
            }
        });
    }

}