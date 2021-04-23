"use strict";

export default class AoIAnnotationModel extends EventTarget {
    constructor() {
        super();
        this.areaName = "";
        this.labels = [];
    }

    resetState() {
        this.areaName = "";
        this.labels = [];
    }

    normalizeAoILables(lables) {
        if (!lables) return [];

        try {
            return JSON.parse(lables);
        } catch (error) {
            return [];
        }
    }

    setAoIAnnotation(aoiResult) {
        this.areaName = aoiResult.name;
        this.labels = this.normalizeAoILables(aoiResult.labels);
    }

    openAoIAnnotation(aoiResult) {
        this.setAoIAnnotation(aoiResult);
        this.dispatchEvent(new CustomEvent("openAoIAnnotation"));
    }

    closeAoIAnnotation() {
        this.resetState();
        this.dispatchEvent(new CustomEvent("closeAoIAnnotation"));
    }
}
