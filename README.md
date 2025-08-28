# KiitSaathi

KiitSaathi is a comprehensive web application designed to simplify and enhance campus life for students at KIIT University. From academic support to social activities and essential services, KiitSaathi aims to be the go-to platform for all student needs, fostering a more connected and efficient campus environment.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

KiitSaathi offers a wide range of functionalities to support students throughout their academic journey and daily campus life:

*   **Book Buyback & Listings**:
    *   **Sell Used Books**: Students can easily list their used textbooks and study materials for sale, providing a convenient way to declutter and earn some money.
    *   **Buy Pre-loved Books**: Access a marketplace of affordable, pre-owned books from fellow students, making essential study materials more accessible.
    *   **Semester Book Management**: Tools to help students manage their book requirements for current and upcoming semesters.

*   **Academic Support**:
    *   **Handwritten Assignments Submission**: A streamlined process for submitting handwritten assignments, potentially including features for scanning and digital submission.
    *   **Skill-Enhancing Sessions**: Information and booking for workshops and sessions designed to boost academic and professional skills.
    *   **Study Material Exchange**: A platform for sharing and accessing study notes, past papers, and other academic resources.

*   **Campus Services & Utilities**:
    *   **Printout On-Demand**: Convenient service for students to request and receive printouts, saving time and effort.
    *   **Carton Transfer**: Facilitates the transfer of belongings, useful for students moving between hostels or during breaks.
    *   **Campus Tour Booking**: Enables prospective and new students to book guided tours of the university campus.

*   **Community & Social Engagement**:
    *   **Fest Announcements**: Stay updated with the latest news and schedules for campus festivals and cultural events.
    *   **Celebrations Management**: Tools or information related to organizing and participating in campus celebrations.
    *   **Meetups & Group Activities**: A platform to discover and organize student meetups and group study sessions.
    *   **KIIT Societies Hub**: Information and engagement opportunities with various student societies and clubs.
    *   **Sports Events Hub**: Centralized information for sports events, fixtures, and participation.
    *   **Senior Connect**: A mentorship or networking feature to connect junior students with seniors for guidance and support.

*   **Essential Tools**:
    *   **Lost and Found**: A system to report and find lost items on campus.
    *   **Split Saathi (Expense Splitter)**: Helps students easily split expenses among friends for group activities or shared living.
    *   **Interview Deadlines Tracker**: A tool to keep track of important interview dates and application deadlines.
    *   **Chatbot Assistant**: An AI-powered chatbot to answer common student queries and provide instant support.
    *   **Notification Bell**: Real-time notifications for important updates, announcements, and service statuses.

*   **User Experience**:
    *   **Intuitive User Interface**: Designed for ease of use and seamless navigation.
    *   **Responsive Design**: Optimized for various devices, including desktops, tablets, and mobile phones.
    *   **Secure Authentication**: Robust user authentication and authorization powered by Supabase.

## Technologies Used

KiitSaathi is built with a modern and robust technology stack:

*   **Frontend**:
    *   **React**: A declarative, component-based JavaScript library for building user interfaces.
    *   **Vite**: A fast and opinionated build tool that provides a lightning-fast development experience.
    *   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
    *   **Shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, providing accessible and customizable UI elements.
    *   **React Hook Form**: For efficient and flexible form management with validation.
    *   **Zod**: A TypeScript-first schema declaration and validation library, used for form validation.
    *   **Lucide React**: A collection of beautiful and customizable SVG icons.

*   **Backend & Database**:
    *   **Supabase**: An open-source Firebase alternative providing a PostgreSQL database, authentication, instant APIs, and serverless functions.
        *   **Supabase Functions**: Used for server-side logic, such as sending contact emails.

*   **Development Tools**:
    *   **Git**: Distributed version control system.
    *   **GitHub**: Platform for hosting and collaborating on code.
    *   **ESLint**: Pluggable JavaScript linter for identifying and reporting on patterns found in ECMAScript/JavaScript code.
    *   **Prettier**: An opinionated code formatter.

