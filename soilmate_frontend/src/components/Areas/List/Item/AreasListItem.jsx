import React, { useRef, useState } from 'react';
import { isNumber } from 'lodash-es';

import { Checkbox } from 'components/_shared/Checkbox';

import {
  AreasListItemBody,
  AreasListItemSize,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItem,
  AreasListItemButton
} from './AreasListItem.styles';

import { getPolygonPositions, getElementBottom } from 'utils/helpers';
import { areasEvents } from '_events';
import { SIDEBAR_MODE, MODAL_TYPE } from '_constants';

import { useAreasActions, useMapActions } from 'state';

export const ListItem = ({ area = {}, parent, ...props }) => {
  const {
    setCurrentArea,
    setSidebarMode,
    setSelectedEntityId,
    deleteSelectedEntityId,
    deleteSelectedResult,
    patchResults
  } = useAreasActions();
  const { setLayerOpacity } = useMapActions();
  const areaRef = useRef(null);
  const [isTopPosition, setIsTopPosition] = useState(false);
  const coordinatesArray = getPolygonPositions(area).coordinates[0][0];
  const coordinates = [
    ['X', +coordinatesArray[0].toFixed(1)],
    ['Y', +coordinatesArray[1].toFixed(1)]
  ];
  const hasCoordinates = coordinates.some(([, c]) => c && isNumber(c));

  const handleAreaListItemClick = () => {
    setCurrentArea(area.id);
    deleteSelectedResult();
    setLayerOpacity(1);
  };

  const handleChangeCheckbox = isChecked => {
    if (isChecked) {
      setSelectedEntityId(area.id);
    } else {
      deleteSelectedEntityId(area.id);
    }
  };

  const handleEditArea = () => {
    setCurrentArea(area.id);
    setSidebarMode(SIDEBAR_MODE.EDIT);
  };

  const handleMenuClick = () => {
    setIsTopPosition(getElementBottom(parent) <= getElementBottom(areaRef));
  };

  const handleViewReports = () => {
    setCurrentArea(area.id);
    patchResults(area);
    setSidebarMode(SIDEBAR_MODE.REQUESTS);
  };

  const handleDeleteButton = () => {
    areasEvents.toggleModal(true, { type: MODAL_TYPE.DELETE, id: area.id });
  };

  return (
    <AreasListItem
      {...props}
      top={isTopPosition}
      ref={areaRef}
      hasCoordinates={hasCoordinates}
      onClick={handleAreaListItemClick}
    >
      <Checkbox onChange={handleChangeCheckbox} />

      <AreasListItemBody>
        <AreasListItemName>{area.name}</AreasListItemName>
        {area.size && <AreasListItemSize>Size: {area.size} m2</AreasListItemSize>}
      </AreasListItemBody>

      <AreasListItemMenu onClick={handleMenuClick}>
        <AreasListItemButton onClick={handleEditArea}>Edit</AreasListItemButton>
        <AreasListItemButton onClick={handleViewReports}>
          View reports
        </AreasListItemButton>
        <AreasListItemButton variantType='danger' onClick={handleDeleteButton}>
          Delete
        </AreasListItemButton>
      </AreasListItemMenu>
    </AreasListItem>
  );
};
