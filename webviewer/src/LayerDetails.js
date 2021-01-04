"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createLayerDetails(widgetFactory, mapModel) {
    const box = Div({ class: "fixed fixed--bl" });

    const layerOptionsContainer = Div({ class: "details__options" });

    mapModel.addEventListener("layerselected", () => {
        const input = widgetFactory.createRangeInput(
            0,
            100,
            100,
            (value) => {
                mapModel.updateForegroundLayerOptions({
                    opacity: value / 100,
                });
            },
            "range__input"
        );
        const label = Div({ class: "range__label" }).setChildren("Opacity");
        layerOptionsContainer.setChildren(label, input);
        box.setChildren(layerOptionsContainer);
    });

    box.setChildren();

    return box;
}
