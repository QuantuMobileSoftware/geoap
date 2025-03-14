import React from 'react';
import { ROUTES } from '_constants';
import { useHistory } from 'react-router-dom';
import { STONE_STATUS_TITLES } from 'pages/StoneValidation/constants';
import { HeaderContainer, Progress, StyledSelect, ProgressWrap } from './Header.styles';
import { Button } from 'components/_shared/Button';

export const Header = ({ onChangeFilter, progressData }) => {
  const history = useHistory();

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

  const progress = Math.round((progressData.completed / progressData.all) * 100);

  return (
    <HeaderContainer>
      <StyledSelect
        items={selectItems()}
        onSelect={onChangeFilter}
        placeholder='Select filter'
      />
      <ProgressWrap>
        <div>
          <span>Progress: {progress}%</span>
          <span>
            {progressData.completed}/{progressData.all}
          </span>
        </div>
        <Progress size={progress}>
          <div />
        </Progress>
      </ProgressWrap>
      <Button variant='secondary' icon='ArrowInCircle' onClick={handleBackClick}>
        Back
      </Button>
    </HeaderContainer>
  );
};
