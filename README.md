# JavaScript/TypeScript Code Execution Visualizer

A production-ready educational tool that visualizes JavaScript/TypeScript code execution in real-time. Similar to Python Tutor but designed for modern JS/TS with **dual-mode visualization** for both event loop behavior and data structures/algorithms.

## Features

### Dual-Mode Intelligent Visualization

The visualizer automatically detects the type of code you're writing and switches between two visualization modes:

#### JS Runtime Mode (Event Loop)
- **Call Stack Visualization**: See function calls and returns in real-time
- **Web APIs Panel**: Track active timers and async operations
- **Task Queue**: Visualize macrotask scheduling and execution
- **Microtask Queue**: Understand Promise resolution order
- **Event Loop Diagram**: See the current phase of the event loop
- **Connection Arrows**: Animated arrows showing task flow

#### DSA Mode (Algorithms)
- **Array Visualizer**: Bar chart with color-coded operations (comparing, swapping, sorted)
- **Recursion Tree**: Hierarchical view of recursive function calls
- **Variables Panel**: Track variable changes with previous values
- **Algorithm Metrics**: Count comparisons, swaps, and recursion depth
- **Pointer Indicators**: Visual markers for indices (i, j, left, right, mid)

### Core Features
- **Auto Mode Detection**: Automatically selects the best visualization mode
- **Manual Override**: Toggle between modes as needed
- **Time Travel**: Step forward, backward, or jump to any execution point
- **Playback Controls**: Play, pause, speed adjustment
- **Code Examples**: Pre-built examples for async patterns, sorting, searching, and more
- **Step Explanations**: Learn what's happening at each step

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

The visualizer automatically detects the appropriate mode based on code patterns:

#### JS Runtime Mode
Best for code with:
- `setTimeout`, `setInterval`
- `Promise`, `async/await`
- `fetch`, event listeners
- Callback patterns

#### DSA Mode
Best for code with:
- Sorting algorithms (bubble, merge, quick sort)
- Searching algorithms (binary search)
- Recursive functions (fibonacci, factorial)
- Array manipulation with loops

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx           # Main page (mode-aware rendering)
│   └── layout.tsx         # Root layout
├── components/
│   ├── controls/          # Mode selector, playback controls
│   ├── panels/            # Visualization panels
│   │   ├── CallStackPanel.tsx        # JS: Call stack
│   │   ├── WebApisPanel.tsx          # JS: Web APIs
│   │   ├── TaskQueuePanel.tsx        # JS: Macrotask queue
│   │   ├── MicrotaskQueuePanel.tsx   # JS: Microtask queue
│   │   ├── ArrayVisualizerPanel.tsx  # DSA: Array visualization
│   │   ├── RecursionTreePanel.tsx    # DSA: Recursion tree
│   │   ├── VariablesPanel.tsx        # DSA: Variables
│   │   ├── AlgorithmMetricsPanel.tsx # DSA: Metrics
│   │   └── ...                       # Shared panels
│   └── visualizer/        # Connection arrows, etc.
├── engine/
│   ├── detector/          # Mode detection
│   │   └── ModeDetector.ts           # Code pattern analysis
│   └── simulator/         # Execution engines
│       ├── types.ts                  # Type definitions
│       ├── EventLoopEngine.ts        # JS Runtime simulation
│       ├── DSAExecutionEngine.ts     # DSA algorithm simulation
│       └── ...
├── stores/
│   └── executionStore.ts  # Mode-aware state management
├── docs/                  # Documentation
│   ├── DUAL_MODE_ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DSA_VISUALIZATION.md
└── lib/                   # Utilities and constants
```

## How It Works

### Mode Detection
1. **Pattern Analysis**: Code is analyzed for JS runtime patterns (setTimeout, Promise) and DSA patterns (array swaps, recursion)
2. **Confidence Scoring**: Each pattern contributes to a confidence score
3. **Mode Selection**: The mode with higher confidence is selected (or use manual override)

### JS Runtime Mode
1. **Parsing**: Code is parsed into an AST using Babel
2. **Analysis**: Operations are identified (timers, promises, function calls)
3. **Simulation**: Event loop is simulated with correct semantics
4. **Visualization**: Call stack, queues, and timers are visualized

### DSA Mode
1. **Instrumentation**: Code is transformed to inject trace calls
2. **Execution**: Instrumented code runs in sandboxed environment
3. **Tracing**: Array operations, comparisons, and recursion are captured
4. **Visualization**: Arrays, variables, and metrics are visualized

## Example Snippets

The app includes pre-built examples for both modes:

### JS Runtime Examples
- **Event Loop Demo**: Classic setTimeout vs Promise ordering
- **Promise Chain**: Promise resolution and chaining
- **Closure Counter**: Understanding closures

### DSA Examples
- **Binary Search**: Efficient sorted array search (O(log n))
- **Bubble Sort**: Simple comparison-based sorting (O(n²))
- **Merge Sort**: Divide and conquer sorting (O(n log n))
- **Quick Sort**: Efficient partitioning sort (O(n log n))
- **Fibonacci**: Recursive sequence generation
- **Factorial**: Recursive multiplication
- **Two Sum**: Hash map problem solving
- **Linked List**: List traversal patterns

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
