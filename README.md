# ErpanOmer's Personal Website

![Status](https://img.shields.io/badge/Status-Active-success)
![Astro](https://img.shields.io/badge/Astro-v5-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-blue)

Welcome to the source code of my personal website! This project is a portfolio website built to showcase my skills, projects, and blog posts as a Frontend Engineer.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - A web framework for building content-driven websites.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- **Deployment**: [GitHub Pages](https://pages.github.com/) - Hosted directly from this repository.

## 📂 Project Structure

```text
/
├── public/       # Static assets
├── src/
│   ├── components/ # Reusable UI components
│   ├── layouts/    # Page layouts (BaseLayout, etc.)
│   ├── pages/      # Astro pages (routes)
│   └── images/     # Project images
├── astro.config.mjs # Astro configuration
└── tailwind.config.mjs # Tailwind CSS configuration
```

## 🛠️ Development

To run this project locally, follow these steps:

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Start the development server**:

    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:4321`.

3.  **Build for production**:

    ```bash
    npm run build
    ```

    This command will generate a static version of the site in the `dist/` folder.

4.  **Preview the production build**:

    ```bash
    npm run preview
    ```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
