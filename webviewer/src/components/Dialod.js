"use strict";

import { Div } from "@adolgarev/domwrapper";
import WidgetFactory from "../utils/WidgetFactory";

const widgetFactory = new WidgetFactory();

export default function createDialog({ title, onSuccess, onCancel }) {
    const dialogHolder = Div({ class: "dialog-holder" });
    const confirmDialog = Div({ class: "dialog" });
    const dialogButtons = Div({ class: "dialog__buttons" });

    const dialogHeader = Div({ class: "dialog__title" }).setChildren(
        title ? title : "Are you sure?"
    );

    const okButton = widgetFactory
        .createButton({ type: "button", class: "button button--error" })
        .setChildren("Delete");

    okButton.addEventListener("click", onSuccess);

    const cancelButton = widgetFactory
        .createButton({ type: "button", class: "button button--neutral" })
        .setChildren("Cancel");

    cancelButton.addEventListener("click", onCancel);

    dialogButtons.setChildren(okButton, cancelButton);

    confirmDialog.setChildren(dialogHeader, dialogButtons);

    return dialogHolder.setChildren(confirmDialog);
}
