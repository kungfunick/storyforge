/**
 * Application Constants
 * ============================================================================
 * 
 * @description Central configuration and constants
 * @module utils/constants
 */

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  STORY: 'storyforge_story',
  USER_SETTINGS: 'storyforge_settings',
  AUTH_TOKEN: 'storyforge_auth',
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  GENERATE: '/api/generate',
  CONTINUE: '/api/continue',
  REGENERATE: '/api/regenerate',
};

/**
 * AI Generation modes
 */
export const GENERATION_MODES = {
  CONTINUE: {
    id: 'continue',
    label: 'Continue Story',
    description: 'Continue from where the story left off',
    icon: 'Play',
  },
  SCENE: {
    id: 'scene',
    label: 'New Scene',
    description: 'Start a new scene with a fresh perspective',
    icon: 'Film',
  },
  DIALOGUE: {
    id: 'dialogue',
    label: 'Dialogue',
    description: 'Generate character dialogue',
    icon: 'Users',
  },
  TWIST: {
    id: 'twist',
    label: 'Plot Twist',
    description: 'Introduce an unexpected turn of events',
    icon: 'Shuffle',
  },
  CLIMAX: {
    id: 'climax',
    label: 'Climax',
    description: 'Build towards the story climax',
    icon: 'Zap',
  },
};

/**
 * Element types configuration
 */
export const ELEMENT_TYPES = {
  character: {
    id: 'character',
    label: 'Character',
    plural: 'Characters',
    icon: 'User',
    color: '#6B7DB3',
    description: 'Main characters and protagonists',
  },
  antagonist: {
    id: 'antagonist',
    label: 'Antagonist',
    plural: 'Antagonists',
    icon: 'Skull',
    color: '#9B6B6B',
    description: 'Villains and opposing forces',
  },
  location: {
    id: 'location',
    label: 'Location',
    plural: 'Locations',
    icon: 'MapPin',
    color: '#7B9B6B',
    description: 'Settings and places',
  },
  arc: {
    id: 'arc',
    label: 'Plot Arc',
    plural: 'Plot Arcs',
    icon: 'TrendingUp',
    color: '#B3936B',
    description: 'Story arcs and plot threads',
  },
  theme: {
    id: 'theme',
    label: 'Theme',
    plural: 'Themes',
    icon: 'Feather',
    color: '#8B7DB3',
    description: 'Themes and motifs',
  },
};

/**
 * Relationship types
 */
export const RELATIONSHIP_TYPES = {
  ally: { id: 'ally', label: 'Ally', color: '#4CAF50', lineStyle: 'solid' },
  enemy: { id: 'enemy', label: 'Enemy', color: '#f44336', lineStyle: 'solid' },
  family: { id: 'family', label: 'Family', color: '#2196F3', lineStyle: 'solid' },
  romantic: { id: 'romantic', label: 'Romantic', color: '#E91E63', lineStyle: 'dashed' },
  mentor: { id: 'mentor', label: 'Mentor', color: '#9C27B0', lineStyle: 'dotted' },
  rival: { id: 'rival', label: 'Rival', color: '#FF9800', lineStyle: 'dashed' },
  neutral: { id: 'neutral', label: 'Neutral', color: '#9E9E9E', lineStyle: 'dotted' },
  secret: { id: 'secret', label: 'Secret', color: '#607D8B', lineStyle: 'dashed' },
  business: { id: 'business', label: 'Business', color: '#795548', lineStyle: 'solid' },
  complicated: { id: 'complicated', label: 'Complicated', color: '#673AB7', lineStyle: 'dashed' },
};

/**
 * Story genres
 */
export const GENRES = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'scifi', label: 'Science Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'romance', label: 'Romance' },
  { value: 'horror', label: 'Horror' },
  { value: 'historical', label: 'Historical Fiction' },
  { value: 'literary', label: 'Literary Fiction' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'western', label: 'Western' },
];

/**
 * Story tones
 */
export const TONES = [
  { value: 'serious', label: 'Serious' },
  { value: 'lighthearted', label: 'Lighthearted' },
  { value: 'dark', label: 'Dark' },
  { value: 'whimsical', label: 'Whimsical' },
  { value: 'suspenseful', label: 'Suspenseful' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'satirical', label: 'Satirical' },
  { value: 'melancholic', label: 'Melancholic' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'gritty', label: 'Gritty' },
];

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  markdown: {
    id: 'markdown',
    label: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
    description: 'Plain text with formatting',
  },
  rtf: {
    id: 'rtf',
    label: 'Rich Text',
    extension: '.rtf',
    mimeType: 'application/rtf',
    description: 'Compatible with Word processors',
  },
  pdf: {
    id: 'pdf',
    label: 'PDF',
    extension: '.pdf',
    mimeType: 'application/pdf',
    description: 'Print-ready document',
  },
  json: {
    id: 'json',
    label: 'JSON',
    extension: '.json',
    mimeType: 'application/json',
    description: 'Full story data backup',
  },
};

/**
 * Navigation items
 */
export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'Home' },
  { id: 'editor', label: 'Editor', icon: 'Edit' },
  { id: 'elements', label: 'Elements', icon: 'Users' },
  { id: 'relationships', label: 'Relationships', icon: 'Link' },
  { id: 'versions', label: 'Versions', icon: 'Clock' },
  { id: 'export', label: 'Export', icon: 'Download' },
];

/**
 * Impact levels for AI options
 */
export const IMPACT_LEVELS = {
  low: { label: 'Low Impact', color: '#4CAF50', description: 'Minor changes to the story' },
  medium: { label: 'Medium Impact', color: '#FF9800', description: 'Moderate story changes' },
  high: { label: 'High Impact', color: '#f44336', description: 'Significant plot changes' },
};

/**
 * Character roles
 */
export const CHARACTER_ROLES = [
  { value: 'protagonist', label: 'Protagonist' },
  { value: 'deuteragonist', label: 'Deuteragonist' },
  { value: 'supporting', label: 'Supporting Character' },
  { value: 'minor', label: 'Minor Character' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'love_interest', label: 'Love Interest' },
  { value: 'comic_relief', label: 'Comic Relief' },
];

/**
 * Location types
 */
export const LOCATION_TYPES = [
  { value: 'city', label: 'City' },
  { value: 'town', label: 'Town' },
  { value: 'village', label: 'Village' },
  { value: 'building', label: 'Building' },
  { value: 'room', label: 'Room' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'fictional', label: 'Fictional Place' },
];

/**
 * Arc types
 */
export const ARC_TYPES = [
  { value: 'main', label: 'Main Plot' },
  { value: 'subplot', label: 'Subplot' },
  { value: 'character', label: 'Character Arc' },
  { value: 'romance', label: 'Romance Arc' },
  { value: 'mystery', label: 'Mystery Arc' },
  { value: 'redemption', label: 'Redemption Arc' },
];

/**
 * Version limits
 */
export const VERSION_CONFIG = {
  MAX_VERSIONS: 3,
  AUTO_SAVE_DELAY: 2000,
};

/**
 * UI breakpoints
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export default {
  STORAGE_KEYS,
  API_ENDPOINTS,
  GENERATION_MODES,
  ELEMENT_TYPES,
  RELATIONSHIP_TYPES,
  GENRES,
  TONES,
  EXPORT_FORMATS,
  NAV_ITEMS,
  IMPACT_LEVELS,
  CHARACTER_ROLES,
  LOCATION_TYPES,
  ARC_TYPES,
  VERSION_CONFIG,
  BREAKPOINTS,
};
