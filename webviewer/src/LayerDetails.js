"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createLayerDetails(widgetFactory, mapModel) {
    const box = Div().setStyle({
        position: "fixed",
        bottom: "1em",
        left: "1em",
        "z-index": "200",
        "background-color": "white"
    });

    const layerOptionsContainer = Div().setStyle({
        "padding-left": "1em",
        "padding-right": "1em",
        "padding-top": "0.5em",
        "border-top": "1px solid rgb(237, 235, 233)"
    });

    mapModel.addEventListener("layerselected", () => {
        const input = widgetFactory.createRangeInput(0, 100, 100, (value) => {
            mapModel.updateForegroundLayerOptions({
                opacity: value/100
            });
        });
        const label = Div().setChildren("Opacity").setStyle({
            "margin-left": "1em",
            "margin-right": "1em",
            "vertical-align": "baseline"
        });
        layerOptionsContainer.setChildren(label, input);
        box.setChildren(layerOptionsContainer);
    });

    box.setChildren();

    return box;
}