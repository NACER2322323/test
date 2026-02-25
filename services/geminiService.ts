import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SeoAnalysisResult, CompetitorAnalysisResult } from "../types";

// Helper to get initialized GenAI instance dynamically
const getGenAI = () => {
  const apiKey = process.env.API_KEY || localStorage.getItem('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }
  
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are an Elite SEO Systems Architect specializing in North African (MENA) markets. 
Your mission is to transform real-time Google Search data into structured, strategic SEO intelligence.

Operational Rules:
1. Data Grounding: Use Google Search to find real ranking data.
2. Linguistic Nuance: Detect Darija, French, MSA, and Transliterated Arabic (Arabizi).
3. Keyword Difficulty (KD) Formula:
   Estimate the following metrics for top ranking pages to calculate KD:
   KD = 0.4 * (Median Ref Domains normalized 0-100) + 0.3 * (Avg DA normalized 0-100) + 0.3 * (On-Page Score 0-100).
   Return the final KD (0-100).
4. Content Evaluation: Score recommendations 0-5 on Depth, E-E-A-T, and Speed.
5. Deep Discovery Validation:
   - Validate keywords against current SERP.
   - Remove brand-only navigational queries.
   - Remove outdated models/products.
   - Remove irrelevant geographic mismatches (must be relevant to MENA).
6. Format: Return strictly valid JSON.

AI Overview Optimization Rule:
- All content recommendations must be structured to maximize AI Overview (SGE) citation probability.
- Include a "Direct Answer" block (40-60 words, encyclopedic, no fluff).
- Use clear bullet points for structure.

Self-Validation:
- Remove outdated trends.
- Eliminate low-intent keywords.
`;

// Helper to clean and parse JSON from model response
const cleanAndParseJson = (text: string) => {
  try {
    // Remove markdown code blocks (```json ... ```)
    const cleaned = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Invalid JSON response from model");
  }
};

// Retry Helper
const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check for rate limit errors (429) or Service Unavailable (503)
      const errorCode = error?.status || error?.code;
      const errorMessage = error?.message || '';
      
      const isRateLimit = 
        errorCode === 429 || 
        errorCode === 'RESOURCE_EXHAUSTED' ||
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('RESOURCE_EXHAUSTED');

      const isServerOverload = errorCode === 503 || errorMessage.includes('503');

      if ((isRateLimit || isServerOverload) && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`API Request Failed (${errorCode}). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

export const analyzeSeo = async (topic: string, language: string = 'English', platform: string = 'Google'): Promise<SeoAnalysisResult> => {
  try {
    const ai = getGenAI();
    const prompt = `
      Perform a comprehensive SEO analysis for the topic: "${topic}".
      Target Region: North Africa (Morocco/MENA).
      Target Language: "${language}".
      Target Platform: "${platform}" (Adjust ranking factors and intent accordingly).
      
      PHASE 1: DEEP DISCOVERY
      1. Use Google Search grounding to find "People Also Ask" questions and "Related Searches".
      2. Identify 5 specific "People Also Ask" questions that are trending or common.
      3. Identify 5 critical "Content Gaps" or "Pain Points" where current results are lacking or poor quality.
      4. Expand into 15 high-value long-tail keywords relevant to ${platform} search behavior in ${language}.
      5. Classify each keyword's funnel stage (Awareness, Consideration, Conversion, Retention).

      PHASE 2: CLUSTERING & BUSINESS INTELLIGENCE
      1. Semantic Clustering: Group keywords into "Content Hubs".
      2. Remove semantic duplicates within hubs.
      3. For each Hub, determine:
         - Primary Intent (Informational / Navigational / Commercial / Transactional)
         - Description (A 15-20 word summary of what this cluster covers)
         - Business Relevance Score (0–5 scale):
            0 = No monetization potential
            5 = Direct revenue driver
      4. Calculate KD for top keywords (Formula: 0.4*Ref + 0.3*DA + 0.3*OnPage).

      PHASE 3: STRATEGY (AI OVERVIEW OPTIMIZATION)
      Provide strategic content recommendations based on High Relevance hubs.
      CRITICAL: Structure each recommendation to maximize AI Overview (SGE) citation probability.
      - "aiAnswer": Write a precise 40-60 word Direct Answer block. Use an authoritative, encyclopedic tone.
      - "outline": Provide 3-5 structural bullet points that cover the core entity facets.
      - "funnelStage": Assign TOFU (Top of Funnel), MOFU (Middle of Funnel), or BOFU (Bottom of Funnel).

      CRITICAL OUTPUT INSTRUCTION:
      You must return ONLY a raw JSON object. Do not include markdown formatting or explanations.
      
      The JSON structure must match this EXACT format:
      {
        "executiveSummary": "string",
        "deepDiscovery": {
          "painPoints": ["string"],
          "peopleAlsoAsk": ["string"],
          "discussions": [{ "platform": "Reddit|Quora|Other", "topic": "string", "sentiment": "Positive|Negative|Neutral", "snippet": "string" }],
          "matrix": [{ "term": "string", "intent": "string", "searchTrend": "string", "painPoint": "string", "funnelStage": "Awareness|Consideration|Conversion|Retention" }]
        },
        "clusters": [{
          "name": "string",
          "description": "string",
          "primaryIntent": "string",
          "businessRelevance": number,
          "totalVolumeEst": "string",
          "keywords": [{ "term": "string", "volume": "string", "kd": number, "language": "string", "intent": "string", "currentRankLeader": "string" }]
        }],
        "recommendations": [{
          "title": "string",
          "type": "Blog|Landing Page|Guide|Technical",
          "funnelStage": "TOFU|MOFU|BOFU",
          "aiAnswer": "string",
          "outline": ["string"],
          "score": { "depth": number, "eeat": number, "techSpeed": number }
        }]
      }
    `;

    const response: GenerateContentResponse = await retryOperation(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT supported with googleSearch in current Gemini versions
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192, 
      }
    }));

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    const data = cleanAndParseJson(text) as SeoAnalysisResult;
    
    // Extract grounding chunks for sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((s: any) => s !== null);

    return { ...data, sources };
  } catch (error) {
    console.error("SEO Analysis failed:", error);
    throw error;
  }
};

