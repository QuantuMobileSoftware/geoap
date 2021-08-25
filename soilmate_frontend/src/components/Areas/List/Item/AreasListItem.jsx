import React, { useRef, useState } from 'react';
import { isNumber } from 'lodash-es';

import { Checkbox } from 'components/_shared/Checkbox';

import {
  AreasListItemBody,
  AreasListItemSize,
  AreasListItemMenu,
  AreasListItemName,
  AreasListItem,
  AreasListItemButton,
  AreasIconButton,
  AreasIconButtonsHolder
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
    deleteSelectedResult
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

  const handleChangeSidebarMode = mode => () => {
    setCurrentArea(area.id);
    setSidebarMode(mode);
  };

  const handleMenuClick = () => {
    setIsTopPosition(getElementBottom(parent) <= getElementBottom(areaRef));
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

      <AreasIconButtonsHolder isActive={props.isActive}>
        <AreasIconButton
          icon='Plus'
          onClick={handleChangeSidebarMode(SIDEBAR_MODE.CREATE_REQUEST)}
        ></AreasIconButton>
        <AreasIconButton
          icon='List'
          onClick={handleChangeSidebarMode(SIDEBAR_MODE.REQUESTS)}
        ></AreasIconButton>
      </AreasIconButtonsHolder>

      <AreasListItemMenu onClick={handleMenuClick}>
        <AreasListItemButton onClick={handleChangeSidebarMode(SIDEBAR_MODE.EDIT)}>
          Edit
        </AreasListItemButton>
        <AreasListItemButton onClick={handleChangeSidebarMode(SIDEBAR_MODE.REQUESTS)}>
          View reports
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
