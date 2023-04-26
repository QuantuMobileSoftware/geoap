import React from 'react';
import { StyledBreadcrumbs, BreadcrumbsItem, Separator } from './Breadcrumbs.styles';
import { Link } from '../Link';

export const Breadcrumbs = ({ items, ...props }) => {
  return (
    <StyledBreadcrumbs {...props}>
      {items.map(({ text, link }) => (
        <BreadcrumbsItem key={text}>
          {link ? (
            <>
              <Link to={link}>{text}</Link>
              <Separator>/</Separator>
            </>
          ) : (
            text
          )}
        </BreadcrumbsItem>
      ))}
    </StyledBreadcrumbs>
  );
};
