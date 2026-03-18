def get_upload_config(component=None):
    if not component or not component.upload_config:
        raise ValueError(
            "Upload configuration is not set for this component. "
            "Please configure the 'upload_config' field on the component."
        )

    config = dict(component.upload_config)
    config['exclude'] = [folder for folder in config.get('upload', {}).values() if folder]

    return config
