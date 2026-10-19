
"use client";

import { FormEvent, useState } from "react";

type PlannerForm = {
  destination: string;
  days: string;
  budget: string;
  travelers: string;
  interests: string[];
  travelStyle: string;
};

type Photo = {
  url: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
};

type Attraction = {
  name: string;
  description: string;
  time: string;
  estimatedCost: string;
  image?: Photo | null;
};

type TravelDay = {
  day: number;
  title: string;
  summary: string;
  attractions: Attraction[];
};

type Itinerary = {
  destination: string;
  totalBudget: string;
  days: TravelDay[];
  imageWarning?: string;
};

const interestOptions = [
  "Nature & views",
  "Food",
  "Culture & history",
  "Adventure",
  "Shopping",
  "Relaxation",
  "Photography",
  "Nightlife",
];

export default function Home() {
  const [form, setForm] = useState<PlannerForm>({
    destination: "",
    days: "3",
    budget: "₹15,000–₹30,000",
    travelers: "2 adults",
    interests: ["Nature & views", "Food"],
    travelStyle: "Balanced",
  });

  const [plan, setPlan] = useState<Itinerary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PlannerForm>(
    key: K,
    value: PlannerForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPlan(null);
    setLoading(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not create your itinerary."
        );
      }

      if (!Array.isArray(data.days)) {
        throw new Error("The server returned an invalid itinerary.");
      }

      setPlan(data as Itinerary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPlan() {
    if (!plan) return;

    const text = plan.days
      .map((day) => {
        const attractions = day.attractions
          .map(
            (place) =>
              `${place.time}: ${place.name}\n${place.description}\nEstimated cost: ${place.estimatedCost}`
          )
          .join("\n\n");

        return `DAY ${day.day}: ${day.title}\n${day.summary}\n\n${attractions}`;
      })
      .join("\n\n--------------------\n\n");

    try {
      await navigator.clipboard.writeText(
        `${plan.destination}\nBudget: ${plan.totalBudget}\n\n${text}`
      );
    } catch {
      setError("Could not copy the plan. Please select and copy the text manually.");
    }
  }

  return (
    <main className="site-shell">
      <nav className="topbar">
        <a className="brand" href="#" aria-label="WanderWise home">
          <span className="brand-mark">W</span>
          <span>WanderWise</span>
        </a>
        <span className="nav-note">
          <span className="live-dot" /> Your next trip starts here
        </span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>✦</span> YOUR PERSONAL AI TRAVEL DESIGNER
          </p>

          <h1>
            Less planning.
            <br />
            <span>More wandering.</span>
          </h1>

          <p className="hero-description">
            Tell us what your perfect trip looks like. Get a thoughtful,
            day-by-day travel plan made around your time, budget, and interests.
          </p>

          <div className="hero-perks">
            <span><span className="perk-icon">✓</span> Tailored itineraries</span>
            <span><span className="perk-icon">✓</span> Budget-aware ideas</span>
            <span><span className="perk-icon">✓</span> Powered by Groq AI</span>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of a sunny mountain travel destination"
        >
          <div className="sun" />
          <div className="mountain mountain-back" />
          <div className="mountain mountain-front" />
          <div className="lake" />
          <div className="art-label">
            <span>✦</span>
            <div>
              <strong>Somewhere wonderful</strong>
              <small>is closer than you think</small>
            </div>
          </div>
          <div className="floating-stamp">
            GO
            <br />
            EXPLORE
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LET’S MAKE A PLAN</p>
            <h2>Design your getaway</h2>
          </div>
          <span className="step-pill">01 <span>/</span> YOUR TRIP</span>
        </div>

        <form className="planner-card" onSubmit={submit}>
          <div className="form-grid">
            <label className="field field-wide">
              <span className="field-label">
                Where do you want to go? <b>*</b>
              </span>
              <span className="input-wrap">
                <span className="input-icon">⌖</span>
                <input
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  placeholder="e.g. Manali, Japan, Bali..."
                  required
                  maxLength={100}
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Trip duration</span>
              <span className="select-wrap">
                <span className="input-icon">◷</span>
                <select
                  value={form.days}
                  onChange={(e) => update("days", e.target.value)}
                >
                  {Array.from({ length: 7 }, (_, i) => String(i + 1)).map(
                    (day) => (
                      <option value={day} key={day}>
                        {day} {day === "1" ? "day" : "days"}
                      </option>
                    )
                  )}
                </select>
              </span>
            </label>

            <label className="field">
              <span className="field-label">Total budget (per trip)</span>
              <span className="select-wrap">
                <span className="input-icon">₹</span>
                <select
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                >
                  <option>Under ₹10,000</option>
                  <option>₹10,000–₹15,000</option>
                  <option>₹15,000–₹30,000</option>
                  <option>₹30,000–₹60,000</option>
                  <option>₹60,000–₹1,00,000</option>
                  <option>₹1,00,000+</option>
                  <option>Flexible / not sure</option>
                </select>
              </span>
            </label>

            <label className="field">
              <span className="field-label">Who’s travelling?</span>
              <span className="select-wrap">
                <span className="input-icon">♙</span>
                <select
                  value={form.travelers}
                  onChange={(e) => update("travelers", e.target.value)}
                >
                  <option>Solo traveler</option>
                  <option>2 adults</option>
                  <option>Family with kids</option>
                  <option>Group of friends</option>
                  <option>Couple</option>
                </select>
              </span>
            </label>

            <label className="field">
              <span className="field-label">Travel style</span>
              <span className="select-wrap">
                <span className="input-icon">✧</span>
                <select
                  value={form.travelStyle}
                  onChange={(e) => update("travelStyle", e.target.value)}
                >
                  <option>Balanced</option>
                  <option>Budget-friendly</option>
                  <option>Comfort & luxury</option>
                  <option>Adventure-packed</option>
                  <option>Slow & relaxed</option>
                </select>
              </span>
            </label>
          </div>

          <div className="interests-block">
            <div className="field-label">
              What are you into? <span className="optional">(choose any)</span>
            </div>

            <div className="interest-list">
              {interestOptions.map((interest) => (
                <button
                  className={`interest-chip ${
                    form.interests.includes(interest) ? "selected" : ""
                  }`}
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  aria-pressed={form.interests.includes(interest)}
                >
                  <span>
                    {form.interests.includes(interest) ? "✓" : "+"}
                  </span>
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="form-footer">
            <p>
              <span className="sparkle">✦</span>{" "}
              Your itinerary will be generated just for you.
            </p>
            <button
              className="generate-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Planning your trip...
                </>
              ) : (
                <>
                  Create my itinerary <span>↗</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="message error-message" role="alert">
            <strong>We couldn’t create your itinerary.</strong>
            <p>{error}</p>
            <small>Check the VS Code terminal for more details.</small>
          </div>
        )}

        {loading && (
          <div className="loading-panel">
            <div className="loading-orbit"><span>✦</span></div>
            <h3>Finding your kind of wonderful...</h3>
            <p>Groq is planning your trip and searching for attraction photos.</p>
          </div>
        )}

        {plan && (
          <section className="result-card" aria-live="polite">
            <div className="result-heading">
              <div>
                <p className="eyebrow">YOUR TRIP, MADE PERSONAL</p>
                <h2>{plan.destination || form.destination}</h2>
                <p className="result-budget">
                  {plan.days.length} days · Budget: {plan.totalBudget}
                </p>
              </div>
              <button
                className="copy-button"
                onClick={copyPlan}
                type="button"
              >
                Copy plan ↗
              </button>
            </div>

            {plan.imageWarning && (
              <p className="image-warning">{plan.imageWarning}</p>
            )}

            <div className="itinerary-days">
              {plan.days.map((day) => (
                <section className="itinerary-day" key={day.day}>
                  <div className="day-heading">
                    <p className="eyebrow">DAY {day.day}</p>
                    <h3>{day.title}</h3>
                    <p>{day.summary}</p>
                  </div>

                  <div className="attraction-grid">
                    {day.attractions.map((place, index) => (
                      <article
                        className="attraction-card"
                        key={`${day.day}-${place.name}-${index}`}
                      >
                        {place.image?.url ? (
                          <img
                            className="attraction-image"
                            src={place.image.url}
                            alt={`Photograph of ${place.name}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="attraction-image image-placeholder">
                            <span>✦</span>
                            <p>Photo unavailable</p>
                          </div>
                        )}

                        <div className="attraction-body">
                          <span className="attraction-time">{place.time}</span>
                          <h4>{place.name}</h4>
                          <p className="attraction-description">
                            {place.description}
                          </p>
                          <div className="attraction-cost">
                            <span>Estimated cost</span>
                            <strong>{place.estimatedCost}</strong>
                          </div>

                          {place.image && (
                            <p className="photo-credit">
                              Photo by{" "}
                              <a
                                href={`${place.image.photographerUrl}?utm_source=ai_travel_planner&utm_medium=referral`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {place.image.photographer}
                              </a>{" "}
                              on{" "}
                              <a
                                href={`${place.image.photoUrl}?utm_source=ai_travel_planner&utm_medium=referral`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Unsplash
                              </a>
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <p className="disclaimer">
              AI-generated suggestions and costs may be inaccurate. Confirm
              opening hours, prices, transport, and local travel advice before
              booking.
            </p>
          </section>
        )}
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">W</span>
          <span>WanderWise</span>
        </a>
        <span>Made for curious people and open roads.</span>
      </footer>
    </main>
  );
}
