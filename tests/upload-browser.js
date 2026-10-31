// Browser upload checks use a mocked publication response, so they never write to Supabase.
async (page) => {
  const checks = [];
  let uploaded;
  const check = (value, label) => {
    if (!value) throw new Error(label);
    checks.push(label);
  };
  await page.route("**/api/moments*", async (route) => {
    if (route.request().method() === "POST") {
      uploaded = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          item: {
            id:
              uploaded.kind === "drive_video"
                ? "community-browser-video"
                : "community-browser-test",
            title: uploaded.title,
            description: uploaded.description,
            tags: uploaded.tags,
            src:
              uploaded.kind === "drive_video"
                ? "https://drive.google.com/file/d/abcDEF_1234567890/preview"
                : "assets/images/steven-stage-inauguration.webp",
            type: uploaded.kind === "drive_video" ? "video" : "image",
            ...(uploaded.kind === "drive_video"
              ? {
                  source: "gdrive",
                  driveUrl:
                    "https://drive.google.com/file/d/abcDEF_1234567890/view",
                  poster: "assets/brand/hero-bulb.png",
                }
              : {}),
            category: "community",
            chapter: 0,
            chapterName: "Momen teman",
            badge: uploaded.title,
            location: "Momen teman",
            date: "31 Oktober 2026",
          },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ available: true, items: [], nextCursor: null }),
    });
  });
  await page.route("https://drive.google.com/file/d/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>Drive player test</body></html>",
    }),
  );
  await page.goto("http://localhost:8000");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#uploadMomentBtn").click();
  await page.locator("#momentImage").evaluate(async (input) => {
    const blob = await (
      await fetch("/assets/images/steven-stage-inauguration.webp")
    ).blob();
    const transfer = new DataTransfer();
    transfer.items.add(new File([blob], "memory.webp", { type: "image/webp" }));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForFunction(
    () => !document.querySelector("#uploadSubmit").disabled,
  );
  const bytes = await page
    .locator("#uploadPreview")
    .evaluate(async (img) => (await (await fetch(img.src)).blob()).size);
  check(bytes <= 100000, "Photo is compressed below 100 KB before upload");
  check(
    await page.locator("#uploadPreview").isVisible(),
    "Selected photo has a preview",
  );
  await page.locator("#momentTitle").fill("Our browser check");
  await page
    .locator("#momentTags")
    .fill("one,two,three,four,five,six,seven,eight,nine");
  await page.locator("#uploadSubmit").click();
  check(
    (await page.locator("#uploadStatus").innerText()).includes("maksimal 8"),
    "Excessive tags are rejected before sending",
  );
  await page.locator("#momentTags").fill("squad, inaugurasi");
  await page.locator("#uploadSubmit").click();
  await page.waitForFunction(
    () => !document.querySelector("#uploadDialog").open,
  );
  check(uploaded.description === "", "Description can be omitted");
  check(uploaded.tags.length === 2, "Tags are submitted");
  check(
    atob(uploaded.image).length <= 100000,
    "Encoded upload preserves the size limit",
  );
  check(
    (await page
      .locator('.filter-btn[data-filter="community"]')
      .getAttribute("aria-pressed")) === "true",
    "New upload selects the shared gallery",
  );
  check(
    (await page.locator(".polaroid-paper").count()) === 1,
    "New upload appears as a shared polaroid",
  );
  await page.locator(".polaroid-paper").first().click();
  check(
    await page.locator("#lightboxDescription").isHidden(),
    "No empty description is shown in viewer",
  );
  const downloading = page.waitForEvent("download");
  await page.locator("#downloadMomentLink").click();
  const download = await downloading;
  check(
    download.suggestedFilename() === "Our-browser-check.webp",
    "Viewer offers a named photo download",
  );
  await page.keyboard.press("Escape");
  check(
    (await page.locator("#memoryCount").innerText()) === "29",
    "Archive count includes the shared memory",
  );
  await page.locator("#uploadMomentBtn").click();
  await page.locator('input[name="kind"][value="drive_video"]').check();
  check(
    await page.locator("#photoFields").isHidden(),
    "Drive option replaces the photo picker",
  );
  check(
    !(await page.locator("#momentImage").evaluate((e) => e.required)),
    "A video link does not require a photo",
  );
  await page
    .locator("#momentDriveUrl")
    .fill("https://drive.google.com/file/d/abcDEF_1234567890/view");
  await page.locator("#momentTitle").fill("Video Drive test");
  await page.locator("#uploadSubmit").click();
  await page.waitForFunction(
    () => !document.querySelector("#uploadDialog").open,
  );
  check(
    uploaded.kind === "drive_video" && !uploaded.image,
    "Drive submission sends metadata without a video file",
  );
  await page.locator('[data-id="community-browser-video"]').click();
  check(
    (await page.locator("#lightboxMediaContainer iframe").count()) === 1,
    "Drive video opens in an embedded player",
  );
  check(
    (
      await page.locator("#lightboxMediaContainer iframe").getAttribute("src")
    ).endsWith("/preview"),
    "Viewer uses the Drive preview URL",
  );
  check(
    (await page.locator("#downloadMomentLink").getAttribute("target")) ===
      "_blank",
    "Drive download opens the owner-controlled Drive page",
  );
  await page.keyboard.press("Escape");
  await page.locator("#lightboxMediaContainer iframe").waitFor({state:"detached"});
  check(
    (await page.locator("#lightboxMediaContainer iframe").count()) === 0,
    "Closing viewer removes the Drive player",
  );
  await page.unroute("https://drive.google.com/file/d/**");
  await page.unroute("**/api/moments*");
  await page.reload();
  return { passed: checks.length, checks, compressedBytes: bytes };
}
