import styled, { css, keyframes } from 'styled-components';
import { em } from 'styles';
import { Button } from 'components/_shared/Button';
import { typographyStyle } from 'components/_shared/Typography';

// ========== PROGRESS ANIMATION ==========

const progressAnimate = keyframes`
  100% { background-position: right; }
`;

// ========== PAGE LAYOUT ==========

export const UploadPageContainer = styled.div`
  padding: ${em(0)} ${em(40)};
  max-width: 1400px;
  margin: 0 auto;
`;

// ========== TABS ==========

export const Tabs = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: ${em(20)};
`;

export const Tab = styled.button`
  ${({ theme, $selected }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(14)};
    padding: ${em(10)} ${em(24)};
    border: none;
    background: none;
    cursor: pointer;
    color: ${$selected ? theme.colors.primary.p1 : theme.colors.nature.n3};
    font-weight: ${$selected ? 600 : 400};
    border-bottom: 2px solid ${$selected ? theme.colors.primary.p1 : 'transparent'};
    transition: color 0.2s, border-color 0.2s;
    &:hover {
      color: ${theme.colors.primary.p1};
    }
  `}
`;

export const TabsLine = styled.div`
  ${({ theme }) => css`
    flex: 1;
    border-bottom: 2px solid ${theme.colors.nature.n2};
  `}
`;

export const TabContent = styled.div`
  padding: ${em(24)} 0;
`;

// ========== MISSION LIST ==========

export const MissionsWrapper = styled.div`
  ${({ theme }) => css`
    padding: ${em(16)};
    min-width: 50%;
    background: ${theme.colors.nature.n0};
    font-family: sans-serif;
  `}
`;

export const MissionListHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${theme.colors.nature.n0};
    margin-bottom: ${em(12)};
  `}
`;

export const ListTitle = styled.h2`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(20)};
    color: ${theme.colors.nature.n5};
    font-weight: 600;
    margin: 0;
  `}
`;

export const MissionsContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.colors.nature.n0};
    display: flex;
    flex-direction: column;
    border-radius: ${em(12)};
    border: 1px solid ${theme.colors.nature.n1};
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.08);
    padding: ${em(20)} ${em(40)};
    min-height: 55dvh;
  `}
`;

export const MissionItemBlock = styled.div`
  ${({ theme }) => css`
    padding: ${em(10)} ${em(20)};
    background: ${theme.colors.nature.n0};
    border: 1px solid ${theme.colors.nature.n2};
    border-radius: 10px;
    box-shadow: 0 ${em(2)} ${em(4)} rgba(0, 0, 0, 0.06);
    margin-bottom: ${em(8)};
    transition: box-shadow 0.2s ease;
    &:hover {
      box-shadow: 0 ${em(4)} ${em(8)} rgba(0, 0, 0, 0.1);
    }
  `}
`;

export const MissionItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${theme.colors.nature.n0};
    flex-wrap: wrap;
    gap: ${em(8)};
  `}
`;

export const MissionItemInfo = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${em(16)};
    background: ${theme.colors.nature.n0};
  `}
`;

export const MissionDateInfo = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background: ${theme.colors.nature.n0};
    padding: ${em(10)} ${em(4)};
    gap: ${em(4)};
  `}
