import typer

from now_and_here.config import get_user_config


config_app = typer.Typer(
    help="Get and set configuration values.",
    no_args_is_help=True,
)


@config_app.command()
def get(key: str):
    user_config = get_user_config()
    match key:
        case "store_type":
            typer.echo(user_config.store_type)
        case "store_file_path":
            typer.echo(user_config.store_file_path)
        case _:
            typer.echo(f"Unknown key: {key}. Must be one of 'store_type' or 'store_file_path'")
            raise typer.Exit(1)