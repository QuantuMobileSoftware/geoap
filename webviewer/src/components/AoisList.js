"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createAoisList(widgetFactory, mapModel, requestModel) {
    const box = Div({ class: "fixed fixed--aoislist" });

    const aoisContainer = Div({ class: "aoislist-holder" });
    const arrow = Div({ class: "aoislist__item-arrow" });
    const openFormButton = widgetFactory
        .createButton({ type: "button", class: "button button--success" })
        .setChildren("Add request");

    const onAoiChange = () => {
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
                mapModel.selectAoi(aoi);
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    const onAoiSelected = ({ detail }) => {
        aoisContainer.setChildren();
        box.setChildren();

        const aoisElts = [];

        mapModel.aois.forEach((aoi) => {
            const isActive = aoi.properties.id === detail.aoi.properties.id;
            const aoiElt = Div({
                class: `${
                    isActive
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
                mapModel.selectAoi(aoi);
                requestModel.closeRequestForm();
            });

            aoisElts.push(aoiElt);

            if (isActive) {
                const buttonHolder = Div({class: "aoislist__buttonholder"});
                openFormButton.addEventListener("click", () => {
                    requestModel.openRequestForm(aoi);
                });
                buttonHolder.setChildren(openFormButton);
                isActive && aoisElts.push(buttonHolder);
            }
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    mapModel.addEventListener("aoisloaded", onAoiChange);
    mapModel.addEventListener("aoiadded", onAoiChange);
    mapModel.addEventListener("aoiupdated", onAoiChange);

    mapModel.addEventListener("aoiSelected", onAoiSelected);

    box.setChildren();

    return box;
}
