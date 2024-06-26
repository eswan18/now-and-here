import random
from string import ascii_lowercase

from rich.text import Text

ID_LENGTH = 6


def random_id() -> str:
    return "".join(random.choices(ascii_lowercase, k=ID_LENGTH))


def format_id(id: str) -> str:
    """Format an ID in a user-friendly way."""
    # Split task IDs with a dash for readability.
    first_half_len = len(id) // 2
    t_id = f"{id[:first_half_len]}-{id[first_half_len:]}"
    return t_id


def format_priority(priority: int) -> Text:
    """Format a priority in a user-friendly way."""
    match priority:
        case 0:
            return Text("0", style="blue")
        case 1:
            return Text("1", style="yellow")
        case 2:
            return Text("2", style="red")
        case 3:
            return Text("3", style="bold red")
        case _:
            raise ValueError(f"Invalid priority {priority}")


def id_as_int(id: str) -> int:
    """Convert an ID (lowercase string) to an integer."""
    num = 0
    for char in id:
        num = num * 26 + (ord(char) - ord("a"))
    return num


def decode_id_from_int(num: int) -> str:
    """Convert an encoded integer back to an ID."""
    s = ""
    while num:
        num, remainder = divmod(num, 26)
        s = chr(remainder + ord("a")) + s
    return s
