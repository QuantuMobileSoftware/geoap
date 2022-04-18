assets_in_bundles_for_visualizing = dict(
    analytic_8b_sr_udm2={'PSScene': 'ortho_analytic_8b_sr'},
    pansharpened_udm2={'SkySatCollect': 'ortho_pansharpened', 'SkySatScene': 'ortho_pansharpened'},
    analytic_sr_udm2={
        'PSScene4Band': 'analytic_sr',
        'PSScene': 'ortho_analytic_4b_sr',
        'PSOrthoTile': 'analytic_sr',
        'SkySatCollect': 'ortho_analytic_sr',
        'SkySatScene': 'ortho_analytic_sr'
    }
)

ps_bands_order_for_visualizing = {
    'PS2': [3, 2, 1],
    'PS2.SD': [3, 2, 1],
    'PSB.SD': [6, 4, 2],
}
skysat_bands_order_for_visualizing = {'skysat': [3, 2, 1]}

planetscope_bands = {
    'PS2': {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'NIR'},
    'PS2.SD': {1: 'Blue', 2: 'Green', 3: 'Red', 4: 'NIR'},
    'PSB.SD': {
        1: 'Coastal_Blue', 2: 'Blue', 3: 'Green_I', 4: 'Green_II', 5: 'Yellow', 6: 'Red', 7: 'Red-Edge', 8: 'NIR',
    }
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
