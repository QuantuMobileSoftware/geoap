import React from 'react';
import { isNumber } from 'lodash-es';

import {
  AreasListItemBody,
  AreasListItemCoordinate,
  AreasListItemCoordinates,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItemThumbnail,
  StyledAreasListItem
} from './AreasListItem.styles';

import { Button } from 'components/_shared/Button';

export const AreasListItem = ({ area = {}, ...props }) => {
  const coordinates = [
    ['X', 100],
    ['Y', 100]
  ];
  const hasCoordinates = coordinates.some(([, c]) => c && isNumber(c));

  const renderCoordinates = () => {
    if (!hasCoordinates) return null;

    return (
      <AreasListItemCoordinates>
        {coordinates.map(([axios, value]) => {
          return value ? (
            <AreasListItemCoordinate
              key={axios}
            >{`${axios}: ${value}`}</AreasListItemCoordinate>
          ) : null;
        })}
      </AreasListItemCoordinates>
    );
  };

  return (
    <StyledAreasListItem {...props} hasCoordinates={hasCoordinates}>
      <AreasListItemThumbnail backdropIcon='Image' />

      <AreasListItemBody>
        <AreasListItemName>{area.name}</AreasListItemName>
        {renderCoordinates()}
      </AreasListItemBody>

      <AreasListItemMenu>
        <Button>Edit</Button>
        <Button variantType='danger'>Delete</Button>
      </AreasListItemMenu>
    </StyledAreasListItem>
  );
};
