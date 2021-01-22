"use strict";

import { Div, Span, createElement } from "@adolgarev/domwrapper";

export default function createRequestForm(
    widgetFactory,
    userModel,
    requestModel
) {
    createRequestForm._formData = {};

    const box = Div({ class: "fixed fixed--aoisform" });
    const formContainer = Div({ class: "aoisform-holder" });
    const title = Div({ class: "aoisform__title" });
    const fromBlock = Div({ class: "aoisform__from" });
    const toBlock = Div({ class: "aoisform__to" });
    const requestBlock = Div({ class: "aoisform__request" });
    const formButtons = Div({ class: "aoisform__buttons" });

    const closeForm = () => {
        const map = document.querySelector(".map");
        const form = document.querySelector(".fixed--aoisform");
        map.classList.remove("map--active");
        form.classList.remove("active");
    };

    const openForm = () => {
        const map = document.querySelector(".map");
        const form = document.querySelector(".fixed--aoisform");
        map.classList.add("map--active");
        form.classList.add("active");
    };

    const onOpenForm = ({ detail }) => {
        openForm();

        createRequestForm._formData.aoi_id = detail.aoi.properties.id;
        createRequestForm._formData.user_id = userModel.user_id;

        title.setChildren(`Request form for ${detail.aoi.properties.name}`);

        const requestInput = widgetFactory.createSelect(
            null,
            (id) => {
                createRequestForm._formData.jupyter_notebook_id = Number(id);
            },
            "input"
        );
        const emptyOption = createElement("option").setChildren(
            "Select request type"
        );
        const options = [emptyOption];

        if (requestModel.notebooks.length) {
            requestModel.notebooks.forEach((notebook) => {
                const option = createElement("option", {
                    value: notebook.id,
                }).setChildren(notebook.name);

                options.push(option);
            });
        }
        requestInput.setChildren(options);
        const requestLabel = Div({ class: "label" }).setChildren(
            "Type of request"
        );
        requestBlock.setChildren(requestLabel, requestInput);

        const fromInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (from) => {
                createRequestForm._formData.date_from = from;
            },
            "input"
        );
        const fromLabel = Div({ class: "label" }).setChildren("From");
        fromBlock.setChildren(fromLabel, fromInput);

        const toInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (to) => {
                createRequestForm._formData.date_to = to;
            },
            "input"
        );
        const toLabel = Div({ class: "label" }).setChildren("To");
        toBlock.setChildren(toLabel, toInput);

        const sendButton = widgetFactory
            .createButton({ type: "button", class: "button button--success" })
            .setChildren("Send");

        sendButton.addEventListener("click", () => {
            requestModel.sendRequest(createRequestForm._formData, ()=>{
                onCloseForm();
                requestModel.getRequests(detail.aoi.properties.id);
            });
        });

        const cancelButton = widgetFactory
            .createButton({ type: "button", class: "button button--neutral" })
            .setChildren("Cancel");

        cancelButton.addEventListener("click", onCloseForm);

        formButtons.setChildren(sendButton, cancelButton);

        formContainer.setChildren(
            closeButton,
            title,
            requestBlock,
            fromBlock,
            toBlock,
            formButtons
        );
        box.setChildren(formContainer);
    };

    const onCloseForm = () => {
        createRequestForm._formData = {};
        closeForm();
        box.setChildren();
    };

    const closeButton = Span({
        class: "close close--gray close--aoisform",
    }).addEventListener("click", onCloseForm);

    requestModel.addEventListener("closeForm", onCloseForm);
    requestModel.addEventListener("openForm", onOpenForm);

    box.setChildren();

    return box;
}
