"use strict";

export default class UserModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.userDetails = null;
        this.apiWrapper.addEventListener("forbidden", () => {
            this.getUserDetails();
        });
    }

    login(username, password) {
        this.apiWrapper.sendPostRequest("/login", {
            username: username,
            password: password
        }, (err, res) => {
            if (err) {
            } else {
                console.log(`Key: ${res.key}`);
                this.getUserDetails();
            }
        });
    }

    getUserDetails() {
        this.apiWrapper.sendGetRequest("/users/current", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("loggedout"));
            } else {
                this.userDetails = res;
                this.dispatchEvent(new Event("loggedin"));
            }
        });
    }

}