"use strict";

import "./normalize.css";
import "./index.css";
import { render, createElement, Div, Span } from "@adolgarev/domwrapper";
import WidgetFactory from "./WidgetFactory";
import UserModel from "./UserModel";
import APIWrapper from "./APIWrapper";
import createLoginForm from "./LoginForm";
import MapModel from "./MapModel";
import createMap from "./Map";
import createLayersSelector from "./LayersSelector";
import createFeatureDetails from "./FeatureDetails";
import createLayerDetails from "./LayerDetails";

const apiWrapper = new APIWrapper();
const userModel = new UserModel(apiWrapper);
const widgetFactory = new WidgetFactory();
const loginForm = createLoginForm(widgetFactory, userModel);
const mapModel = new MapModel(apiWrapper);
const map = createMap(widgetFactory, mapModel);
const layersSelector = createLayersSelector(widgetFactory, mapModel);
const featureDetails = createFeatureDetails(widgetFactory, mapModel);
const layerDetails = createLayerDetails(widgetFactory, mapModel);
const root = Div({ class: "container" });

const messageContainer = Div();
apiWrapper.addEventListener("error", (e) => {
    if (e.detail.non_field_errors) {
        messageContainer.setChildren(
            widgetFactory.createErrorMessageBar(e.detail.non_field_errors[0], () => {
                messageContainer.setChildren();
            })
        );
    }
});

userModel.addEventListener("loggedin", () => {
    // remove loggedout error if it was previously set
    messageContainer.setChildren();

    root.setChildren(
        map,
        layersSelector,
        featureDetails,
        layerDetails,
        messageContainer
    );
});

userModel.addEventListener("loggedout", () => {
    root.setChildren(loginForm, messageContainer);
});

root.componentDidMount = () => {
    userModel.getUserDetails();
};

window.addEventListener("DOMContentLoaded", () => {
    render(root, document.getElementsByTagName("body")[0]);
});
