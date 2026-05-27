"use server";

export async function fetchLatestNews(query: string = "") {
  try {
    // Using rss2json free service to fetch Google News RSS
    const rssUrl = `https://news.google.com/rss?hl=id-ID&gl=ID&ceid=ID:id${query ? `&q=${encodeURIComponent(query)}` : ""}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Gagal mengambil berita: " + (data.message || "Unknown error"));
    }

    // Map to a clean format for the AI
    return data.items.slice(0, 5).map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.author || "Google News"
    }));
  } catch (error) {
    console.error("News Fetch Error:", error);
    return [];
  }
}
