import styled, { css } from 'styled-components';
import { em } from 'styles';
import { Button } from 'components/_shared/Button';
import { typographyStyle } from 'components/_shared/Typography';

export const PageContainer = styled.div`
  padding: ${em(24)} ${em(40)};
  max-width: 1200px;
  margin: 0 auto;
`;

export const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${em(24)};
  margin-top: ${em(24)};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const SectionCard = styled.div`
  ${({ theme }) => css`
    padding: ${em(16)};
    border-radius: 12px;
    border: 1px solid ${theme.colors.nature.n2};
    background: ${theme.colors.nature.n0};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: ${em(12)};
    min-height: 280px;
  `}
`;

export const SectionTitle = styled.h3`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(16)};
    font-weight: 600;
    color: ${theme.colors.nature.n5};
    margin: 0;
    padding-bottom: ${em(8)};
    border-bottom: 2px solid ${theme.colors.primary.p1};
  `}
`;

export const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${em(6)};
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
`;

export const FileItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${em(6)} ${em(10)};
    border-radius: ${em(6)};
    border: 1px solid ${theme.colors.nature.n2};
    background: ${theme.colors.nature.n0};
  `}
`;

export const FileItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(8)};
  flex-shrink: 0;
`;

export const FileName = styled.span`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(12)};
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

export const FileSize = styled.span`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(11)};
    color: ${theme.colors.nature.n3};
    white-space: nowrap;
  `}
`;

export const RemoveButton = styled.button`
  ${({ theme }) => css`
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    color: ${theme.colors.nature.n3};
    display: flex;
    align-items: center;
    &:hover {
      color: ${theme.colors.danger};
    }
  `}
`;

export const AddFileLabel = styled.label`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    display: inline-flex;
    align-items: center;
    gap: ${em(6)};
    padding: ${em(6)} ${em(14)};
    border-radius: 20px;
    background: ${theme.colors.primary.p1};
    color: ${theme.colors.nature.n0};
    font-size: ${em(13)};
    cursor: pointer;
    align-self: flex-start;
    transition: background 0.2s;
    &:hover {
      background: ${theme.colors.primary.p4};
      color: ${theme.colors.nature.n5};
    }
  `}
`;

export const ProgressBarContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 80px;
    height: 18px;
    background: ${theme.colors.primary.p4};
    border-radius: 6px;
    border: 1px solid ${theme.colors.primary.p1};
    overflow: hidden;
  `}
`;

export const ProgressBarFill = styled.div`
  ${({ theme, $width, $done }) => css`
    height: 100%;
    width: ${$width ?? 0}%;
    background: ${$done ? theme.colors.primary.p1 : theme.colors.primary.p2};
    transition: width 0.2s ease-out;
  `}
`;

export const ProgressBarText = styled.span`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${em(10)};
    pointer-events: none;
    color: ${theme.colors.nature.n5};
    white-space: nowrap;
  `}
`;

export const UploadInfo = styled.p`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    color: ${theme.colors.nature.n3};
    font-size: ${em(13)};
    text-align: center;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(16)};
  margin-top: ${em(32)};
  justify-content: flex-end;
`;

export const UploadButton = styled(Button)`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    padding: ${em(8)} ${em(24)};
    border-radius: 20px;
    background: ${theme.colors.primary.p3};
    color: ${theme.colors.nature.n0};
    font-size: ${em(14)};
    display: flex;
    align-items: center;
    gap: ${em(6)};
    &:hover:not(:disabled) {
      background: ${theme.colors.primary.p1};
    }
    &:disabled {
      background: ${theme.colors.nature.n2};
      color: ${theme.colors.nature.n3};
      cursor: default;
    }
  `}
`;

export const CancelButton = styled(Button)`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    padding: ${em(8)} ${em(24)};
    border-radius: 20px;
    background: ${theme.colors.danger};
    color: ${theme.colors.nature.n0};
    font-size: ${em(14)};
    &:hover {
      opacity: 0.85;
    }
  `}
`;

export const StatusMessage = styled.p`
  ${({ theme, $success }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(14)};
    color: ${$success ? theme.colors.primary.p1 : theme.colors.danger};
  `}
`;

export const SuccessOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SuccessCard = styled.div`
  ${({ theme }) => css`
    background: ${theme.colors.nature.n0};
    border-radius: ${em(16)};
    padding: ${em(40)} ${em(48)};
    max-width: ${em(420)};
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  `}
`;

export const SuccessIconWrap = styled.div`
  ${({ theme }) => css`
    font-size: ${em(52)};
    color: ${theme.colors.primary.p1};
    margin-bottom: ${em(12)};
    line-height: 1;
  `}
`;

export const SuccessTitle = styled.h2`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'h2' })};
    color: ${theme.colors.nature.n5};
    margin: 0 0 ${em(8)};
  `}
`;

export const SuccessText = styled.p`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    color: ${theme.colors.nature.n3};
    margin: 0 0 ${em(24)};
  `}
`;

export const SuccessActions = styled.div`
  display: flex;
  gap: ${em(12)};
  justify-content: center;
  flex-wrap: wrap;
`;

export const SuccessButton = styled(Button)`
  ${({ theme, $secondary }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    padding: ${em(8)} ${em(22)};
    border-radius: 20px;
    font-size: ${em(14)};
    background: ${$secondary ? theme.colors.nature.n2 : theme.colors.primary.p1};
    color: ${$secondary ? theme.colors.nature.n5 : theme.colors.nature.n0};
    &:hover {
      background: ${$secondary ? theme.colors.nature.n3 : theme.colors.primary.p2};
      color: ${theme.colors.nature.n0};
    }
  `}
`;
