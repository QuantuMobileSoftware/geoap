"use strict";

import { Div, createElement } from "@adolgarev/domwrapper";

export default class WidgetFactory {

    createButton(value) {
        return createElement("input")
            .setAttribute("value", value)
            .setAttribute("type", "button")
            .setStyle({ margin: "0.3em", width: "19em" });
    }

    createTextField(placeholder) {
        const inputElt = createElement("input")
            .setAttribute("type", "text")
            .setAttribute("value", "")
            .setAttribute("placeholder", placeholder)
            .setStyle({ margin: "0.3em", border: "1px solid #a9a9a9", width: "19em" })
            .addEventListener("blur", () => inputElt.setAttribute("value", inputElt.getDOMElement().value));
        inputElt.getValue = () => inputElt.getAttribute("value");
        inputElt.setValue = (val) => inputElt.setAttribute("value", val);
        return inputElt;
    }

    createPasswordField(placeholder) {
        const inputElt = this.createTextField(placeholder);
        inputElt.setAttribute("type", "password");
        return inputElt;
    }
}