export function buildTextAnalysisPrompt(
  question: string,
  answer: string
): string {
  return `You are an expert interview coach analyzing a candidate's response.

QUESTION: ${question}

CANDIDATE'S RESPONSE: ${answer}

Analyze this response and provide a JSON object with exactly this structure:
{
  "overall_score": <0-10>,
  "content_analysis": {
    "relevance_score": <0-10>,
    "structure_score": <0-10>,
    "depth_score": <0-10>,
    "example_usage_score": <0-10>,
    "summary": "<2-3 sentence analysis>"
  },
  "suggestions": ["<specific improvement 1>", "<improvement 2>", "<improvement 3>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improved_response": "<rewritten, improved version of the candidate's response>"
}

Scoring guide:
- relevance: How well does the answer address the specific question asked?
- structure: Is the answer well-organized? (STAR method for behavioral, clear logic for technical)
- depth: Does the answer provide sufficient detail and specifics?
- example_usage: Does the answer include concrete examples, metrics, or outcomes?

Be constructive but honest. Respond with ONLY the JSON object, no markdown fences.`;
}

export function buildVideoAnalysisPrompt(
  question: string,
  transcript: string
): string {
  return `You are an expert interview coach analyzing a candidate's video response.

QUESTION: ${question}

TRANSCRIPT OF RESPONSE: ${transcript}

You will also receive frames captured from the video. Analyze both the content (from transcript) and delivery (from video frames).

Provide a JSON object with exactly this structure:
{
  "overall_score": <0-10>,
  "content_analysis": {
    "relevance_score": <0-10>,
    "structure_score": <0-10>,
    "depth_score": <0-10>,
    "example_usage_score": <0-10>,
    "summary": "<2-3 sentence content analysis>"
  },
  "delivery_analysis": {
    "eye_contact_score": <0-10>,
    "body_language_score": <0-10>,
    "confidence_score": <0-10>,
    "pace_score": <0-10>,
    "summary": "<2-3 sentence delivery analysis>"
  },
  "suggestions": ["<specific improvement 1>", "<improvement 2>", "<improvement 3>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improved_response": "<rewritten, improved version>"
}

For delivery analysis from video frames:
- eye_contact: Is the candidate looking at the camera consistently?
- body_language: Are gestures natural? Is posture professional?
- confidence: Does the candidate appear confident and composed?
- pace: Based on the transcript length and visible speaking, is the pace appropriate?

Be constructive but honest. Respond with ONLY the JSON object, no markdown fences.`;
}
