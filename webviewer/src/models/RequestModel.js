"use strict";

import { setCookie, deleteCookie } from "../utils/cookie";

export default class RequestModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.requests = [];
        this.results = [];
        this.notebooks = [];
    }

    getResults() {
        this.apiWrapper.sendGetRequest(`/aoi/${id}/results`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                console.log(res);
            }
        });
    }

    getRequests() {
        this.apiWrapper.sendGetRequest(`/aoi/${id}/requests`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                console.log(res);
            }
        });
    }

    getNotebooks() {
        this.apiWrapper.sendGetRequest(`/notebook`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                console.log(res);
            }
        });
    }

    openRequestForm(aoi) {
        this.dispatchEvent(new CustomEvent("openForm", { detail: { aoi } }));
    }

    closeRequestForm() {
        debugger
        this.dispatchEvent(new Event("closeForm"));
    }
}
