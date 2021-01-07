"use strict";

import { Div } from "@adolgarev/domwrapper/src";
import Wkt from "wicket";

const wkt = new Wkt.Wkt();

function promisify(f, context = null) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            function callback(err, result) {
                if (err) {
                    return reject(err);
                } else {
                    resolve(result);
                }
            }

            args.push(callback);

            f.call(context, ...args);
        });
    };
}

function setOpacity(leafletLayer, value) {
    if (leafletLayer.setOpacity !== undefined) {
        leafletLayer.setOpacity(value);
    } else {
        leafletLayer.setStyle({ opacity: value, fillOpacity: value * 0.2 });
    }
}

function initializeControls(map) {
    L.EditControl = L.Control.extend({
        options: {
            position: "topleft",
            callback: null,
            kind: "",
            html: "",
        },

        onAdd: function (map) {
            var container = L.DomUtil.create(
                    "div",
                    "leaflet-control leaflet-bar"
                ),
                link = L.DomUtil.create("a", "", container);

            link.href = "#";
            link.title = "Create a new " + this.options.kind;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, "click", L.DomEvent.stop).on(
                link,
                "click",
                function () {
                    window.LAYER = this.options.callback.call(map.editTools);
                },
                this
            );

            return container;
        },
    });

    L.NewPolygonControl = L.EditControl.extend({
        options: {
            position: "topleft",
            callback: map.editTools.startPolygon,
            kind: "polygon",
            html: "poly",
        },
    });

    L.NewRectangleControl = L.EditControl.extend({
        options: {
            position: "topleft",
            callback: map.editTools.startRectangle,
            kind: "rectangle",
            html: "rect",
        },
    });

    map.addControl(new L.NewPolygonControl());
    map.addControl(new L.NewRectangleControl());
}

function initializeHandlers(map, mapModel) {
    let features = [];

    const handlePolygonChange = ({ layer }) => {
        const { geometry } = layer.toGeoJSON();
        const polygon = wkt.fromObject(geometry).write();

        const feature = features.find(
            (feature) => feature.l_id === layer._leaflet_id
        );

        const handler = feature
            ? promisify(mapModel.updateAoi, mapModel)
            : promisify(mapModel.sendAoi, mapModel);

        if (feature) {
            const data = {
                ...feature,
                polygon,
            };
            handler(data, data.id).then((res) => {
                features = [
                    ...features.filter((feature) => feature.id !== res.id),
                    { ...res, l_id: data.l_id },
                ];
            });
        } else {
            const data = {
                //NEED fix - use polygon string as unique name
                name: `Test ${(Math.random() * 10000).toFixed()}`,
                polygon,
                l_id: layer._leaflet_id,
            };

            handler(data).then((res) => {
                features.push({ ...data, id: res.id });
            });
        }

        layer.toggleEdit &&
            layer
                .on("dblclick", L.DomEvent.stop)
                .on("dblclick", layer.toggleEdit);
    };

    const handleCustomPolygonCreate = ({ layer }) => {
        const { geometry } = layer.toGeoJSON();
        const polygon = wkt.fromObject(geometry).write();
        const feature = {
            //NEED fix - use polygon string as unique name
            name: `Test ${(Math.random() * 10000).toFixed()}`,
            polygon,
            l_id: layer._leaflet_id,
        };

        const sendAoi = promisify(mapModel.sendAoi, mapModel);
        sendAoi(feature).then((res) => {
            features.push({ ...feature, id: res.id });
        });

        layer.toggleEdit &&
            layer
                .on("dblclick", L.DomEvent.stop)
                .on("dblclick", layer.toggleEdit);
    };

    map.on("editable:vertex:clicked", handleCustomPolygonCreate);
    map.on("editable:vertex:dragend", handlePolygonChange);
    map.on("editable:dragend", handlePolygonChange);
}

export default function createMap(widgetFactory, mapModel) {
    const mapId = widgetFactory.generateRandomId("Map");
    const mapElt = Div({ id: mapId, class: "map" });

    let map = null;
    let startPoint = [48.95, 31.53];
    mapElt.componentDidMount = () => {
        map = L.map(mapId, { editable: true, doubleClickZoom: false }).setView(
            startPoint,
            7
        );

        // add controls to map
        initializeControls(map);

        //add handlers to map
        initializeHandlers(map, mapModel);

        if (process.env.NODE_ENV === "development") {
            L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
                attribution:
                    "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                maxZoom: 16,
            }).addTo(map);
        } else {
            L.tileLayer("/tiles/mapbox/{z}/{x}/{y}.png", {
                attribution:
                    "Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
                maxZoom: 16,
                tileSize: 512,
                zoomOffset: -1,
            }).addTo(map);
        }
    };

    let backgroundLayer = null;
    let foregroundLayer = null;

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
        let selectedLeafletLayer = null;
        if (l.layer_type === "GEOJSON") {
            foregroundLayer = L.geoJSON(undefined, {
                style: (feature) => {
                    return feature.properties.style;
                },
                onEachFeature: (feature, layer) => {
                    layer.addEventListener("click", () => {
                        if (
                            selectedLeafletLayer != null &&
                            selectedLeafletLayer.setStyle
                        ) {
                            selectedLeafletLayer.setStyle({
                                fillOpacity: 0.2,
                            });
                        }
                        if (layer.setStyle) {
                            layer.setStyle({
                                fillOpacity: 0.7,
                            });
                        }
                        selectedLeafletLayer = layer;
                        mapModel.selectFeature(feature);
                    });
                    if (feature.properties.label) {
                        layer.bindPopup(feature.properties.label);
                    }

                    // add posibility to edit current features
                    layer.toggleEdit &&
                        layer
                            .on("dblclick", L.DomEvent.stop)
                            .on("dblclick", layer.toggleEdit);
                },
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
                    default: (properties) => {
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
                    },
                },
                interactive: true,
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
                maxZoom: 16,
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
            setOpacity(
                foregroundLayer,
                mapModel.foregroundLayerOptions.opacity
            );
        } else {
            setOpacity(foregroundLayer, 1);
        }
    });

    return mapElt;
}
