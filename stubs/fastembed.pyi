from typing import Iterable

import numpy as np

class TextEmbedding:
    def embed(
        self,
        documents: str | Iterable[str],
    ) -> Iterable[np.ndarray]: ...
