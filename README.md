# ENHANCE! - CSI Image Enhancer

"Infinitely zoom into any image with this creative enhancer. See if you can find the easter egg."

This project is a web application that allows users to select a region of an image and use the Google Gemini API to generate a higher-resolution, creatively enhanced version of that area. This process can be repeated, creating an "infinite zoom" effect.

## Features

-   **Infinite Image Zoom**: Select any part of an image to enhance and reveal new details.
-   **AI-Powered Enhancement**: Uses the Gemini API to intelligently interpret and upscale selected image regions.
-   **Custom Image Upload**: Start with the default image or upload your own via drag-and-drop or a file selector.
-   **Navigation History**: Step backward and forward through your enhancement history with Undo and Redo.
-   **Regenerate**: Not happy with an enhancement? Regenerate the current step with a new AI prompt.
-   **GIF Export**: Create and download an animated GIF that showcases your entire zoom journey.
-   **Interactive Canvas**: Zoom and pan the image for precise selections.

## How It Works

1.  **Selection**: The user draws a box or clicks on the image to select an area to enhance.
2.  **Description**: The selected image crop is sent to the Gemini API (`gemini-2.5-flash`) which analyzes the pixels and the enhancement history to generate a descriptive prompt.
3.  **Enhancement**: The original cropped image and the new prompt are sent to the Gemini image editing model (`gemini-2.5-flash-image-preview`).
4.  **Integration**: The model returns a new, high-resolution image. This new image replaces the original, and the user can then select a new area within the newly generated content to continue the process.

## Tech Stack

-   **Frontend**: React, TypeScript
-   **Styling**: Tailwind CSS
-   **AI**: Google Gemini API (`@google/genai`)
-   **GIF Generation**: `gifenc` library

## Project Structure

-   `index.html`: The main entry point of the application.
-   `index.tsx`: Mounts the React application.
-   `App.tsx`: The core component managing state, history, and user interactions.
-   `components/`: Contains all reusable React components (`ImageDisplay`, `StatusBar`, etc.).
-   `utils/`: Contains helper functions for API calls (`serviceEnhance`, `serviceDescribeImage`), image manipulation (`imageUtils`), and GIF creation (`gifGenerator`).
-   `types.ts`: Defines all TypeScript types and interfaces used throughout the application.

---

## Author

**Anurag Shankar Maurya**

-   **Phone**: [+91 8707297564](tel:+918707297564)
-   **Email**: [anuragshankarmaurya@gmail.com](mailto:anuragshankarmaurya@gmail.com)
-   **LinkedIn**: [linkedin.com/in/anurag-shankar-maurya](https://www.linkedin.com/in/anurag-shankar-maurya/)
-   **GitHub**: [github.com/Anurag-Shankar-Maurya](https://github.com/Anurag-Shankar-Maurya)
