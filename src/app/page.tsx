import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  CheckCircle2,
  FlaskConical,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { CommunicationService } from "@/services/school.service";

const HIGHLIGHTS = [
  { label: "Students Enrolled", value: "2,480+ K-12 Learners" },
  { label: "Faculty Ratio", value: "1:14 Certified Educators" },
  { label: "Board Results", value: "99.4% Distinction Rate" },
  { label: "Smart Campus", value: "GPS Transport • Digital Library" },
];

const QUICK_CARDS = [
  {
    badge: "Portal Access",
    tone: "info" as const,
    title: "Unified Role-Based Dashboards",
    desc: "Dedicated portals for Super Admin, Faculty, Students, and Parents with real-time sync.",
    cta: "Open Portal Login",
    href: "/login",
  },
  {
    badge: "3 New Notices",
    tone: "info" as const,
    title: "Campus Notices & Exam Schedules",
    desc: "Stay up to date with mid-term timetables, annual science expo dates, and holiday circulars.",
    cta: "View Notice Board",
    href: "/notices",
  },
  {
    badge: "Apply Now",
    tone: "info" as const,
    title: "Admissions 2026–27 Open",
    desc: "Submit online admission enquiry for Nursery to Grade 11 and schedule your campus tour.",
    cta: "Start Application",
    href: "/apply",
  },
];

const CURRICULUM_CARDS = [
  {
    badge: "Pre-Primary & Primary",
    grade: "Grades Nur – 5",
    title: "Foundational Numeracy, Literacy & Inquiry",
    points: [
      "Play-based Montessori & NEP foundational framework",
      "Bilingual reading studio and robotics discovery lab",
      "Continuous portfolio & milestone observation reports",
    ],
  },
  {
    badge: "Middle School",
    grade: "Grades 6 – 8",
    title: "Integrated STEM, Languages & Humanities",
    points: [
      "Hands-on physics, chemistry, biology & coding labs",
      "Olympiad mentorship & interdisciplinary project sprints",
      "Structured skill rubrics and parent progress reviews",
    ],
  },
  {
    badge: "Senior Secondary",
    grade: "Grades 9 – 12",
    title: "Science, Commerce & Global University Prep",
    points: [
      "CBSE / IB aligned streams with dedicated career counseling",
      "Mock board series, AI data lab & practical assessments",
      "Digital report cards, transcripts & exam cell portal",
    ],
  },
];

const CAMPUS_FACILITIES = [
  {
    icon: FlaskConical,
    title: "STEM & Robotics Labs",
    desc: "22 specialized science, AI computing, and maker labs equipped for hands-on discovery.",
  },
  {
    icon: BookOpen,
    title: "18,000+ Digital & Print Library",
    desc: "RFID-enabled catalog with automated issue/return tracking and digital reading pods.",
  },
  {
    icon: Bus,
    title: "GPS-Tracked Fleet (18 Routes)",
    desc: "Live parent bus notifications, RFID gate check-in alerts, and trained route attendants.",
  },
  {
    icon: Building2,
    title: "Residential Hostel & Dining",
    desc: "Monitored student wings with biometric safety, study halls, and nutritious dining.",
  },
  {
    icon: ShieldCheck,
    title: "24x7 Campus Safety",
    desc: "CCTV perimeter coverage, nurse infirmary, and verified parent gate-pass workflows.",
  },
  {
    icon: Globe,
    title: "Sports & Performing Arts",
    desc: "Olympic-size track, indoor badminton complex, music conservatory, and amphitheater.",
  },
];

