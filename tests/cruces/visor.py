"""Desde la raíz del repo: python tests/cruces/visor.py [base|corregido]."""
import sys
from playwright.sync_api import sync_playwright, expect

baseline = sys.argv[1:] == ["base"]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    page = browser.new_page()
    page.route("**/*", lambda r: r.continue_() if r.request.url.startswith("http://127.0.0.1:3100/") else r.abort())
    page.goto("http://127.0.0.1:3100/", wait_until="domcontentloaded")
    page.get_by_role("button", name="Estadísticas", exact=True).click(timeout=8000)
    page.get_by_role("button", name="Cruzada", exact=True).click()
    panel = page.get_by_role("region", name="Panel de estadisticas")
    # La base sólo admitía polígonos en el selector de agrupamiento.
    group = "poligono" if baseline else "agrupamiento"
    for target_partial in [0, 1]:
        for group_partial in [0, 1]:
            for crosses in [0, 1]:
                target_id = f"objetivo-{target_partial}-0"
                group_id = f"{group}-{group_partial}-{crosses}"
                panel.get_by_label("Capa objetivo").select_option(target_id)
                panel.get_by_label("Capa de agrupamiento").select_option(group_id)
                panel.get_by_label("Operacion espacial").select_option("intersects")
                panel.get_by_label("Agrupar por").select_option("DISTRITO")
                with page.expect_response(lambda r: r.url.endswith("/local/statistics/cross-query")) as response:
                    panel.get_by_role("button", name="Calcular cruce global").click()
                data = response.value.json()
                status = ("ready" if crosses else "empty") if baseline or not (target_partial or group_partial) else "partial"
                assert (data["matchedFeatureCount"], data["status"]) == (crosses, status), data
                expect(panel.locator(".analysis-status")).to_have_attribute("data-status", status)
                expect(panel.locator(".analysis-note")).to_contain_text(f"Coincidencias: {crosses}.")
                if not baseline:
                    for flag, label in [(target_partial, "Capa objetivo incompleta"), (group_partial, "Capa de agrupamiento incompleta")]:
                        expect(panel.get_by_text(label, exact=False)).to_have_count(flag)
                    if not crosses:
                        expected = ("No se encontraron cruces entre las entidades cargadas. "
                                    "Puede haber otros en los datos pendientes.") if target_partial or group_partial else "No se encontraron cruces."
                        expect(panel.locator(".bar-chart")).to_have_text(expected)
                print(target_id, group_id, status, panel.locator(".analysis-status").inner_text().replace("\n"," | "),
                      panel.locator(".analysis-note").inner_text(), panel.locator(".bar-chart").inner_text(), flush=True)
    browser.close()
