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
            left: "0"
        });
    map.componentDidMount = () => {
        const mymap = L.map(mapId);
        mymap.fitBounds([[49.8704624780525, 37.0123590916912], [50.040247115589196, 36.737865323126336]]);
        L.tileLayer("/tiles/mapbox/{z}/{x}/{y}.png", {
            attribution: "Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mymap);
    };
    return map;
}