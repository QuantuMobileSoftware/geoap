import React from 'react';
import { ROUTES } from '_constants';
import { useHistory } from 'react-router-dom';
import { STONE_STATUS_TITLES } from 'pages/StoneValidation/constants';
import {
  HeaderContainer,
  Progress,
  StyledSelect,
  ProgressWrap,
  MiddleContainer,
  Breadcrumbs
} from './Header.styles';
import { Button } from 'components/_shared/Button';
import { useSelector } from 'react-redux';
import { selectCurrentArea, selectAreasList } from 'state';

export const Header = ({ onChangeFilter, progressData, resultName }) => {
  const currentAreaId = useSelector(selectCurrentArea);
  const initialAreas = useSelector(selectAreasList);
  const { completed, total } = progressData;
  const history = useHistory();
  const currentArea = initialAreas.find(({ id }) => id === currentAreaId);

  const handleBackClick = () => {
    history.push(ROUTES.ROOT, { isOpenSidebar: true });
  };

  const selectItems = () => {
    const fistItem = { name: 'All', value: '' };
    return [
      fistItem,
      ...Object.entries(STONE_STATUS_TITLES).map(([value, name]) => ({ name, value }))
    ];
  };

  const progress = total ? Math.floor((completed / total) * 100) : 0;

  return (
    <HeaderContainer>
      <StyledSelect
        items={selectItems()}
        onSelect={onChangeFilter}
        placeholder='Select filter'
      />
      <MiddleContainer>
        <div>
          <ProgressWrap>
            <span>Progress: {progress}%</span>
            <span>
              {completed}/{total}
            </span>
          </ProgressWrap>
          <Progress size={progress}>
            <div />
          </Progress>
        </div>
        <Breadcrumbs>
          <span onClick={handleBackClick}>{currentArea.name}</span> /{' '}
          <span onClick={handleBackClick}>report</span> / <span>{resultName}</span>
        </Breadcrumbs>
      </MiddleContainer>
      <Button variant='secondary' icon='ArrowInCircle' onClick={handleBackClick}>
        Back
      </Button>
    </HeaderContainer>
  );
};
