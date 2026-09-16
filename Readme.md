# 🏠 CHUD — UTA Housing Discovery Platform

A full-stack housing platform designed to help students at **The University of Texas at Arlington (UTA)** discover, compare, map, rate, and review on-campus and off-campus housing.

🌐 **Live Demo:** https://chud-acm.vercel.app

---

## 📌 Overview

Finding student housing often requires comparing information across multiple websites. **CHUD** brings housing discovery into one platform where UTA students can explore properties, compare housing options, view locations on an interactive map, and share their experiences through ratings and reviews.

The application combines housing search, property comparison, authentication, interactive maps, property profiles, and student reviews into one responsive web application.

---

## ✨ Features

### 🔎 Housing Discovery

- Browse on-campus and off-campus housing
- Search housing options near UTA
- Filter available properties
- View detailed housing profiles
- Explore housing information such as location, features, ratings, and distance from UTA

### ⚖️ Housing Comparison

- Select properties for side-by-side comparison
- Compare housing type and location
- Compare distance from UTA
- Compare ratings and features
- Quickly identify differences between housing options

### 🗺️ Interactive Map

- View housing locations around UTA
- Interactive property markers powered by Mapbox
- Explore both on-campus and off-campus locations
- Open property information from the map
- Visualize the location of housing relative to the university

### ⭐ Ratings & Reviews

- Submit housing reviews
- Rate housing properties
- Read reviews from other users
- Edit your own reviews
- Delete your own reviews
- View property rating information

### 🔐 Authentication

- Create a user account
- Email and password authentication
- Google authentication
- User login and logout
- Password recovery
- Password reset
- Authenticated review management

### 🏆 Top Rated Housing

- Discover highly rated housing options
- View property ratings and review counts
- Quickly access highly reviewed properties

---

## 🛠️ Tech Stack

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend & Database

- **Next.js API Routes**
- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**

### Maps

- **Mapbox GL**

### Deployment & Development

- **Vercel**
- **Git**
- **GitHub**
- **VS Code**

---

## 🏗️ Architecture

```text
                         CHUD
                          │
                    Next.js / React
                          │
          ┌───────────────┼───────────────┐
          │               │               │
       Housing          Reviews          Maps
          │               │               │
     Next.js API      Next.js API      Mapbox GL
          │               │
          └─────── Supabase ─────────────┘
                      │
              PostgreSQL + Auth
```

The frontend is built with **Next.js, React, and TypeScript**.

Housing and review data are stored in **PostgreSQL through Supabase**, while **Supabase Authentication** handles account creation, login, Google authentication, and password recovery.

**Next.js API routes** provide server-side endpoints for application data, while **Mapbox GL** provides interactive geographic visualization of housing locations.

The production application is deployed through **Vercel**.

---

## 📂 Project Structure

```text
CHUD-ACM/
│
├── apps/
│   └── web/
│       │
│       ├── app/
│       │   ├── api/
│       │   │   ├── browse-housing/
│       │   │   └── reviews/
│       │   │
│       │   ├── browse-housing/
│       │   ├── forgot-password/
│       │   ├── housing/
│       │   ├── login/
│       │   ├── map/
│       │   ├── signup/
│       │   ├── top-rated/
│       │   └── write-review/
│       │
│       ├── public/
│       │   ├── off_campus/
│       │   └── on_campus/
│       │
│       ├── scripts/
│       ├── .env.local
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── PROJECT_CHARTER.md
└── Readme.md
```

> `.env.local` is used locally and should not be committed to the repository.

---

## 🚀 Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/datphandp333/CHUD-ACM.git
```

Move into the web application:

```bash
cd CHUD-ACM/apps/web
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a file named:

```text
.env.local
```

inside:

