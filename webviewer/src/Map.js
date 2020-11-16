"use strict";

import { Div } from "@adolgarev/domwrapper/src";

export default function createMap(widgetFactory, mapModel) {
    const mapId = widgetFactory.generateRandomId("Map");
    const map = Div()
        .setAttribute("id", mapId)
        .setStyle({
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
            "z-index": "1",
        });
    map.componentDidMount = () => {
        const mymap = L.map(mapId, { zoomControl: false });
        mymap.fitBounds([[49.8704624780525, 37.0123590916912], [50.040247115589196, 36.737865323126336]]);
        if (process.env.NODE_ENV === "development") {
            L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                minZoom: 10,
                maxZoom: 16
            }).addTo(mymap);
        } else {
            L.tileLayer("/tiles/mapbox/{z}/{x}/{y}.png", {
                attribution: "Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
                maxZoom: 18,
                tileSize: 512,
                zoomOffset: -1
            }).addTo(mymap);
        }
    };
    return map;
}