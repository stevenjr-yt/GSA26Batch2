// Run through playwright-cli run-code with the local preview already serving.
async (page) => {
  await page.goto("http://localhost:8000");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.mouse.move(0, 0);
  const tick = () =>
    page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
  const measurements = [];
  for (const delta of [20, 220]) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .locator(".polaroid-anchor")
      .nth(4)
      .evaluate((e) => {
        document.documentElement.style.scrollBehavior = "auto";
        scrollTo(0, e.getBoundingClientRect().top + scrollY - 350);
      });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await tick();
    const result = await page.evaluate(async (delta) => {
      const e = document.querySelectorAll(".polaroid-swing")[4];
      scrollBy(0, delta);
      let peak = 0;
      const samples = [];
      const start = performance.now();
      await new Promise((resolve) => {
        function sample(now) {
          const angle = parseFloat(e.style.getPropertyValue("--sway")) || 0;
          peak = Math.max(peak, Math.abs(angle));
          samples.push({ time: now - start, angle, scroll: scrollY });
          if (now - start < 800) requestAnimationFrame(sample);
          else resolve();
        }
        requestAnimationFrame(sample);
      });
      return { delta, peak, samples };
    }, delta);
    measurements.push(result);
  }
  const [slow, fast] = measurements;
  if (slow.peak <= 0)
    throw new Error("Slow scroll must produce a gentle swing");
  if (fast.peak < slow.peak * 2)
    throw new Error("Fast scroll should produce substantially stronger swing");
  const tail = fast.samples.filter((s) => s.time > 150);
  if (new Set(tail.map((s) => s.scroll)).size !== 1)
    throw new Error("Inertia measurement requires stationary scroll");
  if (
    Math.max(...tail.map((s) => s.angle)) -
      Math.min(...tail.map((s) => s.angle)) <
    0.2
  )
    throw new Error("Swing must continue after scrolling stops");
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const start = performance.now();
        function frame(now) {
          if (now - start > 5000) resolve();
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }),
  );
  const settled = await page
    .locator(".polaroid-swing")
    .nth(4)
    .evaluate((e) => parseFloat(e.style.getPropertyValue("--sway")) || 0);
  if (Math.abs(settled) > 0.08)
    throw new Error("Swing should damp back to the resting tilt");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await page
    .locator(".polaroid-swing")
    .nth(4)
    .evaluate((e) => e.style.getPropertyValue("--sway"));
  if (reduced) throw new Error("Reduced motion must clear dynamic rotation");
  return {
    slowPeakDegrees: slow.peak,
    fastPeakDegrees: fast.peak,
    settledDegrees: settled,
    stationaryScrollInertia: true,
    reducedMotion: true,
  };
}
