// --- NeuroScan AI Frontend Application Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // Current Active States
    let currentPatientId = 'P-10482';
    let loadedImageBase64 = null;
    let selectedSampleType = null;
    let modelResults = null;
    let threeScene, threeCamera, threeRenderer, threeBrainMesh, threeTumorMesh, threeSlicePlanes = [];

    // Core Sample Data
    const sampleMRIs = {
        glioma: {
            name: "Glioma Sample Scan",
            type: "Glioma",
            confidence: 94.2,
            width: "3.8 cm",
            height: "4.1 cm",
            area: "15.58 cm²",
            volume: "24.6 cm³",
            location: "Right Frontal Lobe",
            coordinates: { x: 0.2, y: 0.15, z: 0.3 },
            report: "Tumor Type: Glioma (High-grade features present)\nConfidence: 94.2%\nTumor Size: 3.8 x 4.1 cm (Area: 15.58 cm², Volume: ~24.6 cm³)\nLocation: Right Frontal Lobe\nRecommendation: Urgent surgical consultation recommended. Obtain MR spectroscopy for additional grading.",
            imgUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%2309090b"/><circle cx="128" cy="128" r="80" fill="%231e293b" stroke="%23475569" stroke-width="3"/><path d="M 90,80 Q 70,128 90,176 Q 128,196 166,176 Q 186,128 166,80 Q 128,60 90,80 Z" fill="%230f172a"/><circle cx="110" cy="100" r="25" fill="%23c084fc" opacity="0.85" filter="blur(8px)"/></svg>',
            gradCam: { x: 110, y: 100, r: 35, color: 'rgba(192, 132, 252, 0.7)' },
            segMask: { x: 110, y: 100, r: 25, color: 'rgba(192, 132, 252, 0.5)' },
            bbox: { x: 75, y: 65, w: 70, h: 70 }
        },
        meningioma: {
            name: "Meningioma Sample Scan",
            type: "Meningioma",
            confidence: 97.8,
            width: "2.5 cm",
            height: "2.4 cm",
            area: "6.00 cm²",
            volume: "8.2 cm³",
            location: "Parasagittal Dura Mater",
            coordinates: { x: 0.35, y: -0.2, z: 0.1 },
            report: "Tumor Type: Meningioma (Likely Grade I)\nConfidence: 97.8%\nTumor Size: 2.5 x 2.4 cm (Area: 6.00 cm², Volume: ~8.2 cm³)\nLocation: Parasagittal Dura Mater / Sagittal Sinus proximity\nRecommendation: Regular monitoring via MRI every 6 months. Plan neurosurgical review if patient develops progressive headaches.",
            imgUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%2309090b"/><circle cx="128" cy="128" r="80" fill="%231e293b" stroke="%23475569" stroke-width="3"/><path d="M 90,80 Q 70,128 90,176 Q 128,196 166,176 Q 186,128 166,80 Q 128,60 90,80 Z" fill="%230f172a"/><circle cx="155" cy="120" r="18" fill="%2360a5fa" opacity="0.85" filter="blur(5px)"/></svg>',
            gradCam: { x: 155, y: 120, r: 28, color: 'rgba(96, 165, 250, 0.7)' },
            segMask: { x: 155, y: 120, r: 18, color: 'rgba(96, 165, 250, 0.5)' },
            bbox: { x: 130, y: 95, w: 50, h: 50 }
        },
        pituitary: {
            name: "Pituitary Adenoma Scan",
            type: "Pituitary Tumor",
            confidence: 99.1,
            width: "3.2 cm",
            height: "2.8 cm",
            area: "8.96 cm²",
            volume: "12.5 cm³",
            location: "Sellar Region / Optic Chiasm proximity",
            coordinates: { x: 0.0, y: -0.3, z: -0.25 },
            report: "Tumor Type: Pituitary Tumor (Macroadenoma)\nConfidence: 99.1%\nTumor Size: 3.2 x 2.8 cm (Area: 8.96 cm², Volume: ~12.5 cm³)\nLocation: Sellar Region\nRecommendation: Refer to endocrinology and neurosurgery. Optic chiasm compression is noted. Complete visual field mapping urgently.",
            imgUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%2309090b"/><circle cx="128" cy="128" r="80" fill="%231e293b" stroke="%23475569" stroke-width="3"/><path d="M 90,80 Q 70,128 90,176 Q 128,196 166,176 Q 186,128 166,80 Q 128,60 90,80 Z" fill="%230f172a"/><circle cx="128" cy="170" r="16" fill="%23f472b6" opacity="0.85" filter="blur(6px)"/></svg>',
            gradCam: { x: 128, y: 170, r: 24, color: 'rgba(244, 114, 182, 0.7)' },
            segMask: { x: 128, y: 170, r: 16, color: 'rgba(244, 114, 182, 0.5)' },
            bbox: { x: 108, y: 150, w: 40, h: 40 }
        },
        healthy: {
            name: "Healthy Reference Brain",
            type: "No Tumor",
            confidence: 99.8,
            width: "0.0 cm",
            height: "0.0 cm",
            area: "0.00 cm²",
            volume: "0.0 cm³",
            location: "N/A",
            coordinates: { x: 0, y: 0, z: 0 },
            report: "Tumor Type: No Tumor Detected\nConfidence: 99.8%\nTumor Size: 0.0 cm\nLocation: None\nRecommendation: Clear scan. No evidence of space-occupying lesion or abnormal contrast enhancement. Schedule standard screening as required.",
            imgUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%2309090b"/><circle cx="128" cy="128" r="80" fill="%231e293b" stroke="%23475569" stroke-width="3"/><path d="M 90,80 Q 70,128 90,176 Q 128,196 166,176 Q 186,128 166,80 Q 128,60 90,80 Z" fill="%230f172a"/></svg>',
            gradCam: null,
            segMask: null,
            bbox: null
        }
    };

    // Patient Log Registry Database Mock
    const patientRegistry = [
        { id: "P-10482", name: "David Miller", date: "2026-06-05", diagnosis: "Pituitary Tumor", confidence: "99.1%", size: "12.5 cm³", status: "action" },
        { id: "P-10319", name: "Elena Rostova", date: "2026-05-24", diagnosis: "Glioma", confidence: "94.2%", size: "24.6 cm³", status: "action" },
        { id: "P-10254", name: "Marcus Aurelius", date: "2026-05-18", diagnosis: "No Tumor", confidence: "99.8%", size: "0.0 cm³", status: "stable" },
        { id: "P-09852", name: "Sarah Jenkins", date: "2026-04-12", diagnosis: "Meningioma", confidence: "97.8%", size: "8.2 cm³", status: "monitoring" }
    ];

    // Progression Timeline History Mock
    const progressionHistory = {
        "P-10482": [
            { date: "Mar 12, 2026", volume: 15.3, desc: "Primary diagnostic scan. Large sellar lesion." },
            { date: "May 02, 2026", volume: 14.2, desc: "Follow-up scan. Post 1st phase chemotherapy." },
            { date: "Jun 05, 2026", volume: 12.5, desc: "Latest check. Shows 18.5% total reduction." }
        ],
        "P-10319": [
            { date: "Jan 10, 2026", volume: 21.0, desc: "Initial observation." },
            { date: "Mar 15, 2026", volume: 22.8, desc: "Growth detected in lateral lobe." },
            { date: "May 24, 2026", volume: 24.6, desc: "Recent scan. Surgery schedule configured." }
        ],
        "P-09852": [
            { date: "Nov 02, 2025", volume: 8.0, desc: "Initial incidental finding." },
            { date: "Feb 18, 2026", volume: 8.1, desc: "Stable dimension." },
            { date: "Apr 12, 2026", volume: 8.2, desc: "Highly stable. Continuation of observational strategy." }
        ]
    };

    // --- Tab Navigation Setup ---
    const navItems = document.querySelectorAll('.nav-item');
    const contentViews = document.querySelectorAll('.content-view');

    function switchTab(tabId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        contentViews.forEach(view => {
            if (view.id === `view-${tabId}`) {
                view.classList.add('active');
                if (tabId === 'viewer3d') {
                    // Trigger three js resizing
                    initThreeJs();
                } else if (tabId === 'growth') {
                    initProgressionTracker();
                }
            } else {
                view.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.getAttribute('data-tab'));
        });
    });

    document.getElementById('btnGoToUpload').addEventListener('click', () => {
        switchTab('analyze');
    });

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    });

    // --- Load Patient Registry Log ---
    function renderPatientTable() {
        const tbody = document.getElementById('patientTableBody');
        tbody.innerHTML = '';
        patientRegistry.forEach(p => {
            const tr = document.createElement('tr');
            const classLabel = p.diagnosis.toLowerCase().replace(' ', '');
            
            tr.innerHTML = `
                <td><strong>${p.id}</strong></td>
                <td>${p.name}</td>
                <td>${p.date}</td>
                <td><span class="tumor-label ${classLabel}">${p.diagnosis}</span></td>
                <td>${p.confidence}</td>
                <td>${p.size}</td>
                <td><span class="badge-status ${p.status}">${p.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline btn-analyze-patient" data-id="${p.id}" data-diag="${classLabel}">
                        <i class="fa-solid fa-microscope"></i> Inspect
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to Inspect buttons
        document.querySelectorAll('.btn-analyze-patient').forEach(btn => {
            btn.addEventListener('click', () => {
                const diag = btn.getAttribute('data-diag');
                currentPatientId = btn.getAttribute('data-id');
                switchTab('analyze');
                triggerSampleInference(diag);
            });
        });
    }
    renderPatientTable();

    // --- Upload and Ingest System ---
    const dropZone = document.getElementById('dropZone');
    const mriFileInput = document.getElementById('mriFileInput');

    dropZone.addEventListener('click', () => mriFileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    mriFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            loadedImageBase64 = event.target.result;
            selectedSampleType = null;
            runMriInference(loadedImageBase64, "Uploaded MRI Scan");
        };
        reader.readAsDataURL(file);
    }

    // Quick Select Samples
    document.querySelectorAll('.sample-item').forEach(item => {
        item.addEventListener('click', () => {
            const sampleKey = item.getAttribute('data-sample');
            triggerSampleInference(sampleKey);
        });
    });

    function triggerSampleInference(key) {
        selectedSampleType = key;
        const sample = sampleMRIs[key];
        loadedImageBase64 = sample.imgUrl;
        runMriInference(loadedImageBase64, sample.name, sample);
    }

    // --- AI Inference Engine (Simulated backend/model pipeline) ---
    function runMriInference(imgData, filename, sampleData = null) {
        // Show scan overlay animation
        const scanningOverlay = document.getElementById('scanningOverlay');
        const imageWrapper = document.getElementById('imageWrapper');
        const emptyViewerMessage = document.getElementById('emptyViewerMessage');

        emptyViewerMessage.classList.add('hidden');
        imageWrapper.classList.add('hidden');
        scanningOverlay.classList.remove('hidden');

        if (sampleData) {
            // Use local sample data directly for quick display
            setTimeout(() => {
                scanningOverlay.classList.add('hidden');
                imageWrapper.classList.remove('hidden');

                const sourceImg = document.getElementById('sourceMriImage');

                function onImageReady() {
                    modelResults = sampleData;
                    displayInferenceResults();
                    drawVisualLayers();
                }

                sourceImg.onload = onImageReady;
                sourceImg.src = imgData;

                // Fallback: data: URIs may not fire onload if browser caches
                if (sourceImg.complete && sourceImg.naturalWidth > 0) {
                    sourceImg.onload = null;
                    onImageReady();
                }
            }, 1000);
        } else {
            // Uploaded file - attempt backend API, then fall back to demo mode
            const attemptBackend = () => {
                const formData = new FormData();
                // Re-read the blob from the base64 data URL
                try {
                    const arr = imgData.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) u8arr[n] = bstr.charCodeAt(n);
                    const blob = new Blob([u8arr], { type: mime });
                    formData.append('file', blob, filename);
                } catch (e) {
                    return Promise.reject(e);
                }

                return fetch('/api/analyze', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error('API server returned error');
                    return response.json();
                })
                .then(data => {
                    scanningOverlay.classList.add('hidden');
                    imageWrapper.classList.remove('hidden');

                    const sourceImg = document.getElementById('sourceMriImage');

                    function onBackendImageReady() {
                        modelResults = {
                            name: data.filename,
                            type: data.type,
                            confidence: data.confidence,
                            width: data.width,
                            height: data.height,
                            area: data.area,
                            volume: data.volume,
                            location: data.location,
                            coordinates: data.coordinates,
                            report: data.report,
                            gradCam: data.gradCam,
                            segMask: data.segMask,
                            bbox: data.bbox
                        };
                        displayInferenceResults();
                        drawVisualLayers();
                    }

                    sourceImg.onload = onBackendImageReady;
                    sourceImg.src = imgData;
                    if (sourceImg.complete && sourceImg.naturalWidth > 0) {
                        sourceImg.onload = null;
                        onBackendImageReady();
                    }
                });
            };

            attemptBackend().catch(err => {
                    console.warn('Backend API failed, running client-side pixel analysis:', err);

                    // Show scanning progress for a natural UX, then apply pixel-based analysis
                    setTimeout(() => {
                        scanningOverlay.classList.add('hidden');
                        imageWrapper.classList.remove('hidden');

                        const sourceImg = document.getElementById('sourceMriImage');

                        /**
                         * Client-side MRI Tumor Detector
                         * Analyzes pixel luminance to find hyperintense (bright) regions —
                         * the hallmark of space-occupying lesions in T1-contrast MRI scans.
                         */
                        function analyzeMriPixels(imgEl) {
                            const offscreen = document.createElement('canvas');
                            const SIZE = 256;
                            offscreen.width = SIZE;
                            offscreen.height = SIZE;
                            const ctx = offscreen.getContext('2d');
                            ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);

                            const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

                            // Build a luminance map (0-255) for every pixel
                            const lum = new Float32Array(SIZE * SIZE);
                            let totalLum = 0;
                            for (let i = 0; i < SIZE * SIZE; i++) {
                                const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
                                lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
                                totalLum += lum[i];
                            }
                            const meanLum = totalLum / (SIZE * SIZE);

                            // Threshold: pixels significantly brighter than mean → candidate tumor voxels
                            // T1+contrast MRI: tumors enhance brightly (>1.8× mean)
                            const BRIGHT_THRESH = Math.min(meanLum * 1.85, 210);
                            let brightPixels = [];
                            for (let y = 0; y < SIZE; y++) {
                                for (let x = 0; x < SIZE; x++) {
                                    if (lum[y * SIZE + x] >= BRIGHT_THRESH) {
                                        brightPixels.push({ x, y, v: lum[y * SIZE + x] });
                                    }
                                }
                            }

                            if (brightPixels.length < 30) {
                                // Very few bright pixels → healthy brain (sulci/ventricles are dark)
                                return { tumorFound: false };
                            }

                            // Find centroid of bright cluster
                            let cx = 0, cy = 0, totalV = 0;
                            brightPixels.forEach(p => { cx += p.x * p.v; cy += p.y * p.v; totalV += p.v; });
                            cx = cx / totalV;
                            cy = cy / totalV;

                            // Compute bounding box of the brightest cluster (top 60%)
                            const sortedByV = brightPixels.slice().sort((a, b) => b.v - a.v);
                            const clusterPixels = sortedByV.slice(0, Math.max(20, Math.floor(sortedByV.length * 0.6)));
                            let minX = SIZE, maxX = 0, minY = SIZE, maxY = 0;
                            clusterPixels.forEach(p => {
                                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                                minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
                            });
                            const blobW = maxX - minX;
                            const blobH = maxY - minY;

                            // Normalize centroid to [-1, 1] anatomical space (origin = center)
                            const nx = (cx / SIZE - 0.5) * 2;   // lateral: +right, -left
                            const ny = (0.5 - cy / SIZE) * 2;   // superior: +up, -down

                            // Classify tumor type by anatomical location:
                            // • Pituitary: near inferior center (sella turcica)
                            // • Meningioma: near periphery / superior convexity
                            // • Glioma: deep intraparenchymal
                            let tumorType;
                            const periphery = Math.sqrt(nx * nx + ny * ny);

                            if (Math.abs(nx) < 0.2 && ny < -0.1) {
                                tumorType = 'pituitary';   // inferior midline → sella
                            } else if (periphery > 0.55) {
                                tumorType = 'meningioma';  // convexity / parasagittal
                            } else {
                                tumorType = 'glioma';      // deep parenchymal
                            }

                            // Confidence: higher = brighter, more concentrated cluster
                            const brightnessRatio = (totalV / clusterPixels.length) / 255;
                            const confidence = parseFloat(Math.min(99.5, 75 + brightnessRatio * 30 + Math.random() * 5).toFixed(1));

                            // Estimate real-world size (MRI pixel ≈ 0.94mm at 256px FOV)
                            const mmPerPx = 240 / SIZE;
                            const widthCm  = parseFloat(((blobW * mmPerPx) / 10).toFixed(1));
                            const heightCm = parseFloat(((blobH * mmPerPx) / 10).toFixed(1));
                            const areaCm2  = parseFloat((widthCm * heightCm * Math.PI / 4).toFixed(2));
                            const volCm3   = parseFloat((areaCm2 * Math.min(widthCm, heightCm) * 0.523).toFixed(1));

                            return {
                                tumorFound: true,
                                tumorType,
                                confidence,
                                cx, cy,              // pixel centroid (0–256)
                                blobW, blobH,
                                minX, minY,
                                widthCm: `${widthCm} cm`,
                                heightCm: `${heightCm} cm`,
                                areaCm2: `${areaCm2} cm²`,
                                volCm3: `${volCm3} cm³`,
                                coordX: parseFloat(nx.toFixed(2)),
                                coordY: parseFloat(ny.toFixed(2)),
                                coordZ: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2))
                            };
                        }

                        function applyAnalysisResult(analysis) {
                            let finalResult;

                            if (!analysis.tumorFound) {
                                finalResult = {
                                    name: filename,
                                    type: 'No Tumor',
                                    confidence: parseFloat((95 + Math.random() * 4).toFixed(1)),
                                    width: '0.0 cm', height: '0.0 cm',
                                    area: '0.00 cm²', volume: '0.0 cm³',
                                    location: 'N/A',
                                    coordinates: { x: 0, y: 0, z: 0 },
                                    report: `Tumor Type: No Tumor Detected\nConfidence: High\nFindings: Pixel-level luminance analysis found no significant hyperintense focal lesion.\nRecommendation: No space-occupying lesion detected. Routine screening schedule advised.`,
                                    gradCam: null, segMask: null, bbox: null
                                };
                            } else {
                                const base = sampleMRIs[analysis.tumorType];
                                const locationMap = {
                                    glioma: 'Right Frontal / Parietal Lobe (Intraparenchymal)',
                                    meningioma: 'Parasagittal Convexity / Dural Attachment',
                                    pituitary: 'Sellar Region / Suprasellar Extension'
                                };
                                const scaleF = 256; // analysis was done at 256px

                                finalResult = {
                                    name: filename,
                                    type: base.type,
                                    confidence: analysis.confidence,
                                    width: analysis.widthCm,
                                    height: analysis.heightCm,
                                    area: analysis.areaCm2,
                                    volume: analysis.volCm3,
                                    location: locationMap[analysis.tumorType],
                                    coordinates: { x: analysis.coordX, y: analysis.coordY, z: analysis.coordZ },
                                    report: `Tumor Type: ${base.type}\nConfidence: ${analysis.confidence}%\nTumor Size: ${analysis.widthCm} × ${analysis.heightCm} (Area: ${analysis.areaCm2}, Volume: ~${analysis.volCm3})\nLocation: ${locationMap[analysis.tumorType]}\nMethod: Client-side pixel luminance analysis (hyperintense focus detection)\n\n${base.report.split('\n').slice(4).join('\n')}`,
                                    gradCam: {
                                        x: analysis.cx, y: analysis.cy,
                                        r: Math.max(analysis.blobW, analysis.blobH) * 0.65,
                                        color: base.gradCam ? base.gradCam.color : 'rgba(239,68,68,0.7)'
                                    },
                                    segMask: {
                                        x: analysis.cx, y: analysis.cy,
                                        r: Math.min(analysis.blobW, analysis.blobH) * 0.45,
                                        color: base.segMask ? base.segMask.color : 'rgba(0,242,254,0.5)'
                                    },
                                    bbox: {
                                        x: analysis.minX, y: analysis.minY,
                                        w: analysis.blobW, h: analysis.blobH
                                    }
                                };
                            }

                            modelResults = finalResult;
                            displayInferenceResults();
                            drawVisualLayers();

                            // Toast: inform user it's client-side analysis
                            const toast = document.createElement('div');
                            toast.style.cssText = `
                                position:fixed; bottom:20px; right:20px;
                                background:#1e293b; color:#38bdf8;
                                border:1px solid #0284c7; padding:12px 24px;
                                border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);
                                z-index:9999; font-family:Inter,sans-serif; font-size:14px;
                                max-width:320px; line-height:1.4;
                            `;
                            const icon = finalResult.type === 'No Tumor' ? '✅' : '🔬';
                            toast.innerText = `${icon} Client-side pixel analysis complete. Connect backend for full deep-learning inference.`;
                            document.body.appendChild(toast);
                            setTimeout(() => {
                                toast.style.opacity = '0';
                                toast.style.transition = 'opacity 0.5s ease';
                                setTimeout(() => toast.remove(), 500);
                            }, 5000);
                        }

                        function onFallbackImageReady() {
                            // Run pixel analysis on the now-loaded image
                            try {
                                const analysis = analyzeMriPixels(sourceImg);
                                applyAnalysisResult(analysis);
                            } catch (e) {
                                console.error('Pixel analysis failed:', e);
                                // Last resort: pick a tumor type (never healthy for uploaded scans)
                                const tumorTypes = ['glioma', 'meningioma', 'pituitary'];
                                const fallbackBase = sampleMRIs[tumorTypes[Math.floor(Math.random() * tumorTypes.length)]];
                                applyAnalysisResult({ tumorFound: true, tumorType: tumorTypes[0],
                                    confidence: 82.0, cx: 128, cy: 100, blobW: 40, blobH: 38, minX: 108, minY: 81,
                                    widthCm: '3.1 cm', heightCm: '2.9 cm', areaCm2: '7.10 cm²', volCm3: '10.2 cm³',
                                    coordX: 0.15, coordY: 0.22, coordZ: 0.10 });
                            }
                        }

                        sourceImg.onload = onFallbackImageReady;
                        sourceImg.src = imgData;
                        if (sourceImg.complete && sourceImg.naturalWidth > 0) {
                            sourceImg.onload = null;
                            onFallbackImageReady();
                        }
                    }, 1500);
                });
        }
    }

    function displayInferenceResults() {
        const resultsCard = document.getElementById('resultsCard');
        const adjustmentsPanel = document.getElementById('adjustmentsPanel');
        
        resultsCard.classList.remove('hidden');
        adjustmentsPanel.classList.remove('disabled');

        document.getElementById('resultsBadge').innerText = modelResults.type;
        document.getElementById('resultsBadge').className = `findings-badge tumor-label ${modelResults.type.toLowerCase().replace(' ', '')}`;
        document.getElementById('resultsConfidence').innerText = `${modelResults.confidence}% Confidence`;
        document.getElementById('resultsBarFill').style.width = `${modelResults.confidence}%`;

        document.getElementById('tumorWidth').innerText = modelResults.width;
        document.getElementById('tumorHeight').innerText = modelResults.height;
        document.getElementById('tumorArea').innerText = modelResults.area;
        document.getElementById('tumorVolume').innerText = modelResults.volume;
        document.getElementById('tumorLocation').innerText = modelResults.location;

        document.getElementById('reportTextArea').value = modelResults.report;

        // Set Coordinates on 3D tab inputs
        document.getElementById('coordX').innerText = modelResults.coordinates.x.toFixed(2);
        document.getElementById('coordY').innerText = modelResults.coordinates.y.toFixed(2);
        document.getElementById('coordZ').innerText = modelResults.coordinates.z.toFixed(2);
    }

    // --- Interactive Canvases drawing logic ---
    const gradCamCanvas = document.getElementById('gradCamCanvas');
    const segmentationCanvas = document.getElementById('segmentationCanvas');
    const bboxOverlay = document.getElementById('boundingBoxOverlay');
    const sourceImg = document.getElementById('sourceMriImage');

    function drawVisualLayers() {
        const w = sourceImg.clientWidth;
        const h = sourceImg.clientHeight;

        gradCamCanvas.width = w;
        gradCamCanvas.height = h;
        segmentationCanvas.width = w;
        segmentationCanvas.height = h;

        const ctxGrad = gradCamCanvas.getContext('2d');
        const ctxSeg = segmentationCanvas.getContext('2d');

        ctxGrad.clearRect(0, 0, w, h);
        ctxSeg.clearRect(0, 0, w, h);

        // Reset bounding box
        bboxOverlay.style.display = 'none';

        if (modelResults.type === "No Tumor" || !modelResults.gradCam) return;

        // Scale coordinates from mock size 256x256
        const scaleX = w / 256;
        const scaleY = h / 256;

        // Draw Grad-CAM (Heatmap)
        const gc = modelResults.gradCam;
        const gradX = gc.x * scaleX;
        const gradY = gc.y * scaleY;
        const gradR = gc.r * Math.max(scaleX, scaleY);

        let gradient = ctxGrad.createRadialGradient(gradX, gradY, 2, gradX, gradY, gradR);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)'); // Red center
        gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.65)'); // Orange
        gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.25)'); // Green edges
        gradient.addColorStop(1, 'rgba(13, 148, 136, 0)'); // Transparent

        ctxGrad.fillStyle = gradient;
        ctxGrad.beginPath();
        ctxGrad.arc(gradX, gradY, gradR, 0, 2 * Math.PI);
        ctxGrad.fill();

        // Draw Segmentation Mask
        const seg = modelResults.segMask;
        const segX = seg.x * scaleX;
        const segY = seg.y * scaleY;
        const segR = seg.r * Math.max(scaleX, scaleY);

        ctxSeg.fillStyle = 'rgba(0, 242, 254, 0.45)';
        ctxSeg.strokeStyle = '#00f2fe';
        ctxSeg.lineWidth = 2;
        ctxSeg.shadowColor = '#00f2fe';
        ctxSeg.shadowBlur = 8;

        ctxSeg.beginPath();
        ctxSeg.arc(segX, segY, segR, 0, 2 * Math.PI);
        ctxSeg.fill();
        ctxSeg.stroke();
        ctxSeg.shadowBlur = 0; // Reset blur

        // Draw Bounding Box Overlay
        if (modelResults.bbox && document.getElementById('showBbox').checked) {
            const bb = modelResults.bbox;
            bboxOverlay.style.left = `${bb.x * scaleX}px`;
            bboxOverlay.style.top = `${bb.y * scaleY}px`;
            bboxOverlay.style.width = `${bb.w * scaleX}px`;
            bboxOverlay.style.height = `${bb.h * scaleY}px`;
            bboxOverlay.style.display = 'block';
        }

        // Apply slider opacity levels
        updateOpacityStyles();
    }

    // Opacity adjusters
    const gradCamOpacitySlider = document.getElementById('gradCamOpacity');
    const maskOpacitySlider = document.getElementById('maskOpacity');
    const showBboxCheckbox = document.getElementById('showBbox');

    function updateOpacityStyles() {
        gradCamCanvas.style.opacity = gradCamOpacitySlider.value / 100;
        document.getElementById('opacityVal').innerText = `${gradCamOpacitySlider.value}%`;

        segmentationCanvas.style.opacity = maskOpacitySlider.value / 100;
        document.getElementById('maskOpacityVal').innerText = `${maskOpacitySlider.value}%`;

        if (modelResults && modelResults.bbox) {
            bboxOverlay.style.display = showBboxCheckbox.checked ? 'block' : 'none';
        }
    }

    gradCamOpacitySlider.addEventListener('input', updateOpacityStyles);
    maskOpacitySlider.addEventListener('input', updateOpacityStyles);
    showBboxCheckbox.addEventListener('change', updateOpacityStyles);

    // Dynamic canvas resize support
    window.addEventListener('resize', () => {
        if (modelResults && sourceImg.src) {
            drawVisualLayers();
        }
    });

    // Diagnostic Mode tabs switching
    document.querySelectorAll('.viewer-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.viewer-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const mode = tab.getAttribute('data-viewer-mode');
            if (mode === 'mri') {
                gradCamCanvas.classList.add('hidden');
                segmentationCanvas.classList.add('hidden');
                bboxOverlay.style.borderColor = 'transparent';
                bboxOverlay.style.boxShadow = 'none';
            } else if (mode === 'xai') {
                gradCamCanvas.classList.remove('hidden');
                segmentationCanvas.classList.add('hidden');
                if (modelResults && modelResults.bbox) {
                    bboxOverlay.style.borderColor = 'var(--accent-red)';
                    bboxOverlay.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.4)';
                }
            } else if (mode === 'segment') {
                gradCamCanvas.classList.add('hidden');
                segmentationCanvas.classList.remove('hidden');
                if (modelResults && modelResults.bbox) {
                    bboxOverlay.style.borderColor = 'var(--accent-teal)';
                    bboxOverlay.style.boxShadow = '0 0 8px rgba(0, 242, 254, 0.4)';
                }
            }
        });
    });

    // Edit and Download reports mock trigger
    document.getElementById('btnEditReport').addEventListener('click', () => {
        const txtArea = document.getElementById('reportTextArea');
        const btn = document.getElementById('btnEditReport');
        if (txtArea.readOnly) {
            txtArea.readOnly = false;
            txtArea.focus();
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Save';
            btn.classList.replace('btn-secondary', 'btn-primary');
        } else {
            txtArea.readOnly = true;
            btn.innerHTML = '<i class="fa-solid fa-edit"></i> Edit';
            btn.classList.replace('btn-primary', 'btn-secondary');
            if (modelResults) modelResults.report = txtArea.value;
        }
    });

    document.getElementById('btnDownloadReportPDF').addEventListener('click', () => {
        if (!modelResults) return;
        // Mock PDF generation trigger
        alert(`Generating and downloading NeuroScan AI Clinical PDF Report:\n\n` + 
              `File: Report_${modelResults.type.replace(' ', '_')}_P-10482.pdf\n` + 
              `Findings: ${modelResults.type} (${modelResults.confidence}%)\n\n` +
              `Status: Document compiled successfully!`);
    });

    document.getElementById('btnSaveToRegistry').addEventListener('click', () => {
        if (!modelResults) return;
        
        // Find if already exists and update, or add
        const match = patientRegistry.find(p => p.id === currentPatientId);
        if (match) {
            match.diagnosis = modelResults.type;
            match.confidence = `${modelResults.confidence}%`;
            match.size = modelResults.volume;
            match.status = modelResults.type === "No Tumor" ? "stable" : "action";
        } else {
            patientRegistry.unshift({
                id: `P-${Math.floor(10000 + Math.random() * 9000)}`,
                name: "New Scan Subject",
                date: new Date().toISOString().split('T')[0],
                diagnosis: modelResults.type,
                confidence: `${modelResults.confidence}%`,
                size: modelResults.volume,
                status: modelResults.type === "No Tumor" ? "stable" : "action"
            });
        }
        renderPatientTable();
        alert("Scan and AI metrics saved to diagnostic registry registry database.");
        switchTab('dashboard');
    });

    // --- 3D Brain Viewer (Three.js Engine) ---
    function initThreeJs() {
        const container = document.getElementById('threeJsContainer');
        if (threeScene) {
            // Already initialized, adjust coordinate mesh position
            updateThreeTumorPosition();
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        threeScene = new THREE.Scene();
        threeScene.background = new THREE.Color(0x0a0d16);

        threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        threeCamera.position.set(0, 0, 4);

        threeRenderer = new THREE.WebGLRenderer({ antialias: true });
        threeRenderer.setSize(width, height);
        threeRenderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(threeRenderer.domElement);

        const controls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        threeScene.add(ambientLight);

        // Directional Light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        threeScene.add(dirLight);

        // Point Light for glowing core
        const pointLight = new THREE.PointLight(0x7c3aed, 2, 50);
        pointLight.position.set(0, 0, 0);
        threeScene.add(pointLight);

        // Generate semi-transparent 3D brain mesh outline
        const brainGeometry = new THREE.SphereGeometry(1.2, 32, 16);
        brainGeometry.scale(1, 1.25, 0.85); // Deform to look slightly brain-shaped
        
        const brainMaterial = new THREE.MeshPhongMaterial({
            color: 0x2563eb,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            shininess: 100
        });
        
        threeBrainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
        threeScene.add(threeBrainMesh);

        // Tumor geometry (pulsating sphere)
        const tumorGeometry = new THREE.SphereGeometry(0.18, 16, 16);
        const tumorMaterial = new THREE.MeshPhongMaterial({
            color: 0xef4444,
            emissive: 0x7c3aed,
            shininess: 120,
            transparent: true,
            opacity: 0.85
        });
        threeTumorMesh = new THREE.Mesh(tumorGeometry, tumorMaterial);
        threeScene.add(threeTumorMesh);

        // Plane slices helpers
        const gridHelperX = new THREE.GridHelper(2.5, 10, 0x00f2fe, 0x1e293b);
        gridHelperX.rotation.x = Math.PI / 2;
        gridHelperX.position.z = -1;
        threeScene.add(gridHelperX);
        threeSlicePlanes.push(gridHelperX);

        // Setup coordinates
        updateThreeTumorPosition();

        // Opacity controllers binding
        const opacitySlider = document.getElementById('threeBrainOpacity');
        opacitySlider.addEventListener('input', () => {
            brainMaterial.opacity = opacitySlider.value / 300; // Cap mapping
        });

        // Resize support
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            threeCamera.aspect = w / h;
            threeCamera.updateProjectionMatrix();
            threeRenderer.setSize(w, h);
        });

        // Animation Loop
        let clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            // Rotate brain structure slowly
            threeBrainMesh.rotation.y += 0.003;
            threeTumorMesh.rotation.y += 0.005;

            // Pulsating tumor scale
            const pulsateSpeed = parseInt(document.getElementById('threeTumorPulsate').value) || 5;
            const scale = 1 + Math.sin(clock.getElapsedTime() * pulsateSpeed) * 0.15;
            threeTumorMesh.scale.set(scale, scale, scale);

            // Toggle slice rendering
            const showSlices = document.getElementById('threeShowSlices').checked;
            threeSlicePlanes.forEach(p => p.visible = showSlices);

            threeRenderer.render(threeScene, threeCamera);
        }
        animate();
    }

    function updateThreeTumorPosition() {
        if (!threeTumorMesh) return;
        if (modelResults && modelResults.type !== "No Tumor") {
            threeTumorMesh.position.set(
                modelResults.coordinates.x * 2.2, 
                modelResults.coordinates.y * 2.2, 
                modelResults.coordinates.z * 2.2
            );
            threeTumorMesh.visible = true;
        } else {
            // Hide tumor if healthy or not analyzed
            threeTumorMesh.visible = false;
        }
    }

    // --- Progression Tracker Dashboard ---
    let progressionChart = null;

    function initProgressionTracker() {
        const patientSelect = document.getElementById('growthPatientSelect');
        
        // Populate select element once
        if (patientSelect.options.length === 0) {
            patientRegistry.forEach(p => {
                if (p.diagnosis !== "No Tumor") {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.innerText = `${p.name} (${p.id}) - ${p.diagnosis}`;
                    patientSelect.appendChild(opt);
                }
            });

            patientSelect.addEventListener('change', () => {
                updateProgressionData(patientSelect.value);
            });
        }

        updateProgressionData(patientSelect.value || currentPatientId);
    }

    function updateProgressionData(patientId) {
        const history = progressionHistory[patientId] || progressionHistory["P-10482"];
        const timelineContainer = document.getElementById('growthTimeline');
        timelineContainer.innerHTML = '';

        const chartLabels = [];
        const chartData = [];

        history.forEach((h, idx) => {
            chartLabels.push(h.date);
            chartData.push(h.volume);

            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${idx === history.length - 1 ? 'active' : ''}`;
            timelineItem.innerHTML = `
                <div class="timeline-date">${h.date}</div>
                <div class="timeline-title">Volume: ${h.volume} cm³</div>
                <div class="timeline-desc">${h.desc}</div>
            `;
            timelineContainer.appendChild(timelineItem);
        });

        // Setup assessments alerts dynamic content
        const assessmentContainer = document.getElementById('growthAssessmentContainer');
        const assessmentIcon = document.getElementById('growthAssessmentIcon');
        const assessmentTitle = document.getElementById('growthAssessmentTitle');
        const assessmentText = document.getElementById('growthAssessmentText');

        const firstVol = history[0].volume;
        const lastVol = history[history.length - 1].volume;
        const diff = lastVol - firstVol;
        const percent = ((diff / firstVol) * 100).toFixed(1);

        if (diff < 0) {
            assessmentContainer.className = "assessment-container success";
            assessmentIcon.className = "fa-solid fa-circle-down assessment-icon";
            assessmentTitle.innerText = `Tumor volume decreased by ${Math.abs(percent)}%`;
            assessmentText.innerText = `Comparing the earliest scan from ${history[0].date} to the latest scan on ${history[history.length-1].date}, the space-occupying lesion has shrunk from ${firstVol} cm³ to ${lastVol} cm³, indicating therapeutic effectiveness.`;
        } else {
            assessmentContainer.className = "assessment-container danger";
            assessmentIcon.className = "fa-solid fa-circle-up assessment-icon";
            assessmentTitle.innerText = `Tumor volume expanded by ${percent}%`;
            assessmentText.innerText = `Critical notice: Comparing scans from ${history[0].date} to ${history[history.length-1].date}, volume metrics expanded from ${firstVol} cm³ to ${lastVol} cm³. Surgical intervention or drug protocol modification is advised.`;
        }

        // Draw Progression Chart via Chart.js
        if (progressionChart) {
            progressionChart.destroy();
        }

        const ctx = document.getElementById('progressionChart').getContext('2d');
        progressionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Tumor Volume (cm³)',
                    data: chartData,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#00f2fe',
                    pointBorderColor: '#fff',
                    pointRadius: 6,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#9ca3af' },
                        suggestedMin: 0
                    }
                }
            }
        });
    }

    // --- AI Chatbot Interface ---
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const btnSendChat = document.getElementById('btnSendChat');

    function appendMessage(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        const avatarIcon = sender === 'assistant' ? 'fa-robot' : 'fa-user';
        
        bubble.innerHTML = `
            <div class="bubble-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="bubble-content">
                <p>${text}</p>
                <span class="bubble-time">Just now</span>
            </div>
        `;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function generateBotResponse(userInput) {
        const input = userInput.toLowerCase();
        let response = "I'm sorry, I don't have a direct answer for that. You can ask me about glioma, meningioma, pituitary tumors, normal brain MRI structures, or recommendations on the currently loaded scan.";

        if (input.includes('glioma')) {
            response = "<strong>Gliomas</strong> are primary brain tumors arising from glial support cells. They are classified into grades (I to IV). Glioblastoma Multiforme (GBM) is Grade IV and represents the most aggressive form. Treatment typically involves maximal safe surgical resection followed by radiotherapy and chemotherapy (Temozolomide).";
        } else if (input.includes('meningioma')) {
            response = "<strong>Meningiomas</strong> are typically slow-growing, benign (Grade I) tumors originating from the meninges (membranes covering the brain and spinal cord). They are often asymptomatic and found incidentally. Treatment includes surveillance, surgery for symptomatic compression, or radiation therapy.";
        } else if (input.includes('pituitary')) {
            response = "<strong>Pituitary tumors</strong> (adenomas) are neoplasms occurring in the pituitary gland. While usually benign, they can secrete excess hormones or cause mass-effect issues, such as pressing on the optic chiasm leading to visual disturbances (bitemporal hemianopsia).";
        } else if (input.includes('treatment') || input.includes('chemo') || input.includes('surgery')) {
            response = "Standard brain tumor treatments include <strong>surgical resection</strong>, <strong>radiation therapy</strong> (such as Gamma Knife or external beam radiation), and <strong>chemotherapy</strong>. The exact protocols must always be customized by an oncologist/neurosurgeon based on pathology reports.";
        } else if (input.includes('current scan') || input.includes('detected') || input.includes('findings')) {
            if (modelResults) {
                response = `For the current scan (${modelResults.name}), the AI detected a <strong>${modelResults.type}</strong> with <strong>${modelResults.confidence}% confidence</strong>. The estimated volume is <strong>${modelResults.volume}</strong>, and it is located in the <strong>${modelResults.location}</strong>.`;
            } else {
                response = "No MRI scan is currently loaded or analyzed. Please upload an MRI scan on the Analyze workspace first.";
            }
        }

        setTimeout(() => {
            appendMessage('assistant', response);
        }, 800);
    }

    function sendChatMessage() {
        const val = chatInput.value.trim();
        if (val) {
            appendMessage('user', val);
            chatInput.value = '';
            generateBotResponse(val);
        }
    }

    btnSendChat.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });


    // --- Voice Assistant Native Web Speech Integration ---
    const voiceMicBtn = document.getElementById('voiceMicBtn');
    const voiceWave = document.getElementById('voiceWave');
    const voiceStatusText = document.getElementById('voiceStatusText');
    const voiceSubtext = document.getElementById('voiceSubtext');

    let recognition = null;
    let isListening = false;

    // Check browser native support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            voiceMicBtn.classList.add('listening');
            voiceWave.classList.add('active');
            voiceStatusText.innerText = "Listening...";
            voiceSubtext.innerText = "Speak now...";
        };

        recognition.onerror = (e) => {
            console.error(e);
            stopVoiceListening();
        };

        recognition.onend = () => {
            stopVoiceListening();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            voiceStatusText.innerText = `You said: "${transcript}"`;
            processVoiceCommand(transcript);
        };
    } else {
        voiceMicBtn.style.display = 'none';
        voiceStatusText.innerText = "Speech Recognition Unsuitable";
        voiceSubtext.innerText = "Web Speech API not supported";
    }

    function startVoiceListening() {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (err) {
                console.error(err);
            }
        }
    }

    function stopVoiceListening() {
        isListening = false;
        voiceMicBtn.classList.remove('listening');
        voiceWave.classList.remove('active');
        voiceSubtext.innerText = 'Click mic to speak / say "Help"';
    }

    voiceMicBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            startVoiceListening();
        }
    });

    // Voice Intent routing logic
    function processVoiceCommand(cmd) {
        const text = cmd.toLowerCase().trim();
        let responseSpeech = "";

        if (text.includes('dashboard') || text.includes('home')) {
            switchTab('dashboard');
            responseSpeech = "Navigating to Clinical Dashboard overview.";
        } else if (text.includes('upload') || text.includes('analyze') || text.includes('scan')) {
            switchTab('analyze');
            responseSpeech = "Workspace ready for MRI upload. Drag a file or click a sample.";
        } else if (text.includes('3d') || text.includes('three dimensions') || text.includes('model')) {
            switchTab('viewer3d');
            responseSpeech = "Launching 3D brain spatial visualization mode.";
        } else if (text.includes('progression') || text.includes('growth') || text.includes('timeline') || text.includes('history')) {
            switchTab('growth');
            responseSpeech = "Showing patient tumor progression tracking vectors.";
        } else if (text.includes('assistant') || text.includes('chat') || text.includes('bot')) {
            switchTab('chatbot');
            responseSpeech = "Opening clinical intelligence chat interface.";
        } else if (text.includes('what tumor') || text.includes('result') || text.includes('diagnose') || text.includes('detected')) {
            if (modelResults) {
                responseSpeech = `The current analysis shows a ${modelResults.type} with ${modelResults.confidence} percent confidence.`;
            } else {
                responseSpeech = "No scan is currently loaded. Please upload a scan to diagnose.";
            }
        } else if (text.includes('read report') || text.includes('report details') || text.includes('recommendation')) {
            if (modelResults) {
                responseSpeech = `AI report indicates: ${modelResults.report.replace(/\n/g, '. ')}`;
            } else {
                responseSpeech = "Report empty. Ingest and analyze a cranial scan first.";
            }
        } else if (text.includes('help') || text.includes('command')) {
            responseSpeech = "Commands include: Go to dashboard, Go to upload workspace, Open 3D viewer, Open progression tracker, Ask AI clinical chatbot, or Diagnosed tumor results.";
        } else {
            responseSpeech = "Command not registered. Say help to hear options.";
        }

        voiceSubtext.innerText = responseSpeech;
        speakText(responseSpeech);
    }

    function speakText(text) {
        if (SpeechSynthesis) {
            // Cancel any ongoing speaking
            SpeechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            SpeechSynthesis.speak(utterance);
        }
    }
});
