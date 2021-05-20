import { EMAILJS_USER } from "../constants";

emailjs.init(EMAILJS_USER);

export function sendEmailJSMessage(message) {
    if (!message) return;
    return emailjs.send("service_52ffi6k", "template_77rdqyr", message);
}
