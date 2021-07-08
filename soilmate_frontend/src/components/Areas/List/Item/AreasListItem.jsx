import React, { useRef, useState } from 'react';
import { isNumber } from 'lodash-es';

import {
  AreasListItemBody,
  AreasListItemCoordinate,
  AreasListItemCoordinates,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItemThumbnail,
  AreasListItem,
  AreasListItemButton
} from './AreasListItem.styles';

import { getPolygonPositions, getElementBottom } from 'utils/helpers';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, MODAL_TYPE } from '_constants';

import { useAreasActions } from 'state';

export const ListItem = ({ area = {}, parent, ...props }) => {
  const { setCurrentArea, setAreaMode } = useAreasActions();
  const areaRef = useRef(null);
  const [isTopPosition, setIsTopPosition] = useState(false);
  const coordinatesArray = getPolygonPositions(area).coordinates[0][0];
  const coordinates = [
    ['X', +coordinatesArray[0].toFixed(1)],
    ['Y', +coordinatesArray[1].toFixed(1)]
  ];
  const hasCoordinates = coordinates.some(([, c]) => c && isNumber(c));

  const renderCoordinates = () => {
    if (!hasCoordinates) {
      return null;
    }

    return (
      <AreasListItemCoordinates>
        {coordinates.map(([axios, value]) => {
          return value.toString ? (
            <AreasListItemCoordinate
              key={axios}
            >{`${axios}: ${value}`}</AreasListItemCoordinate>
          ) : null;
        })}
      </AreasListItemCoordinates>
    );
  };

  return (
    <AreasListItem
      {...props}
      top={isTopPosition}
      ref={areaRef}
      hasCoordinates={hasCoordinates}
      onClick={() => {
        setCurrentArea(area.id);
      }}
    >
      <AreasListItemThumbnail backdropIcon='Image' />

      <AreasListItemBody>
        <AreasListItemName>{area.name}</AreasListItemName>
        {renderCoordinates()}
      </AreasListItemBody>

      <AreasListItemMenu
        onClick={() => {
          setIsTopPosition(getElementBottom(parent) <= getElementBottom(areaRef));
        }}
      >
        <AreasListItemButton
          onClick={() => {
            setCurrentArea(area.id);
            setAreaMode(SIDEBAR_MODE.EDIT);
          }}
        >
          Edit
        </AreasListItemButton>
        <AreasListItemButton
          variantType='danger'
          onClick={() =>
            areasEvents.toggleModal(true, { type: MODAL_TYPE.DELETE, id: area.id })
          }
        >
          Delete
        </AreasListItemButton>
      </AreasListItemMenu>
    </AreasListItem>
  );
};
