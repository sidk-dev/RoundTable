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
      title: "Secure Auth Foundation",
      description:
        "Email signup, verification, login, and protected routes ensure authenticated access to app features.",
      accent: "primary",
    },
    {
      title: "Public And Private Communities",
      description:
        "Create communities with visibility controls and let members collaborate in focused spaces.",
      accent: "accent",
    },
    {
      title: "Role-Based Membership",
      description:
        "Membership roles (VIEWER, WRITER, ADMIN) define who can read, contribute, and manage.",
      accent: "primary",
    },
    {
      title: "Personalized Feed",
      description:
        "Your feed aggregates posts from communities you joined, with smooth infinite scrolling.",
      accent: "accent",
    },
  ];

  const roles = [
    {
      title: "Viewer",
      description:
        "Read posts and explore communities you join without publishing new content.",
      points: [
        "Join public communities",
        "Read public and community posts",
        "Follow discussions in your feed",
      ],
      accent: "primary",
    },
    {
      title: "Writer",
      description:
        "Create and edit posts to share knowledge in communities where you have writer access.",
      points: [
        "Create and edit posts",
        "Publish to global or community contexts",
        "Set post visibility where applicable",
      ],
      accent: "accent",
      featured: true,
    },
    {
      title: "Admin",
      description:
        "Own and manage communities, including settings, visibility, and overall structure.",
      points: [
        "Automatically assigned on community creation",
        "Update community details",
        "Manage and grow community spaces",
      ],
      accent: "primary",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Account And Verify Email",
      description:
        "Sign up with email and password, verify your account, then access protected routes after login.",
    },
    {
      step: "02",
      title: "Join Or Create Communities",
      description:
        "Browse public communities and join instantly as VIEWER or WRITER, or create your own community as ADMIN.",
    },
    {
      step: "03",
      title: "Read Feed And Publish Posts",
      description:
        "Read posts from joined communities in your feed and publish posts globally or inside communities.",
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
                Focused communities. Practical knowledge.
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-snug text-t-primary">
                Learn Faster In <span className="text-primary">Structured</span>{" "}
                <br />
                <span className="text-accent">Communities</span> That Share
                Quality.
              </h1>

              <p className="text-base lg:text-lg text-t-secondary max-w-xl mx-auto lg:mx-0">
                RoundTable is built for meaningful discussion: verify your
                account, join focused communities, and contribute with clear
                role-based permissions as VIEWER, WRITER, or ADMIN.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <RootButton onClick={onButtonClick}>Get Started</RootButton>
              </div>

              <p className="text-sm text-t-muted mt-2">
                Verified accounts • Public or private communities • Feed from
                joined spaces
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
              A clear product flow from signup to community participation and
              publishing.
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
              Communities use explicit roles so each user has clear capabilities
              from day one.
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
              Built for authenticated collaboration across communities, posts,
              and personalized feeds.
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
                Start Collaborating With Clear Roles
              </h2>
              <p className="text-lg text-t-secondary leading-relaxed mb-10">
                Join communities, build your feed, and contribute posts where
                your membership role allows.
              </p>
              <RootButton onClick={onButtonClick}>Get Started</RootButton>
              <p className="mt-8 text-sm text-t-muted">
                Viewer, Writer, Admin roles • Public and private communities
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
