"use strict";

import { Div, Span } from "@adolgarev/domwrapper";
import Plotly from "plotly.js-dist";

export default function createFeatureDetails(widgetFactory, mapModel) {
    const box = Div({ class: "fixed fixed--tr" });
    const closeButton = Span({ class: "close close--gray close--plotly" }).addEventListener(
        "click",
        () => {
            box.setChildren();
        }
    );

    const plotlyContainer = Div({ class: "plotly__details" });

    plotlyContainer.componentDidMount = (elt) => {
        Plotly.plot(
            elt,
            mapModel.selectedFeature.properties.data,
            mapModel.selectedFeature.properties.layout,
            { displayModeBar: false, responsive: true }
        );
    };

    mapModel.addEventListener("featureselected", () => {
        box.setChildren();
        if (
            mapModel.selectedFeature === null ||
            mapModel.selectedFeature.properties.data === undefined
        ) {
            return;
        }
        box.setChildren(plotlyContainer, closeButton);
    });

    box.setChildren();

    return box;
}
