import os
from aoi.management.commands.executor import NotebookExecutor


class HostVolumePaths:
    """Extracts from base container (eg. sip_webapplication_1) abs volumes paths
    for next mounting data folder with notebooks and folder with NotebookExecutor.py
    """
    def __init__(self, container_attrs):
        self.container_attrs = container_attrs

    def data_volume(self, basename):
        data_volume_path, _ = self._abs_host_path(basename)
        return data_volume_path

    def executor_volume(self, basename):
        source_path, dst_path = self._abs_host_path(basename)

        executor_volume_path = os.path.dirname(os.path.join(source_path,
                                                            os.path.relpath(NotebookExecutor.__file__, dst_path)))
        return executor_volume_path

    def _abs_host_path(self, basename):
        for mount in self.container_attrs['Mounts']:
            if basename == mount['Destination']:
                return mount['Source'], mount['Destination']
        else:
            raise ValueError(f"For host volume basename {basename}, mount['Source'], mount['Destination'] "
                             f"not exists for {self.container_attrs['Name']} container and {basename}. "
                             f"Check docker-compose file and image: {self.container_attrs['Config']['Image']}")
