import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getSelectedResults, selectCurrentResults } from 'state';
import { filesEndpoints } from 'api/files';
import { Header as PageHeader } from 'components/Header';
import { Spinner } from 'components/_shared/Spinner';
import { API } from 'api';
import { ROUTES } from '_constants';
import { ImageViewer, Header, ImageList } from './components';
import { STONE_STATUS } from './constants';
import { Container } from './StoneValidation.styles';

const paginationDefault = { offset: 0, page: 0 };

export const StoneValidation = () => {
  const allAreaResults = useSelector(selectCurrentResults);
  const selectedResults = useSelector(getSelectedResults);
  const history = useHistory();
  const [images, setImages] = useState([]);
  const [currentImg, setCurrentImg] = useState();
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const imgDataRef = useRef({ image: currentImg }); // eventlistener can't se currentImg changing

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
  const currentImages = filteredImages.slice(pagination.offset, endOffset);
  const handlePageClick = event => {
    const newOffset = (event.selected * itemsPerPage) % filteredImages.length;
    setPagination({ page: event.selected, offset: newOffset });
    setCurrentImg(0);
  };

  const imagePath =
    currentImg === undefined
      ? ''
      : `${result?.filepath.split('/')[0]}/${currentImages[currentImg][0]}`;

  useEffect(() => {
    if (!result) {
      history.push(ROUTES.ROOT);
      return;
    }
    async function fetchData() {
      const response = await API.files.getStoneImages(result.id);
      setImages(
        Object.entries(response).map(([path, data], i) => [path, { ...data, id: i }])
      );
      setCurrentImg(0);
    }
    fetchData();
  }, [result, history]);

  useEffect(() => {
    imgDataRef.current.image = currentImg;
    imgDataRef.current.currentImages = currentImages;
  }, [currentImg, currentImages]);

  const handlePrev = () => {
    if (imgDataRef.current.image > 0) {
      setCurrentImg(imgDataRef.current.image - 1);
    }
  };

  const handleNext = () => {
    const { image, currentImages } = imgDataRef.current;
    if (image < currentImages.length - 1) {
      setCurrentImg(imgDataRef.current.image + 1);
    }
  };

  const handleValidateImage = async status => {
    setLoading(true);
    const [path, data] = imgDataRef.current.currentImages[imgDataRef.current.image];
    const imageData = { [path]: { ...data, status } };
    API.files
      .patchStoneImages(result.id, imageData)
      .then(resp =>
        setImages(
          Object.entries(resp).map(([path, data], i) => [path, { ...data, id: i }])
        )
      )
      .finally(() => setLoading(false));
  };

  const handleChangeFilter = ({ value }) => {
    setFilter(value);
    setPagination(paginationDefault);
    setCurrentImg(0);
  };

  if (images.length === 0) return <Spinner />;

  return (
    <div>
      <PageHeader />
      <Header
        onChangeFilter={handleChangeFilter}
        progressData={{ all: images.length, completed: validatedImages }}
      />
      <Container>
        <ImageList
          images={currentImages}
          currentImg={currentImg}
          setCurrentImg={setCurrentImg}
          onPageChange={handlePageClick}
          pageCount={Math.ceil(filteredImages.length / itemsPerPage)}
          currentPage={pagination.page}
        />

        {currentImg !== undefined && (
          <ImageViewer
            src={`/api${filesEndpoints.results}/${imagePath}`}
            onPrev={handlePrev}
            onNext={handleNext}
            onConfirm={() => handleValidateImage(STONE_STATUS.hasStones)}
            onReject={() => handleValidateImage(STONE_STATUS.noStones)}
            disablePrev={currentImg === 0}
            disableNext={currentImg === currentImages.length - 1}
            status={currentImages[currentImg][1].status}
            imagePath={currentImages[currentImg][0]}
            loading={loading}
          />
        )}
      </Container>
    </div>
  );
};
