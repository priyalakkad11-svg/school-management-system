import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Campus Life, Labs, Library & Fleet",
  description:
    "Explore Greenwood International Academy facilities: 22 STEM & Robotics labs, 18,000+ RFID library collection, GPS buses, residential hostel, and sports complex.",
};

const FACILITIES = [
  { tag: "STEM Labs", title: "22 Physics, Chemistry, Bio & AI Robotics Labs", desc: "Dedicated discovery stations with supervised instrumentation." },
  { tag: "Library", title: "RFID Digital & Print Resource Center", desc: "18,400+ curated books, academic journals, and quiet study pods." },
  { tag: "Transport", title: "18 GPS-Tracked Bus Routes", desc: "Real-time boarding & drop alerts pushed to the Parent Portal." },
  { tag: "Sports", title: "Athletics Track, Swimming & Indoor Courts", desc: "Trained coaches for inter-school CBSE cluster championships." },
];

export default function CampusLifePage() {
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="max-w-3xl flex flex-col gap-3">
          <span className="self-start">
            <StatusBadge tone="info">14-Acre Smart Campus</StatusBadge>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink">
            Campus Life, Sports &amp; Smart Infrastructure
          </h1>
          <p className="text-base text-ink-secondary">
            Safe, green, and technologically integrated campus designed for holistic growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FACILITIES.map((item) => (
            <Card key={item.title} className="p-6 flex flex-col gap-2.5">
              <span className="self-start">
                <StatusBadge tone="primary">{item.tag}</StatusBadge>
              </span>
              <h2 className="text-lg font-bold text-ink">{item.title}</h2>
              <p className="text-sm text-ink-secondary">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

