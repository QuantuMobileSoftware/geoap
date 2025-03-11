import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getSelectedResults, selectCurrentResults } from 'state';
import { filesEndpoints } from 'api/files';
import { Page } from 'components/_shared/Page';
import { API } from 'api';
import { ROUTES } from '_constants';
import { Button } from 'components/_shared/Button';
import { ImageViewer } from './components';
import { Icon } from 'components/_shared/Icon';
import {
  Container,
  StoneTableWrap,
  TableHeader,
  TableRow
} from './StoneValidation.styles';

export const StoneValidation = ({ ...props }) => {
  const allAreaResults = useSelector(selectCurrentResults);
  const selectedResults = useSelector(getSelectedResults);
  const history = useHistory();
  const [images, setImages] = useState([]);
  const [currentImg, setCurrentImg] = useState();
  const countRef = useRef(currentImg); // eventlistener can't se currentImg changing

  const result = allAreaResults?.find(({ id }) => id === selectedResults[0]);

  useEffect(() => {
    if (!result) {
      history.push(ROUTES.ROOT, { isOpenSidebar: true });
      return;
    }
    async function fetchData() {
      const response = await API.files.getStoneImages(result.id);
      setImages(Object.entries(response));
    }
    fetchData();
  }, [result, history]);

  const getImagePath =
    currentImg === undefined
      ? ''
      : `${result?.filepath.split('/')[0]}/${images[currentImg][0]}`;

  useEffect(() => {
    countRef.current = currentImg;
  }, [currentImg]);

  const handlePrev = () => {
    if (countRef.current > 0) {
      setCurrentImg(countRef.current - 1);
    }
  };

  const handleNext = () => {
    if (countRef.current < images.length - 1) {
      setCurrentImg(countRef.current + 1);
    }
  };

  const handleValidateImage = async status => {
    const [path, data] = images[countRef.current];
    const imageData = { [path]: { ...data, status } };
    const resp = await API.files.patchStoneImages(result.id, imageData);
    setImages(Object.entries(resp));
  };

  return (
    <Page {...props}>
      <Container>
        <StoneTableWrap>
          <table>
            <tbody>
              <TableRow>
                <TableHeader>#</TableHeader>
                <TableHeader>Verified</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              {images.map(([path, data], i) => (
                <TableRow key={path} isActive={i === currentImg}>
                  <td>{i}</td>
                  <td>
                    {data.status === 'None' ? (
                      <Icon color='gray'>Cross</Icon>
                    ) : (
                      <Icon color='green'>Check</Icon>
                    )}
                  </td>
                  <td>{data.status === 'None' ? 'unverified' : data.status}</td>
                  <td>
                    <Button variant='secondary' onClick={() => setCurrentImg(i)}>
                      Validate
                    </Button>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </table>
        </StoneTableWrap>
        {currentImg !== undefined && (
          <ImageViewer
            src={`/api${filesEndpoints.results}/${getImagePath}`}
            onPrev={handlePrev}
            onNext={handleNext}
            onConfirm={() => handleValidateImage('validated')}
            onReject={() => handleValidateImage('removed')}
            disablePrev={currentImg === 0}
            disableNext={currentImg === images.length - 1}
          />
        )}
      </Container>
    </Page>
  );
};
