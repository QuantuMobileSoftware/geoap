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
        this.aois = [];
        this.selectedLayers = [];
        this.layersOptions = {};
        this.selectedFeature = null;
    }

    getLastSelectedLayer() {
        return this.selectedLayers[this.selectedLayers.length - 1];
    }

    setSelectedLayers(layer) {
        const isAlreadySelected = this.selectedLayers.some(({ id }) => id === layer.id);

        const addToSelected = layer => {
            this.selectedLayers = [...this.selectedLayers, layer];
        };

        const removeFromSelected = layer => {
            this.selectedLayers = this.selectedLayers.filter(({ id }) => id !== layer.id);
        };

        (isAlreadySelected ? removeFromSelected : addToSelected)(layer);
    }

    selectLayer(layer) {
        this.setSelectedLayers(layer);
        this.dispatchEvent(new Event("layerselected"));
    }

    updateLayersOptions(options) {
        const lastSelectedLayer = this.getLastSelectedLayer();
        if (!lastSelectedLayer) return;

        this.layersOptions[lastSelectedLayer.id] = { ...(lastSelectedLayer.options || {}), ...options };
        this.dispatchEvent(new CustomEvent("updateLayersOptions", { detail: { id: lastSelectedLayer.id } }));
    }

    isLayerSelected(layer) {
        return (
            (this.backgroundLayer !== null && this.backgroundLayer.id === layer.id) ||
            (this.foregroundLayer !== null && this.foregroundLayer.id === layer.id)
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

        this.apiWrapper.sendPostRequest("/aoi", { ...data, polygon }, (err, res) => {
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
                            id: res.id
                        },
                        geometry: getGeometry(res)
                    }
                ];
                this.dispatchEvent(new Event("aoiadded"));
            }
        });
    }

    updateAoi(dataObject, callback) {
        const wkt = new Wkt.Wkt();
        const { layer, ...data } = dataObject;
        const { geometry } = layer.toGeoJSON();
        const polygon = wkt.fromObject(geometry).write();

        this.apiWrapper.sendPatchRequest(`/aoi/${data.id}`, { ...data, polygon }, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                callback(res);
                this.aois = [
                    ...this.aois.filter(aoi => aoi.properties.id !== res.id),
                    {
                        type: "Feature",
                        properties: {
                            name: res.name,
                            id: res.id
                        },
                        geometry: getGeometry(res)
                    }
                ];
                this.dispatchEvent(new Event("aoiupdated"));
            }
        });
    }

    updateAoiName(dataObject) {
        const wkt = new Wkt.Wkt();
        const { geometry, ...data } = dataObject;
        const polygon = wkt.fromObject(geometry).write();

        this.apiWrapper.sendPatchRequest(`/aoi/${data.id}`, { ...data, polygon }, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.aois = [
                    ...this.aois.filter(aoi => aoi.properties.id !== res.id),
                    {
                        type: "Feature",
                        properties: {
                            name: res.name,
                            id: res.id
                        },
                        geometry: getGeometry(res)
                    }
                ];
                this.dispatchEvent(new Event("aoiupdated"));
            }
        });
    }

    getAois() {
        this.apiWrapper.sendGetRequest("/aoi", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                const aois = res.map(aoi => {
                    return {
                        type: "Feature",
                        properties: { name: aoi.name, id: aoi.id },
                        geometry: getGeometry(aoi)
                    };
                });

                this.aois = aois;
                this.dispatchEvent(new Event("aoisloaded"));
            }
        });
    }

    deleteAoi(id) {
        this.apiWrapper.sendDeleteRequest(`/aoi/${id}`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.aois = [...this.aois.filter(aoi => aoi.properties.id !== id)];
                this.dispatchEvent(new CustomEvent("aoideleted", { detail: { id } }));
            }
        });
    }

    selectAoi(aoi) {
        this.dispatchEvent(new CustomEvent("aoiSelected", { detail: { aoi } }));
    }
}
