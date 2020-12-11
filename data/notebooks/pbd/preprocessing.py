import os
import rasterio
import numpy as np
import shutil

from os.path import join, basename, dirname


def preprocess_sentinel_raw_data(save_path, tile_folder, aoi_mask=None):
    """
    Prepare raster for the following processing. Crop Sentinel-2 tile to fit the given AoI.

        Parameters:
            save_path (str): Path where preprocessed rasters will be stored.
            tile_folder (str): Path to raw Sentinel-2 data.
            aoi_mask (GeoDataFrame): Dataframe with geometry of the area of interest.

        Returns:
            out_path (str): Path to preprocessed raster.
    """
    img, metadata = extract_and_merge_bands(tile_folder)
    
    raster_path = join(
        save_path,
        basename(tile_folder) + ".tif"
    )
    save_raster(img, metadata, raster_path)
    out_path = raster_path

    if aoi_mask is not None:
        raster, metadata = crop_raster_aoi(raster_path, aoi_mask)
        out_path = out_path.replace(".tif", "_cropped.tif")
        save_raster(raster, metadata, out_path)

    return out_path


def extract_and_merge_bands(tile_folder):
    rgb_name, b8_name = find_band_names(tile_folder)
    img, metadata = merge_bands(rgb_name, b8_name)

    return img, metadata


def read_raster(img_path):
    with rasterio.open(img_path) as src:
        img = src.read().astype(np.float32)
        meta = src.meta

    return img, meta


def find_band_names(tile_folder):
    rgb_name = join(tile_folder, find_band_in_folder('TCI', tile_folder, 'jp2'))
    b8_name = join(tile_folder, find_band_in_folder('B08', tile_folder, 'jp2'))

    return rgb_name, b8_name


def find_band_in_folder(band, folder, file_type):
    for file in os.listdir(folder):
        if band in file and file.endswith(file_type):
            return file

    return None


def merge_bands(rgb_name, b8_name):
    bands = []
    band, metadata = read_raster(rgb_name)
    bands.append(band)

    band, _ = read_raster(b8_name)
    band = scale_img(band)
    bands.append(band)

    img = np.concatenate(bands).astype(np.uint8)
    metadata["count"] = img.shape[0]

    return img, metadata


def scale_img(img, max_value=255):
    img = np.nan_to_num(img)
    mean_ = img.mean()
    std_ = img.std()

    min_ = max(img.min(), mean_ - 2 * std_)
    max_ = min(img.max(), mean_ + 2 * std_)

    img = (img - min_) * max_value / (max_ - min_)
    img = np.clip(img, 0, max_value)

    return img


def crop_raster_aoi(raster_path, aoi_mask):
    with rasterio.open(raster_path) as src:
        aoi_mask.to_crs(src.crs, inplace=True)
        meta = src.meta
        raster, transform = rasterio.mask.mask(
            src, aoi_mask.geometry, crop=True)
        meta.update({
            "driver": "GTiff",
            "height": raster.shape[1],
            "width": raster.shape[2],
            "transform": transform
        })

    return raster, meta


def save_raster(raster, meta, save_path):
    directory = dirname(save_path)
    if not os.path.exists(directory):
        os.makedirs(directory)
    with rasterio.open(save_path, "w", **meta) as dest:
        dest.write(raster)

def extract_tci(raster_path, temp_save_path, results_dir): 
    """
    Extracting from cropped image TCI bands to show in Results
    """
    
    with rasterio.open(raster_path) as src:
        meta = src.meta        
        meta.update({
            'count': 3, 
            'nodata': 0,
        })
        tci = src.read((1, 2, 3))        
        with rasterio.open(temp_save_path, "w", **meta) as dest:
            dest.write(tci)
            
    os.makedirs(results_dir, exist_ok=True)
    try:
        shutil.move(temp_save_path, os.path.join(results_dir, os.path.basename(temp_save_path)))
    except Exception as ex:
        print(f"Error while moving: {str(ex)}")
