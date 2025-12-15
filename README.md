# Bar App - Security Module Frontend

React TypeScript application for managing the security module of Bar App.

## Features

- **CRUD Operations** for all security entities:
  - Módulos (Modules)
  - Formularios (Forms)
  - Acciones (Actions)
  - Grupos (Groups)
  - Usuarios (Users)

- **Role-based Access Control**:
  - Only admin users can remove users
  - Only superadmin can remove any users

- **Modern UI** built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
BarApp/
├── src/
│   ├── components/     # Reusable components (Modal, Layout)
│   ├── contexts/       # React contexts (AuthContext)
│   ├── pages/          # Page components (Dashboard, CRUD pages)
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## API Endpoints

The frontend expects the following REST endpoints:

- `GET /modulos` - List all modules
- `POST /modulos` - Create module
- `PUT /modulos/:id` - Update module
- `DELETE /modulos/:id` - Delete module

- `GET /formularios` - List all forms
- `POST /formularios` - Create form
- `PUT /formularios/:id` - Update form
- `DELETE /formularios/:id` - Delete form

- `GET /acciones` - List all actions
- `POST /acciones` - Create action
- `PUT /acciones/:id` - Update action
- `DELETE /acciones/:id` - Delete action

- `GET /grupos` - List all groups
- `POST /grupos` - Create group
- `PUT /grupos/:id` - Update group
- `DELETE /grupos/:id` - Delete group

- `GET /users` - List all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Authentication

The app uses a simple authentication context. In a production environment, you should:

1. Implement proper JWT token handling
2. Store tokens securely
3. Add token refresh logic
4. Implement proper logout functionality

Currently, the auth context stores user role in localStorage. You can set a user role by modifying the `AuthContext` or implementing a login page.

## Notes

- The backend server should be running on `http://localhost:3000`
- The Vite dev server proxies API requests from `/api` to `http://localhost:3000`
- Make sure CORS is properly configured on your backend

