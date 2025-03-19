import React, { useEffect, useState } from 'react';
import { Button } from 'components/_shared/Button';
import {
  Container,
  ButtonsWrap,
  DangerButton,
  StyledButton,
  BottomContainer,
  ImgPath,
  CopyWrap,
  StatusText,
  ImageLoader
} from './ImageViewer.styles';
import { STONE_STATUS } from 'pages/StoneValidation/constants';

const keyboardKeys = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  KeyC: 'KeyC',
  KeyR: 'KeyR'
};

export const ImageViewer = ({
  src,
  onPrev,
  onNext,
  onConfirm,
  onReject,
  disablePrev,
  disableNext,
  status,
  loading
}) => {
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    setImgLoading(true);
    // Safari make image loading function first and then useEffect
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setImgLoading(false);
    } else {
      img.onload = () => setImgLoading(false);
      img.onerror = () => setImgLoading(false);
    }
  }, [src]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (!Object.values(keyboardKeys).includes(e.code)) return;

      const events = {
        [keyboardKeys.left]: onPrev,
        [keyboardKeys.right]: onNext,
        [keyboardKeys.up]: onPrev,
        [keyboardKeys.down]: onNext,
        [keyboardKeys.KeyC]: onConfirm,
        [keyboardKeys.KeyR]: onReject
      };
      events[e.code]();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <img
        width='100%'
        src={src}
        alt='Stone image'
        onLoad={() => setImgLoading(false)}
        onError={() => setImgLoading(false)}
      />
      {imgLoading && (
        <ImageLoader>
          <span>Loading image...</span>
        </ImageLoader>
      )}
      <ButtonsWrap>
        <Button
          variant='secondary'
          onClick={onPrev}
          disabled={disablePrev}
          icon='ExpandLeft'
        ></Button>
        <StyledButton
          variant='primary'
          onClick={onConfirm}
          disabled={loading}
          title='Shift + C'
        >
          Confirm
        </StyledButton>
        <DangerButton
          variant='danger'
          onClick={onReject}
          disabled={loading}
          title='Shift + R'
        >
          Reject
        </DangerButton>
        <Button
          variant='secondary'
          onClick={onNext}
          disabled={disableNext}
          icon='ExpandRight'
        ></Button>
      </ButtonsWrap>
      <BottomContainer>
        <CopyWrap>
          <Button variant='secondary' onClick={() => navigator.clipboard.writeText(src)}>
            Copy path
          </Button>
          <ImgPath title={src}>.../{src.split('/').pop()}</ImgPath>
        </CopyWrap>
        {status !== STONE_STATUS.unverified && (
          <StatusText verified={status === STONE_STATUS.hasStones}>{status}</StatusText>
        )}
      </BottomContainer>
    </Container>
  );
};
