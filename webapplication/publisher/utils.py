import os
import zipfile
from django.conf import settings


def zip_files(paths):
    request_folder = paths[0].split("/")[0]
    output_zip_path = os.path.join(
        settings.RESULTS_FOLDER,
        request_folder,
        settings.DEFAULT_DOWNLOAD_ZIP_NAME
    )

    with zipfile.ZipFile(output_zip_path, 'w') as zipf:
        for file_path in paths:
            zipf.write(os.path.join(settings.RESULTS_FOLDER, file_path), os.path.basename(file_path))
    return os.path.join(
        settings.RESULTS_FOLDER.split("/")[-1],
        request_folder,
        settings.DEFAULT_DOWNLOAD_ZIP_NAME
    )
