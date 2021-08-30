"use strict";

export default class AoIAnnotationModel extends EventTarget {
    constructor({ mapModel }) {
        super();
        this.mapModel = mapModel;
    }

    normalizeAoILables(lables) {
        if (!lables) return [];

        try {
            if (lables.match(/\'|\(|\)/g)) {
                lables = lables.replace(/\'|\(|\)/g, '"');
            }

            return JSON.parse(lables);
        } catch (error) {
            return [];
        }
    }

    getAoIAnnotation(aoiResult) {
        return {
            areaName: aoiResult.name,
            labels: aoiResult.labels ? this.normalizeAoILables(aoiResult.labels) : [],
            type: aoiResult.name.includes("(NDVI)") ? "NDVI" : ""
        };
    }

    openAoIAnnotation(aoiResult) {
        const aoiAnnotation = this.getAoIAnnotation(aoiResult);

        if (!this.mapModel.selectedLayers.some(({ id }) => id === aoiResult.id)) return;

        this.dispatchEvent(
            new CustomEvent("openAoIAnnotation", {
                detail: aoiAnnotation
            })
        );
    }

    closeAoIAnnotation() {
        this.dispatchEvent(new CustomEvent("closeAoIAnnotation"));
    }
}
