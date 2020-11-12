"use strict";

export default class APIWrapper extends EventTarget {
    _processXHRError(xhr) {
        if (xhr.status === 401) {
            this.dispatchEvent(new Event("forbidden"));
        } else {
            console.error(xhr.responseText);
        }
    }

    sendPostRequest(url, data, cb) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api" + url);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                this._processXHRError(xhr);
                cb(xhr.responseText);
            } else {
                const jsonResponse = JSON.parse(xhr.responseText);
                cb(null, jsonResponse);
            }
        };
        xhr.onerror = () => {
            console.error("Failed to request " + url);
        };
        xhr.setRequestHeader("Content-type", 'application/json');
        xhr.send(JSON.stringify(data));
    }

    sendGetRequest(url, cb) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/api" + url);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                this._processXHRError(xhr);
                cb(xhr.responseText);
            } else {
                const jsonResponse = JSON.parse(xhr.responseText);
                cb(null, jsonResponse);
            }
        };
        xhr.onerror = () => {
            console.error("Failed to request " + url);
        };
        xhr.send();
    }
}