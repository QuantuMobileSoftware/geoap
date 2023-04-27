import React from 'react';
import {
  AnalyticsWrap,
  Header,
  Title,
  AnalyticsInfo,
  AnalyticsInfoTitle,
  ListItem,
  ListWrap
} from './Analytics.styles.js';

const LIST_DATA = [
  {
    title: 'Agriculture',
    items: [
      'NDVI index calculation',
      'Moisture index calculation',
      'Blooming index calculation',
      'Plot boundary detection',
      'Crop type detection'
    ]
  },
  {
    title: 'Forestry',
    items: [
      'Forest AGB estimation',
      'Deforestation / afforestation',
      'Net Forest Carbon Sequestration Report'
    ]
  },
  {
    title: 'General',
    items: [
      'Land usage detection',
      'Basic objects detection: buildings, vehicles, and more'
    ]
  }
];

export const Analytics = () => {
  return (
    <AnalyticsWrap>
      <Header>Analytics we provide</Header>
      <Title>We are working on expanding this list, so stay tuned</Title>
      <AnalyticsInfo>
        {LIST_DATA.map(({ title, items }) => (
          <List key={title} title={title} items={items} />
        ))}
      </AnalyticsInfo>
    </AnalyticsWrap>
  );
};

const List = ({ title, items }) => (
  <ListWrap>
    <AnalyticsInfoTitle>{title}</AnalyticsInfoTitle>
    <ul>
      {items.map(item => (
        <ListItem key={item}>{item}</ListItem>
      ))}
    </ul>
  </ListWrap>
);
