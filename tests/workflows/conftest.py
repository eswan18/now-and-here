import pytest
from typer.testing import CliRunner

from now_and_here.cli import app

from .nhrunner import NHRunner


@pytest.fixture(scope="session")
def nh() -> NHRunner:
    """An instance of the nh command that can be invoked."""
    runner = CliRunner()
    return NHRunner(runner, app)
