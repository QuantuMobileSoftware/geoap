"use strict";

import { Div } from "@adolgarev/domwrapper/src";

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

        const mvtLayer = L.vectorGrid.protobuf("/tiles/ClearCut-2020-11-25-1/{z}/{x}/{y}.pbf", {
            // rendererFactory: L.canvas.tile,
            maxZoom: 16,
            vectorTileLayerStyles: {
                "ClearCut-2020-11-25": (properties) => {
                    return {
                        color: "green",
                        fill: true
                    }
                }
            },
            interactive: true
        }).addTo(map);
        mvtLayer.addEventListener("click", (x) => {
            console.log(x.layer.properties);
        });
        map.fitBounds([[49.8704624780525, 37.0123590916912], [50.040247115589196, 36.737865323126336]]);
    };
    var layer = null;
    mapModel.addEventListener("layerselected", () => {
        if (map === null) {
            return;
        }
        if (layer !== null) {
            layer.remove();
        }
        const l = mapModel.selectedLayer;
        var selectedLayer = null;
        if (l.layer_type === "GEOJSON") {
            layer = L.geoJSON(undefined, {
                style: (feature) => {
                    return feature.properties.style;
                },
                onEachFeature: (feature, layer) => {
                    layer.addEventListener("click", () => {
                        if (selectedLayer != null && selectedLayer.setStyle) {
                            selectedLayer.setStyle({
                                fillOpacity: 0.2
                            });
                        }
                        if (layer.setStyle) {
                            layer.setStyle({
                                fillOpacity: 0.7
                            });
                        }
                        selectedLayer = layer;
                        mapModel.selectFeature(feature);
                    });
                }
            });
            const xhr = new XMLHttpRequest();
            xhr.open("GET", l.rel_url);
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    console.error(xhr.responseText);
                } else {
                    const jsonResponse = JSON.parse(xhr.responseText);
                    layer.addData(jsonResponse);
                }
            };
            xhr.onerror = () => {
                console.error("Failed to request " + l.rel_url);
            };
            xhr.send();
        } else if (l.layer_type === "XYZ") {
            layer = L.tileLayer(l.rel_url, {
                minZoom: 10,
                maxZoom: 16
            })
        }
        layer.addTo(map);
        map.fitBounds(l.boundingCoordinates);
    });
    return mapElt;
}