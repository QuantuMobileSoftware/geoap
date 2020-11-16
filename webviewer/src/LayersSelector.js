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
            listContainer.setChildren("" + mapModel.layers);
        } else {
            listContainer.setChildren();
        }
    });

    box.componentDidMount = () => {
        mapModel.getLayers();
    };
    mapModel.addEventListener("layersupdated", () => {
        console.log(mapModel.layers);
    });

    box.setChildren(button, listContainer);

    return box;
}