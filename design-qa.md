# Mobile WeChat Popup Design QA

- Source visual truth: `C:\Users\ADMINI~1\AppData\Local\Temp\codex-clipboard-c4923a19-6968-4d8b-9dd2-234b4ff0c7b2.png`
- Implementation screenshot: `C:\Users\Administrator\AppData\Local\Temp\erpanomer-mobile-wechat-popup-fixed.png`
- Side-by-side comparison: `C:\Users\Administrator\AppData\Local\Temp\erpanomer-mobile-wechat-popup-comparison.png`
- Viewport: 390 × 844 CSS pixels
- State: Home page, mobile WeChat popup open, dark theme

## Full-view comparison evidence

The source screenshot shows page headings, body copy, and the CTA visibly bleeding through the popup surface. In the revised browser capture, the popup surface is fully opaque and the rest of the page is intentionally dimmed by a viewport backdrop. The popup remains anchored above the floating WeChat control without horizontal overflow.

The source includes Safari browser chrome while the implementation capture contains only the page viewport. The side-by-side artifact normalizes both images to the same 390 × 844 comparison frame; browser chrome is excluded from fidelity judgments.

## Focused region comparison evidence

Focused review was required for the popup surface, QR block, close control, CTA, and the content immediately behind the panel. Computed browser styles confirm:

- Popup background: `rgb(22, 27, 34)` at opacity `1`.
- Popup backdrop filter: `none`, avoiding Safari backdrop-compositing transparency.
- Page backdrop: `rgba(0, 0, 0, 0.65)` at opacity `1`.
- Popup bounds: 288 × 332 CSS pixels at the tested viewport.
- Backdrop click and Escape both close the popup and synchronize `aria-expanded` / `aria-hidden`.
- At 1024px, the desktop QR card remains visible while the mobile panel, backdrop, and toggle are all hidden.

## Required fidelity surfaces

- Fonts and typography: Existing type family, weights, sizes, line heights, wrapping, and hierarchy are unchanged. Text contrast is improved by the opaque popup surface.
- Spacing and layout rhythm: Existing popup size, padding, QR scale, radius, CTA spacing, and bottom-right anchoring are preserved. No horizontal overflow is visible at 390px.
- Colors and visual tokens: Popup now uses the solid GitHub Dark surface token `#161b22`; the backdrop uses 65% black. Existing green accent, borders, and muted text tokens are preserved.
- Image quality and asset fidelity: The existing QR asset remains sharp and undistorted. No logo or image asset was replaced.
- Copy and content: Popup title, supporting text, CTA, accessible names, and destination are unchanged.

## Comparison history

### Initial finding

- [P1] Popup transparency makes content difficult to read.
  - Location: mobile WeChat popup in `BackToTop.astro`.
  - Evidence: source screenshot shows hero copy and the underlying white CTA through the popup.
  - Impact: weak separation, poor readability, and an unfinished modal appearance on mobile Safari.
  - Fix: remove the translucent/backdrop-blur panel treatment, set a fully opaque `#161b22` surface, and add a 65% black viewport backdrop.

### Post-fix evidence

- The revised screenshot shows no page-copy bleed-through inside the popup.
- The underlying page is clearly de-emphasized while the QR code, title, close control, and CTA remain readable.
- Backdrop click and Escape behavior passed.
- Browser console reported no errors or warnings.

## Findings

No remaining actionable P0, P1, or P2 differences for the requested popup-opacity fix.

## Open questions

None.

## Implementation checklist

- [x] Use an opaque mobile popup surface.
- [x] Add a mobile-only viewport backdrop.
- [x] Preserve the desktop persistent QR card.
- [x] Support backdrop click, close button, and Escape dismissal.
- [x] Verify the 390 × 844 open state and console.
- [x] Verify the production build.

## Follow-up polish

No P3 follow-up is required for this focused change.

final result: passed
