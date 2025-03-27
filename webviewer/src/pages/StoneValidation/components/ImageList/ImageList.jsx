import React, { useEffect, useRef } from 'react';
import ReactPaginate from 'react-paginate';
import { STONE_STATUS_TITLES } from '../../constants';
import { Icon } from 'components/_shared/Icon';

import {
  Pagination,
  Container,
  TableHeader,
  TableRow,
  TableWrap
} from './ImageList.styles';

export const ImageList = ({
  images,
  currentImg,
  setCurrentImg,
  pageCount,
  onPageChange,
  currentPage
}) => {
  const wrapperRef = useRef();

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [currentImg]);

  const handlePageChange = event => {
    onPageChange?.(event);
  };

  return (
    <Container>
      <TableWrap>
        <table>
          <tbody>
            <tr>
              <TableHeader>#</TableHeader>
              <TableHeader>Validated</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
            {images.map(([path, data], i) => (
              <TableRow
                key={path}
                isActive={i === currentImg}
                onClick={() => setCurrentImg(i)}
                ref={currentImg === i ? wrapperRef : null}
              >
                <td>{data.id + 1}</td>
                <td>
                  {data.status === 'None' ? (
                    <Icon color='gray'>Cross</Icon>
                  ) : (
                    <Icon color='green'>Check</Icon>
                  )}
                </td>
                <td>{STONE_STATUS_TITLES[data.status]}</td>
              </TableRow>
            ))}
          </tbody>
        </table>
      </TableWrap>
      {images.length > 0 && (
        <Pagination>
          <ReactPaginate
            breakLabel='...'
            nextLabel='>'
            onPageChange={handlePageChange}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel='<'
            renderOnZeroPageCount={null}
            forcePage={currentPage}
          />
        </Pagination>
      )}
    </Container>
  );
};
