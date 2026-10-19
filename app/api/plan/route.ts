
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Attraction = {
  name: string;
  description: string;
  time: string;
  estimatedCost: string;
};

type TravelDay = {
  day: number;
  title: string;
  summary: string;
  attractions: Attraction[];
};

export async function POST(request: Request) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!groqKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing from .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const destination =
      typeof body.destination === "string"
        ? body.destination.trim()
        : "";

    const days = Number(body.days);
    const budget =
      typeof body.budget === "string" ||
      typeof body.budget === "number"
        ? String(body.budget)
        : "";

    const travelers = String(body.travelers || "2 adults");
    const travelStyle = String(body.travelStyle || "Balanced");

    const interests = Array.isArray(body.interests)
      ? body.interests
          .filter((item: unknown) => typeof item === "string")
          .slice(0, 8)
          .join(", ")
      : String(body.interests || "General sightseeing");

    if (
      !destination ||
      destination.length > 100 ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 7 ||
      !budget.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a destination, select 1–7 days, and choose a budget.",
        },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey: groqKey });

    const completion = await groq.chat.completions.create({
     model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are WanderWise, an expert travel planner. Return valid JSON only. Do not use Markdown fences. Never invent precise prices as guaranteed facts.",
        },
        {
          role: "user",
          content: `
Create a personalized ${days}-day itinerary for ${destination}.

Total trip budget: ${budget}
Travellers: ${travelers}
Travel style: ${travelStyle}
Interests: ${interests}

Return JSON in this exact structure:
{
  "destination": "${destination}",
  "totalBudget": "${budget}",
  "days": [
    {
      "day": 1,
      "title": "A short, attractive daily title",
      "summary": "A short overview of the day",
      "attractions": [
        {
          "name": "Real attraction name",
          "description": "Useful description in 1-3 sentences",
          "time": "Morning",
          "estimatedCost": "Estimated cost in INR"
        }
      ]
    }
  ]
}

Requirements:
- Include exactly ${days} day objects.
- Include 2 or 3 attractions per day.
- Use real attractions in or near the requested destination.
- Consider the selected budget, traveller type, travel style and interests.
- Include realistic activities and sensible travel order.
- Use INR estimates where appropriate.
- Clearly communicate that prices and opening hours need verification.
- Do not add image URLs.
`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    const itinerary = JSON.parse(content);

    if (!Array.isArray(itinerary.days)) {
      throw new Error("Groq returned an invalid itinerary.");
    }

    // Without an Unsplash key, the itinerary still works.
    async function findPhoto(query: string) {
      if (!unsplashKey) return null;

      try {
        const params = new URLSearchParams({
          query,
          per_page: "1",
          orientation: "landscape",
        });

        const response = await fetch(
          `https://api.unsplash.com/search/photos?${params.toString()}`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashKey}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error("Unsplash request failed:", response.status);
          return null;
        }

        const data = await response.json();
        const photo = data.results?.[0];

        if (!photo) return null;

        return {
          url: photo.urls.regular,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          photoUrl: photo.links.html,
        };
      } catch (error) {
        console.error("Photo search failed:", error);
        return null;
      }
    }

    const daysWithImages = await Promise.all(
      itinerary.days.slice(0, days).map(async (day: TravelDay) => ({
        ...day,
        attractions: await Promise.all(
          (Array.isArray(day.attractions) ? day.attractions : [])
            .slice(0, 3)
            .map(async (place) => ({
              ...place,
              image: await findPhoto(
                `${place.name} ${destination}`
              ),
            }))
        ),
      }))
    );

    return NextResponse.json({
      destination: itinerary.destination || destination,
      totalBudget: itinerary.totalBudget || budget,
      days: daysWithImages,
      imageWarning: unsplashKey
        ? undefined
        : "Add UNSPLASH_ACCESS_KEY to .env.local to display attraction photos.",
    });
  } catch (error) {
    console.error("WanderWise API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Could not create your itinerary. ${message}`,
      },
      { status: 500 }
    );
  }
}
