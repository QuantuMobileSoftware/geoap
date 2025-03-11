import React, { useEffect, useMemo, useState, useRef } from 'react';
import { getStoneOptionsLayer, selectUser, useAreasActions } from 'state';
import { useSelector } from 'react-redux';
import { Preloader } from 'components/_shared/Preloader';
import {
  Label,
  LabelWrapper,
  StyledSelect,
  DropdownContainer,
  StyledInput,
  DropdownList,
  DropdownItem
} from './StoneOptions.styles';

export const StoneOptions = ({
  handleStoneFolderChange,
  handleStoneSizeChange,
  isShowSizeList
}) => {
  const { getStoneLayers, isLoading } = useAreasActions();
  const { data, status } = useSelector(getStoneOptionsLayer);
  const user = useSelector(selectUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return (data || [])
      .filter(folder => folder.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(folder => ({
        name: folder,
        value: folder,
        title: folder
      }));
  }, [data, searchTerm]);

  const handleSelect = selected => {
    setSearchTerm(selected.value);
    setIsOpen(false);
    handleStoneFolderChange(selected);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectStoneOptionsLayer = useMemo(
    () =>
      (data || []).map(folder => ({
        name: folder,
        value: folder,
        title: folder
      })),
    [data]
  );

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

          <DropdownContainer ref={dropdownRef}>
            <Label>Folder path</Label>
            <StyledInput
              type='text'
              placeholder='Type to search or click to select...'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />

            {isOpen && filteredOptions.length > 0 && (
              <DropdownList>
                {filteredOptions.map(option => (
                  <DropdownItem key={option.value} onClick={() => handleSelect(option)}>
                    {option.name}
                  </DropdownItem>
                ))}
              </DropdownList>
            )}
          </DropdownContainer>
          {isShowSizeList && (
            <StyledSelect
              items={rangeArray}
              placeholder='Select stone size'
              onSelect={handleStoneSizeChange}
              label='Size list'
            />
          )}
        </>
      );
  }
};
