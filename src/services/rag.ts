import { supabase } from "@/integrations/supabase/client";

export interface RagResultItem {
  id: string;
  type: "resource" | "opportunity" | "project" | "event";
  title: string;
  category?: string;
  subject?: string;
  courseCode?: string;
  organization?: string;
  location?: string;
  description?: string;
  date?: string;
  tags?: string[];
  relevanceScore: number;
}

// Admin email check matching project privacy logic
const ADMIN_EMAILS = ["kamilikhith@gmail.com", "uppumanogna@gmail.com", "luckylucky12h@gmail.com"];

const checkPrivacyAccess = (item: any, userEmail: string | undefined, userId: string | undefined): boolean => {
  // If user is creator, access granted
  if (userId && (item.user_id === userId || item.created_by === userId)) {
    return true;
  }

  const privacy = item.privacy_type || "all";
  const allowed = item.allowed_emails || [];

  if (privacy === "all") return true;

  if (privacy === "college" && userEmail) {
    const lowerEmail = userEmail.toLowerCase().trim();
    if (ADMIN_EMAILS.includes(lowerEmail)) return true;
    if (lowerEmail.endsWith("@nbkrist.org") || lowerEmail.endsWith("@srmap.edu.in")) return true;
    const domain = lowerEmail.split("@")[1];
    if (domain && (domain.endsWith(".edu") || domain.endsWith(".edu.in"))) return true;
  }

  if (privacy === "selected" && userEmail) {
    const lowerEmail = userEmail.toLowerCase().trim();
    return allowed.map((e: string) => e.toLowerCase().trim()).includes(lowerEmail);
  }

  return false;
};

// Calculate keyword matching score
const calculateScore = (text: string, keywords: string[]): number => {
  if (!text || keywords.length === 0) return 0;
  const lowerText = text.toLowerCase();
  let score = 0;
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 1;
      // Bonus if it starts with word boundary
      if (lowerText.includes(` ${keyword}`) || lowerText.startsWith(keyword)) {
        score += 0.5;
      }
    }
  });
  return score;
};