## Setup Instructions

To get a local copy of KiitSaathi up and running on your machine, follow these steps:

1.  **Prerequisites**:
    *   Node.js (v18 or higher)
    *   npm (v9 or higher) or Yarn (v1.22 or higher) or Bun (v1.0 or higher)
    *   Git

2.  **Clone the repository**:
    ```bash
    git clone https://github.com/adityash8997/kiitsaathi.git
    cd kiitsaathi
    ```

3.  **Install dependencies**:
    Choose your preferred package manager:
    ```bash
    # Using npm
    npm install

    # Using Yarn
    yarn install

    # Using Bun
    bun install
    ```

4.  **Set up environment variables**:
    Create a `.env` file in the root directory of the project. This file will store your Supabase credentials.
    ```plaintext
    VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
    VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"
    VITE_SUPABASE_URL="your_supabase_url"
    ```
    *   You can find these values in your Supabase project settings under "API".
    *   The `VITE_` prefix is necessary for Vite to expose these variables to the client-side code.

5.  **Run the development server**:
    Start the application in development mode:
    ```bash
    # Using npm
    npm run dev

    # Using Yarn
    yarn dev

    # Using Bun
    bun dev
    ```

6.  **Open your browser**:
    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use). Open this URL in your web browser to see KiitSaathi in action.

## Environment Variables

The following environment variables are crucial for the application's connection to Supabase:

*   `VITE_SUPABASE_PROJECT_ID`: Your unique Supabase project identifier.
*   `VITE_SUPABASE_PUBLISHABLE_KEY`: The public API key for your Supabase project. This key is safe to expose in your client-side code.
*   `VITE_SUPABASE_URL`: The base URL for your Supabase project's API.

**Important**: Do not commit your `.env` file to version control. It is already included in `.gitignore` to prevent accidental exposure of sensitive keys.

## Project Structure

The project follows a standard React application structure with clear separation of concerns:

```
kiitsaathi1/
├── public/                 # Static assets (images, favicon)
├── src/
│   ├── assets/             # Images and other media
│   ├── components/         # Reusable UI components (e.g., Navbar, Footer, specific feature components)
│   │   └── ui/             # Shadcn/ui components (accordion, button, card, etc.)
│   ├── hooks/              # Custom React hooks for logic encapsulation (e.g., useAuth, useBookBuyback)
│   ├── integrations/       # Third-party service integrations (e.g., Supabase client setup)
│   ├── lib/                # Utility functions
│   ├── pages/              # Top-level components representing different routes/views (e.g., Index, Auth, BookBuyback)
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point for the React application
│   └── index.css           # Global styles
├── supabase/               # Supabase related configurations, functions, and migrations
│   ├── functions/          # Supabase Edge Functions (e.g., send-contact-email)
│   ├── migrations/         # Database migration files
│   └── config.toml         # Supabase CLI configuration
├── .env                    # Environment variables (local, not committed)
├── .gitignore              # Specifies intentionally untracked files to ignore
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration for Tailwind CSS
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build tool configuration
└── README.md               # Project README file
```

## Contributing

We welcome contributions to KiitSaathi! If you're interested in improving the platform, please follow these guidelines:

1.  **Fork the repository**: Click the "Fork" button at the top right of this page.
2.  **Clone your forked repository**:
    ```bash
    git clone https://github.com/adityash8997kiitsaathi.git
    cd kiitsaathi
    ```
3.  **Create a new branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    (e.g., `feature/add-event-calendar` or `bugfix/fix-login-issue`)
4.  **Make your changes**: Implement your feature or bug fix.
5.  **Commit your changes**: Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new event calendar feature"
    ```
    (or `fix: Resolve login authentication bug`)
6.  **Push to your branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Open a Pull Request**: Go to the original repository on GitHub and open a new pull request from your forked branch. Provide a detailed description of your changes.

Please ensure your code adheres to the existing coding style and passes all linting checks.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---
