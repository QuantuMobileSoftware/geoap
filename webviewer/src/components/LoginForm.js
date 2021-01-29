"use strict";

import { Div } from "@adolgarev/domwrapper/src";

export default function createLoginForm(widgetFactory, userModel) {
    const usernameField = widgetFactory.createTextField({
        label: "Username",
        placeholder: "Enter username",
    });
    const passwordField = widgetFactory.createTextField({
        label: "Password",
        placeholder: "Enter password",
        type: 'password'
    });
    const loginButton = widgetFactory
        .createButton({ type: "button", class: "button button--login" })
        .setChildren("Login")
        .addEventListener("click", () => {
            userModel.login(usernameField.getValue(), passwordField.getValue());
        });
    const box = Div({ class: "login-container" }).setChildren(
        usernameField,
        passwordField,
        loginButton
    );

    return box;
}
