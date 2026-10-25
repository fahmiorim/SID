import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "documentation status API exposes the current catalog scope",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/api/docs-status");
    await expect(browser).toHaveURL("/api/docs-status");
    await expect(browser.locator("body")).toContainText('"totalIds":113');
    await expect(browser.locator("body")).toContainText("KATALOG-FITUR-OPENSID.md");
  },
);
