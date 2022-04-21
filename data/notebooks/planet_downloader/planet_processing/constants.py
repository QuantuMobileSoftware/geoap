
# <acquisition date>_<acquisition time>_<satellite_id>_<productLevel><bandProduct>.<extension>

ps_3b_order = {'R': 1, 'G': 2, 'B': 3}
ps_4b_order = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}
ps_8b_order = {'Coastal_Blue': 1, 'B': 2, 'G_I': 3, 'G': 4, 'Yellow': 5, 'R': 6, 'Red-Edge': 7, 'NIR': 8}

ps_rgb = {'R': 1, 'G': 2, 'B': 3}
ps_rgb_nir = {'R': 1, 'G': 2, 'B': 3, 'NIR': 4}
visual_all = {'R': 1, 'G': 2, 'B': 3}

ps_scene3b = {'R': 1, 'G': 2, 'B': 3, 'ALPHA': 4}  # TODO check ALPHA band
ps_scene4b = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4, 'ALPHA': 5}  # TODO check ALPHA band

ps_ortho_tile_4b = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4, 'ALPHA': 5}  # TODO check ALPHA band
ps_ortho_tile_5b = {'B': 1, 'G': 2, 'R': 3, 'Red-Edge': 4, 'NIR': 5, 'ALPHA': 6}  # TODO check ALPHA band


ps_scene3b_ortho_analytic = {'bands': ps_scene3b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene3b_basic_analytic = {'bands': ps_scene3b, 'projection': None, 'dtype': 'uint16'}
ps_scene3b_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}  # TODO check ALPHA band

ps_scene4b_ortho_analytic = {'bands': ps_scene4b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene4b_ortho_analytic_sr = {'bands': ps_scene4b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene4b_basic_analytic = {'bands': ps_scene4b, 'projection': None, 'dtype': 'uint16'}

ps_scene_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}

ps_scene_ortho_analytic_3b = {'bands': ps_rgb, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene_ortho_analytic_4b = {'bands': ps_rgb_nir, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene_ortho_analytic_8b = {'bands': ps_8b_order, 'projection': 'UTM', 'dtype': 'uint16'}  # TODO check bands order
ps_scene_ortho_analytic_4b_sr = {'bands': ps_rgb_nir, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene_ortho_analytic_8b_sr = {'bands': ps_8b_order, 'projection': 'UTM', 'dtype': 'uint16'}  # TODO check bands order

ps_scene_basic_analytic_4b = {'bands': ps_rgb_nir, 'projection': None, 'dtype': 'uint16'}
ps_scene_basic_analytic_8b = {'bands': ps_8b_order, 'projection': None, 'dtype': 'uint16'}

ps_tile_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}
ps_tile_ortho_analytic = {'bands': ps_ortho_tile_4b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_tile_ortho_analytic_5b = {'bands': ps_ortho_tile_5b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_tile_ortho_analytic_sr = None
ps_tile_basic_analytic = None


ps_scene_basic_3band = {'bands': ps_3b_order, 'projection': None}


ps_scene_basic_analytic_3band = {'bands': ps_3b_order, 'projection': None}
ps_scene_basic_analytic_4band = {'bands': ps_4b_order, 'projection': None}



ps_analytic_ortho_tile_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
ps_analytic_sr_ortho_tile_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}

ps_analytic_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM', 'dtype': 'uint16'}
ps_analytic_sr_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}

skysat_basic_panchromatic_scene_product = {'bands': {'PAN': 1}, 'projection': 'WGS84'}
skysat_basic_analytic_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'PAN': 4, 'NIR': 5}, 'projection': 'WGS84'}

skysat_panchromatic_ortho_scene_product = {'bands': {'PAN': 1}, 'projection': 'UTM'}
skysat_panchromatic_ortho_collect_product = {'bands': {'PAN': 1}, 'projection': 'UTM'}

skysat_visual_ortho_scene_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}
skysat_visual_ortho_collect_product = {'bands': {'R': 1, 'G': 2, 'B': 3}, 'projection': 'UTM'}

skysat_pansharpened_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
skysat_pansharpened_ortho_collect_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}

skysat_analytic_sr_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM', }
skysat_analytic_ortho_scene_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}
skysat_analytic_ortho_collect_product = {'bands': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}, 'projection': 'UTM'}

assets_in_bundles_for_visualizing = dict(
    analytic_8b_sr_udm2={
        'PSScene': {'file_name': 'ortho_analytic_8b_sr', 'properties': ps_scene_ortho_analytic_8b_sr}  # ok
    },
    pansharpened_udm2={
        'SkySatCollect': {'file_name': 'ortho_pansharpened', 'properties': skysat_pansharpened_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_pansharpened', 'properties': skysat_pansharpened_ortho_scene_product}
    },
    analytic_sr_udm2={
        'PSScene4Band': {'file_name': 'analytic_sr', 'properties': ps_scene4b_ortho_analytic_sr},  # ok
        'PSScene': {'file_name': 'ortho_analytic_4b_sr', 'properties': ps_scene_ortho_analytic_4b_sr},  # ok
        'PSOrthoTile': {'file_name': 'analytic_sr', 'properties': ps_tile_ortho_analytic_sr},
        'SkySatCollect': {'file_name': 'ortho_analytic_sr', 'properties': skysat_analytic_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_analytic_sr', 'properties': skysat_analytic_ortho_scene_product}
    }, 
    visual={
        'PSOrthoTile': {'file_name': 'visual', 'properties': ps_scene_ortho_visual},  # ok
        'PSScene3Band': {'file_name': 'visual', 'properties': ps_scene_ortho_visual},  # ok
        'PSScene': {'file_name': 'ortho_visual', 'properties': ps_scene_ortho_visual},  # ok
        'SkySatCollect': {'file_name': 'ortho_visual', 'properties': skysat_visual_ortho_collect_product},
        'SkySatScene': {'file_name': 'ortho_visual', 'properties': skysat_visual_ortho_scene_product}
    },
    analytic={
        'PSOrthoTile': {'file_name': 'analytic', 'properties': ps_tile_ortho_analytic},  # ok
        'PSScene3Band': {'file_name': 'analytic', 'properties': ps_scene3b_ortho_analytic},  # ok
        'PSScene4Band': {'file_name': 'analytic', 'properties': ps_scene4b_ortho_analytic},  # ok
        'SkySatScene': {'file_name': 'ortho_analytic', 'properties': ''},
        'SkySatCollect': {'file_name': 'ortho_analytic', 'properties': ''}
    },
    analytic_udm2={
        'PSOrthoTile': {'file_name': 'analytic', 'properties': ps_tile_ortho_analytic},  # ok
        'PSScene4Band': {'file_name': 'analytic', 'properties': ps_scene4b_ortho_analytic},  # ok
        'PSScene': {'file_name': 'ortho_analytic_4b', 'properties': ps_scene_ortho_analytic_4b},   # ok
        'SkySatScene': ['ortho_analytic', ],
        'SkySatCollect': ['ortho_analytic', ]
    },
    
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
