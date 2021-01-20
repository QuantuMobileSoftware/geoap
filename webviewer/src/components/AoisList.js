"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createAoisList(widgetFactory, mapModel) {
    const box = Div({ class: "fixed fixed--aoislist" });

    const aoisContainer = Div({ class: "aoislist-holder" });
    const arrow = Div({ class: "aoislist__item-arrow" });

    const handleAoiChange = () => {
        if (!mapModel.aois.length) {
            const emptyElt = Div({ class: "aoislist__emptyitem" }).setChildren(
                "No data. Please create AOI"
            );
            aoisContainer.setChildren(emptyElt);
            box.setChildren(aoisContainer);
            return;
        }

        aoisContainer.setChildren();
        box.setChildren();

        const aoisElts = [];

        mapModel.aois.forEach((aoi) => {
            const aoiElt = Div({ class: "aoislist__item" }).setChildren(
                Div({ class: "aoislist__item-text" }).setChildren(
                    aoi.properties.name
                ),
                arrow
            );

            aoiElt.addEventListener("click", () => {
                mapModel.selectAoiFromList(aoi);
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    const handleAoiSelected = ({ detail }) => {
        aoisContainer.setChildren();
        box.setChildren();

        const aoisElts = [];

        mapModel.aois.forEach((aoi) => {
            const aoiElt = Div({
                class: `${
                    aoi.properties.id === detail.aoi.properties.id
                        ? "aoislist__item aoislist__item--active"
                        : "aoislist__item"
                }`,
            }).setChildren(
                Div({ class: "aoislist__item-text" }).setChildren(
                    aoi.properties.name
                ),
                arrow
            );

            aoiElt.addEventListener("click", (e) => {
                let elem = document.querySelector(".aoislist__item--active");
                elem.classList.remove("aoislist__item--active");
                e.target.classList.add("aoislist__item--active");
                mapModel.selectAoiFromList(aoi);
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    mapModel.addEventListener("aoisloaded", handleAoiChange);
    mapModel.addEventListener("aoiadded", handleAoiChange);
    mapModel.addEventListener("aoiupdated", handleAoiChange);
    
    mapModel.addEventListener("aoiSelected", handleAoiSelected);

    box.setChildren();

    return box;
}
