"use strict";

import { Div } from "@adolgarev/domwrapper/src";

export default function createLoginForm(widgetFactory, userModel) {
  const usernameField = widgetFactory.createTextField("Username");
  const passwordField = widgetFactory.createPasswordField("Password");
  const loginButton = widgetFactory
    .createButton({ type: "button", class: "button button--login" }).setChildren('Login')
    .addEventListener("click", () => {
      userModel.login(usernameField.getValue(), passwordField.getValue());
    });
  const box = Div()
    .setStyle({
      position: "absolute",
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
      margin: "auto",
      height: "300px",
      width: "22em",
    })
    .setChildren(usernameField, passwordField, loginButton);
  return box;
}
