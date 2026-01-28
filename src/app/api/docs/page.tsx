'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-muted-foreground">Loading API documentation...</p>
    </div>
  ),
});

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI url="/api/openapi.json" />
    </div>
  );
}
