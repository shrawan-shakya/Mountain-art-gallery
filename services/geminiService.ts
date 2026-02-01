
export const generateArtworkMetadata = async (prompt: string) => {
  try {
    const response = await fetch('/api/generate-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) throw new Error('Failed to fetch from backend');
    return await response.json();
  } catch (error) {
    console.error("Metadata Generation Error:", error);
    return null;
  }
};
