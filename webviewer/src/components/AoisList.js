"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createAoisList(widgetFactory, mapModel) {
    const box = Div({ class: "fixed fixed--aoislist" });

    const aoisContainer = Div({ class: "aoislist-holder" });

    mapModel.addEventListener("aoisloaded", () => {
        if (!mapModel.aois.length) {
            const emptyElt = Div({ class: "aoislist__emptyitem" }).setChildren(
                'No data. Please create AOI'
            );
            aoisContainer.setChildren(emptyElt);
            box.setChildren(aoisContainer);
            return;
        }

        const aoisElts = [];

        mapModel.aois.forEach(({ properties }) => {
            const aoiElt = Div({ class: "aoislist__item" }).setChildren(
                properties.name
            );

            aoiElt.addEventListener("click", () => {
               mapModel.selectAoiFromList(properties.id)
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    });

    mapModel.addEventListener("aoiSelected", ({ detail }) => {
        aoisContainer.setChildren();
        box.setChildren();

        const aoisElts = [];

        mapModel.aois.forEach(({ properties }) => {
            const aoiElt = Div({
                class: `${
                    properties.name === detail.aoi.properties.name
                        ? "aoislist__item aoislist__item--active"
                        : "aoislist__item"
                }`,
            }).setChildren(properties.name);

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    });

    box.setChildren();

    return box;
}
