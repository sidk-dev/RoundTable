import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import RootButton from "./components/Button/RootButton";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  const onButtonClick = () => {
    navigate("/login"); // if user is logged in he will be redirect to feed page
  };

  const benefits = [
    {
      title: "Signal Over Noise",
      description:
        "Every community is moderated to keep discussions focused, relevant, and valuable.",
      accent: "primary",
    },
    {
      title: "Clear Participation Rules",
      description:
        "Roles define what you can do, creating structured collaboration instead of chaos.",
      accent: "accent",
    },
    {
      title: "Quality Contributions",
      description:
        "Posts come from approved writers, ensuring thoughtful insights and credibility.",
      accent: "primary",
    },
    {
      title: "Community-Driven Trust",
      description:
        "Moderators protect standards and culture, keeping communities healthy over time.",
      accent: "accent",
    },
  ];

  const roles = [
    {
      title: "Viewer",
      description:
        "Explore communities and read curated posts. Ideal for learning and staying informed.",
      points: [
        "Browse public communities",
        "Read approved posts",
        "Request creator access",
      ],
      accent: "primary",
    },
    {
      title: "Writer",
      description:
        "Share insights and contribute knowledge within communities you’re approved for.",
      points: [
        "Create and edit posts",
        "Participate in discussions",
        "Build credibility",
      ],
      accent: "accent",
      featured: true,
    },
    {
      title: "Moderator",
      description:
        "Maintain quality and structure by reviewing access requests and moderating content.",
      points: [
        "Approve or reject requests",
        "Moderate posts",
        "Enforce community rules",
      ],
      accent: "primary",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Discover a Community",
      description:
        "Explore public communities or discover private spaces centered around focused topics and expertise.",
    },
    {
      step: "02",
      title: "Request Access",
      description:
        "Apply to join as a Viewer or Creator. Moderators review requests to ensure quality and relevance.",
    },
    {
      step: "03",
      title: "Read or Contribute",
      description:
        "Once approved, participate by reading curated posts or contributing knowledge based on your role.",
    },
  ];

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* ================= Hero Section ================= */}
      <section
        id="home"
        className="relative min-h-screen w-full pt-24 pb-36 bg-bg overflow-visible"
      >
        <div className="relative max-w-6xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center w-full">
            {/* Text */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <span className="inline-flex mx-auto lg:mx-0 w-fit items-center rounded-full border border-border bg-surface px-4 py-1 text-sm text-t-muted">
                A moderated knowledge platform
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-snug text-t-primary">
                Thoughtful <span className="text-primary">Communities</span>,{" "}
                <br />
                Insightful <span className="text-accent">Discussions</span>.
              </h1>

              <p className="text-base lg:text-lg text-t-secondary max-w-xl mx-auto lg:mx-0">
                RoundTable is a role-based knowledge-sharing platform where
                access, contribution, and moderation are intentionally designed
                to protect quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <RootButton onClick={onButtonClick}>Let's Start</RootButton>
              </div>

              <p className="text-sm text-t-muted mt-2">
                Moderated access • Community-scoped roles • Signal over noise
              </p>
            </div>

            {/* Visuals */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative z-10 rounded-3xl border border-border bg-surface shadow-xl overflow-hidden w-[420px] h-[280px]">
                <img
                  src="https://picsum.photos/520/380"
                  alt="Community discussion"
                  className="object-cover w-full h-full"
                />
              </div>
              <img
                src="https://picsum.photos/160/160?random=1"
                alt="Insight"
                className="hidden lg:block absolute -top-10 left-10 w-36 h-36 rounded-2xl object-cover border border-border shadow-lg"
              />
              <img
                src="https://picsum.photos/160/160?random=2"
                alt="Collaboration"
                className="hidden lg:block absolute -bottom-12 right-10 w-32 h-32 rounded-2xl object-cover border border-border shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= How It Works Timeline ================= */}
      <section
        id="how-it-works"
        className="relative w-full pt-18 pb-36 bg-bg overflow-visible"
      >
        {/* Blur backgrounds */}
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-48 w-[32rem] h-[32rem] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute left-40 bottom-30 w-[24rem] h-[24rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-t-primary mb-4">
              How RoundTable Works
            </h2>
            <p className="text-lg text-t-secondary">
              A clear, moderated flow designed for structured and meaningful
              knowledge sharing.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 h-full w-px bg-border" />
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`relative mb-16 lg:mb-24 flex flex-col lg:flex-row ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}
              >
                <div
                  className={`w-full lg:w-5/12 ${index % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12 lg:text-left"}`}
                >
                  <div className="group relative bg-bg border border-border rounded-2xl p-7 lg:p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                    <span className="inline-flex items-center mb-4 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold tracking-wide">
                      STEP {step.step}
                    </span>
                    <h3 className="text-xl font-semibold text-t-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-t-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-bg border-4 border-primary z-10" />
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Roles Section ================= */}
      <section
        id="roles"
        className="relative w-full pt-18 pb-36 bg-bg overflow-visible"
      >
        <div className="relative max-w-6xl mx-auto px-6 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-t-primary mb-4">
              Roles & Responsibilities
            </h2>
            <p className="text-lg text-t-secondary">
              Every community is structured with clear roles to ensure quality,
              trust, and meaningful participation.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className={`relative rounded-2xl border border-border bg-surface p-8 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl ${role.featured ? "lg:-translate-y-6 shadow-lg" : ""}`}
              >
                <div
                  className={`absolute top-0 left-0 h-1 w-full rounded-t-2xl ${role.accent === "primary" ? "bg-primary" : "bg-accent"}`}
                />
                <h3 className="text-xl font-semibold text-t-primary mb-3">
                  {role.title}
                </h3>
                <p className="text-t-secondary mb-6 leading-relaxed">
                  {role.description}
                </p>
                <ul className="space-y-3">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-t-secondary"
                    >
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${role.accent === "primary" ? "bg-primary" : "bg-accent"}`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                {role.featured && (
                  <span className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full bg-accent/15 text-accent">
                    Most Common
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Benefits Section ================= */}
      <section
        id="benefits"
        className="relative w-full pt-18 pb-36 bg-bg overflow-visible"
      >
        <div className="relative max-w-6xl mx-auto px-6 md:px-16">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-t-primary mb-4">
              Why RoundTable
            </h2>
            <p className="text-lg text-t-secondary">
              Designed for people who value clarity, structure, and meaningful
              knowledge exchange.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group relative rounded-2xl border border-border bg-surface p-7 shadow-sm hover:shadow-md transition"
              >
                <div
                  className={`absolute top-5 right-5 h-2 w-2 rounded-full ${b.accent === "primary" ? "bg-primary" : "bg-accent"}`}
                />
                <h3 className="text-lg font-semibold text-t-primary mb-3">
                  {b.title}
                </h3>
                <p className="text-sm text-t-secondary leading-relaxed">
                  {b.description}
                </p>
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none ${b.accent === "primary" ? "bg-primary/5" : "bg-accent/5"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Join Section ================= */}
      <section
        id="join"
        className="relative w-full pt-18 pb-36 bg-bg overflow-visible"
      >
        <div className="relative max-w-5xl mx-auto px-6 md:px-16">
          <div className="relative rounded-3xl border border-border bg-surface p-10 lg:p-16 shadow-sm">
            <div className="absolute inset-0 rounded-3xl bg-primary/5 pointer-events-none" />
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-t-primary mb-6">
                Join Communities That Value Quality
              </h2>
              <p className="text-lg text-t-secondary leading-relaxed mb-10">
                Read with clarity, contribute with purpose, and grow within
                moderated communities.
              </p>
              <RootButton onClick={onButtonClick}>Let's Start</RootButton>
              <p className="mt-8 text-sm text-t-muted">
                Access is moderated • Roles are community-scoped • No spam
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
