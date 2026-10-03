import React from 'react';

/**
 * JsonLd component to safely inject Schema.org JSON-LD scripts into the head or body.
 * Accepts a JavaScript object or an array of schema objects.
 */
export default function JsonLd({ schema }) {
  if (!schema) return null;

  const jsonString = JSON.stringify(schema, null, 2);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