`;

export const HelpText = styled.p`
  ${({ theme, fontSize }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${fontSize ? em(fontSize) : em(14)};
    display: inline-block;
    max-width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    margin: 0;
  `}
`;

export const ToggleButton = styled.button`
  ${({ theme }) => css`
    border: none;
    background: none;
    cursor: pointer;
    padding: ${em(4)};
    color: ${theme.colors.nature.n3};
    display: flex;
    align-items: center;
    border-radius: 50%;
    transition: background 0.2s, color 0.2s;
    &:hover {
      background: ${theme.colors.nature.n1};
      color: ${theme.colors.primary.p1};
    }
  `}
`;

// ========== LIST PROGRESS BAR ==========

export const ListProgressBarItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    background: ${theme.colors.nature.n0};
    min-width: ${em(140)};
  `}
`;

export const ListProgressBarContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 22px;
    position: relative;
    background: ${theme.colors.primary.p4};
    overflow: hidden;
    border-radius: ${em(8)};
    border: 1px solid ${theme.colors.primary.p1};
    text-align: center;
  `}
`;

export const ListProgressBarFill = styled.div`
  ${({ theme, $width, $status }) => css`
    height: 100%;
    transition: width 0.2s ease-out;

    ${$status === 'pending' &&
    css`
      width: 0%;
      background: ${theme.colors.nature.n2};
    `}

    ${$status === 'in_progress' &&
    css`
      width: 100%;
      background: repeating-linear-gradient(
        -45deg,
        ${theme.colors.primary.p2} 0 10px,
        transparent 0 15px
      );
      background-size: 40px 100%;
      animation: ${progressAnimate} 4s infinite linear;
    `}

    ${$status === 'completed' &&
    css`
      width: 100%;
      background: ${theme.colors.primary.p1};
    `}

    ${$status === 'failed' &&
    css`
      width: 100%;
      background: ${theme.colors.danger};
    `}

    ${$status === 'processing' &&
    css`
      width: 100%;
      background: repeating-linear-gradient(-45deg, #f59e0b 0 10px, transparent 0 15px);
      background-size: 40px 100%;
      animation: ${progressAnimate} 4s infinite linear;
    `}

    ${$status === 'traj_done' &&
    css`
      width: 100%;
      background: ${theme.colors.primary.p1};
    `}

    ${$status === 'traj_failed' &&
    css`
      width: 100%;
      background: ${theme.colors.danger};
    `}

    ${!$status &&
    css`
      width: ${$width ?? 0}%;
      background: ${theme.colors.primary.p2};
    `}
  `}
`;

export const ListProgressBarText = styled.span`
  ${({ theme }) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${em(10)};
    font-weight: 600;
    pointer-events: none;
    color: ${theme.colors.nature.n5};
    white-space: nowrap;
  `}
`;

// ========== STATUS CHIPS ==========

export const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(6)};
  flex-wrap: wrap;
`;

export const StatusChip = styled.div`
  ${({ theme, $status }) => css`
    display: inline-flex;
    align-items: center;
    gap: ${em(4)};
    padding: ${em(3)} ${em(10)};
    border-radius: ${em(20)};
    font-size: ${em(12)};
    font-weight: 500;
    white-space: nowrap;

    ${($status === 'completed' || $status === 'traj_done') &&
    css`
      background: ${theme.colors.primary.p4};
      color: ${theme.colors.primary.p1};
      border: 1px solid ${theme.colors.primary.p2};
    `}

    ${($status === 'in_progress' || $status === 'processing') &&
    css`
      background: #fff8e1;
      color: #b45309;
      border: 1px solid #fcd34d;
    `}

    ${($status === 'failed' || $status === 'traj_failed') &&
    css`
      background: #fef2f2;
      color: ${theme.colors.danger};
      border: 1px solid ${theme.colors.danger};
    `}

    ${($status === 'pending' || !$status) &&
    css`
      background: ${theme.colors.nature.n1};
      color: ${theme.colors.nature.n3};
      border: 1px solid ${theme.colors.nature.n2};
    `}
  `}
`;

// ========== MISSION FILE LIST (expanded details) ==========

export const MissionFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${em(4)};
  margin-top: ${em(10)};
`;

export const MissionFileRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${em(10)};
    padding: ${em(6)} ${em(10)};
    background: ${theme.colors.nature.n1};
    border-radius: ${em(6)};
    border: 1px solid ${theme.colors.nature.n2};
  `}
`;

export const MissionFileName = styled.span`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(13)};
    color: ${theme.colors.nature.n5};
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  `}
`;

export const MissionFileSize = styled.span`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(12)};
    color: ${theme.colors.nature.n3};
    white-space: nowrap;
    min-width: ${em(90)};
    text-align: right;
    flex-shrink: 0;
  `}
`;

export const DownloadButton = styled.button`
  ${({ theme }) => css`
    border: none;
    background: none;
    cursor: pointer;
    padding: ${em(4)};
    color: ${theme.colors.primary.p1};
    display: flex;
    align-items: center;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
    &:hover {
      background: ${theme.colors.primary.p4};
    }
  `}
`;

// ========== UPLOAD FORM WRAPPER ==========

export const UploadFormWrapper = styled.div`
  max-width: 1100px;
`;

export const CombinedSize = styled.p`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(13)};
    color: ${theme.colors.nature.n3};
    margin-top: ${em(8)};
  `}
`;

// ========== SUCCESS MODAL ==========

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

export const StatusMessage = styled.p`
  ${({ theme }) => css`
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(14)};
    color: ${theme.colors.danger};
    margin: 0;
  `}
`;

export const EmptyState = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: ${em(40)};
    color: ${theme.colors.nature.n3};
    ${typographyStyle({ theme, variant: 'body2' })};
    font-size: ${em(14)};
    text-align: center;
  `}
`;
