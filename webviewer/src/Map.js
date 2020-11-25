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
        if (l.layer_type === "GEOJSON") {
            layer = L.geoJSON();
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