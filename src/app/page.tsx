"use client";

import { useAppStore } from "@/store/app-store";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { AuthDialog } from "@/components/site/auth-dialog";
import { HomeView } from "@/components/views/home-view";
import { DiscoverView } from "@/components/views/discover-view";
import { MovieDetailsView } from "@/components/views/movie-details-view";
import { PeopleListView, PersonDetailsView } from "@/components/views/people-view";
import { SearchView } from "@/components/views/search-view";
import { WatchlistView, FavoritesView, ProfileView } from "@/components/views/user-views";
import { AdminView } from "@/components/views/admin-view";
import {
  ListingView,
  GenresView,
  ProvidersView,
  CollectionsView,
  TrailersView,
  StaticPage,
} from "@/components/views/listing-views";
import { AiAssistantView } from "@/components/views/ai-assistant-view";
import { BoxOfficeView } from "@/components/views/box-office-view";
import { AwardsView } from "@/components/views/awards-view";
import { CalendarView } from "@/components/views/calendar-view";
import { CompareView } from "@/components/views/compare-view";
import { SettingsView } from "@/components/views/settings-view";
import { HelpView } from "@/components/views/help-view";
import { TriviaView } from "@/components/views/trivia-view";
import { YearReviewView } from "@/components/views/year-review-view";
import { FranchisesView } from "@/components/views/franchises-view";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <CurrentView view={view} navigate={navigate} />
      </main>

      <Footer />
      <AuthDialog />
    </div>
  );
}

function CurrentView({ view, navigate }: { view: string; navigate: any }) {
  switch (view) {
    case "home":
      return <HomeView />;
    case "discover":
      return <DiscoverView />;
    case "movie":
      return <MovieDetailsView mediaType="MOVIE" />;
    case "tv-details":
      return <MovieDetailsView mediaType="TV" />;
    case "movies":
      return <ListingView kind="movies" />;
    case "tv":
      return <ListingView kind="tv" />;
    case "people":
      return <PeopleListView />;
    case "person":
      return <PersonDetailsView />;
    case "search":
      return <SearchView />;
    case "watchlist":
      return <WatchlistView />;
    case "favorites":
      return <FavoritesView />;
    case "profile":
      return <ProfileView />;
    case "admin":
      return <AdminView />;
    case "genres":
      return <GenresView />;
    case "trending":
      return <ListingView kind="trending" />;
    case "top-rated":
      return <ListingView kind="top-rated" />;
    case "upcoming":
      return <ListingView kind="upcoming" />;
    case "now-playing":
      return <ListingView kind="now-playing" />;
    case "collections":
      return <CollectionsView />;
    case "providers":
      return <ProvidersView />;
    case "trailers":
      return <TrailersView />;
    case "about":
      return <StaticPage kind="about" />;
    case "privacy":
      return <StaticPage kind="privacy" />;
    case "terms":
      return <StaticPage kind="terms" />;
    case "ai-assistant":
      return <AiAssistantView />;
    case "box-office":
      return <BoxOfficeView />;
    case "awards":
      return <AwardsView />;
    case "calendar":
      return <CalendarView />;
    case "compare":
      return <CompareView />;
    case "settings":
      return <SettingsView />;
    case "subscription":
      return <SettingsView initialTab="subscription" />;
    case "help":
      return <HelpView kind="help" />;
    case "faq":
      return <HelpView kind="faq" />;
    case "contact":
      return <HelpView kind="contact" />;
    case "trivia":
      return <TriviaView />;
    case "year-review":
      return <YearReviewView />;
    case "franchises":
      return <FranchisesView />;
    default:
      return <HomeView />;
  }
}
