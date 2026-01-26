/**
 * Device Fingerprint ID Generator SDK
 * 
 * A privacy-focused, permission-less device fingerprinting library.
 * Generates a stable, high-entropy device identifier using browser signals.
 * 
 * Signals used:
 * - Canvas: Rendering differences (fonts, emojis, blending)
 * - Audio: Audio stack processing differences (oscillator, compressor)
 * - Hardware: Concurrency, memory, platform, language, timezone
 * 
 * @version 1.1.0
 */

// --- Hashing Utility (MurmurHash3 32-bit) ---
// Chosen for speed and good distribution.
function murmurhash3_32_gc(key, seed) {
    let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

    // key length and remainder variables
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
        k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }

    k1 = 0;

    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;
            h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = ((((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
}

// Generate 64-bit hash by running 32-bit hash twice with different seeds
// Returns 16-character hex string
function getHash64(key, seed = 1337) {
    const h1 = murmurhash3_32_gc(key, seed);
    const h2 = murmurhash3_32_gc(key, seed + 0x5F3759DF); // Magic constant
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

// --- Signal 1: Canvas Fingerprinting ---
function getCanvasSignal() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return { error: 'ERROR_NO_CONTEXT', hash: null, dataUrl: null };

        canvas.width = 240;
        canvas.height = 80; // Increased to accommodate drawing

        // 1. Global Composite Operation (blending modes) - Fixed coordinates
        // We removed Text rendering as it is highly browser-dependent (font smoothing, default fonts)
        // varying even between Chrome and Edge on the same machine.
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(50, 40, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgb(0,255,255)';
        ctx.beginPath();
        ctx.arc(100, 40, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgb(255,255,0)';
        ctx.beginPath();
        ctx.arc(75, 60, 20, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        // 3. Winding rule test
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(180, 40, 30, 0, Math.PI * 2, true);
        ctx.arc(180, 40, 15, 0, Math.PI * 2, true);
        ctx.fill('evenodd');

        // Get pixel data for hashing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Sample pixels across the entire canvas to capture all drawing areas
        // Each pixel is 4 bytes [R,G,B,A]. We skip by a prime-ish number to get diverse samples.
        let sampleData = '';
        const step = Math.max(4, Math.floor(pixels.length / 500)); // Sample ~500 points

        for (let i = 0; i < pixels.length; i += step) {
            // Include R, G, B channels as chars (A is often 255/0)
            sampleData += String.fromCharCode(pixels[i], pixels[i + 1], pixels[i + 2]);
        }

        // Generate a proper 64-bit hash from the sampled data
        const fingerHash = getHash64(sampleData);

        return {
            error: null,
            hash: fingerHash,
            dataUrl: canvas.toDataURL() // Keep for display
        };
    } catch (e) {
        return { error: `ERROR_CANVAS: ${e.message}`, hash: null, dataUrl: null };
    }
}

// --- Signal 2: Audio Fingerprinting ---
// Renders audio silently and captures the buffer data. 
// Sensitive to audio stack, sample rate, and compression implementation.
async function getAudioSignal() {
    try {
        const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioContext) return 'ERROR_NOT_SUPPORTED';

        // 44100 Hz, 1 channel, 4096 samples (~0.09s)
        const context = new AudioContext(1, 4096, 44100);

        // Create oscillator (Triangle wave)
        const oscillator = context.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;

        // Create Dynamics Compressor (introduces subtle hardware/software differences)
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        // compressor.reduction is read-only (metering), do not set it.
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Connect: Oscillator -> Compressor -> Destination
        oscillator.connect(compressor);
        compressor.connect(context.destination);

        oscillator.start(0);

        const buffer = await context.startRendering();
        const data = buffer.getChannelData(0);

        // Sum a subset of samples to create a simple hash
        let signal = 0;
        for (let i = 0; i < data.length; i += 10) { // skip samples for speed
            signal += Math.abs(data[i]);
        }

        // Truncate floating point noise
        return signal.toFixed(1); // Keep 1 decimal for stability (ignore minor floating point diffs)
    } catch (e) {
        return `ERROR_AUDIO: ${e.message}`;
    }
}

// --- Signal 3: WebGL Fingerprinting ---
function getWebGLSignal() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return 'ERROR_NO_WEBGL';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const params = {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            // unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unavailable', // REMOVED: Often contains "Google Inc" vs "Microsoft"
            unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unavailable',
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS).join('x')
        };

        return Object.values(params).join('|');
    } catch (e) {
        return `ERROR_WEBGL: ${e.message}`;
    }
}

// --- Signal 4: Font Detection ---
function getFontSignal() {
    try {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testFonts = [
            'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
            'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black',
            'Impact', 'Tahoma', 'Helvetica', 'Calibri', 'Consolas',
            'Microsoft YaHei', 'SimSun', 'SimHei', 'PingFang SC', 'Hiragino Sans'
        ];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'ERROR_NO_CONTEXT';

        const testString = 'mmmmmmmmmmlli';
        const textSize = '72px';

        // Get base measurements
        const baseMeasurements = {};
        baseFonts.forEach(baseFont => {
            ctx.font = `${textSize} ${baseFont}`;
            baseMeasurements[baseFont] = ctx.measureText(testString).width;
        });

        // Detect available fonts
        const availableFonts = [];
        testFonts.forEach(font => {
            let detected = false;
            baseFonts.forEach(baseFont => {
                ctx.font = `${textSize} '${font}', ${baseFont}`;
                const measurement = ctx.measureText(testString).width;
                if (measurement !== baseMeasurements[baseFont]) {
                    detected = true;
                }
            });
            if (detected) availableFonts.push(font);
        });

        return availableFonts.sort().join('|') || 'none';
    } catch (e) {
        return `ERROR_FONT: ${e.message}`;
    }
}

// --- Signal 5: Hardware & Screen ---
function getHardwareSignal() {
    const n = navigator;
    const s = screen;

    // Collecting stable signals
    // EXCLUDED: s.width/height and devicePixelRatio as they change when moving windows between monitors.
    // Fixed timezone calculation: Use Intl.DateTimeFormat to get static timezone without DST impact
    let timezoneOffset;
    try {
        // Get the IANA timezone name (e.g., 'Asia/Shanghai')
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // For consistency, we'll still use offset but calculated more reliably
        const now = new Date();
        const jan = new Date(now.getFullYear(), 0, 1);
        const jul = new Date(now.getFullYear(), 6, 1);
        // Use the smaller offset (standard time, not DST)
        timezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    } catch (e) {
        // Fallback to simple offset
        timezoneOffset = new Date().getTimezoneOffset();
    }

    const traits = {
        concurrency: n.hardwareConcurrency || 'unknown',
        memory: n.deviceMemory || 'unknown',
        platform: n.platform || 'unknown',
        language: n.language || 'unknown',
        colorDepth: s.colorDepth,
        pixelDepth: s.pixelDepth,
        timezoneOffset: timezoneOffset
    };

    // Return structured object and string representation for hashing
    return {
        traits,
        toString: () => {
            return [
                traits.concurrency,
                traits.memory,
                traits.platform,
                traits.language,
                traits.colorDepth,
                traits.pixelDepth,
                traits.timezoneOffset
            ].join('|');
        }
    };
}


/**
 * Normalizes signals into a consistent string format
 */
function normalizeSignals(components) {
    // Sort keys to ensure deterministic order
    const keys = Object.keys(components).sort();
    return keys.map(key => {
        const val = components[key];
        // If it's the hardware object with custom toString, use that
        if (val && typeof val.toString === 'function' && typeof val !== 'string') {
            return `${key}:${val.toString()}`;
        }
        return `${key}:${val}`;
    }).join(';;');
}

/**
 * Main Generator Function
 * @param {Object} options Configuration options
 * @returns {Promise<Object>} Fingerprint result with deviceId, components, and metadata
 */
export async function generateFingerprint(options = {}) {
    // Default options
    const config = {
        canvas: true,
        audio: true,
        webgl: true,
        fonts: true,
        hardware: true,
        ...options
    };

    // Environment Guard: Ensure it only runs in browser
    if (typeof window === 'undefined') {
        return {
            deviceId: 'ERROR_SSR',
            entropyScore: 0,
            generationTimeMs: 0,
            components: {},
            details: {}
        };
    }

    const components = {};
    const detailedInfo = {};
    const startTime = performance.now();

    // 1. Gather Signals (Parallel where possible)
    const tasks = [];

    if (config.canvas) {
        // Sync
        const res = getCanvasSignal();
        components.canvas = res.hash || res.error; // Use hash for fingerprint
        if (res.dataUrl) detailedInfo.canvasDataUrl = res.dataUrl; // Store dataUrl for display
        if (res.error) detailedInfo.canvasError = res.error;
    }

    if (config.audio) {
        tasks.push(getAudioSignal().then(res => {
            components.audio = res;
        }));
    }

    if (config.webgl) {
        // Sync
        const res = getWebGLSignal();
        components.webgl = res;
        if (!res.startsWith('ERROR_')) {
            detailedInfo.webgl = res; // Store for display
        }
    }

    if (config.fonts) {
        // Sync
        const res = getFontSignal();
        components.fonts = res;
        if (!res.startsWith('ERROR_')) {
            detailedInfo.fonts = res.split('|');
        }
    }

    if (config.hardware) {
        // Sync
        const res = getHardwareSignal();
        components.hardware = res; // This is the object with .traits and .toString()
        detailedInfo.hardware = res.traits;
    }

    // Await all async signals
    await Promise.all(tasks);

    // 2. Normalize
    const featureString = normalizeSignals(components);

    // 3. Hash
    // Primary ID: MurmurHash3 (Hex)
    // Using two seeds to get 64-bit / 16 chars
    const deviceId = getHash64(featureString);

    // 4. Calculate Entropy Score (estimation based on enabled signals)
    // Canvas ~ 10 bits, Audio ~ 5 bits, WebGL ~ 8 bits, Fonts ~ 10 bits, Hardware ~ 5 bits
    let entropyScore = 0;
    if (config.canvas && components.canvas && !String(components.canvas).startsWith('ERROR_')) {
        entropyScore += 10;
    }
    if (config.audio && components.audio && components.audio !== 'ERROR_NOT_SUPPORTED' && !String(components.audio).startsWith('ERROR_')) {
        entropyScore += 5;
    }
    if (config.webgl && components.webgl && !String(components.webgl).startsWith('ERROR_')) {
        entropyScore += 8;
    }
    if (config.fonts && components.fonts && !String(components.fonts).startsWith('ERROR_')) {
        entropyScore += 10;
    }
    if (config.hardware) {
        entropyScore += 5;
    }

    const endTime = performance.now();

    return {
        deviceId: deviceId,
        entropyScore,
        generationTimeMs: Math.round(endTime - startTime),
        components,
        details: detailedInfo,
        // Debug info (hash source)
        _debug_featureString: featureString
    };
}
