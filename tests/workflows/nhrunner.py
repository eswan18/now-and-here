import re
from typing import IO, Any, Mapping, Sequence

from typer import Typer
from typer.testing import CliRunner, Result


class NHRunner:
    def __init__(self, runner: CliRunner, app: Typer):
        self._runner = runner
        self._app = app

    def invoke(
        self,
        args: str | Sequence[str] | None = None,
        input: bytes | str | IO[Any] | None = None,
        env: Mapping[str, str] | None = None,
        catch_exceptions: bool = True,
        color: bool = False,
        **extra: Any,
    ) -> Result:
        return self._runner.invoke(
            self._app,
            args=args,
            input=input,
            env=env,
            catch_exceptions=catch_exceptions,
            color=color,
            **extra,
        )

    @staticmethod
    def remove_ansi_codes(s: str) -> str:
        """Remove ansi escape codes from a string."""
        # From https://stackoverflow.com/a/14693789/7191513
        ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
        return ansi_escape.sub("", s)