export default async function LandingHomePage() {
  const notices = await CommunicationService.listNotices();

  return (
    <PublicLayout>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "Greenwood International Academy",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu",
            telephone: "+91-20-6789-4200",
            email: "admissions@greenwood.edu",
            address: {
              "@type": "PostalAddress",
              streetAddress: "42 Knowledge Park Boulevard, Baner Annexe",
              addressLocality: "Pune",
              addressRegion: "Maharashtra",
              postalCode: "411045",
              addressCountry: "IN",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "EduCore — Greenwood International Academy",
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenwood.edu",
          },
        ]}
      />
      <section className="bg-subtle/60 border-b border-line py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <span className="text-xs sm:text-sm font-semibold text-brand">
              Admissions Open • Academic Year 2026–27
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-ink leading-[1.15]">
              Empowering Future Leaders Through Excellence &amp; Innovation
            </h1>
            <p className="text-base sm:text-lg text-ink-secondary max-w-2xl leading-relaxed">
              A unified K-12 campus powered by EduCore ERP — connecting students, parents,
              faculty, and administration seamlessly.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/apply">
                <Button variant="primary" size="lg">
                  Apply for Admission
                </Button>
              </Link>
              <Link href="/admissions">
                <Button variant="outline" size="lg">
                  Download Prospectus
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-6 sm:p-7 shadow-modal">
              <h2 className="text-base font-bold text-ink pb-4 border-b border-line">
                Quick Campus Highlights
              </h2>
              <dl className="divide-y divide-line">
                {HIGHLIGHTS.map((item) => (
                  <div
                    key={item.label}
                    className="py-3.5 flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <dt className="text-ink-secondary">{item.label}</dt>
                    <dd className="font-semibold text-brand text-right">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUICK_CARDS.map((card) => (
            <Card key={card.title} className="p-6 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="self-start">
                  <StatusBadge tone={card.tone}>{card.badge}</StatusBadge>
                </div>
                <h3 className="text-lg font-bold text-ink">{card.title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{card.desc}</p>
              </div>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <span>{card.cta}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section id="academics" className="py-14 sm:py-16 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="self-start">
              <StatusBadge tone="primary">Academics</StatusBadge>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Structured K–12 Curriculum &amp; STEM Excellence
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Aligned with national board standards with personalized faculty mentorship and
              continuous skill assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CURRICULUM_CARDS.map((wing) => (
              <Card key={wing.grade} className="p-6 flex flex-col gap-4">
                <span className="self-start">
                  <StatusBadge tone="info">{wing.badge}</StatusBadge>
                </span>
                <div>
                  <div className="text-xl font-bold text-ink">{wing.grade}</div>
                  <p className="text-sm font-medium text-brand pt-1">{wing.title}</p>
                </div>
                <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary pt-2 border-t border-line">
                  {wing.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-4 h-4 text-success shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="admissions" className="py-14 sm:py-16 bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <span className="self-start">
              <StatusBadge tone="success">Admissions 2026–27</StatusBadge>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Transparent 4-Step Digital Admission Workflow
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Parents can submit online enquiries, upload required birth &amp; transfer documents,
              track assessment slots, and complete seat confirmation online.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/apply">
                <Button variant="primary">Apply Online Now</Button>
              </Link>
              <Link href="/admissions">
                <Button variant="outline">View Fee &amp; Seat Matrix</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { step: "Step 01", title: "Online Enquiry", desc: "Register student & parent profile in 3 minutes." },
              { step: "Step 02", title: "Campus Visit", desc: "Guided lab tour & faculty interaction slot." },
              { step: "Step 03", title: "Document Review", desc: "Digital verification via EduCore Admissions." },
              { step: "Step 04", title: "Fee & Enrollment", desc: "Instant Admission ID & Parent Portal activation." },
            ].map((s) => (
              <Card key={s.step} className="p-5 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-brand">{s.step}</span>
                <h3 className="text-base font-bold text-ink">{s.title}</h3>
                <p className="text-xs text-ink-secondary">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="campus-life" className="py-14 sm:py-16 bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="self-start">
              <StatusBadge tone="info">Campus Life</StatusBadge>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              Safe, Smart &amp; Future-Ready Facilities
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Purpose-built 14-acre green campus integrating STEM discovery, athletics, and smart
              RFID campus logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAMPUS_FACILITIES.map((fac) => {
              const Icon = fac.icon;
              return (
                <Card key={fac.title} className="p-6 flex flex-col gap-3">
                  <span className="w-10 h-10 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-bold text-ink">{fac.title}</h3>
                  <p className="text-sm text-ink-secondary">{fac.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="notices" className="py-14 sm:py-16 bg-canvas border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">Latest Notices &amp; Upcoming Events</h2>
              <p className="text-sm text-ink-secondary">
                Published directly from the EduCore Principal &amp; Exam Cell Office.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/notices">
                <Button variant="outline">All Notices</Button>
              </Link>
              <Link href="/events">
                <Button variant="secondary">Event Calendar</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {notices.map((notice) => (
              <Card key={notice.id} className="p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge
                    tone={
                      notice.category === "Event"
                        ? "success"
                        : notice.category === "Finance"
                          ? "warning"
                          : "info"
                    }
                  >
                    {notice.category}
                  </StatusBadge>
                  <span className="text-xs text-ink-muted inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    {notice.date}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink">{notice.title}</h3>
                <p className="text-xs text-ink-secondary">Audience: {notice.audience}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-14 sm:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 flex items-start gap-4">
            <span className="w-10 h-10 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Main Campus Address</h3>
              <p className="text-sm text-ink-secondary pt-1">
                42 Knowledge Park Boulevard, Baner Annexe, Pune, Maharashtra 411045
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-start gap-4">
            <span className="w-10 h-10 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Admissions &amp; Helpdesk</h3>
              <p className="text-sm text-ink-secondary pt-1">
                +91 20 6789 4200 (Mon–Sat, 08:00 AM – 04:30 PM)
              </p>
            </div>
          </Card>
          <Card className="p-6 flex items-start gap-4">
            <span className="w-10 h-10 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">Official Correspondence</h3>
              <p className="text-sm text-ink-secondary pt-1">
                admissions@greenwood.edu • support@greenwood.edu
              </p>
            </div>
          </Card>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card className="p-6 sm:p-8 bg-brand-soft border-brand/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-lg bg-brand text-ink-on-dark inline-flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">Already part of Greenwood Academy?</h2>
                <p className="text-sm text-ink-secondary">
                  Access attendance, digital fee receipts, exam marks, and parent messaging.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/login">
                <Button variant="primary">
                  <Award className="w-4 h-4" aria-hidden="true" />
                  <span>Go to Role Portal</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
