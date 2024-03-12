class DataStoreError(Exception):
    pass


class RecordNotFoundError(DataStoreError):
    pass


class InvalidSortError(DataStoreError):
    pass
