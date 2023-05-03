import React, { useEffect, useMemo, useState } from 'react';
import { useAreasActions } from 'state';
import { useSuccessfulLayers } from 'hooks';
import { Header } from 'components/Header';
import { ModelItem } from './components/ModelItem';
import { Breadcrumbs } from 'components/_shared/Breadcrumbs';
import { ROUTES } from '_constants';
import { ModelWrapper, Container, StyledSelect } from './ModelCatalog.styles';

const filterDefaultValue = { name: 'All models', value: null };
const breadcrumbsItems = [{ link: ROUTES.ROOT, text: 'Home' }, { text: 'Geo models' }];

export const ModelCatalog = () => {
  const { getLayers } = useAreasActions();
  const layers = useSuccessfulLayers();
  const [selectedOption, setSelectedOption] = useState(filterDefaultValue);

  useEffect(() => {
    if (layers.length === 0) getLayers();
  }, [layers.length, getLayers]);

  const selectOptions = useMemo(() => {
    const domains = layers.flatMap(({ domains }) => domains ?? []);
    const filterItems = [...new Set(domains)].map(item => ({ name: item, value: item }));
    return [filterDefaultValue, ...filterItems];
  }, [layers]);

  const handleFilterChange = value => setSelectedOption(value);

  const filteredLayers = selectedOption.value
    ? layers.filter(l => l.domains?.includes(selectedOption.value))
    : layers;

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs items={breadcrumbsItems} />
        <StyledSelect
          items={selectOptions}
          value={filterDefaultValue.value}
          onSelect={handleFilterChange}
        />
        <ModelWrapper alignLeft={filteredLayers.length < 4}>
          {filteredLayers.map(layer => (
            <ModelItem key={layer.id} model={layer} />
          ))}
        </ModelWrapper>
      </Container>
    </>
  );
};
