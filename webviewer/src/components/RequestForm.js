"use strict";

import { Div, Span } from "@adolgarev/domwrapper";

export default function createRequestForm(
    widgetFactory,
    mapModel,
    requestModel
) {
    const box = Div({ class: "fixed fixed--aoisform" });

    const formContainer = Div({ class: "aoisform-holder" });

    const title = Div({ class: "aoisform__title" });
    const fromBlock = Div({ class: "aoisform__from" });
    const toBlock = Div({ class: "aoisform__to" });
    const request = Div({ class: "aoisform__request" });

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

    const onCloseForm = () => {
        closeForm();
        box.setChildren();
    };

    const closeButton = Span({
        class: "close close--gray close--aoisform",
    }).addEventListener("click", onCloseForm);

    const onOpenForm = ({ detail }) => {
        openForm();

        title.setChildren(`Request form for ${detail.aoi.properties.name}`);

        const requestInput = widgetFactory.createSelect(
            null,
            (value) => {
                console.log(value);
            },
            "request__input"
        );
        const requestLabel = Div({ class: "request__label" }).setChildren(
            "Type of request"
        );
        request.setChildren(requestLabel, requestInput);

        const fromInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (value) => {
                console.log(value);
            },
            "date__input"
        );
        const fromLabel = Div({ class: "date__label" }).setChildren("From");
        fromBlock.setChildren(fromLabel, fromInput);

        const toInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (value) => {
                console.log(value);
            },
            "date__input"
        );
        const toLabel = Div({ class: "date__label" }).setChildren("To");
        toBlock.setChildren(toLabel, toInput);

        const formButtons = Div({ class: "aoisform__buttons" });

        const sendButton = widgetFactory
            .createButton({ type: "button", class: "button button--success" })
            .setChildren("Send");

        const cancelButton = widgetFactory
            .createButton({ type: "button", class: "button button--neutral" })
            .setChildren("Cancel");

        cancelButton.addEventListener("click", onCloseForm);

        formButtons.setChildren(sendButton, cancelButton);

        formContainer.setChildren(
            closeButton,
            title,
            request,
            fromBlock,
            toBlock,
            formButtons
        );
        box.setChildren(formContainer);
    };

    requestModel.addEventListener("closeForm", onCloseForm);
    requestModel.addEventListener("openForm", onOpenForm);

    box.setChildren();

    return box;
}
