import { generateFingerprint } from "@/pages/tools/device-fingerprint/fingerprint-sdk.js";

export function initFingerprint() {
    // UI Elements
    const btn = document.getElementById("generate-btn");
    const resultContainer = document.getElementById("result-container");
    const breakdownGrid = document.getElementById("breakdown-grid");

    const idDisplay = document.getElementById("device-id-display");
    const entropyDisplay = document.getElementById("entropy-score");
    const timeDisplay = document.getElementById("gen-time");
    const copyBtn = document.getElementById("copy-btn");
    const copyCodeBtn = document.getElementById("copy-code-btn");

    // Component outputs
    const canvasImg = document.getElementById("signal-canvas-img");
    const canvasHash = document.getElementById("signal-canvas-hash");
    const audioHash = document.getElementById("signal-audio-hash");
    const hwCores = document.getElementById("hw-cores");
    const hwMem = document.getElementById("hw-mem");
    const hwPlatform = document.getElementById("hw-platform");
    const hwLanguage = document.getElementById("hw-language");
    const hwColorDepth = document.getElementById("hw-colordepth");
    const hwPixelDepth = document.getElementById("hw-pixeldepth");
    const hwTimezone = document.getElementById("hw-timezone");

    // WebGL elements
    const webglVendor = document.getElementById("webgl-vendor");
    const webglRenderer = document.getElementById("webgl-renderer");
    const webglVersion = document.getElementById("webgl-version");
    const webglTexture = document.getElementById("webgl-texture");

    // Font elements
    const fontCountValue = document.getElementById("font-count-value");
    const fontList = document.getElementById("font-list");

    // Core Function
    async function runGeneration() {
        try {
            // Manual trigger UI state
            if (btn) btn.textContent = "生成中...";

            const result = await generateFingerprint();

            console.log("Fingerprint Result:", result);

            // 1. Update Main ID
            if (idDisplay) {
                idDisplay.innerHTML = `<span class="text-cyan-50">${result.deviceId}</span>`;
            }

            if (entropyDisplay) entropyDisplay.textContent = result.entropyScore;
            if (timeDisplay) timeDisplay.textContent = result.generationTimeMs;

            // 2. Update Canvas
            if (result.details && result.details.canvasDataUrl) {
                if (canvasImg && canvasImg instanceof HTMLImageElement) canvasImg.src = result.details.canvasDataUrl;
                if (canvasHash) canvasHash.textContent = "数据已捕获";
            } else if (result.details && result.details.canvasError) {
                if (canvasHash) canvasHash.textContent = "被拦截/错误";
            } else if (result.components.canvas && !String(result.components.canvas).startsWith("ERROR_")) {
                if (canvasHash) canvasHash.textContent = "散列已计算";
            } else {
                if (canvasHash) canvasHash.textContent = "被拦截/错误";
            }

            // 3. Update Audio
            if (audioHash) audioHash.textContent = `样本哈希: ${result.components.audio}`;

            // 4. Update Hardware
            if (result.details && result.details.hardware) {
                const h = result.details.hardware;
                if (hwCores) {
                    const v = hwCores.querySelector("span:last-child");
                    if (v) v.textContent = String(h.concurrency);
                }
                if (hwMem) {
                    const v = hwMem.querySelector("span:last-child");
                    if (v) v.textContent = h.memory === "unknown" ? "未知" : `${h.memory} GB`;
                }
                if (hwPlatform) {
                    const v = hwPlatform.querySelector("span:last-child");
                    if (v) v.textContent = String(h.platform);
                }
                if (hwLanguage) {
                    const v = hwLanguage.querySelector("span:last-child");
                    if (v) v.textContent = String(h.language);
                }
                if (hwColorDepth) {
                    const v = hwColorDepth.querySelector("span:last-child");
                    if (v) v.textContent = `${h.colorDepth} bit`;
                }
                if (hwPixelDepth) {
                    const v = hwPixelDepth.querySelector("span:last-child");
                    if (v) v.textContent = `${h.pixelDepth} bit`;
                }
                if (hwTimezone) {
                    const v = hwTimezone.querySelector("span:last-child");
                    if (v) v.textContent = `UTC${h.timezoneOffset > 0 ? "-" : "+"}${String(Math.abs(h.timezoneOffset / 60))}`;
                }
            }

            // 5. Update WebGL
            if (result.details && result.details.webgl) {
                const webglData = result.details.webgl.split("|");
                if (webglVendor) {
                    const v = webglVendor.querySelector("span:last-child");
                    // Index 0 is standard Vendor (unmasked removed)
                    if (v) v.textContent = webglData[0] || "未知";
                }
                if (webglRenderer) {
                    const v = webglRenderer.querySelector("span:last-child");
                    // Index 4 is now Unmasked Renderer (was 5), Index 1 is standard Renderer
                    if (v) v.textContent = webglData[4] || webglData[1] || "未知";
                }
                if (webglVersion) {
                    const v = webglVersion.querySelector("span:last-child");
                    // Index 2 is Version
                    if (v) v.textContent = webglData[2] || "未知";
                }
                if (webglTexture) {
                    const v = webglTexture.querySelector("span:last-child");
                    // Index 5 is now Max Texture Size (was 6)
                    if (v) v.textContent = webglData[5] || "未知";
                }
            }

            // 6. Update Fonts
            if (result.details && result.details.fonts && result.details.fonts.length > 0) {
                if (fontCountValue) fontCountValue.textContent = result.details.fonts.length;
                if (fontList) fontList.textContent = result.details.fonts.join(", ");
            }

            // 7. Reveal UI
            if (resultContainer) {
                resultContainer.classList.remove("hidden");
                resultContainer.classList.remove("translate-y-4");
                setTimeout(() => { resultContainer.style.opacity = "1"; }, 50);
            }
            if (breakdownGrid) {
                breakdownGrid.classList.remove("hidden");
                setTimeout(() => { breakdownGrid.style.opacity = "1"; }, 50);
            }

            if (btn) {
                btn.textContent = "重新生成";
                btn.classList.remove("hidden");
            }
        } catch (e) {
            console.error(e);
            if (idDisplay) idDisplay.innerHTML = "<span class='text-red-400'>生成失败</span>";
        }
    }

    // Event Listeners
    if (btn) btn.addEventListener("click", runGeneration);

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text = idDisplay?.innerText;
            if (text && !text.includes("...")) {
                navigator.clipboard.writeText(text);
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span class="text-emerald-400 font-bold text-xs" style="position: absolute; left: 50%; top: 50%; transform: translate(-60%, -50%); width: 100px;">已复制</span>';
                setTimeout(() => (copyBtn.innerHTML = original), 2000);
            }
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener("click", () => {
            const code = document.getElementById("code-snippet")?.innerText;
            if (code) {
                navigator.clipboard.writeText(code);
                const original = copyCodeBtn.innerText;
                copyCodeBtn.innerText = "已复制!";
                copyCodeBtn.classList.add("text-emerald-400", "border-emerald-500/50");
                setTimeout(() => {
                    copyCodeBtn.innerText = original;
                    copyCodeBtn.classList.remove("text-emerald-400", "border-emerald-500/50");
                }, 2000);
            }
        });
    }

    // Initial Run
    runGeneration();
}

// Support Astro View Transitions and regular page loads
document.addEventListener("astro:page-load", initFingerprint);
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFingerprint);
} else {
    // Check if we are in a browser context (Astro scripts run in browser, but this confirms)
    if (typeof window !== "undefined" && !window.__fingerprint_initialized) {
        initFingerprint();
        window.__fingerprint_initialized = true;
    }
}
