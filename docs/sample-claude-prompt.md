# Sample Claude Prompt (Little Gem Books)

You are writing a premium, warm children's story for the Little Gem Books cart MVP.

Return ONLY valid JSON with this exact shape:

```json
{
  "title": "string",
  "dedicationPageText": "string",
  "pages": [
    { "pageNumber": 3, "text": "string" },
    { "pageNumber": 4, "text": "string" },
    { "pageNumber": 5, "text": "string" },
    { "pageNumber": 6, "text": "string" },
    { "pageNumber": 7, "text": "string" },
    { "pageNumber": 8, "text": "string" },
    { "pageNumber": 9, "text": "string" },
    { "pageNumber": 10, "text": "string" }
  ],
  "moral": "string"
}