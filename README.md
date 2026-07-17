# 🧠 NeuroScan AI – Advanced Brain Tumor Analysis Platform

Welcome to **NeuroScan AI**! A premium, interactive, and responsive web application designed for radiologists, neurosurgeons, and clinical researchers to detect, classify, and segment brain tumors from MRI scans, visualize them in 3D, and track progression over time.

This project features a fully integrated **AI Clinical Assistant** that greets you with a personalized voice greeting (tailored for Kiran), a interactive **3D Brain Viewer** for surgical pathway planning, a longitudinal **Tumor Progression Tracker**, a multi-mode **Diagnostic Viewer** (MRI, Grad-CAM, and Segmentation), and automated **Clinical Report Generation** for patient registries.

---

## ✨ Features

### 1. 🎙️ Voice Assistant & AI Clinical Helper
* **Personalized Welcome**: Welcomes user "Kiran" on startup using the Web Speech API with an overview of the platform's diagnostic modules.
* **Interactive Voice Widget**: Features sidebar voice-wave animation controls and microphone buttons to simulate natural vocal queries.
* **Clinical Chatbot**: Interactive assistant specialized in neuro-oncology to answer questions regarding tumor types (Glioma, Meningioma, Pituitary), symptoms, and treatment guidelines.

### 2. 🔬 Real-Time MRI Analysis & Explainable AI
* **Multi-Class Classification**: Identifies Glioma, Meningioma, Pituitary Adenoma, or Healthy Brain scans with up to 99.1% diagnostic confidence.
* **Multi-Mode Diagnostic Viewer**: Toggle instantly between the raw MRI scan, Grad-CAM (Explainable AI) heatmap overlays, and precise tumor segmentation masks.
* **Client-Side Ingestion Engine**: An intelligent fallback pixel-luminance analysis algorithm that detects hyperintense space-occupying contrast lesions dynamically when the backend is offline.

### 3. 📦 3D Volumetric Brain Viewer
* **Interactive 3D Brain Visualizer**: Leverages Three.js to render an anatomical brain mesh overlayed with 3D coordinate centroids of identified tumors.
* **Spatial Controls**: Allows real-time adjustments of brain mesh opacity, tumor pulsing animation speed, and 3D MRI planar slice slicing.
* **Surgical Path Aid**: Maps coordinate positions (X, Y, Z centroids) to assist neurosurgical pathway planning.

### 4. 📊 Tumor Progression Tracker
* **Longitudinal Patient Scans**: Monitor specific patient records over sequential dates to evaluate tumor contraction or expansion.
* **Volume Growth Vector**: Uses Chart.js line charts to plot historical tumor volumes, calculating percentage decreases (e.g., tracking response to chemotherapy).
* **Clinical Assessment Summaries**: Automated textual summaries indicating progress, medication response, or recommended surgical windows.

### 5. 📄 Automated Clinical Reports & Registry
* **Structured Medical Findings**: Computes tumor width, height, surface area, volumetric size, and anatomical locations (e.g., Sellar Region, Frontal Lobe).
* **Registry Ingestion**: Instantly updates patient records in the local diagnostic database log directly from the analysis window.
* **PDF Report Builder**: One-click mock generation of professional PDF diagnostic reports containing tumor measurements and recommendation texts.

---

## 🛠️ Technology Stack

* **Frontend**: Semantic HTML5, Custom CSS3 (with responsive layouts, CSS variables, glassmorphic card overlays, custom scrollbars, and dark/light themes), Vanilla JavaScript (ES6+).
* **Libraries**:
  * [Three.js](https://threejs.org/) (Volumetric 3D mesh rendering)
  * [OrbitControls.js](https://threejs.org/docs/#examples/en/controls/OrbitControls) (3D rotation, panning, and zoom controls)
  * [Chart.js](https://www.chartjs.org/) (Volumetric progression line graphs)
  * [FontAwesome](https://fontawesome.com/) (Clinical and dashboard iconography)
  * Web Speech API (Voice greeting engine and speech synthesis)

---

## 🚀 Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/rkiranmayisai/Brain-Tumor-Classification.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Brain-Tumor-Classification
   ```
3. Open `index.html` directly in your web browser, or serve it using a lightweight local server:
   * **Python**: `python -m http.server 8000`
   * **Node.js**: `npx serve`
