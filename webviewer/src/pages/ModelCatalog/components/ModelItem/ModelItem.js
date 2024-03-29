import React from 'react';
import {
  Model,
  ModelDescription,
  ModelTitle,
  ModelText,
  ModelTitleWrap,
  ModelPrice,
  ModelLink
} from './ModelItem.styles';

export const ModelItem = ({ model }) => {
  return model.detail_description_link ? (
    <ModelLink href={model.detail_description_link}>
      <Model bg={model.description_picture}>
        <ModelDescription>
          <ModelTitleWrap>
            <ModelTitle>{model.name}</ModelTitle>
          </ModelTitleWrap>
          <ModelText>{model.description}</ModelText>
          <ModelPrice>Price {model.basic_price || 0} $ per 1 sq. km.</ModelPrice>
        </ModelDescription>
      </Model>
    </ModelLink>
  ) : (
    <Model bg={model.description_picture}>
      <ModelDescription>
        <ModelTitleWrap>
          <ModelTitle>{model.name}</ModelTitle>
        </ModelTitleWrap>
        <ModelText>{model.description}</ModelText>
        <ModelPrice>Price {model.basic_price || 0} $ per 1 sq. km.</ModelPrice>
      </ModelDescription>
    </Model>
  );
};
