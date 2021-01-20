"use strict";

import { Div } from "@adolgarev/domwrapper";

export default function createRequestForm(widgetFactory, mapModel) {
    const box = Div({ class: "fixed fixed--aoisform" });

    const formContainer = Div({ class: "aoisform-holder" });

    const title = Div({class: 'aoisform__title'}).setChildren('Request form');
    const fromBlock = Div({class: 'aoisform__from'});
    const toBlock = Div({class: 'aoisform__to'});
    const request = Div({class: 'aoisform__request'});
    
    mapModel.addEventListener("aoiSelected", ({ detail }) => {

        const requestInput = widgetFactory.createSelect(
            null,
            (value) => {
                    console.log(value)
            },
            "request__input"
        );
        const requestLabel = Div({ class: "request__label" }).setChildren("Type of request");
        request.setChildren(requestLabel, requestInput);


        const fromInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (value) => {
                    console.log(value)
            },
            "date__input"
        );
        const fromLabel = Div({ class: "date__label" }).setChildren("From");
        fromBlock.setChildren(fromLabel, fromInput);

        const toInput = widgetFactory.createDateInput(
            null,
            null,
            new Date(),
            (value) => {
                    console.log(value)
            },
            "date__input"
        );
        const toLabel = Div({ class: "date__label" }).setChildren("To");
        toBlock.setChildren(toLabel, toInput);




        formContainer.setChildren(title,request, fromBlock, toBlock);
        box.setChildren(formContainer);
    });

    box.setChildren();

    return box;
}
