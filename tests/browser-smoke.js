// Run with an existing local preview:
// playwright-cli -s=gsa-check open http://localhost:8000
// playwright-cli -s=gsa-check run-code --filename=tests/browser-smoke.js
async (page) => {
  const checks = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const check = (condition, label) => {
    if (!condition) throw new Error(label);
    checks.push(label);
  };
  const filter = (value) => page.locator(`.filter-btn[data-filter="${value}"]`);
  const cards = page.locator(".polaroid-paper");
  await page.goto("http://localhost:8000");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => document.fonts.ready);
  check((await cards.count()) === 28, "28 original memories render");
  check(
    (await page.locator("#videoCount").innerText()) === "9",
    "Video count comes from data",
  );
  check(
    (await page.locator(".polaroid-paper p").count()) === 0,
    "Descriptions are absent from polaroid fronts",
  );
  for (const [category, count] of Object.entries({
    commute: 3,
    inauguration: 10,
    "google-hq": 5,
    hangout: 4,
    nightlife: 4,
    candidate: 2,
    videos: 9,
  })) {
    await filter(category).click();
    check(
      (await cards.count()) === count,
      `Filter ${category}: ${count} memories`,
    );
    check(
      (await filter(category).getAttribute("aria-pressed")) === "true",
      `${category} exposes active state`,
    );
  }
  await filter("all").click();
  await page.locator("#geminiSearchInput").fill("cermin");
  check((await cards.count()) === 1, "Search finds the Blok M mirror");
  check(
    (await cards.first().getAttribute("data-id")) === "blok-m-mirror",
    "Search returns the intended memory",
  );
  await filter("commute").click();
  check(
    (await page.locator("#geminiSearchInput").inputValue()) === "" &&
      (await cards.count()) === 3,
    "Changing category clears search",
  );
  await page.locator("#geminiSearchInput").fill("no-such-memory-123");
  check(
    (await cards.count()) === 0 &&
      (await page.locator(".empty-state").isVisible()),
    "No-results state is actionable",
  );
  await page.locator(".empty-state button").click();
  check((await cards.count()) === 28, "Empty-state reset restores the archive");
  await page.locator(".prompt-chip").filter({ hasText: "cermin" }).click();
  check(
    (await cards.count()) === 1 &&
      (await page.locator("#aiResponseBox").isVisible()),
    "Prompt chips filter and show their local explanation",
  );
  await page.locator("#clearSearchFilterBtn").click();

  const first = cards.first();
  await first.focus();
  await page.keyboard.press("Enter");
  check(
    await page.locator("#lightboxModal").evaluate((e) => e.open),
    "Polaroid opens with keyboard",
  );
  check(
    await page.locator("#lightboxDescription").isVisible(),
    "Available description appears only inside viewer",
  );
  await page.keyboard.press("ArrowRight");
  check(
    (await page.locator("#lightboxCounter").innerText()) === "2 / 28",
    "Right arrow advances within the selected set",
  );
  await page.keyboard.press("ArrowLeft");
  check(
    (await page.locator("#lightboxCounter").innerText()) === "1 / 28",
    "Left arrow returns to previous memory",
  );
  await page.keyboard.press("Escape");
  check(
    !(await page.locator("#lightboxModal").evaluate((e) => e.open)),
    "Escape closes the viewer",
  );
  check(
    await first.evaluate((e) => document.activeElement === e),
    "Focus returns to the opening polaroid",
  );

  // Real edge case: optional description must not retain the previous item's text.
  await page.evaluate(() => {
    window.__originalDescription = MEMORIES_DATA[0].description;
    MEMORIES_DATA[0].description = "   ";
  });
  await first.click();
  check(
    await page.locator("#lightboxDescription").isHidden(),
    "Whitespace-only description has no empty panel",
  );
  await page.locator("#lightboxNext").click();
  check(
    await page.locator("#lightboxDescription").isVisible(),
    "Next item restores a populated description",
  );
  await page.locator("#lightboxPrev").click();
  check(
    await page.locator("#lightboxDescription").isHidden(),
    "Returning to missing description clears stale text",
  );
  await page.locator("#lightboxClose").click();
  await page.evaluate(() => {
    MEMORIES_DATA[0].description = window.__originalDescription;
    delete window.__originalDescription;
  });

  await filter("videos").click();
  await cards.first().click();
  check(
    (await page.locator("#lightboxMediaContainer video").count()) === 1,
    "Video uses the native player",
  );
  await page.locator("#lightboxClose").click();
  await page
    .locator("#lightboxMediaContainer video")
    .waitFor({ state: "detached" });
  check(
    (await page.locator("#lightboxMediaContainer video").count()) === 0,
    "Closing removes video playback",
  );
  await page.locator("#rewindPlay").click();
  check(
    (
      await page.locator("#lightboxMediaContainer video").getAttribute("src")
    ).includes("grand-confetti"),
    "Rewind opens the correct local highlight",
  );
  await page.locator("#lightboxClose").click();
  await filter("all").click();
  await page.locator(".chapter-card").first().click();
  check((await cards.count()) === 3, "Chapter cards open their category");
  await page.locator(".story-tab").last().click();
  check(
    (await page.locator("#storyPanel h3").innerText()).includes("After Hours"),
    "Story selector changes content",
  );
  await filter("all").click();

  const widths = [];
  for (const width of [320, 390, 768, 810, 1024, 1366, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const geometry = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: innerWidth,
      columns: getComputedStyle(
        document.querySelector("#galleryGrid"),
      ).gridTemplateColumns.split(" ").length,
      title: document.querySelector("h1").getBoundingClientRect().height,
    }));
    check(
      geometry.page <= geometry.viewport,
      `No horizontal page overflow at ${width}px`,
    );
    check(
      geometry.columns === (width >= 1200 ? 3 : width >= 810 ? 2 : 1),
      `Gallery columns adapt at ${width}px`,
    );
    widths.push({ width, ...geometry });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.locator("#menuToggle").click();
  check(
    (await page.locator("#menuToggle").getAttribute("aria-expanded")) ===
      "true",
    "Mobile menu opens",
  );
  check(
    await page.locator("#navLinks").evaluate((e) => {
      const b = e.getBoundingClientRect();
      return b.left >= 0 && b.right <= innerWidth;
    }),
    "Expanded menu stays inside viewport",
  );
  await page.keyboard.press("Escape");
  check(
    (await page.locator("#menuToggle").getAttribute("aria-expanded")) ===
      "false",
    "Escape closes mobile menu",
  );
  await page.locator("#menuToggle").click();
  await page.locator('#navLinks a[href="#gallerySection"]').click();
  check(
    (await page.locator("#menuToggle").getAttribute("aria-expanded")) ===
      "false",
    "Selecting a mobile anchor closes the menu",
  );
  await page.locator(".faq-list summary").first().click();
  check(
    (await page.locator(".faq-list details").first().getAttribute("open")) !==
      null,
    "FAQ disclosure works",
  );
  check(
    (await page.locator('#cerita,a[href="#cerita"]').count()) === 0,
    "Removed spotlight has no dangling navigation",
  );
  const footer = await page.locator(".site-footer").innerText();
  check(
    footer.includes("Steven and Galih") &&
      footer.includes("GSAID26B20013") &&
      footer.includes("GSAID26B20004"),
    "Footer credits both contributors and IDs",
  );

  check(
    await page
      .locator(".polaroid-swing")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName === "none"),
    "Reduced motion disables the sway",
  );
  await page.locator("#triggerConfettiBtn").click();
  check(
    (await page.locator("#confettiCanvas").count()) === 0,
    "Reduced motion disables confetti",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    const e = document.querySelector(".polaroid-swing");
    scrollTo(0, e.getBoundingClientRect().top + scrollY - 600);
  });
  const tick = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  await tick();
  const before = await page
    .locator(".polaroid-swing")
    .first()
    .evaluate((e) => getComputedStyle(e).transform);
  await page.evaluate(() => scrollBy(0, 280));
  await tick();
  const after = await page
    .locator(".polaroid-swing")
    .first()
    .evaluate((e) => getComputedStyle(e).transform);
  check(before !== after, "Scroll gives polaroids a physical impulse");
  await page.locator("#audioToggleBtn").click();
  check(
    (await page.locator("#audioToggleBtn").getAttribute("aria-pressed")) ===
      "true",
    "Ambient sound is opt-in",
  );
  await page.locator("#audioToggleBtn").click();
  check(
    (await page.locator("#audioToggleBtn").getAttribute("aria-pressed")) ===
      "false",
    "Ambient sound can stop",
  );
  await page.locator("#triggerConfettiBtn").click();
  check(
    (await page.locator("#confettiCanvas").count()) === 1,
    "Manual confetti works",
  );
  await page.evaluate(() => {
    document.querySelector("#confettiCanvas")?.remove();
  });
  check(errors.length === 0, `No JavaScript errors: ${errors.join(", ")}`);
  return { passed: checks.length, checks, widths };
}
