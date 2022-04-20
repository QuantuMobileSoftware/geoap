
# <acquisition date>_<acquisition time>_<satellite_id>_<productLevel><bandProduct>.<extension>

s = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
ps_basic_scene_product_3band = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': None}
ps_basic_scene_product_4band = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': None}

ps_basic_analytic_scene_product_3band = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'WGS84'}
ps_basic_analytic_scene_product_4band = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'WGS84'}
ps_ortho_scene_product_3band = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_ortho_scene_product_4band = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
ps_ortho_scene_product_8band = {'bands': {
    'Coastal_Blue': 1, 'B': 2, 'G_I': 3, 'G': 4, 'Yellow': 5, 'R': 6, 'Red-Edge': 7, 'NIR': 8}, 'projection': 'UTM'
}

ps_visual_ortho_tile_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_analytic_ortho_tile_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_analytic_sr_ortho_tile_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_visual_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_analytic_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_analytic_sr_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}

skysat_basic_panchromatic_scene_product = {'bands': {'PAN': 1}, 'projection': 'WGS84'}
skysat_basic_analytic_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'PAN': 4, 'NIR': 5}, 'projection': 'WGS84'}

skysat_panchromatic_ortho_scene_product = {'bands': {'PAN': 1}, 'projection': 'UTM'}
skysat_panchromatic_ortho_collect_product = {'bands': {'PAN': 1}, 'projection': 'UTM'}

skysat_visual_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
skysat_visual_ortho_collect_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}

skysat_pansharpened_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
skysat_pansharpened_ortho_collect_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}

skysat_analytic_sr_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
skysat_analytic_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
skysat_analytic_ortho_collect_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}

assets_in_bundles_for_visualizing = dict(
    analytic_8b_sr_udm2={'PSScene': {'file_name': 'ortho_analytic_8b_sr', 'properties': ps_ortho_scene_product_8band}},
    pansharpened_udm2={
        'SkySatCollect': {'file_name': 'ortho_pansharpened', 'properties': skysat_pansharpened_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_pansharpened', 'properties': skysat_pansharpened_ortho_scene_product}
    },
    analytic_sr_udm2={
        'PSScene4Band': {'file_name': 'analytic_sr', 'properties': ps_ortho_scene_product_4band},
        'PSScene': {'file_name': 'ortho_analytic_4b_sr', 'properties': ps_ortho_scene_product_4band},
        'PSOrthoTile': {'file_name': 'analytic_sr', 'properties': ps_analytic_sr_ortho_tile_product},
        'SkySatCollect': {'file_name': 'ortho_analytic_sr', 'properties': skysat_analytic_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_analytic_sr', 'properties': skysat_analytic_ortho_scene_product}
    }, 
    visual={
        'PSOrthoTile': {'file_name': 'visual', 'properties': ps_visual_ortho_tile_product},
        'PSScene3Band': {'file_name': 'visual', 'properties': ps_ortho_scene_product_3band},
        'PSScene': {'file_name': 'ortho_visual', 'properties': ps_visual_ortho_scene_product},
        'REOrthoTile': {'file_name': 'visual', 'properties': None},
        'Sentinel2L1C': {'file_name': 'visual', 'properties': None},
        'SkySatCollect': {'file_name': 'ortho_visual', 'properties': skysat_visual_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_visual', 'properties': skysat_visual_ortho_scene_product}}
    
)


ps_bands_order_for_visualizing = {
    'PS2': [3, 2, 1],
    'PS2.SD': [3, 2, 1],
    'PSB.SD': [6, 4, 2],
}
skysat_bands_order_for_visualizing = {'skysat': [3, 2, 1]}

planetscope_bands = {
    'PS2': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4},
    'PS2.SD': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4},
    'PSB.SD': {'Coastal_Blue': 1, 'B': 2, 'G_I': 3, 'G': 4, 'Yellow': 5, 'R': 6, 'Red-Edge': 7, 'NIR': 8}
}
skysat_bands = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4, 'Pan': 5}

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
