# ENHANCE! - CSI Image Enhancer

![\[1\]](https://user-gen-media-assets.s3.amazonaws.com/gemini_images/7dd81a80-f760-40f4-adec-0f4763f30f59.png)

> **"Infinitely zoom into any image with this creative enhancer. See if you can find the easter egg."**

This project is a **cutting-edge web application** that allows users to select a region of an image and use the Google Gemini API to generate a higher-resolution, creatively enhanced version of that area. This process can be repeated, creating an **"infinite zoom"** effect that reveals endless detail and creativity.

---

## ✨ Features

![\[2\]](https://user-gen-media-assets.s3.amazonaws.com/gemini_images/47895735-15f3-4973-81a8-8875fbe7964a.png)

### 🔍 **Infinite Image Zoom**
Select any part of an image to enhance and reveal new details in stunning clarity.

### 🤖 **AI-Powered Enhancement** 
Uses the Gemini API to intelligently interpret and upscale selected image regions with remarkable precision.

### 📁 **Custom Image Upload**
Start with the default image or upload your own via intuitive drag-and-drop or file selector.

### 🔄 **Navigation History**
Step backward and forward through your enhancement history with seamless Undo and Redo functionality.

### 🎯 **Regenerate**
Not happy with an enhancement? Regenerate the current step with a new AI prompt for different results.

### 🎬 **GIF Export**
Create and download an animated GIF that showcases your entire zoom journey in a shareable format.

### 🖱️ **Interactive Canvas**
Zoom and pan the image for precise selections with smooth, responsive controls.

---

## ⚙️ How It Works

![\[3\]](https://user-gen-media-assets.s3.amazonaws.com/gemini_images/525c05db-872a-4701-be7e-3aaa806fbab9.png)

### **1. Selection**
The user draws a box or clicks on the image to select an area to enhance.

### **2. Description** 
The selected image crop is sent to the Gemini API (`gemini-2.5-flash`) which analyzes the pixels and the enhancement history to generate a descriptive prompt.

### **3. Enhancement**
The original cropped image and the new prompt are sent to the Gemini image editing model (`gemini-2.5-flash-image-preview`).

### **4. Integration**
The model returns a new, high-resolution image. This new image replaces the original, and the user can then select a new area within the newly generated content to continue the process.

---

## 🛠️ Tech Stack

![\[4\]](https://user-gen-media-assets.s3.amazonaws.com/gemini_images/10b0557b-0de6-4122-9139-b24874719b8a.png)

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend Framework | Latest |
| **TypeScript** | Type Safety | Latest |
| **Tailwind CSS** | Styling & Design | Latest |
| **Google Gemini API** | AI Enhancement | `@google/genai` |
| **GIF Generation** | Animation Export | `gifenc` library |

---

## 📁 Project Structure

```
📦 CSI Image Enhancer
├── 📄 index.html          # Main entry point
├── 📄 index.tsx           # React application mount
├── 📄 App.tsx             # Core component with state management
├── 📂 components/         # Reusable React components
│   ├── ImageDisplay.tsx   # Image rendering component
│   ├── StatusBar.tsx      # Status display component
│   └── ...               # Additional UI components
├── 📂 utils/             # Helper functions
│   ├── serviceEnhance.ts  # API enhancement calls
│   ├── serviceDescribeImage.ts # Image analysis
│   ├── imageUtils.ts      # Image manipulation utilities
│   └── gifGenerator.ts    # GIF creation logic
└── 📄 types.ts           # TypeScript definitions
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- Google Gemini API key
- Modern web browser

### **Installation**
```bash
# Clone the repository
git clone https://github.com/Anurag-Shankar-Maurya/ai-image-zoom

# Install dependencies
npm install

# Set up environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

### **Usage**
1. Open the application in your browser
2. Upload an image or use the default one
3. Select an area by drawing a selection box
4. Watch as AI enhances your selected region
5. Repeat the process to zoom infinitely
6. Export your journey as an animated GIF

---

## 🎯 Key Benefits

- **🎨 Creative Exploration**: Discover hidden details and artistic possibilities
- **⚡ Real-time Processing**: Fast AI-powered enhancements
- **🔄 Iterative Workflow**: Build upon previous enhancements
- **📱 Responsive Design**: Works seamlessly across all devices
- **🎁 Easter Egg Hunt**: Hidden surprises await discovery

---

## 👨‍💻 Author

![\[5\]](https://user-gen-media-assets.s3.amazonaws.com/gemini_images/022164c9-0be3-410e-9c1a-478bb941734e.png)

**Anurag Shankar Maurya**  
*Full Stack Developer & AI Enthusiast*

### **📞 Get In Touch**

| Contact Method | Details |
|----------------|---------|
| **📧 Email** | [anuragshankarmaurya@gmail.com](mailto:anuragshankarmaurya@gmail.com) |
| **💼 LinkedIn** | [linkedin.com/in/anurag-shankar-maurya](https://www.linkedin.com/in/anurag-shankar-maurya/) |
| **🐙 GitHub** | [github.com/Anurag-Shankar-Maurya](https://github.com/Anurag-Shankar-Maurya) |

---

## 🤝 Contributing

We welcome contributions! Please feel free to:

- 🐛 Report bugs
- 💡 Suggest new features  
- 🔧 Submit pull requests
- 📖 Improve documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support

If you found this project helpful, please consider:
- ⭐ Starring the repository
- 🍴 Forking the project
- 📢 Sharing with others
- 💝 Contributing improvements

---

<div align="center">

**Made with ❤️ by [Anurag Shankar Maurya](https://github.com/Anurag-Shankar-Maurya)**

*Turning pixels into possibilities, one enhancement at a time.*

</div>