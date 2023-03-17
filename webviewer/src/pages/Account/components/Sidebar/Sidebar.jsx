import { Icon } from 'components/_shared/Icon';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '_constants';
import { TABS } from '../../constants';
import { StyledSidebar, BreadCrumbsItem, BreadCrumbs, TabItem } from './Sidebar.styles';

export const Sidebar = props => {
  const { activeTab, setActiveTab } = props;
  const history = useHistory();
  const handleClickHome = () => history.push(ROUTES.ROOT);

  return (
    <StyledSidebar>
      <BreadCrumbs>
        <BreadCrumbsItem onClick={handleClickHome}>Home</BreadCrumbsItem> /{' '}
        <BreadCrumbsItem current>Personal account</BreadCrumbsItem>
      </BreadCrumbs>
      <div>
        {TABS.map(({ name, icon }) => (
          <TabItem
            key={name}
            isActive={name === activeTab}
            onClick={() => setActiveTab(name)}
          >
            <Icon>{icon}</Icon> {name}
          </TabItem>
        ))}
      </div>
    </StyledSidebar>
  );
};
