"use strict";

import "./styles/normalize.css";
import "./styles/index.css";

import { render, Div } from "@adolgarev/domwrapper";

import WidgetFactory from "./utils/WidgetFactory";
import APIWrapper from "./utils/APIWrapper";

import UserModel from "./models/UserModel";
import MapModel from "./models/MapModel";
import RequestModel from "./models/RequestModel";

import createFeatureDetails from "./components/FeatureDetails";
import createLayerDetails from "./components/LayerDetails";

import createLoginForm from "./components/LoginForm";
import createAoisList from "./components/AoisList";
import createRequestForm from "./components/RequestForm";
import createFeatureRequestDialog from "./components/FeatureRequestDialog";
import createMap from "./components/Map";

const apiWrapper = new APIWrapper();
const widgetFactory = new WidgetFactory();

const userModel = new UserModel(apiWrapper);
const mapModel = new MapModel(apiWrapper);
const requestModel = new RequestModel(apiWrapper);

const featureDetails = createFeatureDetails(widgetFactory, mapModel);
const layerDetails = createLayerDetails(widgetFactory, mapModel);

const loginForm = createLoginForm(widgetFactory, userModel);
const aoisList = createAoisList(widgetFactory, mapModel, requestModel, userModel);
const requestForm = createRequestForm(widgetFactory, userModel, requestModel);
const featureRequestDialog = createFeatureRequestDialog({ requestModel });
const map = createMap(widgetFactory, mapModel, requestModel, userModel);

const root = Div({ class: "container" });

const messageContainer = Div({class: 'message-container'});
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
        featureDetails,
        layerDetails,
        messageContainer,
        aoisList,
        requestForm,
        featureRequestDialog,
        map
    );
});

userModel.addEventListener("loggedout", () => {
    if (process.env.AUTOLOGIN && process.env.AUTOPASSWORD) {
        console.log("Logging in default user", process.env.AUTOLOGIN);
        userModel.login(process.env.AUTOLOGIN, process.env.AUTOPASSWORD);
    } else {
        root.setChildren(loginForm, messageContainer);
    }
});

root.componentDidMount = () => {
    userModel.getUserDetails();
};

window.addEventListener("DOMContentLoaded", () => {
    render(root, document.getElementsByTagName("body")[0]);
});
