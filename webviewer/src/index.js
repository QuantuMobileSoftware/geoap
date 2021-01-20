"use strict";

import "./styles/normalize.css";
import "./styles/index.css";

import { render, Div } from "@adolgarev/domwrapper";

import WidgetFactory from "./utils/WidgetFactory";
import APIWrapper from "./utils/APIWrapper";

import UserModel from "./models/UserModel";
import MapModel from "./models/MapModel";
import RequestsModel from "./models/RequestsModel";

import createFeatureDetails from "./components/FeatureDetails";
import createLayersSelector from "./components/LayersSelector";
import createLayerDetails from "./components/LayerDetails";

import createLoginForm from "./components/LoginForm";
import createAoisList from "./components/AoisList";
import createRequestForm from "./components/RequestForm";
import createMap from "./components/Map";

const apiWrapper = new APIWrapper();
const widgetFactory = new WidgetFactory();

const userModel = new UserModel(apiWrapper);
const mapModel = new MapModel(apiWrapper);
const requestsModel = new RequestsModel(apiWrapper);

// const layersSelector = createLayersSelector(widgetFactory, mapModel);
// const featureDetails = createFeatureDetails(widgetFactory, mapModel);
// const layerDetails = createLayerDetails(widgetFactory, mapModel);

const loginForm = createLoginForm(widgetFactory, userModel);
const aoisList = createAoisList(widgetFactory, mapModel);
const requestForm = createRequestForm(widgetFactory, mapModel, requestsModel);
const map = createMap(widgetFactory, mapModel);

const root = Div({ class: "container" });

const messageContainer = Div();
apiWrapper.addEventListener("error", (e) => {
    if (e.detail.non_field_errors) {
        messageContainer.setChildren(
            widgetFactory.createErrorMessageBar(
                e.detail.non_field_errors[0],
                () => {
                    messageContainer.setChildren();
                }
            )
        );
    }
});

userModel.addEventListener("loggedin", () => {
    // remove loggedout error if it was previously set
    messageContainer.setChildren();

    root.setChildren(
        // layersSelector,
        // featureDetails,
        // layerDetails,
        messageContainer,
        aoisList,
        requestForm,
        map
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
