# StoryForge

AI-Powered Story Generation & World Builder with MVC Architecture

## 🏗️ Architecture

StoryForge follows a strict **MVC + SOLID** architecture:

```
storyforge/
├── src/
│   ├── models/           # Data models (Story, Element, Relationship)
│   ├── controllers/      # Business logic (StoryController, ElementController)
│   ├── services/         # External services (Storage, AI, Export)
│   ├── contexts/         # React state management
│   ├── templates/        # Reusable view templates
│   ├── components/       # UI components
│   │   ├── common/       # Shared components (Modal, Icons, Sidebar)
│   │   └── panels/       # Page-level components
│   ├── utils/            # Helpers and constants
│   ├── hooks/            # Custom React hooks
│   └── styles/           # CSS styles (separate file)
├── api/                  # Vercel serverless functions
└── public/               # Static assets
```

### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Models** | Data structures, validation, factories | `createElement()`, `validateStory()` |
| **Controllers** | Business logic, orchestration | `StoryController.addChapter()` |
| **Services** | External I/O (API, storage, export) | `StorageService.save()`, `AIService.generate()` |
| **Templates** | Reusable view structures | `PageTemplate`, `FormFields`, `CardTemplates` |
| **Components** | UI rendering, user interaction | `EditorPanel`, `Modal`, `Sidebar` |
| **Contexts** | State management, action dispatch | `StoryContext`, `useStory()` |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (optional, uses localStorage fallback)
- Anthropic API key (for AI features)

### Installation

```bash
# Clone and install
git clone <your-repo>
cd storyforge
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Start development
npm run dev
```

### Environment Variables

```env
# Required for AI features
ANTHROPIC_API_KEY=sk-ant-api-...

# Optional - Supabase (uses localStorage if not set)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📋 Features

### Story Management
- **Create** stories from an idea (AI-generated) or start blank
- **Edit** story details (title, genre, tone, setting, synopsis)
- **Core change detection** - prompts for regeneration when genre/tone changes

### Elements
- **Characters** - name, role, description, traits, goals, backstory
- **Antagonists** - name, description, motivation, methods, weakness
- **Locations** - name, type, description, atmosphere, significance
- **Story Arcs** - name, type, description, start/end points, stakes
- **Themes** - name, description, manifestation, resolution

### Visual Relationship Editor
- Drag-and-drop to create relationships
- 10 relationship types (ally, enemy, family, romantic, mentor, rival, etc.)
- Click connection midpoint to delete
- Color-coded lines by relationship type

### AI Continuation System
- **5 generation modes**: Continue, New Scene, Develop Elements, Plot Twist, Add Conflict
- **3 distinct options** generated per request
- Each option shows: title, preview, tone, impact level
- Automatically creates version snapshot before applying

### Version History
- Auto-snapshots before AI changes
- Manual version creation
- Max 3 versions retained
- Restore to previous versions

### Export
- **Markdown** - Full structured export
- **RTF** - Word-compatible
- **PDF** - Browser print dialog

## 🔧 Customization

### Adding a New Element Type

1. Add to `src/models/Element.js`:
```javascript
export const ELEMENT_TYPES = {
  // ... existing types
  magicSystem: {
    id: 'magicSystem',
    label: 'Magic System',
    plural: 'Magic Systems',
    icon: 'Sparkles',
    color: '#9B8AC4',
    fields: ['name', 'rules', 'limitations', 'source'],
    requiredFields: ['name'],
  },
};
```

2. Add form fields in `ElementsPanel.jsx`

3. Update navigation in `Sidebar.jsx`

### Adding a New Relationship Type

Add to `src/models/Relationship.js`:
```javascript
export const RELATIONSHIP_TYPES = [
  // ... existing types
  { id: 'protects', label: 'Protects', color: '#5B8E6B', lineStyle: 'solid' },
];
```

### Adding a New Generation Mode

Add to `src/utils/constants.js`:
```javascript
export const GENERATION_MODES = [
  // ... existing modes
  { 
    id: 'flashback', 
    label: 'Flashback', 
    description: 'Add a flashback scene',
    icon: 'Clock',
  },
];
```

Then update `api/continue.js` with the mode prompt.

## 🗄️ Database Setup (Supabase)

If using Supabase for persistence:

```sql
-- Stories table
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);
```

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - ANTHROPIC_API_KEY
# - VITE_SUPABASE_URL (optional)
# - VITE_SUPABASE_ANON_KEY (optional)
```

## 📁 File Structure Details

### Models
- `Story.js` - Story structure, chapters, versions
- `Element.js` - Element types, validation
- `Relationship.js` - Relationship types, validation

### Controllers
- `StoryController.js` - Story CRUD, chapters, AI integration
- `ElementController.js` - Element CRUD, search
- `RelationshipController.js` - Relationship CRUD

### Services
- `supabase.js` - Supabase client setup
- `StorageService.js` - Persistence (Supabase/localStorage)
- `AIService.js` - AI API calls
- `ExportService.js` - Document export

### Templates
- `PageTemplates.jsx` - Page layouts
- `FormFields.jsx` - Form inputs
- `CardTemplates.jsx` - Card displays

### Components
- `common/` - Icons, Modal, Sidebar
- `panels/` - OverviewPanel, EditorPanel, ElementsPanel, etc.

## 📝 License

MIT
