import { getConversations } from "@/lib/actions/ai-actions";
import AIChatContainer from "@/components/admin/AIChatContainer";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "McdAI | SukaMCD Intelligence",
  description: "Advanced AI assistance for SukaMCD administrators.",
};

export default async function McdAIPage() {
  const user = await getCurrentUser();
  const initialConversations = await getConversations();
  
  const profile = user ? await queryOne("SELECT * FROM profiles WHERE id = ? LIMIT 1", [user.id]) : null;

  return (
    <div className="h-[calc(100%+4rem)] -m-8 flex overflow-hidden bg-black">
      <AIChatContainer initialConversations={initialConversations} profile={profile} />
    </div>
  );
}
