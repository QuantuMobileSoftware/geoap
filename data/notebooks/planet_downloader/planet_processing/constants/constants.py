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
ps_scene_ortho_analytic_8b = {'bands': ps_8b_order, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene_ortho_analytic_4b_sr = {'bands': ps_rgb_nir, 'projection': 'UTM', 'dtype': 'uint16'}
ps_scene_ortho_analytic_8b_sr = {'bands': ps_8b_order, 'projection': 'UTM', 'dtype': 'uint16'}

ps_scene_basic_analytic_4b = {'bands': ps_rgb_nir, 'projection': None, 'dtype': 'uint16'}
ps_scene_basic_analytic_8b = {'bands': ps_8b_order, 'projection': None, 'dtype': 'uint16'}

ps_tile_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}
ps_tile_ortho_analytic = {'bands': ps_ortho_tile_4b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_tile_ortho_analytic_5b = {'bands': ps_ortho_tile_5b, 'projection': 'UTM', 'dtype': 'uint16'}
ps_tile_ortho_analytic_sr = None
ps_tile_basic_analytic = None

ss_bgrn = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4}
ss_pan = {'PAN': 1}

ss_scene_basic_analytic = {'bands': ss_bgrn, 'projection': None, 'dtype': 'uint16'}
ss_scene_basic_analytic_dn = {'bands': ss_bgrn, 'projection': None, 'dtype': 'uint16'}
ss_scene_basic_panchromatic = {'bands': ss_pan, 'projection': None, 'dtype': 'uint16'}
ss_scene_basic_panchromatic_dn = {'bands': ss_pan, 'projection': None, 'dtype': 'uint16'}

ss_scene_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}
ss_scene_ortho_analytic = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_scene_ortho_analytic_sr = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_scene_ortho_analytic_dn = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_scene_ortho_pansharpened = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_scene_ortho_panchromatic = {'bands': ss_pan, 'projection': 'UTM', 'dtype': 'uint16'}
ss_scene_ortho_panchromatic_dn = {'bands': ss_pan, 'projection': 'UTM', 'dtype': 'uint16'}

ss_collect_ortho_visual = {'bands': visual_all, 'projection': 'UTM', 'dtype': 'uint8'}
ss_collect_ortho_analytic = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_collect_ortho_analytic_sr = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_collect_ortho_analytic_dn = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_collect_ortho_pansharpened = {'bands': ss_bgrn, 'projection': 'UTM', 'dtype': 'uint16'}
ss_collect_ortho_panchromatic = {'bands': ss_pan, 'projection': 'UTM', 'dtype': 'uint16'}
ss_collect_ortho_panchromatic_dn = {'bands': ss_pan, 'projection': 'UTM', 'dtype': 'uint16'}


assets_in_bundles_for_visualizing = dict(
    analytic_8b_sr_udm2={
        'PSScene': {'file_name': 'ortho_analytic_8b_sr', 'properties': ps_scene_ortho_analytic_8b_sr}
    },
    pansharpened_udm2={
        'SkySatCollect': {'file_name': 'ortho_pansharpened', 'properties': ss_collect_ortho_pansharpened},
        'SkySatScene': {'file_name': 'ortho_pansharpened', 'properties': ss_scene_ortho_pansharpened}
    },
    analytic_sr_udm2={
        'PSScene4Band': {'file_name': 'analytic_sr', 'properties': ps_scene4b_ortho_analytic_sr},
        'PSScene': {'file_name': 'ortho_analytic_4b_sr', 'properties': ps_scene_ortho_analytic_4b_sr},
        'PSOrthoTile': {'file_name': 'analytic_sr', 'properties': ps_tile_ortho_analytic_sr},
        'SkySatCollect': {'file_name': 'ortho_analytic_sr', 'properties': ss_collect_ortho_analytic_sr},
        'SkySatScene': {'file_name': 'ortho_analytic_sr', 'properties': ss_scene_ortho_analytic_sr}
    }, 
    visual={
        'PSOrthoTile': {'file_name': 'visual', 'properties': ps_scene_ortho_visual},
        'PSScene3Band': {'file_name': 'visual', 'properties': ps_scene_ortho_visual},
        'PSScene': {'file_name': 'ortho_visual', 'properties': ps_scene_ortho_visual},
        'SkySatCollect': {'file_name': 'ortho_visual', 'properties': ss_collect_ortho_visual},
        'SkySatScene': {'file_name': 'ortho_visual', 'properties': ss_scene_ortho_visual}
    },
    analytic={
        'PSOrthoTile': {'file_name': 'analytic', 'properties': ps_tile_ortho_analytic},
        'PSScene3Band': {'file_name': 'analytic', 'properties': ps_scene3b_ortho_analytic},
        'PSScene4Band': {'file_name': 'analytic', 'properties': ps_scene4b_ortho_analytic},
        'SkySatScene': {'file_name': 'ortho_analytic', 'properties': ss_scene_ortho_analytic},
        'SkySatCollect': {'file_name': 'ortho_analytic', 'properties': ss_collect_ortho_analytic}
    },
    analytic_udm2={
        'PSOrthoTile': {'file_name': 'analytic', 'properties': ps_tile_ortho_analytic},
        'PSScene4Band': {'file_name': 'analytic', 'properties': ps_scene4b_ortho_analytic},
        'PSScene': {'file_name': 'ortho_analytic_4b', 'properties': ps_scene_ortho_analytic_4b},
        'SkySatScene': {'file_name': 'ortho_analytic', 'properties': ss_scene_ortho_analytic},
        'SkySatCollect': {'file_name': 'ortho_analytic', 'properties': ss_collect_ortho_analytic}
    },
    
)

planetscope_bands = {
    'PS2': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4},
    'PS2.SD': {'B': 1, 'G': 2, 'R': 3, 'NIR': 4},
    'PSB.SD': {'Coastal_Blue': 1, 'B': 2, 'G_I': 3, 'G': 4, 'Yellow': 5, 'R': 6, 'Red-Edge': 7, 'NIR': 8}
}
skysat_bands = {'B': 1, 'G': 2, 'R': 3, 'NIR': 4, 'Pan': 5}