```text
apps/web/
```

Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
```

Replace the example values with your own Supabase and Mapbox credentials.

> ⚠️ Never commit `.env.local`, passwords, private API keys, service-role keys, or other secrets to GitHub.

---

### 4. Start the Development Server

Run:

```bash
npm run dev
```

The application should be available locally at:

```text
http://localhost:3000
```

---

### 5. Create a Production Build

Before deployment, verify that the application builds successfully:

```bash
npm run build
```

---

## 🔐 Authentication

CHUD uses **Supabase Authentication** for user account management.

The authentication system supports:

- Email/password registration
- Email/password login
- Google OAuth
- Password recovery
- Password reset
- User sessions
- Logout

Authentication is also used to associate user activity with the appropriate account and protect user-specific functionality such as review management.

---

## ⭐ Review System

The review system allows authenticated users to share their housing experiences.

Users can:

- Select a housing property
- Submit a rating
- Write a review
- View existing reviews
- Edit their own reviews
- Delete their own reviews

Reviews are stored through the application's Supabase-backed data layer.

---

## 🗺️ Housing Map

CHUD includes an interactive housing map built with **Mapbox GL**.

The map provides a geographic view of housing options around UTA and allows students to visually explore where properties are located.

Housing markers correspond to properties stored in the application's housing data.

---

## 🏠 Housing Data

Housing records contain information used throughout the application, including:

- Property name
- Housing category
- On-campus or off-campus classification
- Address
- Location
- Description
- Property image
- Features
- Tags
- Rating
- Review count
- Distance from UTA
- Latitude
- Longitude

This data powers the browse, map, comparison, review, and property-profile experiences.

---

## 🔍 Browse Housing

The Browse Housing page gives users a centralized interface for discovering housing around UTA.

Users can explore housing listings and narrow their options based on available property information.

Each property can lead to a more detailed housing profile containing additional information about the location.

---

## ⚖️ Housing Comparison

CHUD includes a housing comparison feature designed to make evaluating different properties easier.

Instead of opening multiple listings and manually remembering the differences, users can compare housing information in a side-by-side interface.

The comparison experience can include information such as:

- Housing type
- Location
- Distance from UTA
- Rating
- Features
- Property information

---

## 📱 Responsive Design

CHUD is designed to provide a usable experience across different screen sizes.

The interface uses modern responsive web-development techniques through **React, Next.js, and Tailwind CSS**.

---

## 🔒 Security

CHUD uses authentication and authorization controls to protect account-specific functionality.

Sensitive configuration values are stored using environment variables rather than being hard-coded into the application.

Production environment variables are configured separately from source code during deployment.

Users should never commit files containing private credentials to the repository.

---

## 🎯 Project Goals

CHUD was built to apply practical software engineering concepts to a real student problem.

The project demonstrates experience with:

- Full-stack web development
- Modern React development
- Next.js application architecture
- TypeScript
- REST-style API development
- Authentication and authorization
- Relational database integration
- PostgreSQL
- Supabase
- Interactive mapping
- Responsive UI development
- Git and GitHub collaboration
- Environment configuration
- Cloud deployment

---

## 💡 What I Worked On

My work on CHUD includes development across the full-stack application, including:

- Housing discovery interfaces
- Housing property pages
- Housing comparison functionality
- Interactive Mapbox integration
- Authentication flows
- Google OAuth integration
- Password recovery and reset
- Ratings and reviews
- Review editing and deletion
- Supabase integration
- Housing database integration
- Responsive UI improvements
- Production deployment with Vercel

The project gave me experience working across the **frontend, backend, database, authentication, mapping, and deployment layers** of a production-style web application.

---

## 📸 Application Preview

Screenshots of the application will be added here to demonstrate the primary user experience.

Planned previews include:

- Home page
- Browse Housing
- Housing Details
- Interactive Map
- Housing Comparison
- Ratings & Reviews

---

## 🔮 Future Improvements

Potential future improvements include:

- More advanced housing filters
- Additional housing data
- Improved recommendation features
- Favorites and saved properties
- Personalized housing recommendations
- Enhanced mobile responsiveness
- Improved review analytics
- Additional map functionality
- AI-assisted housing recommendations

---

## 👨‍💻 Developer

### Thanh Phan

Computer Science student at **The University of Texas at Arlington**

Interested in:

- Software Engineering
- Artificial Intelligence
- Full-Stack Development
- Backend Development

GitHub: **@datphandp333**

---

## 🔗 Links

### Live Application

https://chud-acm.vercel.app

### GitHub Repository

https://github.com/datphandp333/CHUD-ACM

### GitHub Profile

https://github.com/datphandp333

---

## 📄 Project Status

🟢 **Active Development**

The application is currently deployed and continues to receive improvements to its housing data, UI, authentication, reviews, mapping, and overall user experience.

---

## 📄 License

This project is intended for **educational and portfolio purposes**.
