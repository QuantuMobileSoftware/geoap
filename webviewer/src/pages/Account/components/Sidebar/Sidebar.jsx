import { Icon } from 'components/_shared/Icon';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '_constants';
import { TABS } from '../../constants';
import { StyledSidebar, StyledBreadcrumbs, TabItem } from './Sidebar.styles';

export const Sidebar = props => {
  const { activeTab, setActiveTab } = props;
  const history = useHistory();

  return (
    <StyledSidebar>
      <StyledBreadcrumbs
        items={[{ link: ROUTES.ROOT, text: 'Home' }, { text: 'Personal account' }]}
      />
      <div>
        {TABS.map(({ name, icon, hash }) => (
          <TabItem
            key={name}
            isActive={name === activeTab}
            onClick={() => {
              setActiveTab(name);
              history.push({ hash });
            }}
          >
            <Icon>{icon}</Icon> {name}
          </TabItem>
        ))}
      </div>
    </StyledSidebar>
  );
};
