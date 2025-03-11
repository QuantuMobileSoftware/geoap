import React, { useEffect } from 'react';
import { Button } from 'components/_shared/Button';
import { Container, ButtonsWrap, DangerButton } from './ImageViewer.styles';

const keyboardKeys = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  up: 'ArrowUp',
  down: 'ArrowDown'
};

export const ImageViewer = ({
  src,
  onPrev,
  onNext,
  onConfirm,
  onReject,
  disablePrev,
  disableNext
}) => {
  useEffect(() => {
    const handleKeyDown = e => {
      if (!Object.values(keyboardKeys).includes(e.key)) return;

      const events = {
        [keyboardKeys.left]: onPrev,
        [keyboardKeys.right]: onNext,
        [keyboardKeys.up]: onConfirm,
        [keyboardKeys.down]: onReject
      };
      events[e.key]();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <img width='100%' src={src} alt='Stone image' />
      <ButtonsWrap>
        <Button
          variant='secondary'
          onClick={onPrev}
          disabled={disablePrev}
          icon='ExpandLeft'
        ></Button>
        <Button variant='primary' onClick={onConfirm} icon='ExpandUp'>
          Confirm
        </Button>
        <DangerButton variant='danger' onClick={onReject} icon='ExpandDown'>
          Reject
        </DangerButton>
        <Button
          variant='secondary'
          onClick={onNext}
          disabled={disableNext}
          icon='ExpandRight'
        ></Button>
      </ButtonsWrap>
    </Container>
  );
};
