"use strict";

import { Div } from "@adolgarev/domwrapper/src";

function setOpacity(leafletLayer, value) {
    if (leafletLayer.setOpacity !== undefined) {
        leafletLayer.setOpacity(value);
    } else {
        leafletLayer.setStyle({ opacity: value, fillOpacity: value * 0.2 });
    }
}

function initializeControls(map, { isDemoUser, onAddClick } = {}) {
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
                    if (isDemoUser) {
                        return onAddClick && onAddClick();
                    }

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

function initializeHandlers(map, mapModel, userModel) {
    let FEATURES = {};

    const handlePolygonChange = ({ layer }) => {
        if (FEATURES[layer._leaflet_id]) {
            const feature = {
                ...FEATURES[layer._leaflet_id],
                layer,
                user: userModel.user_id,
            };

            mapModel.updateAoi(feature, (res) => {
                FEATURES = {
                    ...FEATURES,
                    [layer._leaflet_id]: { ...res },
                };
            });
        } else {
            const feature = {
                name: `Test ${(Math.random() * 10000).toFixed()}`,
                layer,
                user: userModel.user_id,
            };

            mapModel.sendAoi(feature, (res) => {
                FEATURES[layer._leaflet_id] = { ...res };
            });
        }
    };

    const handleCustomPolygonCreate = ({ layer }) => {
        const feature = {
            name: `Test ${(Math.random() * 10000).toFixed()}`,
            layer,
            user: userModel.user_id,
        };

        mapModel.sendAoi(feature, (res) => {
            FEATURES[layer._leaflet_id] = { ...res };
            map.removeLayer(layer);
        });
    };


    map.on("editable:drawing:commit", handleCustomPolygonCreate);

    // map.on("editable:vertex:clicked", handleCustomPolygonCreate);
    // map.on("editable:vertex:dragend", handlePolygonChange);
}

export default function createMap(
    widgetFactory,
    mapModel,
    requestModel,
    userModel
) {
    const mapId = widgetFactory.generateRandomId("Map");
    const mapElt = Div({ id: mapId, class: "map" });

    let map = null;
    let geojson = null;
    let layersToRender = {};

    let startPoint = [48.95, 31.53];

    const handleMapControlAddClick = () => {
        requestModel.openFeatureRequestDialog();
    }

    mapElt.componentDidMount = () => {
        map = L.map(mapId, { editable: true, doubleClickZoom: false }).setView(
            startPoint,
            8
        );

        // add controls to map
        initializeControls(map, { isDemoUser: userModel.isDemoUser, onAddClick: handleMapControlAddClick });

        //add handlers to map
        initializeHandlers(map, mapModel, userModel);

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

        mapModel.getAois();
    };

    const onAoiChange = () => {
        geojson && geojson.clearLayers();
        if (mapModel.aois.length) {
            function onEachFeature(feature, layer) {
                layer.setStyle({
                    className: `layer__${feature.properties.id}`,
                });
                layer.on({
                    click: function (e) {
                        geojson && geojson.resetStyle();
                        mapModel.aois.forEach((aoi) => {
                            if (aoi.properties.id === feature.properties.id) {
                                mapModel.selectAoi({
                                    ...aoi,
                                });

                                requestModel.getResults(aoi.properties.id);
                                requestModel.getRequests(aoi.properties.id);
                                requestModel.getNotebooks();
                                requestModel.closeRequestForm();
                            }
                        });
                    },
                });
            }
            geojson = L.geoJSON(mapModel.aois, { onEachFeature }).addTo(map);
        }
    };

    const onLayerSelected = () => {
        if (map === null) {
            return;
        }

        const { selectedLayers } = mapModel;
        const lastSelectedLayer = selectedLayers[selectedLayers.length - 1];

        Object.values(layersToRender).forEach(layer => layer && layer.remove());
        layersToRender = {};

        selectedLayers.forEach(selectedLayer => {
            let layer = null;
            let selectedLeafletLayer = null;

            if (selectedLayer.layer_type === "GEOJSON") {
                layer = L.geoJSON(undefined, {
                    style: feature => {
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
                            layer.bindPopup(feature.properties.label);
                        }
                    }
                });
                // Make a closure here as layer can be changed before data is loaded
                const leafletLayer = layer;
                const xhr = new XMLHttpRequest();
                xhr.open("GET", selectedLayer.rel_url);
                xhr.onload = () => {
                    if (xhr.status !== 200) {
                        console.error(xhr.responseText);
                    } else {
                        const jsonResponse = JSON.parse(xhr.responseText);
                        leafletLayer.addData(jsonResponse);
                    }
                };
                xhr.onerror = () => {
                    console.error("Failed to request " + selectedLayer.rel_url);
                };
                xhr.send();
            } else if (selectedLayer.layer_type === "MVT") {
                layer = L.vectorGrid.protobuf(selectedLayer.rel_url, {
                    rendererFactory: L.canvas.tile,
                    maxZoom: 16,
                    vectorTileLayerStyles: {
                        default: properties => {
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
                layer.addEventListener("click", x => {
                    mapModel.selectFeature(x.layer);
                    if (x.layer.properties.label) {
                        L.popup().setContent(x.layer.properties.label).setLatLng(x.latlng).openOn(map);
                    }
                });
            } else if (selectedLayer.layer_type === "XYZ") {
                layer = L.tileLayer(selectedLayer.rel_url, {
                    minZoom: 10,
                    maxZoom: 16
                });
            }

            layersToRender[selectedLayer.id] = layer;
        });

        if (!Object.keys(layersToRender).length) return;

        Object.values(layersToRender).forEach(layer => layer.addTo(map));
        map.fitBounds(lastSelectedLayer.boundingCoordinates);
    };

    const handleUpdateLayersOptions = ({ detail }) => {
        let targetLayer = layersToRender[detail.id]
        if (!targetLayer) return;
        setOpacity(targetLayer, mapModel.layersOptions[detail.id].opacity || 1);
    };

    const onAoiSelected = (e) => {
        geojson && geojson.resetStyle();

        geojson.getLayers().forEach((layer) => {
            const item = document.querySelector(
                `.layer__${layer.feature.properties.id}`
            );

            if (
                layer.feature &&
                layer.feature.properties.id === e.detail.aoi.properties.id
            ) {
                layer.setStyle({
                    color: "#ff7f50",
                    fillOpacity: 0,
                });
                item.classList.add("aoi__layer--active");
                map.fitBounds(layer.getBounds());
            } else {
                item.classList.remove("aoi__layer--active");
            }
        });
    };

    const onAoiDeleted = (e) => {
        const i = geojson.getLayers().find((layer) => {
            return layer.feature.properties.id === e.detail.id;
        });

        map.editTools.featuresLayer.clearLayers();
        geojson && geojson.removeLayer(i);
        geojson && geojson.resetStyle();
    };

    mapModel.addEventListener("aoiadded", onAoiChange);
    mapModel.addEventListener("aoiupdated", onAoiChange);
    mapModel.addEventListener("aoisloaded", onAoiChange);
    mapModel.addEventListener("aoiSelected", onAoiSelected);
    mapModel.addEventListener("aoideleted", onAoiDeleted);
    mapModel.addEventListener("layerselected", onLayerSelected);
    mapModel.addEventListener( "updateLayersOptions", handleUpdateLayersOptions);

    return mapElt;
}
