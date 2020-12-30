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
        const labelElt = createElement("label")
            .setAttribute("for", inputEltId)
            .setChildren(placeholder);
        const inputElt = createElement("input")
            .setAttribute("type", typeOverride ? typeOverride : "text")
            .setAttribute("value", "")
            .setStyle({
                id: inputEltId,
                "margin-top": "0.3em",
                "border-width": "1px",
                "border-style": "solid",
                "border-radius": "2px",
                "border-color": "rgb(96, 94, 92)",
                "height": "2em",
                width: "19em",
                "appearance": "none"
            })
            .addEventListener("blur", () => inputElt.setAttribute("value", inputElt.getDOMElement().value));
        const box = Div()
            .setStyle({
                margin: "1em 1em",
            })
            .setChildren(labelElt, inputElt);
        box.getValue = () => inputElt.getAttribute("value");
        box.setValue = (val) => inputElt.setAttribute("value", val);
        return box;
    }

    createPasswordField(placeholder) {
        return this.createTextField(placeholder, "password");
    }

    createErrorMessageBar(message, onCloseCb) {
        return Div().setStyle({
            width: "22em",
            position: "fixed",
            "z-index": "2",
            top: "15%",
            left: "50%",
            "margin-left": "-11em",
            padding: "0.5em",
            "background-color": "rgb(253, 231, 233)",
            "height": "2em"
        }).addEventListener("click", () => {
            onCloseCb();
        }).setChildren(message);
    }

    createRangeInput(min, max, value, onValueChangeCb) {
        const inputElt = createElement("input")
            .setAttribute("type", "range")
            .setAttribute("min", min)
            .setAttribute("max", max)
            .setAttribute("value", value);
        const cb = () => {
            const value = inputElt.getDOMElement().value;
            inputElt.setAttribute("value", value);
            onValueChangeCb(value);
        };
        inputElt.addEventListener("click", cb);
        inputElt.addEventListener("touchend", cb);
        return inputElt;
    }
}
