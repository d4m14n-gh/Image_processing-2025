# Image Processing Course Support

<img width="2560" height="1392" alt="image" src="https://github.com/user-attachments/assets/1c4e32f5-9a95-48c5-bfa4-d076ac7c2ce9" />


This project is an educational web application designed to support the teaching and learning of image processing concepts. Built with Angular and Angular Material, it provides interactive visualizations and tools for exploring various image processing algorithms and techniques. Key features include bitmap editing, step-by-step animation of convolutional and median filters, morphological operations, histogram analysis, and Hough transform visualization. The application allows users to experiment with different parameters, observe algorithm behavior in real time, and gain a deeper understanding of fundamental image processing operations. Its modular structure and user-friendly interface make it suitable for both classroom demonstrations and individual study.

## Tech stack
- Angular 19 + Angular Material
- Chart.js for charts
- TypeScript, RxJS

## Prerequisites

Make sure your environment meets the following requirements:

| Component | Recommended version | Check       |
|----------:|---------------------|-------------|
| Node.js   | v20.18.0 (LTS)      | `node -v`   |
| npm       | 10.x or higher      | `npm -v`    |

## Quick start (dev)

From the app folder:

```powershell
cd image-processing-lecture-support
npm install
npm start
```

This starts the dev server with live reload at http://localhost:4200/.

## Build (production)

```powershell
cd image-processing-lecture-support
npm install
npm run build -- --configuration production
```

If the app will be deployed under a subpath (e.g., GitHub Pages at https://d4m14n-gh.github.io/Image_processing-2025/), set the base href:

```powershell
npm run build -- --configuration production --base-href "/Image_processing-2025/"
```

The build output is written to `dist/image-processing-lecture-support/browser`.

## Scripts

Run from `image-processing-lecture-support`:

- `npm start` – start dev server
- `npm run build` – production build
- `npm run watch` – dev build in watch mode
- `npm run compodoc` – generate API docs to `public/docs`


## 👥 Authors
- [@d4m14n-gh](https://github.com/d4m14n-gh)


## ⚖️ License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
