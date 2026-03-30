"use client";

import { useEffect } from "react";

const WARMUP_DELAY = 1000;
const COOLDOWN_MS = 2000;

export function SwatchTooltipWarmup() {
  useEffect(() => {
    let activeSwatch: Element | null = null;
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let coolTimer: ReturnType<typeof setTimeout> | null = null;
    let warm = false;

    function activate(swatch: Element) {
      swatch.setAttribute("data-tooltip-active", "");
    }

    function deactivate() {
      if (activeSwatch) {
        activeSwatch.removeAttribute("data-tooltip-active");
      }
    }

    function setCold() {
      warm = false;
    }

    function startCooldown() {
      if (coolTimer) clearTimeout(coolTimer);
      coolTimer = setTimeout(() => {
        setCold();
        coolTimer = null;
      }, COOLDOWN_MS);
    }

    function onMove(e: Event) {
      const swatch = (e.target as HTMLElement).closest?.(".swatch") ?? null;
      if (swatch === activeSwatch) return;

      if (showTimer) { clearTimeout(showTimer); showTimer = null; }

      deactivate();

      if (swatch) {
        if (coolTimer) { clearTimeout(coolTimer); coolTimer = null; }

        activeSwatch = swatch;

        if (warm) {
          activate(swatch);
          // Reset cooldown — cools down when user stops moving between swatches
          startCooldown();
        } else {
          showTimer = setTimeout(() => {
            activate(swatch);
            warm = true;
            showTimer = null;
            startCooldown();
          }, WARMUP_DELAY);
        }
      } else {
        activeSwatch = null;
        if (warm) {
          startCooldown();
        }
      }
    }

    document.addEventListener("mouseover", onMove);
    return () => {
      document.removeEventListener("mouseover", onMove);
      if (showTimer) clearTimeout(showTimer);
      if (coolTimer) clearTimeout(coolTimer);
      deactivate();
    };
  }, []);

  return null;
}
