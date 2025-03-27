import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import { getSelectedResults, selectCurrentResults } from 'state';
import { Header as PageHeader } from 'components/Header';
import { Spinner } from 'components/_shared/Spinner';
import { API } from 'api';
import { ROUTES } from '_constants';
import { ImageViewer, Header, ImageList } from './components';
import { STONE_STATUS } from './constants';
import { Container, NoDataText } from './StoneValidation.styles';

const paginationDefault = { offset: 0, page: 0 };

export const StoneValidation = () => {
  const allAreaResults = useSelector(selectCurrentResults);
  const selectedResults = useSelector(getSelectedResults);
  const history = useHistory();
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImg, setCurrentImg] = useState();
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);

  const result = allAreaResults?.find(({ id }) => id === selectedResults[0]);

  const filteredImages = useMemo(() => {
    if (!filter) return images;
    return images.filter(([, data]) => data.status === filter);
  }, [filter, images]);

  const validatedImages = useMemo(
    () => images.filter(([, data]) => data.status !== STONE_STATUS.unverified).length,
    [images]
  );

  // pagination
  const itemsPerPage = 30;
  const endOffset = pagination.offset + itemsPerPage;
  const pageCount = Math.ceil(filteredImages.length / itemsPerPage);
  const currentImages = filteredImages.slice(pagination.offset, endOffset);
  const isFirstImage = currentImg === 0 && pagination.page === 0;
  const isLastImage =
    pagination.page + 1 === pageCount && currentImg === currentImages.length - 1;

  const handlePageClick = (event, currentImg = 0) => {
    const newOffset = (event.selected * itemsPerPage) % filteredImages.length;
    setPagination({ page: event.selected, offset: newOffset });
    setCurrentImg(currentImg);
  };

  useEffect(() => {
    if (!result) {
      history.push(ROUTES.ROOT);
      return;
    }
    async function fetchData() {
      const response = await API.files.getStoneImages(result.id);
      if (isEmpty(response)) {
        setIsEmptyResult(true);
        return;
      }
      const images = Object.entries(response).map(([path, data], i) => [
        path,
        { ...data, id: i }
      ]);
      setImages(images);
      setCurrentImg(0);
    }
    fetchData();
  }, [result, history]);

  const handlePrev = () => {
    if (isFirstImage) return;
    if (currentImg === 0) {
      handlePageClick({ selected: pagination.page - 1 }, itemsPerPage - 1);
    } else {
      setCurrentImg(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (isLastImage) return;
    if (currentImg === currentImages.length - 1) {
      handlePageClick({ selected: pagination.page + 1 });
    } else {
      setCurrentImg(prev => prev + 1);
    }
  };

  const handleValidateImage = async status => {
    setLoading(true);
    const [path, data] = currentImages[currentImg];
    const imageData = { [path]: { ...data, status } };
    API.files
      .patchStoneImages(result.id, imageData)
      .then(resp => {
        const respList = Object.entries(resp);
        if ((filter && filter !== status) || respList.length < images.length) {
          setCurrentImg(0); // when last element disappear(filtered or deleted on BE)
        }
        if (isEmpty(resp)) setIsEmptyResult(true);
        setImages(respList.map(([path, data], i) => [path, { ...data, id: i }]));
      })
      .finally(() => setLoading(false));
  };

  const handleChangeFilter = ({ value }) => {
    setFilter(value);
    setPagination(paginationDefault);
    setCurrentImg(0);
  };

  if (images.length === 0 && !isEmptyResult) return <Spinner />;

  return (
    <div>
      <PageHeader />
      <Header
        onChangeFilter={handleChangeFilter}
        progressData={{ total: images.length, completed: validatedImages }}
      />
      {isEmptyResult ? (
        <NoDataText>No data</NoDataText>
      ) : (
        <Container>
          {currentImages.length === 0 ? (
            <NoDataText>Items not found</NoDataText>
          ) : (
            <ImageList
              images={currentImages}
              currentImg={currentImg}
              setCurrentImg={setCurrentImg}
              onPageChange={handlePageClick}
              pageCount={pageCount}
              currentPage={pagination.page}
            />
          )}
          {currentImages[currentImg] && (
            <ImageViewer
              src={currentImages[currentImg][0]}
              onPrev={handlePrev}
              onNext={handleNext}
              onConfirm={() => handleValidateImage(STONE_STATUS.hasStones)}
              onReject={() => handleValidateImage(STONE_STATUS.noStones)}
              disablePrev={isFirstImage}
              disableNext={isLastImage}
              status={currentImages[currentImg][1].status}
              loading={loading}
            />
          )}
        </Container>
      )}
    </div>
  );
};
