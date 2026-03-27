const CHUNK_SIZE = 32 * 1024 * 1024; // 32 MiB — GCS requires multiples of 256 KiB
const MAX_CONSECUTIVE_FAILURES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Ask GCS how many bytes it has received so far for a resumable session.
// Returns the byte offset to resume from.
const queryUploadOffset = (uploadUrl, fileSize) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Range', `bytes */${fileSize}`);
    xhr.onload = () => {
      if (xhr.status === 308) {
        const range = xhr.getResponseHeader('Range');
        resolve(range ? parseInt(range.split('-')[1], 10) + 1 : 0);
      } else if (xhr.status === 200 || xhr.status === 201) {
        resolve(fileSize); // Upload already complete
      } else {
        reject(new Error(`Offset query failed: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error querying upload offset'));
    xhr.send();
  });

// Send one chunk. GCS returns 308 for intermediate chunks and 200/201 for the last.
// onChunkProgress(bytesLoadedWithinChunk) fires continuously during the PUT so the
// caller can show smooth progress rather than waiting for the whole chunk to finish.
const sendChunk = (
  uploadUrl,
  chunk,
  start,
  fileSize,
  contentType,
  abortSignal,
  onChunkProgress
) =>
  new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new DOMException('Cancelled', 'AbortError'));
      return;
    }

    const xhr = new XMLHttpRequest();
    const end = start + chunk.size - 1;

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    abortSignal?.addEventListener('abort', onAbort, { once: true });

    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onChunkProgress(e.loaded);
    };
    xhr.onload = () => {
      abortSignal?.removeEventListener('abort', onAbort);
      if (xhr.status === 308 || xhr.status === 200 || xhr.status === 201) {
        resolve();
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => {
      abortSignal?.removeEventListener('abort', onAbort);
      reject(new Error('Network error'));
    };
    xhr.send(chunk);
  });

// Upload a file to a GCS resumable session URL in 32 MiB chunks.
// On chunk failure: retries up to MAX_CONSECUTIVE_FAILURES times with exponential
// backoff, querying GCS for the real offset before each retry so the resume is exact.
//
// onProgress(percent, bytesLoaded) — fires continuously during each chunk (smooth bar).
// abortSignal                      — pass an AbortSignal to support cancellation.
export const uploadFileChunked = async (uploadUrl, file, onProgress, abortSignal) => {
  const fileSize = file.size;
  const contentType = file.type || 'application/octet-stream';
  let offset = 0;
  let consecutiveFailures = 0;

  while (offset < fileSize) {
    if (abortSignal?.aborted) throw new DOMException('Cancelled', 'AbortError');

    const chunkEnd = Math.min(offset + CHUNK_SIZE, fileSize);
    const chunk = file.slice(offset, chunkEnd);

    try {
      await sendChunk(
        uploadUrl,
        chunk,
        offset,
        fileSize,
        contentType,
        abortSignal,
        chunkLoaded => {
          const total = offset + chunkLoaded;
          onProgress(Math.round((total / fileSize) * 100), total);
        }
      );
      consecutiveFailures = 0;
      offset = chunkEnd;
      onProgress(Math.round((offset / fileSize) * 100), offset);
    } catch (err) {
      if (err.name === 'AbortError') throw err;

      consecutiveFailures++;
      if (consecutiveFailures > MAX_CONSECUTIVE_FAILURES) {
        throw new Error(
          `Upload failed after ${MAX_CONSECUTIVE_FAILURES} retries: ${err.message}`
        );
      }

      await sleep(RETRY_DELAYS_MS[consecutiveFailures - 1] ?? 4000);

      // Re-sync with GCS: the server may have stored more (or less) than we think.
      try {
        const serverOffset = await queryUploadOffset(uploadUrl, fileSize);
        if (serverOffset >= fileSize) return; // Already complete
        offset = serverOffset;
      } catch {
        // If the query itself fails, keep the current offset and retry the same chunk.
      }
    }
  }
};
