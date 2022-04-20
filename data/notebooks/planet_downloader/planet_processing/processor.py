import json
from concurrent.futures import ProcessPoolExecutor, as_completed
import numpy as np
import pandas as pd
from pathlib import Path
import rasterio
from rasterio.windows import Window
import os
import shutil
from subprocess import Popen, PIPE, TimeoutExpired
from tempfile import TemporaryDirectory
import time
import zipfile
from .constants import assets_in_bundles_for_visualizing
from .utils import transform_crs
from .utils import scale_band, min_max_scale

MAX_TIMEOUT_FOR_IMG_MERGE_SECONDS = 100

bundles_json = 'constants/bundles.json'


class PlanetBase:
    def __init__(self, archive_path, temp_dir_path):
        """
        :param archive_path: str or Path: Absolut path to archive
        :param temp_dir_path:  str or Path: Absolut path to directory for storing temporary files
        """
        self.archive_path = Path(archive_path)
        self.temp_dir_path = temp_dir_path
        self.results_json_path = None
        self.products_info = None
        self.found_products_df = None
        self.found_items_info_df = None
        self.filtered_products_df = None
        self.img_df = None
        self.img_converted_list = None
        self.img_transformed_list = None
        self.name = None
        self.max_timeout_for_img_generation = MAX_TIMEOUT_FOR_IMG_MERGE_SECONDS
        self.get_products_info()
        self.planet_bundles = self.get_planet_bundles()
        self.extract_archive_manifest_data()
        self.extract_archive_item_json_files()
        
    def get_products_info(self):
        """
        Extract data from 'results.json' file
        :return:
        """
        self.results_json_path = self.archive_path.parent / 'results.json'
        with open(self.results_json_path) as f:
            data = json.load(f)
            self.products_info = data['products']
            self.name = data['name']
        return
    
    @staticmethod
    def get_planet_bundles():
        """
        Get planet bundles information from json file
        :return: obj: planet bundles information
        """
        with open(Path(__file__).parent.resolve() / bundles_json, 'r') as f:
            return json.load(f)

    @staticmethod
    def filter_product_by_file_type(df, media_type):
        """
        Clear products dataframe from rows which contain other media_type
        :param media_type: str: 'image/tiff' or 'application/json'
        :param df: Pandas DataFrame
        :return: Pandas DataFrame
        """
        df = df.loc[df['media_type'] == media_type]
        df.reset_index(drop=True, inplace=True)
        return df
        
    def extract_archive_manifest_data(self):
        """
        Extract manifest.json from archive,
        convert it to self.found_items_info_df Pandas DataFrame
        and self.found_products_df Pandas DataFrame
        :return:
        """
        with TemporaryDirectory() as tmp_dir:
            with zipfile.ZipFile(self.archive_path, 'r') as zip_ref:
                zip_ref.extract('manifest.json', path=tmp_dir)
            
            with open(Path(tmp_dir) / 'manifest.json') as f:
                archive_files_info = json.load(f)['files']
            with open(Path(tmp_dir) / 'manifest.json', 'w') as f:
                f.write(json.dumps(archive_files_info))
            _df = pd.read_json(Path(tmp_dir) / 'manifest.json',)
            self.found_items_info_df = self.filter_product_by_file_type(_df, 'application/json')
            self.found_products_df = self.filter_product_by_file_type(_df, 'image/tiff')
        return
    
    def extract_file_from_archive(self, file_path, file_size):
        path = self.temp_dir_path / file_path
        if path.exists() and path.stat().st_size == file_size:
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(self.archive_path, 'r') as zip_ref:
            zip_ref.extract(file_path, path=self.temp_dir_path)
        return
        
    def extract_archive_item_json_files(self):
        """
        Extract all '.json' files from order archive
        :return:
        """
        future_to_json_files_list = []
        start_time = time.time()
        max_workers = os.cpu_count()
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            for index, row in self.found_items_info_df.iterrows():
                file_path = row['path']
                file_size = row['size']
                future = executor.submit(self.extract_file_from_archive, file_path, file_size)
                future_to_json_files_list.append(future)
        print(f'{time.time() - start_time} seconds for extracting of all json files from archive')
        
    def extract_img_files_from_archiwe(self, img_df):
        future_to_img_files_list = []
        start_time = time.time()
        max_workers = os.cpu_count()
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            for index, row in img_df.iterrows():
                file_path = row['path']
                file_size = row['size']
                future = executor.submit(self.extract_file_from_archive, file_path, file_size)
                future_to_img_files_list.append(future)
        print(f'{time.time() - start_time} seconds for extracting of all product files from archive')
    
    def get_item_info(self, item_id, item_type):
        """
        Extract item 'metadata.json' file from archive and read it
        :param item_id: str: planet product item_id
        :param item_type: str: planet product item_type
        :return: obj or None: data from metadata.json for product item
        """
        item_metadata_path = self.temp_dir_path / 'files' / item_type / item_id / f'{item_id}_metadata.json'
        if not item_metadata_path.exists():
            print(f'{item_metadata_path} doth not exists! Skip it!')
            return
        with open(item_metadata_path) as f:
            item_info = json.load(f)
            item_info['path'] = item_metadata_path
        return item_info
    
    @staticmethod
    def get_empty_img_df():
        column_names = ['path', 'size', 'item_id', 'bands_order', ]
        return pd.DataFrame(columns=column_names)
        
    def reorder_item_bands(self, img_df, reordering_function):
        """
        Create new image with selected bands, create .json file for each new image after creating succeed
        :param reordering_function: obj: function for image processing
        :param img_df: pandas DataFrame
        :return: list: list of Path to converted images
        """
        future_to_img_files_list = []
        start_time = time.time()
        max_workers = int(os.cpu_count() / 2)
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            for index, row in img_df.iterrows():
                raster_path = self.temp_dir_path / row['path']
                bands_order = row['bands_order']
                future = executor.submit(reordering_function, raster_path, bands_order)
                future_to_img_files_list.append(future)

            img_converted_list = []
            for future in as_completed(future_to_img_files_list):
                raster_dst = future.result()
                if raster_dst:
                    print(raster_dst)
                    img_converted_list.append(raster_dst)
                    json_dst = raster_dst.with_suffix('.json')
                    j_data = {'converted': str(raster_dst)}
                    with open(json_dst, 'w') as f:
                        f.write(json.dumps(j_data))
                    
            print(f'{time.time() - start_time} seconds for converting {len(img_df.index)} images')
            return img_converted_list

    @staticmethod
    def transform_img(paths, dst_crs="EPSG:3857"):
        print(f'Start transforming images to {dst_crs}')
        future_file_list = []
        img_transformed_list = []
        start_time = time.time()
        max_workers = int(os.cpu_count() / 2)
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            for raster_path in paths:
                tmp_path = str(raster_path).replace('.jp2', '_tmp.jp2').replace('.tif', '_tmp.tif')
                json_tmp_path = Path(tmp_path).with_suffix('.json')
                if json_tmp_path.exists():
                    img_transformed_list.append(tmp_path)
                    continue
                future = executor.submit(transform_crs, raster_path, tmp_path, dst_crs=dst_crs, resolution=None)
                future_file_list.append(future)
    
            for future in as_completed(future_file_list):
                raster_transformed = future.result()
                if raster_transformed:
                    print('raster transformed', raster_transformed)
                    img_transformed_list.append(raster_transformed)
                    json_dst = Path(raster_transformed).with_suffix('.json')
                    j_data = {'transformed': str(raster_transformed)}
                    with open(json_dst, 'w') as f:
                        f.write(json.dumps(j_data))
    
            print(f'{time.time() - start_time} seconds for transform {len(img_transformed_list)} images')
            return img_transformed_list
    
    def merge_tiles(self, paths, out_raster_path='test.tif'):
        print(f'Start merging to {out_raster_path}')
        start_time = time.time()
        json_path = Path(out_raster_path).with_suffix('.json')
        if json_path.exists():
            return out_raster_path
        command = [
            "gdal_merge.py",
            "-o", out_raster_path,
            "-ot", "Byte",
            *paths
        ]
        self.run_process(command, self.max_timeout_for_img_generation)
        json_path = Path(out_raster_path).with_suffix('.json')
        with open(json_path, 'w') as f:
            data = {'merged': str(json_path)}
            f.write(json.dumps(data))
        
        print(f'{time.time() - start_time} seconds for merging {len(paths)} images in to {out_raster_path}')
        return out_raster_path
        
    @staticmethod
    def run_process(command, timeout):
        process = Popen(command, stdout=PIPE, stderr=PIPE, encoding="utf-8")
        try:
            out, err = process.communicate(timeout=timeout)
            if process.returncode != 0:
                print(f"Failed {command} output: {out}, err: {err}")
                raise Exception(f"Failed to run process")
            print(f"Success {command} output: {out}, err: {err}")
        except TimeoutExpired as te:
            print(f"Failed {command} error: {str(te)}. Killing process...")
            process.kill()
            out, err = process.communicate()
            print(f"Failed {command} output: {out}, err: {err}")
            raise
        
    def set_max_timeout_for_img_generation(self, timeout):
        self.max_timeout_for_img_generation = timeout
        
    @staticmethod
    def get_product_bands_order(product_bundle, item_type):
        """
        Get available bands for product based on product bundle and product item_type
        :param product_bundle: str: product bundle
        :param item_type: str: product item_type
        :return: Dict: bands dict where keys can be B', 'G', 'R', 'NIR', 'Red-Edge', 'Yellow', 'G_I', 'Coastal_Blue'
        """
        return assets_in_bundles_for_visualizing[product_bundle][item_type]['properties']['bands']
    
        
