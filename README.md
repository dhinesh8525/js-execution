# JavaScript/TypeScript Code Execution Visualizer

A production-ready educational tool that visualizes JavaScript/TypeScript code execution in real-time. Similar to Python Tutor but designed for modern JS/TS with event loop visualization, async behavior, and interactive animations.

## Features

- **Real-time Code Visualization**: Watch your code execute step by step
- **Call Stack Visualization**: See function calls and returns
- **Scope Chain**: Understand variable scoping and closures
- **Memory Heap**: Visualize objects and references
- **Event Loop**: Understand async operations, microtasks, and macrotasks
- **Time Travel**: Step forward, backward, or jump to any execution point
- **Code Examples**: Pre-built examples for closures, recursion, async/await, and more
- **TypeScript Support**: Compile and visualize TypeScript code
- **Share Snippets**: Save and share your code visualizations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React, TailwindCSS, Framer Motion
- **Code Editor**: Monaco Editor
- **State Management**: Zustand
- **Code Parsing**: Babel
- **Sandbox**: Web Workers
- **Database**: PostgreSQL with Prisma

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd js-execution-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start PostgreSQL with Docker:
   ```bash
   docker-compose up -d
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Running Code

1. Write or select example code in the editor
2. Click "Run" or press `Cmd/Ctrl + Enter`
3. Use the playback controls to step through execution

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + Enter` | Run code |
| `Space` | Play/Pause |
| `→` | Step forward |
| `←` | Step backward |
| `R` | Reset |

### Visualization Modes

- **Full**: Shows call stack, scope chain, and heap
- **Stack Only**: Focus on call stack
- **Memory Only**: Focus on scope and heap
- **Event Loop**: Visualize async operations

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── editor/           # Code editor
│   ├── visualizer/       # Visualization panels
│   ├── console/          # Console output
│   ├── controls/         # Playback controls
│   └── layout/           # Layout components
├── engine/               # Execution engine
│   ├── parser/          # Code parsing
│   ├── instrumentation/ # AST transformation
│   ├── runtime/         # Sandbox execution
│   └── execution/       # Step management
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── lib/                 # Utilities
```

## How It Works

1. **Parsing**: Code is parsed into an AST using Babel
2. **Instrumentation**: AST is transformed to inject trace calls
3. **Execution**: Instrumented code runs in a Web Worker sandbox
4. **Collection**: Trace events are collected and processed
5. **Visualization**: Events drive the visualization components

## Example Snippets

The app includes several pre-built examples:

- **Basic Variables**: Variable declarations and assignments
- **Closure Counter**: Understanding closures
- **Factorial**: Recursive function calls
- **Scope Chain**: Variable scoping
- **Hoisting**: Variable and function hoisting
- **Async/Await**: Event loop behavior
- **Promise Chain**: Promise execution order
- **Objects & References**: Heap memory visualization

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/js_visualizer"
```

## License

MIT
