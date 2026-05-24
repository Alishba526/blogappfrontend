# Blog App Frontend

Next.js frontend application for the Blog App with modern UI and full authentication.

## 🚀 Live Demo
Frontend: https://blogappfrontend-two.vercel.app

## 📋 Features
- User authentication (Register/Login)
- Create, edit, and delete blog posts
- Upload images for blog posts
- Like/Unlike blog posts
- User profile pages
- Responsive design with Tailwind CSS
- Real-time updates

## 🛠️ Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Context for state management

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file for development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, the `.env.production` file is already configured:

```env
NEXT_PUBLIC_API_URL=https://blogappbackend-ashen.vercel.app/api
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── blog/[id]/         # Single blog page
│   ├── create/            # Create blog page
│   ├── edit/[id]/         # Edit blog page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── profile/[userId]/  # User profile page
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── BlogCard.tsx
│   ├── BlogForm.tsx
│   └── Navbar.tsx
└── lib/                   # Utilities
    ├── api.ts            # API functions
    └── AuthContext.tsx   # Authentication context
```

## 🚀 Deployment on Vercel

### Step 1: Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `Alishba526/blogappfrontend`

### Step 2: Configure Environment Variables
In Vercel project settings, add:

**Required Variable:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
  - Value: `https://blogappbackend-ashen.vercel.app/api`

### Step 3: Deploy
- Vercel will automatically deploy on every push to the main branch
- The `.env.production` file will be used automatically
- Manual redeploy: Go to Deployments → Click "Redeploy"

## 🔗 Connecting Frontend & Backend

### Backend Configuration Required:
Make sure your backend has the following environment variable set on Vercel:

```env
FRONTEND_URL=https://blogappfrontend-two.vercel.app
```

This enables CORS and allows the frontend to communicate with the backend.

## 📱 Pages

- **Home** (`/`) - List of all blog posts
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration
- **Create Blog** (`/create`) - Create new blog post (auth required)
- **Edit Blog** (`/edit/[id]`) - Edit existing blog (auth required)
- **Blog Detail** (`/blog/[id]`) - View single blog post
- **User Profile** (`/profile/[userId]`) - View user's blogs

## 🎨 Features in Detail

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Protected routes for authenticated users
- Auto-redirect on login/logout

### Blog Management
- Rich text content
- Image upload support
- Edit/Delete own blogs
- Like/Unlike functionality

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Loading states
- Error handling
- Toast notifications

## 👨‍💻 Author
Built with ❤️ using Next.js and TypeScript
