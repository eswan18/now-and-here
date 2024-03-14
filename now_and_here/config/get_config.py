from pathlib import Path
import tomllib

from .app_config import AppConfig, PartialAppConfig
from .default_config import default_config


USER_CONFIG_PATH = Path("~/.now-and-here/config.toml").expanduser()


def get_user_config() -> PartialAppConfig:
    """Get the user's configuration."""
    if not USER_CONFIG_PATH.exists():
        return PartialAppConfig()
    with open(USER_CONFIG_PATH, "rb") as f:
        data = tomllib.load(f)
    store_type = data.get("store_type")
    store_file_path = None
    if "store_file_path" in data:
        store_file_path = Path(data["store_file_path"]).expanduser()
    return PartialAppConfig(store_type=store_type, store_file_path=store_file_path)


def get_config() -> AppConfig:
    """Get the configuration for the application."""
    # TODO: add support for pulling other partial configs from a file or even the
    # command line and merging them in.
    config = default_config.merge(get_user_config())
    if not config.is_complete():
        raise RuntimeError("Configuration is incomplete")
    return AppConfig.from_partial(config)
