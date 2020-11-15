"use strict";

import "./normalize.css";
import "./index.css";
import { render, createElement, Div, Span } from "@adolgarev/domwrapper";
import WidgetFactory from "./WidgetFactory";
import UserModel from "./UserModel";
import APIWrapper from "./APIWrapper";
import createLoginForm from "./LoginForm";

const apiWrapper = new APIWrapper();
const userModel = new UserModel(apiWrapper);
const widgetFactory = new WidgetFactory();
const loginForm = createLoginForm(widgetFactory, userModel);
const root = Div();

// TODO(adolgarev) replace with modal window
const alertContainer = Div();
const errorContainer = Div().setStyle({
    width: "22em",
    position: "fixed",
    "z-index": "2",
    top: "30%",
    left: "50%",
    "margin-left": "-11em",
    padding: "0.1em",
    //            border: "1px solid #383838",
    "background-color": "white",
    color: "red",
    "text-align": "center"
}).addEventListener("click", () => {
    alertContainer.setChildren();
});
apiWrapper.addEventListener("error", (e) => {
    if (e.detail.non_field_errors) {
        errorContainer.setChildren(e.detail.non_field_errors[0]);
        alertContainer.setChildren(errorContainer);
    }
})

userModel.addEventListener("loggedin", () => {
    root.setChildren("loggedin", alertContainer);
});
userModel.addEventListener("loggedout", () => {
    root.setChildren(loginForm, alertContainer);
});
userModel.getUserDetails();

window.addEventListener("DOMContentLoaded", () => {
    render(root, document.getElementsByTagName("body")[0]);
});
