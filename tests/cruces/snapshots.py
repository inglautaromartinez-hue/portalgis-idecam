"""Genera únicamente snapshots sintéticos para la prueba de la API y el visor."""
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
(root / "catalog").mkdir(parents=True, exist_ok=True)
layers, tree = [], []
for role in ["objetivo", "agrupamiento", "poligono"]:
    for partial in [False, True]:
        for crosses in [False, True]:
            key = f"{role}-{int(partial)}-{int(crosses)}"
            coordinates = [[0, 0], [2, 2]] if role == "objetivo" else (
                [[0, 2], [2, 0]] if crosses else [[0, 1], [2, 3]])
            kind = "LineString"
            if role == "poligono":
                kind = "Polygon"
                x = 0 if crosses else 8
                coordinates = [[[x, 0], [x+1, 0], [x+1, 1], [x, 1], [x, 0]]]
            feature = dict(type="Feature", geometry=dict(type=kind, coordinates=coordinates),
                           properties={"DISTRITO": "Grupo QA"})
            (root / f"{key}.json").write_text(json.dumps({"features": [feature]}))
            layers.append(dict(id=key, title=key, typeName=key, group="QA", fields=["DISTRITO"],
                               featureCount=1, syncedAt="2026-01-01T00:00:00Z",
                               status="partial" if partial else "ok", files=[key+".json"]))
            tree.append(dict(id=key, name=key, provider="WFS", typename=key,
                             endpointUrl="/qa", geometry=kind, fields=["DISTRITO"],
                             treeOrder=len(tree), effectiveSrs="EPSG:4326", visibleInitial=False))
(root / "catalog/idecam-catalog.json").write_text(json.dumps({"layers": layers}))
(root / "tree.json").write_text(json.dumps({"tree": tree, "counts": {"layers": len(tree), "groups": 0}}))
