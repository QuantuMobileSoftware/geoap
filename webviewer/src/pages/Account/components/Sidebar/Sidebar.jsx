import React, { useMemo } from 'react';
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
const { REACT_APP_IS_GEOAP_EE_ENABLED } = process.env;

export const Sidebar = props => {
  const { activeTab, setActiveTab } = props;
  const user = useSelector(selectUser);
  const history = useHistory();
  const tabs = useMemo(() => {
    return REACT_APP_IS_GEOAP_EE_ENABLED === 'true' && user.trial_finished_at
      ? TABS
      : TABS.filter(({ name }) => name !== TAB_NAMES.transactions);
  }, [user.trial_finished_at]);

  return (
    <StyledSidebar>
      <StyledBreadcrumbs items={breadcrumbsItems} />
      <div>
        {tabs.map(({ name, icon, hash }) => (
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
