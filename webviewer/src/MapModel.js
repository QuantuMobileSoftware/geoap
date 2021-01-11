"use strict";

import Wkt from "wicket";

export default class MapModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.layers = null;
        this.foregroundLayer = null;
        this.foregroundLayerOptions = {};
        this.backgroundLayer = null;
        this.selectedFeature = null;
    }

    getLayers() {
        this.apiWrapper.sendGetRequest("/results", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.layers = res;
                this.layers.forEach((x) => {
                    const wkt = new Wkt.Wkt();
                    wkt.read(x.bounding_polygon.split(";")[1]);
                    x.boundingCoordinates = [];
                    wkt.toJson().coordinates[0].forEach((longlat) => {
                        x.boundingCoordinates.push([longlat[1], longlat[0]]);
                    });
                });
                this.dispatchEvent(new Event("layersupdated"));
            }
        });
    }

    selectLayer(layer) {
        this.backgroundLayer = this.foregroundLayer;
        this.foregroundLayer = layer;
        this.foregroundLayerOptions = {};
        this.dispatchEvent(new Event("layerselected"));
    }

    updateForegroundLayerOptions(options) {
        this.foregroundLayerOptions = options;
        this.dispatchEvent(new Event("foregroundlayeroptionsupdated"));
    }

    isLayerSelected(layer) {
        return (
            (this.backgroundLayer !== null &&
                this.backgroundLayer.id === layer.id) ||
            (this.foregroundLayer !== null &&
                this.foregroundLayer.id === layer.id)
        );
    }

    selectFeature(feature) {
        this.selectedFeature = feature;
        this.dispatchEvent(new Event("featureselected"));
    }

    sendAoi(dataObject, callback) {
        const wkt = new Wkt.Wkt();
        const { layer, ...data } = dataObject;
        const { geometry } = layer.toGeoJSON();
        const polygon = wkt.fromObject(geometry).write();

        this.apiWrapper.sendPostRequest(
            "/aoi",
            { ...data, polygon },
            (err, res) => {
                if (err) {
                    this.dispatchEvent(new Event("error"));
                } else {
                    callback(res);
                }
            }
        );
    }

    updateAoi(dataObject, id, callback) {
        const wkt = new Wkt.Wkt();
        const { layer, ...data } = dataObject;
        const { geometry } = layer.toGeoJSON();
        const polygon = wkt.fromObject(geometry).write();

        this.apiWrapper.sendPatchRequest(
            `/aoi/${id}`,
            { ...data, polygon },
            (err, res) => {
                if (err) {
                    this.dispatchEvent(new Event("error"));
                } else {
                    callback(res);
                }
            }
        );
    }
}
