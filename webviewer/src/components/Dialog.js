"use strict";

import { Div } from "@adolgarev/domwrapper";
import WidgetFactory from "../utils/WidgetFactory";

const widgetFactory = new WidgetFactory();

export default function createDialog({
    title,
    onSuccess,
    onCancel,
    input,
    inputLabel,
    inputValue,
    inputPlaceholder,
    error,
    buttonLabel,
}) {
    const dialogHolder = Div({ class: "dialog-holder" });
    const confirmDialog = Div({ class: "dialog" });
    const dialogButtons = Div({ class: "dialog__buttons" });

    const dialogHeader = Div({ class: "dialog__title" }).setChildren(
        title ? title : "Are you sure?"
    );

    const inputField = widgetFactory.createTextField({
        label: inputLabel,
        value: inputValue,
        placeholder: inputPlaceholder,
    });

    const errorBlock = Div({ class: "dialog__error" });

    const okButton = widgetFactory
        .createButton({
            type: "button",
            class: `button ${error ? "button--error" : "button--success"}`,
        })
        .setChildren(buttonLabel);

    okButton.addEventListener("click", () => {
        if (input && !inputField.getValue().trim()) {
            errorBlock.setChildren("Field can not be empty");
            return;
        }
        input ? onSuccess(inputField.getValue()) : onSuccess();
    });

    const cancelButton = widgetFactory
        .createButton({ type: "button", class: "button button--neutral" })
        .setChildren("Cancel");

    cancelButton.addEventListener("click", onCancel);

    dialogButtons.setChildren(okButton, cancelButton);

    input
        ? confirmDialog.setChildren(
              dialogHeader,
              inputField,
              errorBlock,
              dialogButtons
          )
        : confirmDialog.setChildren(dialogHeader, dialogButtons);

    return dialogHolder.setChildren(confirmDialog);
}
