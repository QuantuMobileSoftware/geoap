"use strict";

import { Div } from "@adolgarev/domwrapper/src";

function setOpacity(leafletLayer, value) {
    if (leafletLayer.setOpacity !== undefined) {
        leafletLayer.setOpacity(value);
    } else {
        leafletLayer.setStyle({opacity: value, fillOpacity: value * 0.2});
    }
}

export default function createMap(widgetFactory, mapModel) {
    const mapId = widgetFactory.generateRandomId("Map");
    const mapElt = Div()
        .setAttribute("id", mapId)
        .setStyle({
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
            "z-index": "1",
        });
    var map = null;
    mapElt.componentDidMount = () => {
        map = L.map(mapId, { zoomControl: false });
        if (process.env.NODE_ENV === "development") {
            L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                maxZoom: 16
            }).addTo(map);
        } else {
            L.tileLayer("/tiles/mapbox/{z}/{x}/{y}.png", {
                attribution: "Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
                maxZoom: 16,
                tileSize: 512,
                zoomOffset: -1
            }).addTo(map);
        }
    };
    var backgroundLayer = null;
    var foregroundLayer = null;
    mapModel.addEventListener("layerselected", () => {
        if (map === null) {
            return;
        }
        if (backgroundLayer !== null) {
            backgroundLayer.remove();
        }
        if (foregroundLayer !== null) {
            backgroundLayer = foregroundLayer;
            setOpacity(backgroundLayer, 1);
        }
        const l = mapModel.foregroundLayer;
        var selectedLeafletLayer = null;
        if (l.layer_type === "GEOJSON") {
            foregroundLayer = L.geoJSON(undefined, {
                style: (feature) => {
                    return feature.properties.style;
                },
                onEachFeature: (feature, layer) => {
                    layer.addEventListener("click", () => {
                        if (selectedLeafletLayer != null && selectedLeafletLayer.setStyle) {
                            selectedLeafletLayer.setStyle({
                                fillOpacity: 0.2
                            });
                        }
                        if (layer.setStyle) {
                            layer.setStyle({
                                fillOpacity: 0.7
                            });
                        }
                        selectedLeafletLayer = layer;
                        mapModel.selectFeature(feature);
                    });
                    if (feature.properties.label) {
                        layer.bindPopup(feature.properties.label)
                    }
                }
            });
            // Make a closure here as layer can be changed before data is loaded
            const leafletLayer = foregroundLayer;
            const xhr = new XMLHttpRequest();
            xhr.open("GET", l.rel_url);
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    console.error(xhr.responseText);
                } else {
                    const jsonResponse = JSON.parse(xhr.responseText);
                    leafletLayer.addData(jsonResponse);
                }
            };
            xhr.onerror = () => {
                console.error("Failed to request " + l.rel_url);
            };
            xhr.send();
        } else if (l.layer_type === "MVT") {
            foregroundLayer = L.vectorGrid.protobuf(l.rel_url, {
                rendererFactory: L.canvas.tile,
                maxZoom: 16,
                vectorTileLayerStyles: {
                    "default": (properties) => {
                        if (typeof properties.style === "string") {
                            properties.style = JSON.parse(properties.style);
                        }
                        if (typeof properties.data === "string") {
                            properties.data = JSON.parse(properties.data);
                        }
                        if (typeof properties.layout === "string") {
                            properties.layout = JSON.parse(properties.layout);
                        }
                        if (properties.style === undefined) {
                            properties.style = {};
                        }
                        if (properties.style.fill === undefined) {
                            properties.style.fill = true;
                        }
                        return properties.style;
                    }
                },
                interactive: true
            });
            foregroundLayer.addEventListener("click", (x) => {
                mapModel.selectFeature(x.layer);
                if (x.layer.properties.label) {
                    L.popup()
                        .setContent(x.layer.properties.label)
                        .setLatLng(x.latlng)
                        .openOn(map);
                }
            });
        } else if (l.layer_type === "XYZ") {
            foregroundLayer = L.tileLayer(l.rel_url, {
                minZoom: 10,
                maxZoom: 16
            });
        }
        foregroundLayer.addTo(map);
        map.fitBounds(l.boundingCoordinates);
    });

    mapModel.addEventListener("foregroundlayeroptionsupdated", () => {
        if (foregroundLayer === null) {
            return;
        }
        if (mapModel.foregroundLayerOptions.opacity !== undefined) {
            setOpacity(foregroundLayer, mapModel.foregroundLayerOptions.opacity);
        } else {
            setOpacity(foregroundLayer, 1);
        }
    });

    return mapElt;
}