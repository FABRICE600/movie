"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";
import { LifeBuoy, HelpCircle, Mail, Search, MessageSquare, ChevronRight } from "lucide-react";

const FAQS: { category: string; q: string; a: string }[] = [
  { category: "Account", q: "How do I create an account?", a: "Click the Sign up button in the top-right corner and enter your email, username, and password. We'll send a verification email to confirm your address." },
  { category: "Account", q: "I forgot my password. How do I reset it?", a: "Click Sign in, then 'Forgot password'. Enter your email and we'll send a reset link. The link expires after 1 hour for security." },
  { category: "Account", q: "How do I delete my account?", a: "Go to Settings → Security → Request account deletion. Your data will be permanently removed within 30 days. This action cannot be undone." },
  { category: "Watchlist", q: "How many titles can I add to my watchlist?", a: "Free accounts can save up to 50 titles. Premium subscribers have unlimited watchlists and can create custom collections." },
  { category: "Watchlist", q: "Can I share my watchlist?", a: "Yes. Make your watchlist public in Settings → Profile, then share the link. Anyone with the link can view (but not edit) your watchlist." },
  { category: "Reviews", q: "How do I write a review?", a: "Open any movie or TV detail page, scroll to the Reviews section, and click 'Write a review'. You can mark reviews as containing spoilers." },
  { category: "Reviews", q: "Why was my review removed?", a: "Reviews that violate our community guidelines (hate speech, spam, harassment, unauthorized spoilers) may be removed by moderators. You'll receive a notification if this happens." },
  { category: "Data", q: "Where does your movie data come from?", a: "Movie, TV, and person data comes from TMDB (The Movie Database), a community-curated database. Supplementary ratings may come from OMDb. We follow all attribution requirements." },
  { category: "Data", q: "Is your streaming availability information accurate?", a: "Streaming availability is provided for demo purposes. For real-time data, we integrate with the Watchmode API where supported. Always verify availability with the provider before subscribing." },
  { category: "Premium", q: "What does Premium include?", a: "Premium unlocks unlimited watchlists, an ad-free experience, HD media, AI assistant access, priority support, exclusive collections, and achievement badges. See Settings → Subscription for plans." },
  { category: "Premium", q: "Can I cancel my subscription?", a: "Yes, anytime, from Settings → Subscription. Your Premium benefits continue until the end of your current billing period. No questions asked." },
  { category: "Technical", q: "Which browsers are supported?", a: "CineVerse works on the latest Chrome, Firefox, Safari, and Edge. JavaScript must be enabled. For the best experience, use a modern browser." },
  { category: "Technical", q: "Why are images not loading?", a: "Images are served from TMDB's CDN. If they fail, it may be due to network issues or TMDB rate limits. Try refreshing the page." },
  { category: "Privacy", q: "Do you sell my data?", a: "Never. We collect only the information needed to provide watchlists, ratings, reviews, and recommendations. See our Privacy Policy for full details." },
  { category: "Privacy", q: "Can I export my data?", a: "Yes. Go to Settings → Security → Export my data. You'll receive a JSON file with your profile, watchlists, ratings, reviews, and activity." },
];

const HELP_TOPICS: { title: string; desc: string; icon: typeof LifeBuoy; action: () => void }[] = [
  { title: "Getting started", desc: "Learn the basics of browsing, searching, and saving titles.", icon: LifeBuoy, action: () => {} },
  { title: "Account & security", desc: "Manage your account, password, and privacy settings.", icon: LifeBuoy, action: () => {} },
  { title: "Watchlists & collections", desc: "Organize titles, create custom lists, and share them.", icon: LifeBuoy, action: () => {} },
  { title: "Reviews & community", desc: "Write reviews, follow users, and join discussions.", icon: LifeBuoy, action: () => {} },
  { title: "Billing & subscriptions", desc: "Upgrade, downgrade, or cancel your Premium plan.", icon: LifeBuoy, action: () => {} },
  { title: "Technical issues", desc: "Troubleshoot browser, playback, and image issues.", icon: LifeBuoy, action: () => {} },
];

export function HelpView({ kind }: { kind: "help" | "faq" | "contact" }) {
  const navigate = useAppStore((s) => s.navigate);
  const [search, setSearch] = useState("");

  if (kind === "contact") {
    return <ContactForm />;
  }

  if (kind === "faq") {
    const filtered = search
      ? FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
      : FAQS;
    const grouped = filtered.reduce<Record<string, typeof FAQS>>((acc, faq) => {
      (acc[faq.category] = acc[faq.category] || []).push(faq);
      return acc;
    }, {});

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Frequently Asked Questions</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." className="pl-9" />
          </div>
        </div>

        {Object.entries(grouped).map(([category, faqs]) => (
          <div key={category} className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{category}</h2>
            <Accordion type="single" collapsible className="bg-card border border-border rounded-lg">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`${category}-${i}`} className="border-b border-border last:border-0 px-4">
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No FAQs match your search.</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate("contact")}>Contact support</Button>
          </div>
        )}

        <Card className="bg-card border-border">
          <CardContent className="p-5 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t find what you were looking for?</p>
            <Button onClick={() => navigate("contact")} className="gap-2">
              <Mail className="h-4 w-4" /> Contact our support team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // help
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Help Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Find answers, browse guides, or contact support.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search for help articles..." className="pl-9" onFocus={() => navigate("faq")} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HELP_TOPICS.map((topic) => (
          <Card
            key={topic.title}
            className="bg-card border-border hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => navigate("faq")}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <topic.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.desc}</p>
                  <div className="flex items-center gap-1 text-primary text-xs mt-2">
                    Browse articles <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h3 className="font-bold">Browse all FAQs</h3>
            <p className="text-sm text-muted-foreground">Search the full knowledge base for quick answers.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("faq")}>View FAQs</Button>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h3 className="font-bold">Contact support</h3>
            <p className="text-sm text-muted-foreground">Submit a ticket and we&apos;ll respond within 24 hours.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("contact")}>Open contact form</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactForm() {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error("Please fill in subject and message");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, email, category, message }),
      });
      if (res.ok) {
        toast.success("Support ticket submitted. We'll respond within 24 hours.");
        setSubject(""); setEmail(""); setMessage(""); setCategory("GENERAL");
      } else {
        toast.error("Failed to submit ticket");
      }
    } catch {
      toast.error("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Contact us</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit a support ticket and our team will get back to you.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General inquiry</SelectItem>
                    <SelectItem value="BILLING">Billing & subscription</SelectItem>
                    <SelectItem value="TECHNICAL">Technical issue</SelectItem>
                    <SelectItem value="CONTENT">Content or data issue</SelectItem>
                    <SelectItem value="ABUSE">Report abuse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit ticket"}
            </Button>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center">
          We respond to most tickets within 24 hours during business days. For urgent matters, please mark the ticket as
          &quot;urgent&quot; in the subject line.
        </p>
      </form>
    </div>
  );
}
