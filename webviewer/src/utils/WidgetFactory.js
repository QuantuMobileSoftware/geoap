"use strict";

import { Div, Span, createElement } from "@adolgarev/domwrapper";
export default class WidgetFactory {
    generateRandomId(prefix) {
        return prefix + Math.random().toString(36).substring(7);
    }

    createButton(params) {
        return createElement("button", params);
    }

    createTextField(placeholder, typeOverride) {
        const inputEltId = this.generateRandomId("TextField");
        const labelElt = createElement("label", {
            for: inputEltId,
            class: "label",
        }).setChildren(placeholder);

        const inputElt = createElement("input", {
            value: "",
            id: inputEltId,
            type: typeOverride ? typeOverride : "text",
            class: "input",
        }).addEventListener("blur", () =>
            inputElt.setAttribute("value", inputElt.getDOMElement().value)
        );
        const box = Div({ class: "input-holder" }).setChildren(labelElt, inputElt);
        box.getValue = () => inputElt.getAttribute("value");
        box.setValue = (val) => inputElt.setAttribute("value", val);
        return box;
    }

    createPasswordField(placeholder) {
        return this.createTextField(placeholder, "password");
    }

    createErrorMessageBar(message, onCloseCb) {
        const closeButton = Span({ class: "close close--white" }).addEventListener(
            "click",
            () => {
                onCloseCb();
            }
        );
        const messageText = Span({ class: "message" }).setChildren(
            message
        );
        return Div({ class: "error" }).setChildren(messageText, closeButton);
    }

    createSuccessMessageBar(message, onCloseCb) {
        const closeButton = Span({ class: "close close--white" }).addEventListener(
            "click",
            () => {
                onCloseCb();
            }
        );
        const messageText = Span({ class: "message" }).setChildren(
            message
        );
        return Div({ class: "success" }).setChildren(messageText, closeButton);
    }

    createRangeInput(min, max, value, onValueChangeCb, className) {
        const inputElt = createElement("input", {
            type: "range",
            min,
            max,
            value,
            ...(className && { class: className }),
        });

        const cb = () => {
            const value = inputElt.getDOMElement().value;
            inputElt.setAttribute("value", value);
            onValueChangeCb(value);
        };
        inputElt.addEventListener("click", cb);
        inputElt.addEventListener("touchend", cb);
        return inputElt;
    }

    createDateInput(min, max, value, onValueChangeCb, className){
        const inputElt = createElement("input", {
            type: "date",
            min,
            max,
            value,
            ...(className && { class: className }),
        });

        const cb = () => {
            const value = inputElt.getDOMElement().value;
            inputElt.setAttribute("value", value);
            onValueChangeCb(value);
        };
        inputElt.addEventListener("change", cb);
        return inputElt;
    }

    createSelect(value, onValueChangeCb, className){
        const inputElt = createElement("select", {
            value,
            ...(className && { class: className }),
        });

        const cb = () => {
            const value = inputElt.getDOMElement().value;
            onValueChangeCb(value);
        };
        inputElt.addEventListener("change", cb);
        return inputElt;
    }
}
