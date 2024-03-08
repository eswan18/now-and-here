import logging


logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

# Set up the handler to stdout
handler = logging.StreamHandler()
handler.setLevel(logging.WARNING)

# Set up the formatter
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(handler)