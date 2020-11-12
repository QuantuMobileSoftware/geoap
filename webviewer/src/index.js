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
const root = new Div();

userModel.addEventListener("loggedin", () => {
    root.setChildren("loggedin");
});
userModel.addEventListener("loggedout", () => {
    root.setChildren(loginForm);
});
userModel.getUserDetails();

window.addEventListener("DOMContentLoaded", () => {
    render(root, document.getElementsByTagName("body")[0]);
});
