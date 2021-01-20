"use strict";

import Wkt from "wicket";

const getGeometry = (item) => {
    const wkt = new Wkt.Wkt();
    const delimeterIndex = item.polygon.indexOf(";");
    const string = item.polygon.slice(delimeterIndex + 1);
    wkt.read(string);

    return wkt.toJson();
};
export default class MapModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.layers = null;
        this.foregroundLayer = null;
        this.foregroundLayerOptions = {};
        this.backgroundLayer = null;
        this.selectedFeature = null;
        this.aois = [];
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
                    this.aois = [
                        ...this.aois,
                        {
                            type: "Feature",
                            properties: {
                                name: res.name,
                                id: res.id,
                                leafletId: layer._leaflet_id,
                            },
                            geometry: getGeometry(res),
                        },
                    ];
                    this.dispatchEvent(new Event("aoiadded"));
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
                    this.aois = [
                        ...this.aois.filter(
                            (aoi) => aoi.properties.id !== res.id
                        ),
                        {
                            type: "Feature",
                            properties: {
                                name: res.name,
                                id: res.id,
                                leafletId: layer._leaflet_id,
                            },
                            geometry: getGeometry(res),
                        },
                    ];
                    this.dispatchEvent(new Event("aoiupdated"));
                }
            }
        );
    }

    getAois() {
        this.apiWrapper.sendGetRequest("/aoi", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                const aois = res.map((aoi) => {
                    return {
                        type: "Feature",
                        properties: { name: aoi.name, id: aoi.id },
                        geometry: getGeometry(aoi),
                    };
                });

                this.aois = aois;
                this.dispatchEvent(new Event("aoisloaded"));
            }
        });
    }

    selectAoi(aoi) {
        this.dispatchEvent(new CustomEvent("aoiSelected", { detail: { aoi } }));
    }
}
