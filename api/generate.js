/**
 * Story Generation API
 * ============================================================================
 * 
 * @description Vercel serverless function for generating stories from ideas
 * @route POST /api/generate
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, idea, genre, tone, story, regenerate, changes } = req.body;

    if (regenerate && story) {
      // Handle regeneration after core changes
      return handleRegeneration(req, res, story, changes);
    }

    // Generate new story from idea
    if (!title || !idea) {
      return res.status(400).json({ error: 'Title and idea are required' });
    }

    const systemPrompt = `You are a creative writing assistant specializing in story development. 
Generate a complete story foundation based on the user's title and idea.

Return a JSON object with this exact structure:
{
  "title": "Story Title",
  "genre": "Genre",
  "tone": "Tone",
  "synopsis": "2-3 sentence synopsis",
  "elements": {
    "characters": [
      { "name": "Name", "role": "protagonist|supporting|minor", "description": "...", "traits": "...", "goals": "...", "backstory": "..." }
    ],
    "antagonists": [
      { "name": "Name", "role": "villain|rival|obstacle", "description": "...", "motivation": "...", "methods": "...", "weakness": "..." }
    ],
    "locations": [
      { "name": "Name", "type": "city|building|natural|interior|fictional", "description": "...", "atmosphere": "...", "significance": "..." }
    ],
    "arcs": [
      { "name": "Arc Name", "type": "main|character|subplot", "description": "...", "startPoint": "...", "endPoint": "...", "stakes": "..." }
    ],
    "themes": [
      { "name": "Theme", "description": "...", "manifestation": "...", "resolution": "..." }
    ]
  },
  "relationships": [
    { "sourceType": "characters|antagonists|locations|arcs|themes", "sourceIdx": 0, "targetType": "...", "targetIdx": 0, "type": "ally|enemy|family|romantic|mentor|rival|located_in|drives|opposes|embodies", "description": "..." }
  ],
  "chapters": [
    { "title": "Chapter 1 Title", "content": "First chapter content (500-800 words)..." }
  ]
}

Generate:
- 2-3 main characters
- 1-2 antagonists
- 2-3 significant locations
- 1-2 story arcs
- 1-2 themes
- Meaningful relationships between elements
- A compelling first chapter (500-800 words)`;

    const userPrompt = `Generate a story with:
Title: ${title}
Idea: ${idea}
${genre ? `Genre: ${genre}` : ''}
${tone ? `Tone: ${tone}` : ''}

Create rich, interconnected elements and an engaging first chapter.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse story structure');
    }

    const storyData = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ story: storyData });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate story',
      details: error.message 
    });
  }
}

async function handleRegeneration(req, res, story, changes) {
  try {
    const systemPrompt = `You are a creative writing assistant. The user has changed core story details and wants suggestions for how to update the story elements to match.

Analyze the changes and provide suggestions for updating existing elements to align with the new story direction.

Return JSON:
{
  "suggestions": [
    { "elementType": "characters|antagonists|locations|arcs|themes", "elementId": "id", "updates": { ... }, "reason": "..." }
  ],
  "newElements": {
    "characters": [],
    "locations": [],
    ...
  }
}`;

    const userPrompt = `Story changes:
${changes.map(c => `${c.field}: "${c.oldValue}" → "${c.newValue}"`).join('\n')}

Current story:
${JSON.stringify(story, null, 2)}

Suggest how to update elements to match the new direction.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse regeneration suggestions');
    }

    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    console.error('Regeneration error:', error);
    return res.status(500).json({ error: 'Failed to regenerate' });
  }
}
