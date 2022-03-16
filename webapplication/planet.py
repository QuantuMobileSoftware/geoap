import rasterio
import subprocess
import argparse
from glob import glob
import numpy as np


def transform_raster(raster_path, new_raster_path, date, request_id=0):
    with rasterio.open(raster_path, "r") as src:
        updated_meta = src.profile.copy()
        updated_meta.update({"count": 3,
                             "bands": 3,
                             "nodata": 0,
                             "dtype": 'uint8'})
        with rasterio.open(new_raster_path, "w", **updated_meta) as dst:
            rgb = [3, 2, 1]
            dst.update_tags(start_date=date, end_date=date, request_id=request_id)
            for num, band in enumerate(range(1,4)):
                cur_band = src.read(rgb[num])
                max_ = np.percentile(cur_band, 98)
                cur_band[cur_band > max_] = max_
                cur_band = (cur_band / max_) * 255
                cur_band = cur_band.astype(np.uint8)
                dst.write(cur_band, band)


def transform_raster_visual(raster_path, new_raster_path, date, request_id=0):
    """
    For Visual SkySatCollect
    """
    with rasterio.open(raster_path, "r") as src:
        updated_meta = src.profile.copy()
        with rasterio.open(new_raster_path, "w", **updated_meta) as dst:
            dst.update_tags(start_date=date, end_date=date, request_id=request_id)
            for band in range(1, 4):
                cur_band = src.read(band)
                dst.write(cur_band, band)


def merge_rasters(raster_path_list, date, save_path, product):
    raster_new_list = []
    for raster_path in raster_path_list:
        new_raster_path_tmp = raster_path.replace(".tif", "_converted_tmp.tif")
        raster_new_list.append(new_raster_path_tmp)
        if product == 'SkySatCollect':
            transform_raster_visual(raster_path, new_raster_path_tmp, date)
        else:
            transform_raster(raster_path, new_raster_path_tmp, date)

    listToStr = ' '.join([str(elem) for elem in raster_new_list])
    subprocess.call(' '.join(["gdalwarp --config GDAL_CACHEMAX 3000 -wm 3000 -t_srs EPSG:3857", listToStr, save_path]),
                    shell=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Script for creating slices/tiles of rasters from multiple groves')

    # parser.add_argument('-p', '--dataset_path',
    #                     type=str,
    #                     required=True,
    #                     help="""path to dir with rasters""")
    parser.add_argument('-d', '--date',
                        default="2020-07-01",
                        type=str,
                        required=True,
                        help="""date_to_write in meta""")
    parser.add_argument('-s', '--save_path',
                        type=str,
                        required=True,
                        help="""path to save merged raster""")
    parser.add_argument('-p', '--product',
                        type=str,
                        required=False,
                        default='PSScene4Band',
                        choices=['PSScene4Band', 'SkySatCollect'],
                        help="""path to save merged raster""")

    path_dict = {'PSScene4Band': "files/PSScene4Band/*/analytic_sr_udm2/*_SR.tif",
                 'SkySatCollect': "files/SkySatCollect/*/*_visual.tif"}
    args = parser.parse_args()
    raster_list = glob(path_dict.get(args.product))
    merge_rasters(raster_list, args.date, args.save_path, args.product)