class PlanetVisualizer(PlanetBase):
    """
    Class for extracting and converting files from order archive for further visualization using 'gdal2tiles.py'
    """
    def __init__(self, archive_path, temp_dir_path, output_dir_path, delete_temp=False):
        """
        :param archive_path: str or Path: Absolut path to archive
        :param temp_dir_path:  str or Path: Absolut path to directory for storing temporary files
        :param output_dir_path: str or Path: Absolut path to directory for copying output file
        :param delete_temp: Bool: delete temp files
        """
        super().__init__(archive_path, temp_dir_path)
        self.output_dir_path = output_dir_path
        self.delete_temp = delete_temp
    
    @staticmethod
    def get_file_properties(product_bundle, item_type):
        """
        Check if product_bundle and item_type are in known bundles for visualizing,
        if it is not, then raise KeyError,
        else return dict with file name for extracting from archive and product properties
        :param product_bundle: str: product bundle name
        :param item_type: str: product item type
        :return: dict: {'file_name': 'ortho_visual', 'properties':
        {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}}
        """
        if product_bundle not in assets_in_bundles_for_visualizing.keys():
            print('Unknown planet/bundle_type!', product_bundle)
            raise KeyError
        if item_type not in assets_in_bundles_for_visualizing[product_bundle].keys():
            print('Unknown planet/asset_type! in assets_in_bundles_for_visualizing', item_type)
            raise KeyError
        return assets_in_bundles_for_visualizing[product_bundle][item_type]
    
    @staticmethod
    def filter_product_by_item_id(row, item_id):
        return row['planet/item_id'] == item_id
        
    @staticmethod
    def filter_product_by_bundle_assets_file_name(products_df, file_name):
        return products_df[products_df.annotations.apply(lambda row: row['planet/asset_type'] == file_name)]
    
    def get_bands_order_for_visualization(self, product_bundle, item_type):
        """
        Extract from constants bands order for visualization based on product bundle and product item_type
        :param product_bundle: str: product bundle
        :param item_type: str: product item_type
        :return: list: list of ints
        """
        bands_to_extract = ['R', 'G', 'B']
        product_bands_order = self.get_product_bands_order(product_bundle, item_type)
        return [product_bands_order[band] for band in bands_to_extract]

    @staticmethod
    def create_reordered_image(raster_path, bands_order, step=6000):
        """
        Create new image with bands dtype='uint8' and std normalization
        :param raster_path: Path: Path to source image
        :param bands_order: list or tuple
        :param step: step of window normalization
        :return: Path: Path to destination image
        """
        raster_dst = raster_path.parent / f'{raster_path.stem}_rgb{raster_path.suffix}'
        if raster_dst.with_suffix('.json').exists():
            return raster_dst
        src = rasterio.open(raster_path)
        w, h = src.meta['width'], src.meta['height']
        whole_rem_w = divmod(w, step)
        whole_rem_h = divmod(h, step)
    
        whole_i_h_steps = [(0, i * step, 0, step) for i in range(whole_rem_h[0])]
        all_steps_h = whole_i_h_steps + [(0, whole_i_h_steps[-1][1] + step, 0, whole_rem_h[1])]
    
        all_steps = []
        for h_step in all_steps_h:
            all_steps = all_steps + [(i * step, h_step[1], step, h_step[-1]) for i in range(whole_rem_w[0])]
            all_steps = all_steps + [(all_steps[-1][0] + step, h_step[1], whole_rem_w[1], h_step[-1])]
    
        pixels_sum = np.sum([np.sum(src.read((1, 2, 3), window=Window(*i)), axis=(1, 2)) for i in all_steps], axis=0)
    
        means_channels = (pixels_sum / (w * h)).reshape((3, 1, 1))
    
        squared_deviation = np.sum(
            [np.sum((src.read((1, 2, 3), window=Window(*i)) - means_channels) ** 2, axis=(1, 2)) for i in all_steps],
            axis=0)
    
        std = (squared_deviation / (w * h)) ** 0.5
    
        max_ = (means_channels.reshape(3, -1) + 2 * std.reshape(3, -1)).reshape(3, 1, 1)
    
        profile = src.profile
        profile['dtype'] = 'uint8'
        profile['count'] = 3
    
        with rasterio.open(
                raster_dst, 'w', **profile
        ) as dst:
            for i in all_steps:
                window_normalize = src.read((1, 2, 3), window=Window(*i)) / max_
                window_normalize = np.clip(window_normalize * 255, 0, 255).astype(rasterio.uint8)
                dst.write(window_normalize, window=Window(*i))
    
        return raster_dst
        
    @staticmethod
    def create_reordered_image_v1(raster_path, bands_order):
        """
        TODO rm this
        Create new image with bands dtype='uint8' ordered according to bands_order
        :param raster_path: Path: Path to source image
        :param bands_order: list or tuple
        :return: Path: Path to destination image
        """
        raster_dst = raster_path.parent / f'{raster_path.stem}_rgb{raster_path.suffix}'
        if raster_dst.with_suffix('.json').exists():
            return raster_dst
        with rasterio.open(raster_path, "r") as src:
            updated_meta = src.profile.copy()
            updated_meta['count'] = len(bands_order)
            updated_meta['bands'] = len(bands_order)
            with rasterio.open(raster_dst, 'w', **updated_meta) as dst:
                for num, band_num in enumerate(bands_order, start=1):
                    band = src.read(band_num)
                    dst.write(band, indexes=num)
        return raster_dst

    def translate_raster(self, raster_path, bands_order):
        raster_dst = raster_path.parent / f'{raster_path.stem}_rgb{raster_path.suffix}'
        if raster_dst.with_suffix('.json').exists():
            return raster_dst
        b_order = ""
        for band in bands_order:
            b_order = b_order + f" -b {band}"

        command = [
            "gdal_translate",
            "-ot", "Byte",
            b_order,
            # '-q',
            str(raster_path), str(raster_dst)
        ]
        self.run_process(command, self.max_timeout_for_img_generation)
        return raster_dst
    
    def product_filter(self, product):
        """
        Filter ordered images
        :param product: obj:
        :return: pandas DataFrame: DataFrame with column names: 'path', 'size', 'item_id', 'bands_order'
        """
        img_df = self.get_empty_img_df()
        for item_id in product['item_ids']:
            item_info = self.get_item_info(item_id, product['item_type'])
            product_bundle = product['product_bundle']
            item_type = item_info['properties']['item_type']
            item_to_process = self.filtered_products_df[self.filtered_products_df.annotations.apply(
                lambda row: self.filter_product_by_item_id(row, item_id)
            )]
            item_path_in_archive = item_to_process['path'].values[0]
            item_size = item_to_process['size'].values[0]
            bands_order = self.get_bands_order_for_visualization(product_bundle, item_type)
            
            # add new row to img_df
            img_df.loc[img_df.shape[0]] = [item_path_in_archive, item_size, item_id, bands_order, ]
        return img_df
        
    def run(self):
        for product in self.products_info:
            self.img_converted_list = []
            item_type = product['item_type']
            product_bundle = product['product_bundle']
            file_properties = self.get_file_properties(product_bundle, item_type)

            self.filtered_products_df = self.filter_product_by_bundle_assets_file_name(
                self.found_products_df, file_properties['file_name']
            )

            self.img_df = self.product_filter(product)
                
            self.extract_img_files_from_archiwe(self.img_df)
            self.img_converted_list = self.reorder_item_bands(self.img_df, self.create_reordered_image)
            self.img_transformed_list = self.transform_img(self.img_converted_list)

            merged_raster_path = self.merge_tiles(
                self.img_transformed_list, self.temp_dir_path / Path(self.name).with_suffix('.tif')
            )
            shutil.copy(str(merged_raster_path), str(self.output_dir_path))
            if self.delete_temp:
                shutil.rmtree(self.temp_dir_path)
            return str(merged_raster_path)
