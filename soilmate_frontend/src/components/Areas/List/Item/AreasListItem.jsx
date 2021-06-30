import React from 'react';
import { isNumber } from 'lodash-es';

import {
  AreasListItemBody,
  AreasListItemCoordinate,
  AreasListItemCoordinates,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItemThumbnail,
  StyledAreasListItem,
  AreasListItemButton
} from './AreasListItem.styles';

import { getPolygonPositions } from 'utils/helpers';

import { useAreasActions } from 'state';

export const AreasListItem = ({ area = {}, ...props }) => {
  const { setCurrentArea } = useAreasActions();

  const coordinatesArray = getPolygonPositions(area).coordinates[0][0];
  const coordinates = [
    ['X', +coordinatesArray[0].toFixed(1)],
    ['Y', +coordinatesArray[1].toFixed(1)]
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
    <StyledAreasListItem
      {...props}
      hasCoordinates={hasCoordinates}
      onClick={() => setCurrentArea(area.id)}
    >
      <AreasListItemThumbnail backdropIcon='Image' />

      <AreasListItemBody>
        <AreasListItemName>{area.name}</AreasListItemName>
        {renderCoordinates()}
      </AreasListItemBody>

      <AreasListItemMenu>
        <AreasListItemButton>Edit</AreasListItemButton>
        <AreasListItemButton variantType='danger'>Delete</AreasListItemButton>
      </AreasListItemMenu>
    </StyledAreasListItem>
  );
};
