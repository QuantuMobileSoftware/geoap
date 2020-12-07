"use strict";

import Wkt from "wicket";

export default class MapModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.layers = null;
        this.selectedLayer = null;
        this.selectedFeature = null;
    }

    getLayers() {
        this.apiWrapper.sendGetRequest("/results", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.layers = res;
                this.layers.forEach(x => {
                    const wkt = new Wkt.Wkt();
                    wkt.read(x.bounding_polygon.split(";")[1]);
                    x.boundingCoordinates = [];
                    wkt.toJson().coordinates[0].forEach(longlat => {
                        x.boundingCoordinates.push([longlat[1], longlat[0]]);
                    });
                })
                this.dispatchEvent(new Event("layersupdated"));
            }
        });
    }

    selectLayer(layer) {
        this.selectedLayer = layer;
        this.dispatchEvent(new Event("layerselected"));
    }

    selectFeature(feature) {
        this.selectedFeature = feature;
        this.dispatchEvent(new Event("featureselected"));
    }

}