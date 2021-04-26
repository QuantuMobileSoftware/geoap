"use strict";

export default class AoIAnnotationModel extends EventTarget {
    constructor() {
        super();
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
            labels: this.normalizeAoILables(aoiResult.labels),
        };
    }

    openAoIAnnotation(aoiResult) {
        const aoiAnnotation = this.getAoIAnnotation(aoiResult);

        this.dispatchEvent(
            new CustomEvent("openAoIAnnotation", {
                detail: aoiAnnotation,
            })
        );
    }

    closeAoIAnnotation() {
        this.dispatchEvent(new CustomEvent("closeAoIAnnotation"));
    }
}
