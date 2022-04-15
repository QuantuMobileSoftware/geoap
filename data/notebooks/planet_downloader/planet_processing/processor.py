import json
from concurrent.futures import ProcessPoolExecutor, as_completed
import numpy as np
import pandas as pd
from pathlib import Path
import rasterio
from rasterio.merge import merge
import os
from tempfile import TemporaryDirectory
import time
import zipfile
from .utils import transform_crs


class PlanetBase:
    planetscope_bands = {
        'PS2': {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'NIR'},
        'PS2.SD': {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'NIR'},
        'PSB.SD': {1: 'Coastal_Blue', 2: 'Blue', 3: 'Green_I', 4: 'Green_II', 5: 'Yellow', 6: 'Red', 7: 'Red-Edge', 8: 'NIR'}
    }
    skysat_bands = {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'NIR', 5: 'Pan'}

    planetscope_item_types = {
        'PSScene': {
            '3_band': {1: 'Red', 2: 'Green', 3: 'Blue'},
            '4_band': planetscope_bands['PS2'],
            '8_band': planetscope_bands['PSB.SD']
        },
        'PSScene3Band': {'3_band': {1: 'Red', 2: 'Green', 3: 'Blue'}},
        'PSScene4Band': {'4_band': planetscope_bands['PS2']},
        'PSOrthoTile': {
            '4_band': planetscope_bands['PS2'],
            '5_band': {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'Red-Edge', 5: 'NIR'},
        }
    }
    
    skysat_item_types = {
        'SkySatScene': skysat_bands,
        'SkySatCollect': skysat_bands,
    }
    
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
        self.name = None
        self.get_products_info()
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
        column_names = ['path', 'size', 'item_id', 'bands_order']
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

    @staticmethod
    def stitch_tiles(paths, out_raster_path='test.tif'):
        print(f'Start merging to {out_raster_path}')
        tiles = []
        crs = None
        meta = None
        start_time = time.time()
        json_path = Path(out_raster_path).with_suffix('.json')
        if json_path.exists():
            return out_raster_path
    
        for i, path in enumerate(paths):
            file = rasterio.open(path)
            if i == 0:
                meta, crs = file.meta, file.crs
            tiles.append(file)
            print(f'{i} {path} appended to tiles')
    
        tile_arr, transform = merge(tiles, method='last')
    
        meta.update({"driver": "GTiff",
                     "height": tile_arr.shape[1],
                     "width": tile_arr.shape[2],
                     "transform": transform,
                     "crs": crs})
    
        with rasterio.open(out_raster_path, "w", **meta) as dst:
            dst.write(tile_arr)

        json_path = Path(out_raster_path).with_suffix('.json')
        with open(json_path, 'w') as f:
            data = {'merged': str(json_path)}
            f.write(json.dumps(data))
        
        for tile in tiles:
            tile.close()
        print(f'{time.time() - start_time} seconds for merging {len(paths)} images')
        return out_raster_path

    
class PlanetVisualizer(PlanetBase):
    """
    Class for extracting and converting files from order archive for further visualization using 'gdal2tiles.py'
    """
    product_bundles_for_visualizing = dict(
        analytic_8b_sr_udm2='ortho_analytic_8b_sr',
    )
    
    ps_bands_order_for_visualizing = {
        'PS2': [3, 2, 1],
        'PS2.SD': [3, 2, 1],
        'PSB.SD': [6, 4, 2],
    }
    skysat_bands_order_for_visualizing = {'skysat': [3, 2, 1]}
    
    def __init__(self, archive_path, temp_dir_path):
        """
        :param archive_path: str or Path: Absolut path to archive
        :param temp_dir_path:  str or Path: Absolut path to directory for storing temporary files
        """
        super().__init__(archive_path, temp_dir_path)
    
    def __check_bundle_type(self, row, product_bundle):
        """
        Check if product_bundle in known bundles for visualizing,
        if it is not, then raise KeyError,
        else check if asset_type from row equal to asset_type from product_bundles_for_visualizing dict.
        :param row: Pandas DatFrame row
        :param product_bundle: str: product bundle name
        :return:
        """
        if product_bundle not in self.product_bundles_for_visualizing.keys():
            print('Unknown planet/bundle_type!', row['planet/bundle_type'])
            raise KeyError
        return row['planet/asset_type'] == self.product_bundles_for_visualizing[product_bundle]
    
    def filter_product_by_item_id(self, row, item_id):
        return row['planet/item_id'] == item_id
    
    def filter_product_by_product_bundle(self, products_df, product_bundle):
        return products_df[products_df.annotations.apply(lambda row: self.__check_bundle_type(row, product_bundle))]
    
    @staticmethod
    def create_reordered_image(raster_path, bands_order):
        """
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
            updated_meta.update({
                "count": 3,
                "bands": 3,
                "nodata": 0,
                "dtype": 'uint8'
            })
            with rasterio.open(raster_dst, 'w', **updated_meta) as dst:
                for num, band_num in enumerate(bands_order, start=1):
                    band = src.read(band_num)
                    max_ = np.percentile(band, 98)
                    band[band > max_] = max_
                    band = (band / max_) * 255
                    band = band.astype(np.uint8)
                    dst.write(band, indexes=num)
        return raster_dst
    
    def planetscope_processor(self, product):
        """
        Process planetscope ordered images
        :param product: obj:
        :return: list: list of Path to converted images
        """
        img_df = self.get_empty_img_df()
        for item_id in product['item_ids']:
            item_info = self.get_item_info(item_id, product['item_type'])
            instrument = item_info['properties']['instrument']
            if instrument not in self.planetscope_bands.keys():
                print(f'Unknown instrument "{instrument}" in planetscope_bands! Skipping item {item_info["id"]}')
                print(f'path to skipped file {item_info["path"]}')
                continue
            item_to_process = self.filtered_products_df[self.filtered_products_df.annotations.apply(
                lambda row: self.filter_product_by_item_id(row, item_id)
            )]
            item_path_in_archive = item_to_process['path'].values[0]
            item_size = item_to_process['size'].values[0]
            bands_order = self.ps_bands_order_for_visualizing[instrument]
            
            # add new row to img_df
            img_df.loc[img_df.shape[0]] = [item_path_in_archive, item_size, item_id, bands_order]
            
        self.extract_img_files_from_archiwe(img_df)
        
        img_converted_list = self.reorder_item_bands(img_df, self.create_reordered_image)
        return img_converted_list
        
    def skysat_processor(self, product):
        for item_id in product['item_ids']:
            pass
            item_info = self.get_item_info(item_id)
    
    def run(self):
        for product in self.products_info:
            img_converted_list = []
            item_type = product['item_type']
            product_bundle = product['product_bundle']
            self.filtered_products_df = self.filter_product_by_product_bundle(self.found_products_df, product_bundle)
            if item_type in self.planetscope_item_types.keys():
                img_converted_list = self.planetscope_processor(product)
            
            if item_type in self.skysat_item_types.keys():
                img_converted_list = self.skysat_processor(product)
                pass  # todo process product
            
            img_transformed_list = self.transform_img(img_converted_list)
            merged_raster_path = self.stitch_tiles(img_transformed_list, self.temp_dir_path / self.name)

            return merged_raster_path
            
            # TODO rm temp files
            
            for tmp_file in img_transformed_list:
                try:
                    os.remove(tmp_file)
                except FileNotFoundError:
                    print(f'Tile {tmp_file} was removed or renamed, skipping')
