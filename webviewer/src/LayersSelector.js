"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createLayersSelector(widgetFactory, mapModel) {
    const box = Div().setStyle({
        position: "fixed",
        top: "1em",
        left: "1em",
        "z-index": "100",
        "background-color": "white"
    });

    const button = Div().setStyle({
        height: "3em",
        padding: "1em 2em",
        cursor: "pointer"
    }).setChildren("Layers");
    
    const listContainer = Div().setStyle({
    });
    let isOpen = false;
    button.addEventListener("click", () => {
        isOpen = !isOpen;
        if (isOpen) {
            mapModel.getLayers();
            box.setChildren(button, listContainer);
        } else {
            box.setChildren(button);
        }
    });

    mapModel.addEventListener("layersupdated", () => {
        const layerElts = [];
        const layers = mapModel.layers.slice();
        layers.sort((a, b) => {
            if (a.filepath < b.filepath) {
                return -1;
            }
            if (a.filepath > b.filepath) {
                return 1;
            }
            return 0;
        })
        layers.forEach(x => {
            const layerElt = Div().setStyle({
                height: "2em",
                "padding-left": "1em",
                "padding-right": "1em",
                "padding-top": "0.5em",
                cursor: "pointer",
                "border-top": "1px solid rgb(237, 235, 233)",
                "vertical-align": "baseline",
                "background": "white"
            }).setChildren(x.filepath);
            layerElt.addEventListener("click", () => {
                mapModel.selectLayer(x);
                layerElts.forEach(x => {
                    x.updateStyle({
                        background: "white"
                    });
                })
                layerElt.updateStyle({
                    background: "rgb(237, 235, 233)"
                });
            });
            if (mapModel.selectedLayer !== null && mapModel.selectedLayer.id === x.id) {
                layerElt.updateStyle({
                    background: "rgb(237, 235, 233)"
                });
            }
            layerElts.push(layerElt);
        });
        listContainer.setChildren(layerElts);
    });

    box.setChildren(button);

    return box;
}