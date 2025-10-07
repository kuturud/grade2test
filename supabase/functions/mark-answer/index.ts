import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MarkingRequest {
  userAnswer: string;
  markScheme: string;
  marksAvailable: number;
  questionText: string;
}

interface MarkingResponse {
  marksAwarded: number;
  feedback: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userAnswer, markScheme, marksAvailable, questionText }: MarkingRequest = await req.json();

    if (!userAnswer || !markScheme || !marksAvailable) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        } as MarkingResponse),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // AI marking logic using pattern matching and keyword analysis
    const marking = performMarking(userAnswer, markScheme, marksAvailable, questionText);

    return new Response(
      JSON.stringify({
        success: true,
        marksAwarded: marking.marksAwarded,
        feedback: marking.feedback,
      } as MarkingResponse),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        marksAwarded: 0,
        feedback: "An error occurred during marking. Please try again.",
      } as MarkingResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function performMarking(
  userAnswer: string,
  markScheme: string,
  marksAvailable: number,
  questionText: string
): { marksAwarded: number; feedback: string } {
  const answerLower = userAnswer.toLowerCase().trim();
  const schemeLower = markScheme.toLowerCase();

  // Extract key marking points from the mark scheme
  const markingPoints = extractMarkingPoints(schemeLower);
  
  let marksAwarded = 0;
  const feedbackPoints: string[] = [];
  const missedPoints: string[] = [];

  // Check each marking point
  for (const point of markingPoints) {
    const keywords = point.keywords;
    const pointValue = point.marks;
    
    // Check if answer contains relevant keywords (fuzzy matching)
    const matchedKeywords = keywords.filter(keyword => 
      answerLower.includes(keyword) || 
      hasPartialMatch(answerLower, keyword)
    );

    if (matchedKeywords.length > 0) {
      marksAwarded += pointValue;
      feedbackPoints.push(`✓ ${point.description} (${pointValue} mark${pointValue > 1 ? 's' : ''})`);
    } else {
      missedPoints.push(`✗ ${point.description} (${pointValue} mark${pointValue > 1 ? 's' : ''})`);
    }
  }

  // Cap marks at maximum available
  marksAwarded = Math.min(marksAwarded, marksAvailable);

  // Generate feedback
  let feedback = `Score: ${marksAwarded}/${marksAvailable} marks\n\n`;
  
  if (feedbackPoints.length > 0) {
    feedback += "Points awarded:\n" + feedbackPoints.join("\n") + "\n\n";
  }
  
  if (missedPoints.length > 0) {
    feedback += "Points to improve:\n" + missedPoints.join("\n") + "\n\n";
  }

  // Add personalized feedback based on performance
  const percentage = (marksAwarded / marksAvailable) * 100;
  
  if (percentage === 100) {
    feedback += "Excellent work! You've covered all key points.";
  } else if (percentage >= 75) {
    feedback += "Good answer! Consider adding more detail to improve further.";
  } else if (percentage >= 50) {
    feedback += "Decent attempt. Review the mark scheme and add more specific points.";
  } else if (percentage >= 25) {
    feedback += "Basic understanding shown. Work on including more key points from the mark scheme.";
  } else {
    feedback += "More detail needed. Review the topic and ensure you address the question fully.";
  }

  return { marksAwarded, feedback };
}

function extractMarkingPoints(markScheme: string): Array<{
  description: string;
  keywords: string[];
  marks: number;
}> {
  const points: Array<{ description: string; keywords: string[]; marks: number }> = [];
  
  // Split mark scheme into lines
  const lines = markScheme.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Skip header lines
    if (line.includes('mark scheme') || line.includes('award 1 mark')) continue;
    
    // Extract marking points (lines with hyphens or bullet points)
    if (line.includes('-') || line.includes('•')) {
      const cleaned = line.replace(/^[\s\-•]+/, '').trim();
      
      // Extract mark value if present
      const markMatch = cleaned.match(/\((\d+)\s*marks?\)/);
      const marks = markMatch ? parseInt(markMatch[1]) : 1;
      
      // Remove mark notation for description
      const description = cleaned.replace(/\(\d+\s*marks?\)/gi, '').trim();
      
      // Extract keywords from the description
      const keywords = extractKeywords(description);
      
      if (keywords.length > 0) {
        points.push({ description, keywords, marks });
      }
    }
  }
  
  return points;
}

function extractKeywords(text: string): string[] {
  // Remove common filler words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had'];
  
  // Split into words and filter
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Also extract key phrases (2-3 words)
  const phrases: string[] = [];
  const textLower = text.toLowerCase();
  
  // Common CS phrases
  const csPatterns = [
    'volatile memory', 'non-volatile', 'read only', 'von neumann', 'stored program',
    'fetch execute', 'logic gate', 'truth table', 'data type', 'memory management',
    'file management', 'operating system', 'denial of service', 'local area network',
    'wide area network', 'ip address', 'mac address', 'binary number', 'hexadecimal',
    'character encoding', 'lossy compression', 'lossless compression'
  ];
  
  for (const pattern of csPatterns) {
    if (textLower.includes(pattern)) {
      phrases.push(pattern);
    }
  }
  
  return [...new Set([...words, ...phrases])];
}

function hasPartialMatch(answer: string, keyword: string): boolean {
  // Check for partial matches (75% of characters)
  const threshold = 0.75;
  const minLength = Math.ceil(keyword.length * threshold);
  
  // Check if keyword substring exists in answer
  if (keyword.length >= 4) {
    const substrings = [];
    for (let i = 0; i <= keyword.length - minLength; i++) {
      substrings.push(keyword.substring(i, i + minLength));
    }
    return substrings.some(substr => answer.includes(substr));
  }
  
  return false;
}