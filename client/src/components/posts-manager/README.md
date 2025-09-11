# Posts Manager - Modular Components

This directory contains the modular components for the Posts Manager feature, refactored from a single large component into smaller, maintainable pieces.

## 📁 Component Structure

```
posts-manager/
├── index.ts                 # Main exports
├── auth-context.tsx         # Authentication context and provider
├── posts-manager.tsx        # Main orchestrating component
├── login-form.tsx          # Login form component
├── loading-screen.tsx      # Loading screen component
├── posts-header.tsx        # Header component
├── posts-list.tsx          # Posts list and controls
├── post-card.tsx           # Individual post card
├── post-form.tsx           # Post creation/editing form
└── category-form.tsx       # Category creation form
```

## 🧩 Components Overview

### 🔐 **AuthContext (`auth-context.tsx`)**
- Manages authentication state globally
- Handles token persistence in localStorage
- Provides login/logout functionality
- Validates tokens automatically

### 📝 **LoginForm (`login-form.tsx`)**
- Clean login interface
- "Remember Me" functionality
- Form validation
- Loading states

### 🔄 **LoadingScreen (`loading-screen.tsx`)**
- Shows during authentication initialization
- Prevents UI flickering
- Consistent loading experience

### 📋 **PostsList (`posts-list.tsx`)**
- Displays posts in a grid layout
- Search functionality
- Pagination controls
- Create/Edit modals

### 🃏 **PostCard (`post-card.tsx`)**
- Individual post display
- Action buttons (Edit, Delete, Publish)
- Image display
- Status badges

### 📝 **PostForm (`post-form.tsx`)**
- Reusable form for creating/editing posts
- Auto-slug generation
- Category selection
- Form validation

### 🏷️ **CategoryForm (`category-form.tsx`)**
- Simple category creation form
- Auto-slug generation
- Form validation

### 🎯 **PostsManager (`posts-manager.tsx`)**
- Main orchestrating component
- Coordinates all sub-components
- Handles API calls and state management
- Authentication flow control

## 🚀 Usage

```tsx
import { AuthProvider } from './posts-manager/auth-context';
import PostsManager from './posts-manager/posts-manager';

// Wrap with AuthProvider for authentication context
<AuthProvider>
  <PostsManager />
</AuthProvider>
```

## ✨ Benefits of Modular Structure

### 🔧 **Maintainability**
- Each component has a single responsibility
- Easier to test individual components
- Clear separation of concerns

### 🔄 **Reusability**
- Components can be reused in other parts of the app
- Form components are generic and flexible
- Authentication context can be used app-wide

### 🐛 **Debugging**
- Smaller components are easier to debug
- Clear component boundaries
- Isolated state management

### 👥 **Team Development**
- Multiple developers can work on different components
- Reduced merge conflicts
- Clear component ownership

### 📈 **Scalability**
- Easy to add new features
- Components can be extended independently
- Better performance with component-level optimizations

## 🎨 **Theme Support**

All components use theme-aware CSS classes:
- `bg-background`, `text-foreground`
- `bg-card`, `border-border`
- `text-muted-foreground`
- Automatic dark/light mode support

## 🔐 **Authentication Features**

- **Persistent Login**: Remembers user sessions
- **Token Validation**: Automatic token refresh/validation
- **Secure Logout**: Clears all stored data
- **Session Management**: Handles expired tokens gracefully

## 📱 **Responsive Design**

All components are fully responsive:
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

---

**Happy coding! 🎉**
