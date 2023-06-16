import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from 'state';
import { Icon } from 'components/_shared/Icon';
import { ROUTES } from '_constants';
import { TABS, TAB_NAMES } from '../../constants';
import { StyledSidebar, StyledBreadcrumbs, TabItem } from './Sidebar.styles';

const breadcrumbsItems = [
  { link: ROUTES.ROOT, text: 'Home' },
  { text: 'Personal account' }
];

export const Sidebar = props => {
  const { activeTab, setActiveTab } = props;
  const user = useSelector(selectUser);
  const history = useHistory();

  return (
    <StyledSidebar>
      <StyledBreadcrumbs items={breadcrumbsItems} />
      <div>
        {TABS.map(({ name, icon, hash }) => {
          if (!user.trial_finished_at && name === TAB_NAMES.transactions) return;

          return (
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
          );
        })}
      </div>
    </StyledSidebar>
  );
};
