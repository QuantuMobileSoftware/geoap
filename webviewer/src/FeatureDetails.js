"use strict";

import { Div } from "@adolgarev/domwrapper";
import Plotly from "plotly.js-dist";

export default function createFeatureDetails(widgetFactory, mapModel) {
    const box = Div().setStyle({
        position: "fixed",
        top: "1em",
        right: "2em",
        "z-index": "200",
        "background-color": "white"
    });
    box.addEventListener("click", () => {
        box.setChildren();
    });

    const plotlyContainer = Div().setStyle({
        height: "300px",
        width: "300px"
    });
    
    plotlyContainer.componentDidMount = (elt) => {
        Plotly.plot(elt,
            mapModel.selectedFeature.properties.data,
            mapModel.selectedFeature.properties.layout,
            { displayModeBar: false, responsive: true }
        );
    };

    mapModel.addEventListener("featureselected", () => {
        box.setChildren();
        if (mapModel.selectedFeature === null
                || mapModel.selectedFeature.properties.data === undefined) {
            return;
        }
        box.setChildren(plotlyContainer);
    });

    box.setChildren();

    return box;
}