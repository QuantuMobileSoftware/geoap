"use strict";

import { Div, createElement } from "@adolgarev/domwrapper";

export default class WidgetFactory {

    generateRandomId(prefix) {
        return prefix + Math.random().toString(36).substring(7);
    }

    createButton(value) {
        return createElement("input")
            .setAttribute("value", value)
            .setAttribute("type", "button")
            .setStyle({
                margin: "1em",
                "background-color": "rgb(0, 120, 212)",
                "border-color": "rgb(0, 120, 212)",
                "border-width": "1px",
                "border-radius": "2px",
                "border-style": "solid",
                "height": "2em",
                "color": "rgb(255, 255, 255)",
                "padding-left": "1em",
                "padding-right": "1em",
                "vertical-align": "baseline",
                "appearance": "none"
            });
    }

    createTextField(placeholder, typeOverride) {
        const inputEltId = this.generateRandomId("TextField");
        const labelElt = createElement("label")
            .setAttribute("for", inputEltId)
            .setChildren(placeholder);
        const inputElt = createElement("input")
            .setAttribute("type", typeOverride? typeOverride : "text")
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
}