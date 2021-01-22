"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createAoisList(widgetFactory, mapModel, requestModel) {
    const box = Div({ class: "fixed fixed--aoislist" });

    const aoisContainer = Div({ class: "aoislist-holder" });
    const buttonHolder = Div({ class: "aoislist__buttonholder" });
    const results = Div({ class: "aoislist__results" });
    const requests = Div({ class: "aoislist__requests" });

    const arrowIcon = Div({ class: "aoislist__item-arrow" });

    const openFormButton = widgetFactory
        .createButton({ type: "button", class: "button button--success" })
        .setChildren("Add request");
    const requestsTitle = Div({ class: "aoislist__title" }).setChildren(
        "Requests"
    );
    const resultsTitle = Div({ class: "aoislist__title" }).setChildren(
        "Results"
    );

    let timer;
    let currentId;

    const onAoiChange = () => {
        clearInterval(timer);

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
            const controls = Div({ class: "aoislist__controls" });
            controls.setChildren(arrowIcon);

            const aoiElt = Div({ class: "aoislist__item" }).setChildren(
                Div({ class: "aoislist__item-text" }).setChildren(
                    aoi.properties.name
                ),
                controls
            );

            aoiElt.addEventListener("click", () => {
                mapModel.selectAoi(aoi);
                currentId = aoi.properties.id;
                requestModel.getResults(currentId);
                requestModel.getRequests(currentId);
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    const onAoiSelected = ({ detail }) => {
        aoisContainer.setChildren();
        box.setChildren();
        clearInterval(timer);

        currentId = detail.aoi.properties.id;

        const aoisElts = [];

        mapModel.aois.forEach((aoi) => {
            const controls = Div({ class: "aoislist__controls" });
            const removeIcon = Div({
                class: "aoislist__item-remove",
            });

            controls.setChildren(removeIcon, arrowIcon);

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
                controls
            );

            aoiElt.addEventListener("click", (e) => {
                let elem = document.querySelector(".aoislist__item--active");
                elem.classList.remove("aoislist__item--active");
                e.target.classList.add("aoislist__item--active");
                mapModel.selectAoi(aoi);
                currentId = aoi.properties.id;
                requestModel.closeRequestForm();
                requestModel.getResults(currentId);
                requestModel.getRequests(currentId);
            });

            aoisElts.push(aoiElt);

            if (isActive) {
                removeIcon.addEventListener("click", (e) => {
                    let result = window.confirm(
                        "Are you sure want to delete AOI with requests and results?"
                    );
                    if (result) {
                        mapModel.deleteAoi(aoi.properties.id);
                    }
                });

                openFormButton.addEventListener("click", () => {
                    requestModel.openRequestForm(aoi);
                });

                buttonHolder.setChildren(openFormButton);
                isActive && aoisElts.push(results, requests, buttonHolder);

                timer = setInterval(() => {
                    requestModel.getResults(currentId);
                    requestModel.getRequests(currentId);
                }, 10000);
            }
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(aoisContainer);
    };

    const onRequestsLoaded = ({ detail }) => {
        requests.setChildren();

        if (!requestModel.requests.length || detail.id !== currentId) {
            return;
        }

        const items = [];

        items.push(requestsTitle);

        requestModel.requests.forEach((request) => {
            const elem = Div({ class: "aoislist__requests-item" });

            const notebook = Div({
                class: "aoislist__requests-item-text",
            }).setChildren(`Request: ${request.jupyter_notebook_name}`);
            const date = Div({
                class: "aoislist__requests-item-text",
            }).setChildren(
                request.date_from ? `From: ${request.date_from}` : "",
                " ",
                request.date_to ? `To: ${request.date_to}` : ""
            );
            elem.setChildren(notebook, date);
            items.push(elem);
        });

        requests.setChildren(items);
    };

    const onResultsLoaded = ({ detail }) => {
        results.setChildren();

        if (!requestModel.results.length || detail.id !== currentId) {
            return;
        }

        const items = [];

        items.push(resultsTitle);

        requestModel.results.forEach((result) => {
            const elem = Div({ class: "aoislist__results-item" }).setChildren(
                `Name: ${result.filepath}`
            );

            elem.addEventListener("click", (e) => {
                const highlightedItem = document.querySelector(
                    ".aoislist__results-item--active"
                );

                highlightedItem &&
                    highlightedItem.classList.remove(
                        "aoislist__results-item--active"
                    );

                e.target.classList.add("aoislist__results-item--active");
                mapModel.selectLayer(result);
            });

            items.push(elem);
        });

        results.setChildren(items);
    };

    mapModel.addEventListener("aoisloaded", onAoiChange);
    mapModel.addEventListener("aoiadded", onAoiChange);
    mapModel.addEventListener("aoiupdated", onAoiChange);
    mapModel.addEventListener("aoideleted", onAoiChange);
    mapModel.addEventListener("aoiSelected", onAoiSelected);

    requestModel.addEventListener("requestsLoaded", onRequestsLoaded);
    requestModel.addEventListener("resultsLoaded", onResultsLoaded);

    box.setChildren();

    return box;
}
