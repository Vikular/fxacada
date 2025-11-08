# Web App Project

This project is a web application that utilizes a Supabase backend for data management. It is designed to be simple and easy to deploy on GitHub Pages.

## Project Structure

```
web-app-project
├── public
│   ├── index.html        # Main HTML document
│   ├── css
│   │   └── styles.css    # Styles for the web application
│   └── js
│       └── main.js       # Main JavaScript code
├── src
│   ├── config
│   │   └── supabase.js   # Supabase client configuration
│   ├── api
│   │   └── index.js      # API calls to Supabase
│   └── utils
│       └── helpers.js    # Utility functions
├── .github
│   └── workflows
│       └── deploy.yml    # GitHub Actions workflow for deployment
├── .gitignore             # Files and directories to ignore by Git
└── README.md              # Project documentation
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/web-app-project.git
   cd web-app-project
   ```

2. **Install dependencies** (if any):
   This project does not require any dependencies as it is built with plain HTML, CSS, and JavaScript.

3. **Set up Supabase**:
   - Create a Supabase account and a new project.
   - Configure your Supabase settings in `src/config/supabase.js`.

4. **Run the application**:
   Open `public/index.html` in your web browser to view the application.

## Deployment

This project is set up for deployment on GitHub Pages. The deployment process is automated using GitHub Actions. 

1. Push your changes to the `main` branch.
2. The GitHub Actions workflow defined in `.github/workflows/deploy.yml` will automatically build and deploy the application to GitHub Pages.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.