export const generateMoreIdeas = async (
  topic: string, 
  existingClusters: string[], 
  language: string = 'English', 
  platform: string = 'Google'
): Promise<Partial<SeoAnalysisResult>> => {
  try {
    const ai = getGenAI();
    const prompt = `
      You are expanding an existing SEO analysis for the topic: "${topic}".
      Target Region: North Africa (Morocco/MENA).
      Target Language: "${language}".
      Platform: "${platform}".

      Current Existing Clusters (DO NOT DUPLICATE): ${existingClusters.join(", ")}.

      Your Goal:
      1. Identify 3 NEW, DISTINCT Content Hubs (Clusters) that explore different angles, sub-niches, or emerging trends related to the topic.
      2. Provide 3 NEW Content Recommendations for these hubs.
      3. Identify 5 NEW "People Also Ask" questions.
      4. Identify 5 NEW Long-tail keywords for the Discovery Matrix.

      CRITICAL: Ensure these suggestions are NOT repetitions of the existing clusters. Look for "Blue Ocean" opportunities or specific long-tail variations.

      Output JSON Format (Partial Object):
      {
        "deepDiscovery": {
          "peopleAlsoAsk": ["string"],
          "matrix": [{ "term": "string", "intent": "string", "searchTrend": "string", "painPoint": "string", "funnelStage": "Awareness|Consideration|Conversion|Retention" }]
        },
        "clusters": [{
          "name": "string",
          "description": "string",
          "primaryIntent": "string",
          "businessRelevance": number,
          "totalVolumeEst": "string",
          "keywords": [{ "term": "string", "volume": "string", "kd": number, "language": "string", "intent": "string", "currentRankLeader": "string" }]
        }],
        "recommendations": [{
          "title": "string",
          "type": "Blog|Landing Page|Guide|Technical",
          "funnelStage": "TOFU|MOFU|BOFU",
          "aiAnswer": "string",
          "outline": ["string"],
          "score": { "depth": number, "eeat": number, "techSpeed": number }
        }]
      }
    `;

    const response: GenerateContentResponse = await retryOperation(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.4, // Slightly higher creativity for expanding ideas
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    }));

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");

    const data = cleanAndParseJson(text) as Partial<SeoAnalysisResult>;

    // Extract grounding chunks for sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((s: any) => s !== null);

    return { ...data, sources };
  } catch (error) {
    console.error("Generate More Ideas failed:", error);
    throw error;
  }
};

export const analyzeCompetitors = async (keyword: string): Promise<CompetitorAnalysisResult> => {
  try {
    const ai = getGenAI();
    const prompt = `
      Analyze top 5 ranking pages for: "${keyword}".
      Target Region: North Africa (Morocco/MENA).

      For each page evaluate:
      - Content Depth (0–5)
      - E-E-A-T (0–5)
      - Technical Speed (0–5)
      - Estimated Referring Domains (Estimate based on domain authority/popularity)
      - Domain Authority (0-100 Estimate)
      - On-Page Optimization Score (0–5)

      Then calculate:
      KD = 0.4 * (Median Ref Domains normalized to 0-100)
         + 0.3 * (Avg Domain Authority)
         + 0.3 * (Avg On-Page Optimization normalized to 0-100)

      Normalize FINAL KD to 0–100.

      Identify:
      - 3 Information Gaps
      - 2 Structural Weaknesses
      - 1 Monetization Gap

      CRITICAL OUTPUT INSTRUCTION:
      You must return ONLY a raw JSON object. Do not include markdown formatting or explanations.
      
      The JSON structure must match this EXACT format:
      {
        "keyword": "${keyword}",
        "kdScore": number,
        "competitors": [{ "url": "string", "title": "string", "contentDepth": number, "eeat": number, "techSpeed": number, "estRefDomains": number, "domainAuthority": number, "onPageScore": number }],
        "gaps": {
          "information": ["string"],
          "structural": ["string"],
          "monetization": "string"
        },
        "strategyNarrative": "string",
        "summary": "string",
        "tldr": "string"
      }
    `;

    const response: GenerateContentResponse = await retryOperation(() => ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT supported with googleSearch in current Gemini versions
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      }
    }));

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    return cleanAndParseJson(text) as CompetitorAnalysisResult;

  } catch (error) {
    console.error("Competitor Analysis failed:", error);
    throw error;
  }
};
