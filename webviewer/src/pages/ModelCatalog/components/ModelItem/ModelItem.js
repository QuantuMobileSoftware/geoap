import React from 'react';
import {
  Model,
  ModelDescription,
  ModelTitle,
  ModelText,
  ModelTitleWrap,
  ModelPrice
} from './ModelItem.styles';

export const ModelItem = ({ model }) => {
  return (
    <Model bg={model.description_picture}>
      <ModelDescription>
        <ModelTitleWrap>
          <ModelTitle>{model.name}</ModelTitle>
        </ModelTitleWrap>
        <ModelText>{model.description}</ModelText>
        <ModelPrice>Price {model.basic_price} $ per 1 sq. km.</ModelPrice>
      </ModelDescription>
    </Model>
  );
};
