import random
from string import ascii_lowercase, digits


ID_LENGTH = 5

def random_id() -> str:
    return "".join(random.choices(ascii_lowercase + digits, k=ID_LENGTH))
