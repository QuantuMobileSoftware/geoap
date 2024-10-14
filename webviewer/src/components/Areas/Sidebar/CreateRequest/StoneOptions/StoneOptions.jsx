import React, { useEffect, useMemo } from 'react';
import { getStoneOptionsLayer, selectUser, useAreasActions } from 'state';
import { useSelector } from 'react-redux';
import { Preloader } from 'components/_shared/Preloader';
import { Label, LabelWrapper, StyledSelect } from './StoneOptions.styles';

export const StoneOptions = ({ handleStoneFolderChange, handleStoneSizeChange }) => {
  const { getStoneLayers, isLoading } = useAreasActions();
  const { data, status } = useSelector(getStoneOptionsLayer);
  const user = useSelector(selectUser);

  const start = 15; // Starting value
  const end = 40; // Ending value
  const step = 5; // Step value

  const rangeArray = [];

  for (let i = start; i <= end; i += step) {
    rangeArray.push({
      name: `${i}cm+`,
      value: i
    });
  }

  const selectStoneOptionsLayer = useMemo(
    () =>
      (data || []).map(folder => ({
        name: folder,
        value: folder,
        title: folder
      })),
    [data]
  );

  useEffect(() => {
    if (user.stone_google_folder) {
      getStoneLayers();
    }
  }, [getStoneLayers, user.stone_google_folder]);

  if (isLoading) return <Preloader />;

  if (!user.stone_google_folder) {
    return (
      <LabelWrapper>
        <Label>Google bucket not added, please contact us</Label>
      </LabelWrapper>
    );
  }

  switch (status) {
    case 404:
      return (
        <LabelWrapper>
          <Label>Google bucket added, but not correct, please contact us</Label>
        </LabelWrapper>
      );
    case 204:
      return (
        <LabelWrapper>
          <Label>No folders have been created in Google bucket, please add them</Label>
        </LabelWrapper>
      );
    default:
      return (
        <>
          <LabelWrapper>
            <Label>Folder name</Label>
            <Label>{`[${user.stone_google_folder}]`}</Label>
          </LabelWrapper>
          <StyledSelect
            items={selectStoneOptionsLayer}
            placeholder='Select folder data'
            onSelect={handleStoneFolderChange}
            label='Input list'
          />
          <StyledSelect
            items={rangeArray}
            placeholder='Select stone size'
            onSelect={handleStoneSizeChange}
            label='Size list'
          />
        </>
      );
  }
};
