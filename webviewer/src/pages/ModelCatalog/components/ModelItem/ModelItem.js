import React from 'react';
import {
  Model,
  ModelDescription,
  ModelTitle,
  ModelText,
  ModelTitleWrap
} from './ModelItem.styles';

export const ModelItem = ({ model }) => {
  return (
    <Model bg={model.description_picture}>
      <ModelDescription>
        <ModelTitleWrap>
          <ModelTitle>{model.name}</ModelTitle>
        </ModelTitleWrap>
        <ModelText>{model.description}</ModelText>
      </ModelDescription>
    </Model>
  );
};