export const retrieveCampusContext = async (
  query: string,
  userEmail?: string,
  userId?: string
): Promise<{ contextText: string; results: RagResultItem[] }> => {
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2); // only score words longer than 2 characters

  const results: RagResultItem[] = [];

  try {
    // 1. Fetch Resources
    const { data: resources } = await supabase
      .from("resources")
      .select("*")
      .limit(50);
    
    if (resources) {
      resources.forEach((res: any) => {
        if (checkPrivacyAccess(res, userEmail, userId)) {
          let score = calculateScore(res.title, keywords);
          score += calculateScore(res.subject, keywords) * 0.8;
          if (res.course_code) {
            score += calculateScore(res.course_code, keywords) * 1.5;
          }
          
          // Fallback if no matching keywords: give a very tiny score based on recency
          if (score === 0 && keywords.length === 0) {
            score = 0.01;
          }

          if (score > 0 || keywords.length === 0) {
            results.push({
              id: res.id,
              type: "resource",
              title: res.title,
              category: res.category,
              subject: res.subject,
              courseCode: res.course_code || undefined,
              relevanceScore: score,
              date: res.created_at,
            });
          }
        }
      });
    }

    // 2. Fetch Opportunities
    const { data: opportunities } = await supabase
      .from("opportunities")
      .select("*")
      .limit(50);

    if (opportunities) {
      opportunities.forEach((opp: any) => {
        if (checkPrivacyAccess(opp, userEmail, userId)) {
          let score = calculateScore(opp.title, keywords);
          score += calculateScore(opp.organization, keywords) * 1.2;
          score += calculateScore(opp.description, keywords) * 0.5;
          score += calculateScore(opp.category, keywords) * 0.8;

          if (score === 0 && keywords.length === 0) {
            score = 0.01;
          }

          if (score > 0 || keywords.length === 0) {
            results.push({
              id: opp.id,
              type: "opportunity",
              title: opp.title,
              category: opp.category,
              organization: opp.organization,
              location: opp.location || undefined,
              description: opp.description || undefined,
              date: opp.deadline || undefined,
              relevanceScore: score,
            });
          }
        }
      });
    }

    // 3. Fetch Projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .limit(50);

    if (projects) {
      projects.forEach((proj: any) => {
        if (checkPrivacyAccess(proj, userEmail, userId)) {
          let score = calculateScore(proj.title, keywords);
          score += calculateScore(proj.description, keywords) * 0.5;
          if (proj.tags && proj.tags.length > 0) {
            score += calculateScore(proj.tags.join(" "), keywords) * 1.0;
          }

          if (score === 0 && keywords.length === 0) {
            score = 0.01;
          }

          if (score > 0 || keywords.length === 0) {
            results.push({
              id: proj.id,
              type: "project",
              title: proj.title,
              category: proj.status,
              description: proj.description || undefined,
              tags: proj.tags || [],
              relevanceScore: score,
            });
          }
        }
      });
    }

    // 4. Fetch Events
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .limit(50);

    if (events) {
      events.forEach((evt: any) => {
        let score = calculateScore(evt.title, keywords);
        score += calculateScore(evt.description, keywords) * 0.5;
        score += calculateScore(evt.location, keywords) * 0.8;
        score += calculateScore(evt.category, keywords) * 0.6;

        if (score === 0 && keywords.length === 0) {
          score = 0.01;
        }

        if (score > 0 || keywords.length === 0) {
          results.push({
            id: evt.id,
            type: "event",
            title: evt.title,
            category: evt.category,
            location: evt.location || undefined,
            description: evt.description || undefined,
            date: evt.event_date,
            relevanceScore: score,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error retrieving RAG campus context:", error);
  }

  // Sort by score descending, then by date (if available) descending
  const sortedResults = results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return 0; // maintain database order (typically newest first)
  });

  // Take top 8 matches to stay within prompt limits
  const topMatches = sortedResults.slice(0, 8);

  if (topMatches.length === 0) {
    return {
      contextText: "No specific records (resources, projects, opportunities, or events) matched the query in the database.",
      results: [],
    };
  }

  // Build markdown context summary
  let contextText = "Here are the relevant campus records found matching the query:\n\n";
  topMatches.forEach((item, idx) => {
    contextText += `${idx + 1}. [${item.type.toUpperCase()}] "${item.title}"\n`;
    if (item.type === "resource") {
      contextText += `   - Subject: ${item.subject || "N/A"}\n`;
      if (item.courseCode) contextText += `   - Course Code: ${item.courseCode}\n`;
      contextText += `   - Category: ${item.category || "N/A"}\n`;
    } else if (item.type === "opportunity") {
      contextText += `   - Organization: ${item.organization || "N/A"}\n`;
      contextText += `   - Category: ${item.category || "N/A"}\n`;
      if (item.location) contextText += `   - Location: ${item.location}\n`;
      if (item.deadline) contextText += `   - Deadline: ${new Date(item.deadline).toLocaleDateString()}\n`;
      if (item.description) contextText += `   - Description: ${item.description}\n`;
    } else if (item.type === "project") {
      contextText += `   - Status: ${item.category || "recruiting"}\n`;
      if (item.tags && item.tags.length > 0) contextText += `   - Tech Tags: ${item.tags.join(", ")}\n`;
      if (item.description) contextText += `   - Description: ${item.description}\n`;
    } else if (item.type === "event") {
      contextText += `   - Category: ${item.category || "N/A"}\n`;
      if (item.location) contextText += `   - Location: ${item.location}\n`;
      if (item.date) contextText += `   - Date: ${new Date(item.date).toLocaleString()}\n`;
      if (item.description) contextText += `   - Description: ${item.description}\n`;
    }
    contextText += "\n";
  });

  return {
    contextText,
    results: topMatches,
  };
};
