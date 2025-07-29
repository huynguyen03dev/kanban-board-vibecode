# Kanban Board MVP

A minimal viable product (MVP) Kanban board application built with modern web technologies.

## 🚀 Features

- **Drag & Drop**: Smooth drag and drop functionality between columns using @dnd-kit
- **Task Management**: Add, edit, and delete tasks with inline editing
- **Database Persistence**: All data persists in PostgreSQL database
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean interface using Tailwind CSS and shadcn/ui components
- **Real-time Updates**: Instant visual feedback during interactions
- **Error Handling**: Comprehensive error handling with toast notifications

## 🛠️ Technology Stack

- **Next.js 15**: Latest version with TypeScript support
- **PostgreSQL**: Robust relational database for data persistence
- **Prisma**: Modern ORM for database operations
- **Docker**: Containerized database setup
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality component library
- **@dnd-kit**: Modern drag and drop toolkit
- **TypeScript**: Type-safe development
- **React**: Component-based UI library

## 📋 Kanban Columns

The board includes three default columns:
- **To Do**: Tasks that need to be started
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

## 🎯 Core Functionality

### Task Operations
- **Add Tasks**: Click "Add Task" button in any column
- **Edit Tasks**: Click the edit icon or double-click task title for inline editing
- **Delete Tasks**: Click the trash icon to remove tasks
- **Move Tasks**: Drag and drop tasks between columns

### Visual Feedback
- Hover effects on interactive elements
- Smooth animations during drag operations
- Color-coded columns for easy identification
- Responsive layout that adapts to screen size

## 🚀 Getting Started

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd app-test
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env
   ```

3. **Start Database**
   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database Setup
For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

## 📱 Responsive Design

The application is fully responsive and provides an optimal experience across devices:
- **Desktop**: Horizontal column layout with full drag and drop functionality
- **Mobile**: Vertical column layout with touch-friendly interactions

## 🎨 Design Features

- **Color-coded Columns**: Each column has a distinct color theme
- **Smooth Animations**: Transitions and hover effects for better UX
- **Modern Typography**: Clean, readable fonts
- **Consistent Spacing**: Well-structured layout with proper spacing
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🔧 Development

The project structure follows Next.js 15 conventions:
- `src/app/`: App router pages
- `src/components/`: Reusable React components
- `src/hooks/`: Custom React hooks
- `src/types/`: TypeScript type definitions

## 📦 Key Components

- **KanbanBoard**: Main board container with drag and drop context
- **KanbanColumn**: Individual column component
- **TaskCard**: Individual task card with edit/delete functionality
- **useKanbanBoard**: Custom hook for state management

## 🎯 Future Enhancements

This MVP provides a solid foundation for additional features:
- User authentication
- Data persistence (database integration)
- Task priorities and due dates
- Team collaboration features
- Advanced filtering and search
- Custom column creation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
