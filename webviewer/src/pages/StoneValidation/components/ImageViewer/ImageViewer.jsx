import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'components/_shared/Button';
import { STONE_STATUS } from 'pages/StoneValidation/constants';
import {
  Container,
  ButtonsWrap,
  DangerButton,
  StyledButton,
  BottomContainer,
  ImgPath,
  CopyWrap,
  StatusText,
  ImageLoader,
  ImgWrap
} from './ImageViewer.styles';

const keyboardKeys = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown',
  KeyC: 'KeyC',
  KeyR: 'KeyR',
  KeyZ: 'KeyZ'
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
  const [isFullImg, setIsFullImg] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    setImgLoading(true);
    setIsFullImg(false);
    imgRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
      e.preventDefault();
      const events = {
        [keyboardKeys.left]: onPrev,
        [keyboardKeys.right]: onNext,
        [keyboardKeys.up]: onPrev,
        [keyboardKeys.down]: onNext,
        [keyboardKeys.KeyC]: onConfirm,
        [keyboardKeys.KeyR]: onReject,
        [keyboardKeys.KeyZ]: () => setIsFullImg(prev => !prev)
      };
      events[e.code]();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext, onConfirm, onReject]);

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(src);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <Container padding='1'>
      <ImgWrap fullWidth={isFullImg}>
        <img
          src={src}
          alt='Stone image'
          onLoad={() => setImgLoading(false)}
          onError={() => setImgLoading(false)}
          ref={imgRef}
        />
      </ImgWrap>
      {imgLoading && (
        <ImageLoader>
          <span>Loading image...</span>
        </ImageLoader>
      )}
      <div>
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
            title='C - to confirm'
          >
            Confirm
          </StyledButton>
          <StyledButton
            variant='secondary'
            onClick={() => setIsFullImg(!isFullImg)}
            disabled={loading}
            icon='Search'
            title='Z - to zoom'
          >
            Zoom {isFullImg ? 'out' : 'in'}
          </StyledButton>
          <DangerButton
            variant='danger'
            onClick={onReject}
            disabled={loading}
            title='R - to reject'
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
            <Button
              variant='secondary'
              onClick={handleCopy}
              icon={isCopied ? 'Done' : ''}
            >
              {isCopied ? 'Copied' : 'Copy path'}
            </Button>
            <ImgPath title={src}>.../{src.split('/').pop()}</ImgPath>
          </CopyWrap>
          {status !== STONE_STATUS.unverified && (
            <StatusText verified={status === STONE_STATUS.hasStones}>{status}</StatusText>
          )}
        </BottomContainer>
      </div>
    </Container>
  );
};
