"use strict";

import { Div, Span, createElement } from "@adolgarev/domwrapper";
import WidgetFactory from "../utils/WidgetFactory";

import "../styles/components/FeatureRequestDialog.css";

const widgetFactory = new WidgetFactory();

export default function createFeatureRequestDialog({ requestModel } = {}) {
    const dialog = Div({ class: "dialog feature-request-dialog fixed" });

    const dialogTitle = Span({ class: "dialog__title" }).setChildren(
        "To access this functionality please contact us!"
    );

    const dialogChildren = Div({ class: "dialog__children" });

    const form = createElement("form", { class: "form request-from" });

    const formMessageError = createElement("p", { class: "form__message form__message--error" });

    const formInput = widgetFactory.createTextField({
        label: "Email",
        placeholder: "Enter email",
        class: "form__input form__input-email",
    });

    const formButtons = Div({ class: "form__buttons" });

    const formButtonCancel = widgetFactory
        .createButton({
            type: "button",
            class: "button button--neutral form__button form__button-cancel",
        })
        .setChildren("Cancel");

    const formButtonSubmit = widgetFactory
        .createButton({
            type: "submit",
            class: "button button--success form__button form__button-submit",
        })
        .setChildren("Send");

    const clearInputValue = () => {
        const input = formInput._element.querySelector(".input");
        if (!input || !input.value) return;
        input.value = "";
    };

    const close = () => {
        dialog._element.classList.remove("is-open");
        formMessageError.setChildren("");
        clearInputValue();
    };

    const open = () => {
        dialog._element.classList.add("is-open");
    };

    const handleSubmit = event => {
        event.preventDefault();

        const input = formInput._element.querySelector(".input");

        formButtonSubmit._element.disabled = true;
        formButtonCancel._element.disabled = true;

        requestModel
            .sendFeatureRequest(input.value)
            .then(() => {
                formMessageError.setChildren('');
                close();
            })
            .catch(error => formMessageError.setChildren(error))
            .finally(() => {
                formButtonSubmit._element.disabled = false;
                formButtonCancel._element.disabled = false;
            });
    };

    formButtonCancel.addEventListener("click", close);
    form.addEventListener("submit", handleSubmit);
    requestModel.addEventListener("closeFeatureRequestDialog", close);
    requestModel.addEventListener("openFeatureRequestDialog", open);

    formButtons.setChildren(formButtonCancel, formButtonSubmit);
    form.setChildren(formInput, formMessageError, formButtons);
    dialogChildren.setChildren(form);

    return dialog.setChildren(dialogTitle, dialogChildren);
}
