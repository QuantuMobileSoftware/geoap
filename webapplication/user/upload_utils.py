import json
import os

_DEFAULT_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'upload_config.json')


def get_upload_config(component=None):
    with open(_DEFAULT_CONFIG_PATH) as f:
        config = json.load(f)

    if component and component.upload_config:
        for key, value in component.upload_config.items():
            config[key] = value

    config['exclude'] = [folder for folder in config['upload'].values() if folder]

    return config
