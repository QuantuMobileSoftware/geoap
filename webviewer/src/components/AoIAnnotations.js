"use strict";

import { Div, Span, createElement } from "@adolgarev/domwrapper";

import "../styles/components/AoIAnnotations.css";

export default function createAoIAnnotation({ aoiAnnotationModel } = {}) {
    const container = Div({ class: `aoi-annotation-container fixed` });

    const closeButton = Span({ class: "close close--gray close--aoisform" });
    const title = createElement("h2", { class: "container-title" }).setChildren("Annotations");

    const renderLabel = ({ name, area, color }) => {
        const label = Div({ class: "aoi-annotaino-label" });
        const labelColor = Div({ class: "aoi-annotaino-label-color" });
        const labelBody = Div({ class: "aoi-annotaino-label-body" });
        const labelName = createElement("h4", { class: "aoi-annotaino-label-title" });
        const labelArea = Div({ class: "aoi-annotaino-label-coordinates" });
        const labelUnit = Span({ class: "aoi-annotaino-label-unit" }).setChildren(
            "km",
            createElement("sup").setChildren("2")
        );

        labelColor.setStyle({ background: `rgba(${color})` });

        return label.setChildren(
            labelColor,
            labelBody.setChildren(
                labelName.setChildren(name),
                labelArea.setChildren(area.toString(), labelUnit)
            )
        );
    };

    const renderChildren = aoiAnnotation => {
        const children = [closeButton, title];

        if (aoiAnnotation.areaName) {
            children.push(
                createElement("h3", { class: "aoi-annotation-area-name" }).setChildren(
                    aoiAnnotation.areaName
                )
            );
        }

        if (aoiAnnotation.labels.length) {
            children.push(
                Div({ class: "aoi-annotation-lables" }).setChildren(
                    aoiAnnotation.labels.map(renderLabel)
                )
            );
        }

        if (aoiAnnotation.type === "NDVI") {
            children.push(
                Div({ class: "aoi-annotation-area-ndvi" })
            )
        }

        container.setChildren(children);
    };

    const handleAoIAnnotationOpen = ({ detail: aoiAnnotation }) => {
        container._element.classList.add("is-open");
        renderChildren(aoiAnnotation);
    };

    const handleAoIAnnotationClose = () => {
        container._element.classList.remove("is-open");
        container.setChildren("");
    };

    closeButton.addEventListener("click", handleAoIAnnotationClose);

    aoiAnnotationModel.addEventListener("openAoIAnnotation", handleAoIAnnotationOpen);
    aoiAnnotationModel.addEventListener("closeAoIAnnotation", handleAoIAnnotationClose);

    return container;
}
