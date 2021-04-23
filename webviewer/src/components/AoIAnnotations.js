"use strict";

import { Div, Span, createElement } from "@adolgarev/domwrapper";

import "../styles/components/AoIAnnotations.css";

export default function createAoIAnnotation({ aoiAnnotationModel } = {}) {
    console.log(aoiAnnotationModel);
    const container = Div({ class: `aoi-annotation-container fixed` });

    // const closeButton = Span({ class: "close close--gray close--aoisform" });
    // const title = createElement("h2", { class: "container-title" }).setChildren("Annotations");

    // const areaName = createElement("h3", { class: "aoi-annotation-area-name" }).setChildren(
    //     aoiAnnotationModel.areaName
    // );

    // const lables = Div({ class: "aoi-annotation-lables" });

    // const renderLabel = ({ title, coordinates, color }) => {
    //     const label = Div({ class: "aoi-annotaino-label" });
    //     const labelColor = Div({ class: "aoi-annotaino-label-color" });
    //     console.log(labelColor);
    //     const labelBody = Div({ class: "aoi-annotaino-label-body" });
    //     const labelTitle = createElement("h4", { class: "aoi-annotaino-label-title" });
    //     const labelCoordinates = Div({ class: "aoi-annotaino-label-coordinates" });

    //     return label.setChildren(
    //         labelColor,
    //         labelBody.setChildren(
    //             labelTitle.setChildren(title),
    //             labelCoordinates.setChildren(coordinates)
    //         )
    //     );
    // };

    // label.setChildren(aoiAnnotationModel.labels.map(renderLabel));

    // return container.setChildren(closeButton, title, areaName, lables);

    const handleAoIAnnotationOpen = () => {
        container._element.classList.add('is-open');
        console.log(aoiAnnotationModel)
    };

    const handleAoIAnnotationClose = () => {
        container._element.classList.remove('is-open');
    };

    aoiAnnotationModel.addEventListener("openAoIAnnotation", handleAoIAnnotationOpen);
    aoiAnnotationModel.addEventListener("closeAoIAnnotation", handleAoIAnnotationClose);

    return container;
}
