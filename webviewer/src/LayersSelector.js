"use strict";

import { Div } from "@adolgarev/domwrapper";

const sortFunction = (a, b) => {
  if (a.filepath < b.filepath) {
    return -1;
  }
  if (a.filepath > b.filepath) {
    return 1;
  }
  return 0;
};

export default function createLayersSelector(widgetFactory, mapModel) {
  const box = Div({ class: "layers" });
  const listContainer = Div({ class: "layers__container" });
  const relativeContainer = Div({ class: "relative" });

  const button = widgetFactory
    .createButton({ type: "button", class: "button layers__button" })
    .setChildren("Layers");

  let isOpen = false;

  button.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      mapModel.getLayers();
      box.setChildren(button, relativeContainer);
    } else {
      box.setChildren(button);
    }
  });

  mapModel.addEventListener("layersupdated", () => {
    const layerElts = [];
    const sortedLayers = mapModel.layers.slice().sort(sortFunction);

    sortedLayers.forEach((layer) => {
      const layerElt = Div({ class: "layers__item" }).setChildren(
        layer.filepath
      );

      layerElt.layer = layer;
      layerElt.addEventListener("click", () => {
        mapModel.selectLayer(layer);
        layerElts.forEach((elt) => {
          if (mapModel.isLayerSelected(elt.layer)) {
            elt.updateStyle({
              background: "rgb(237, 235, 233)",
            });
          } else {
            elt.updateStyle({
              background: "white",
            });
          }
        });
      });
      if (mapModel.isLayerSelected(layer)) {
        layerElt.updateStyle({
          background: "rgb(237, 235, 233)",
        });
      }

      layerElts.push(layerElt);
    });
    relativeContainer.setChildren(listContainer.setChildren(layerElts));
  });

  box.setChildren(button);

  return box;
}
