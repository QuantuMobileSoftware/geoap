"use strict";

import { Div } from "@adolgarev/domwrapper";

import Dialog from "./Dialog";

const confirmContainer = Div({ class: "confirm-container" });

export default function createAoisList(
    widgetFactory,
    mapModel,
    requestModel,
    userModel,
    aoiAnnotationModel
) {
    const box = Div({ class: "fixed fixed--aoislist" });

    const aoisContainer = Div({ class: "aoislist-holder" });
    const buttonHolder = Div({ class: "aoislist__buttonholder" });
    const results = Div({ class: "aoislist__results" });
    const requests = Div({ class: "aoislist__requests" });
    const arrowIcon = Div({ class: "aoislist__item-arrow" });

    const openFormButton = widgetFactory
        .createButton({ type: "button", class: "button button--success" })
        .setChildren("Add request");

    let timer;
    let currentId;

    const onAoiChange = () => {
        clearInterval(timer);

        if (!mapModel.aois.length) {
            const emptyElt = Div({ class: "aoislist__emptyitem" }).setChildren(
                "No data. Please create AOI"
            );
            aoisContainer.setChildren(emptyElt);
            box.setChildren(confirmContainer, aoisContainer);
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
                requestModel.getNotebooks();
            });

            aoisElts.push(aoiElt);
        });

        aoisContainer.setChildren(aoisElts);
        box.setChildren(confirmContainer, aoisContainer);
    };

    const confirmRemove = (id) => (e) => {
        const successCallback = () => {
            mapModel.deleteAoi(id);
            confirmContainer.setChildren();
        };
        const cancelCallback = () => confirmContainer.setChildren();

        confirmContainer.setChildren(
            Dialog({
                title: "Are you sure want to delete AOI?",
                onSuccess: successCallback,
                onCancel: cancelCallback,
                error: true,
                buttonLabel: "Delete",
            })
        );
    };

    const confirmEdit = (aoi) => (e) => {
        const successCallback = (name) => {
            mapModel.updateAoiName({
                name,
                id: aoi.properties.id,
                geometry: aoi.geometry,
                user: userModel.user_id,
            });
            confirmContainer.setChildren();
        };
        const cancelCallback = () => confirmContainer.setChildren();

        confirmContainer.setChildren(
            Dialog({
                input: true,
                inputLabel: "AOI name",
                inputPlaceholder: "Enter new name",
                inputValue: aoi.properties.name,
                title: `Rename ${aoi.properties.name}`,
                buttonLabel: "Ok",
                onSuccess: successCallback,
                onCancel: cancelCallback,
            })
        );
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
            const editIcon = Div({
                class: "aoislist__item-edit",
            });

            if (userModel.isDemoUser) {
                controls.setChildren(arrowIcon);
            } else {
                controls.setChildren(editIcon, removeIcon, arrowIcon);
            }


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

                if (removeIcon) {
                    removeIcon.addEventListener(
                        "click",
                        confirmRemove(aoi.properties.id)
                    );
                }

                if (editIcon) {
                    editIcon.addEventListener("click", confirmEdit(aoi));
                }

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
        box.setChildren(confirmContainer, aoisContainer);
    };

    const onRequestsLoaded = ({ detail }) => {
        requests.setChildren();

        if (!requestModel.requests.length || detail.id !== currentId) {
            return;
        }

        const items = [];

        requestModel.requests.forEach((request) => {
            if (request.success) {
                return;
            }
            const elem = Div({ class: "aoislist__requests-item" });

            const notebook = Div({
                class: "aoislist__requests-item-text",
            }).setChildren(`Request: ${request.notebook_name}`);
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

        requestModel.results.forEach(result => {
            const classNameActive = "aoislist__results-item--active";
            const classNameSelected = "aoislist__results-item--selected";

            const lastSelectedLayer = () => mapModel.selectedLayers[mapModel.selectedLayers.length - 1] || {};
            const isSelectedLayer = () => mapModel.selectedLayers.some(({ id }) => id === result.id);
            const isActiveLayer = () => lastSelectedLayer() && lastSelectedLayer().id === result.id;

            const elem = Div({
                id: result.id,
                class: `aoislist__results-item ${isActiveLayer() ? classNameActive : ""} ${isSelectedLayer() ? classNameSelected : ""}`
            });

            const name = Div({
                class: "aoislist__results-item-text"
            }).setChildren(result.name ? result.name : result.filepath);

            const date = Div({
                class: "aoislist__results-item-text"
            }).setChildren(result.start_date ? `From: ${result.start_date}` : "", " ", result.end_date ? `To: ${result.end_date}` : "");

            elem.setChildren(name, date);

            elem.addEventListener("click", e => {
                mapModel.selectLayer(result);
                !!result.labels && aoiAnnotationModel.openAoIAnnotation(result);
                result.name.includes("(NDVI)") && aoiAnnotationModel.openAoIAnnotation(result);

                const activeLayer = document.querySelector(`.${classNameActive}`);
                activeLayer && activeLayer.classList.remove(classNameActive);

                const lastSelectedElement = document.getElementById(lastSelectedLayer().id);
                lastSelectedElement && lastSelectedElement.classList.add(classNameActive);

                elem.getDOMElement().classList[isSelectedLayer() ? "add" : "remove"](classNameSelected);
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
