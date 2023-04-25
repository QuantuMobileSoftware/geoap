import React from 'react';
import { StyledBreadcrumbs, BreadcrumbsItem, Separator } from './Breadcrumbs.styles';
import { Link } from '../Link';

export const Breadcrumbs = ({ items, ...props }) => {
  return (
    <StyledBreadcrumbs {...props}>
      {items.map(({ text, link }) => {
        if (link)
          return (
            <BreadcrumbsItem key={text}>
              <Link to={link}>{text}</Link>
              <Separator>/</Separator>
            </BreadcrumbsItem>
          );

        return <BreadcrumbsItem key={text}>{text}</BreadcrumbsItem>;
      })}
    </StyledBreadcrumbs>
  );
};
