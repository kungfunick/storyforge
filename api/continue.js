/**
 * Story Continuation API
 * ============================================================================
 * 
 * @description Vercel serverless function for generating story continuations
 * @route POST /api/continue
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODE_PROMPTS = {
  continue: 'Continue the story naturally from where it left off, advancing the plot and developing characters.',
  scene: 'Create a new scene that fits the story, possibly introducing new settings or situations.',
  develop: 'Focus on character development, revealing more about their motivations, relationships, or backstory.',
  twist: 'Introduce an unexpected plot twist that changes the direction of the story in a compelling way.',
  conflict: 'Add tension, obstacles, or conflicts that the characters must overcome.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { story, mode, userPrompt } = req.body;

    if (!story) {
      return res.status(400).json({ error: 'Story state is required' });
    }

    const modeInstruction = MODE_PROMPTS[mode] || MODE_PROMPTS.continue;

    const systemPrompt = `You are a creative writing assistant generating story continuations. 
${modeInstruction}

Given the story state, generate exactly 3 distinct continuation options. Each option should offer a different direction while remaining consistent with the established story.

Return JSON with this structure:
{
  "options": [
    {
      "title": "Short title for this option",
      "preview": "2-3 sentence preview of what happens",
      "tone": "dramatic|tense|hopeful|mysterious|light-hearted|etc",
      "impact": "high|medium|low",
      "continuation": {
        "chapterContent": "The actual continuation text (300-500 words)",
        "synopsis": "Updated synopsis if significant changes occur (or null)",
        "newElements": {
          "characters": [{ "name": "...", "role": "...", "description": "..." }],
          "locations": [{ "name": "...", "type": "...", "description": "..." }]
        },
        "updatedElements": [
          { "type": "character", "_id": "element_id", "updates": { "description": "new description" } }
        ],
        "newRelationships": [
          { "source": "Character Name", "target": "Other Name", "type": "ally|enemy|etc", "description": "..." }
        ]
      }
    }
  ]
}

Impact levels:
- high: Major plot changes, character deaths/revelations, story direction shifts
- medium: Significant developments, new conflicts, relationship changes
- low: Scene continuation, dialogue, minor developments

Keep new elements minimal - only introduce what's necessary for the continuation.
For updatedElements, use the _id from the provided story state.`;

    const userContent = `Story State:
${JSON.stringify(story, null, 2)}

Mode: ${mode}
${userPrompt ? `User guidance: ${userPrompt}` : ''}

Generate 3 distinct continuation options.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userContent }
      ],
      system: systemPrompt,
    });

    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse continuation options');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate we have exactly 3 options
    if (!result.options || result.options.length !== 3) {
      throw new Error('Expected exactly 3 options');
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Continuation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate continuations',
      details: error.message 
    });
  }
}
