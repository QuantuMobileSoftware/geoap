"use strict";
export default class UserModel extends EventTarget {
    constructor(apiWrapper) {
        super();
        this.apiWrapper = apiWrapper;
        this.userDetails = {};
        this.isDemoUser = false;
        this.apiWrapper.addEventListener("forbidden", () => {
            this.getUserDetails();
        });
    }

    login(username, password) {
        this.apiWrapper.sendPostRequest(
            "/login",
            {
                username: username,
                password: password
            },
            (err, res) => {
                if (err) {
                } else {
                    console.log(`Key: ${res.key}`);
                    this.getUserDetails();
                }
            }
        );
    }

    getUserDetails() {
        this.apiWrapper.sendGetRequest("/users/current", (err, res) => {
            if (err) {
                this.dispatchEvent(new Event("loggedout"));
            } else {
                const isDemoUser = res.username === "demo1";
                this.userDetails = res;
                this.isDemoUser = isDemoUser;
                this.dispatchEvent(new CustomEvent("loggedin", { detail: { ...res, isDemoUser } }));
            }
        });
    }

    get user_id() {
        return this.userDetails.pk;
    }
}
