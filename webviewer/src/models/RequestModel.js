"use strict";

import Wkt from "wicket";
export default class RequestModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.requests = [];
        this.results = [];
        this.notebooks = {
            loaded: false,
            items: [],
        };
    }

    getResults(id) {
        this.apiWrapper.sendGetRequest(`/aoi/${id}/results`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.results = [...res];

                this.results.forEach((x) => {
                    const wkt = new Wkt.Wkt();
                    wkt.read(x.bounding_polygon.split(";")[1]);
                    x.boundingCoordinates = [];
                    wkt.toJson().coordinates[0].forEach((longlat) => {
                        x.boundingCoordinates.push([longlat[1], longlat[0]]);
                    });
                });
                this.dispatchEvent(
                    new CustomEvent("resultsLoaded", { detail: { id } })
                );
            }
        });
    }

    getRequests(id) {
        this.apiWrapper.sendGetRequest(`/aoi/${id}/requests`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.requests = [...res];
                this.dispatchEvent(
                    new CustomEvent("requestsLoaded", { detail: { id } })
                );
            }
        });
    }

    getNotebooks() {
        if (this.notebooks.loaded) {
            return;
        }
        this.apiWrapper.sendGetRequest(`/notebook`, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                this.notebooks = {
                    loaded: true,
                    items: [...res],
                };
            }
        });
    }

    sendRequest(data, cb) {
        this.apiWrapper.sendPostRequest("/request", { ...data }, (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("error"));
            } else {
                cb();
            }
        });
    }

    openRequestForm(aoi) {
        this.dispatchEvent(new CustomEvent("openForm", { detail: { aoi } }));
    }

    closeRequestForm() {
        this.dispatchEvent(new Event("closeForm"));
    }
}