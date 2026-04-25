import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Star, Send, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export const ReviewSection = ({ tmdbId, mediaType }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data as any);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [tmdbId, mediaType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vous devez être connecté pour laisser un avis.");
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          user_id: user.id,
          tmdb_id: tmdbId,
          media_type: mediaType,
          rating,
          comment: comment.trim(),
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast.error("Vous avez déjà laissé un avis pour ce titre.");
        } else {
          throw error;
        }
      } else {
        toast.success("Merci pour votre avis !");
        setComment("");
        setRating(5);
        fetchReviews();
      }
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 animate-fade-in">
      <h2 className="font-display text-2xl md:text-3xl text-accent mb-8 flex items-center gap-3">
        <Star className="w-6 h-6 fill-accent" /> {t("review_title")}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-surface-card border border-accent-subtle/30 rounded-2xl p-6 mb-12 shadow-glow/5">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-10 h-10 border border-accent-subtle">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-accent/10 text-accent"><User className="w-5 h-5" /></AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">{t("review_placeholder")}</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        (hoveredRating || rating) >= star ? "text-accent fill-accent" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs text-accent font-mono">{hoveredRating || rating}/10</span>
              </div>
            </div>
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("review_placeholder")}
            className="w-full bg-surface-primary border border-border rounded-xl p-4 text-sm focus:border-accent-subtle outline-none min-h-[100px] mb-4 resize-none transition-all"
            required
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-6 py-2.5 rounded-full shadow-accent hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t("review_submit")}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-card border border-border rounded-2xl p-8 text-center mb-12">
          <p className="text-muted-foreground mb-4">{t("review_login_prompt")}</p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-surface-card/50 shimmer-gold rounded-2xl" />
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-surface-card border border-border/50 rounded-2xl p-6 hover:border-accent-subtle/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 border border-border">
                    <AvatarImage src={review.profiles?.avatar_url || ""} />
                    <AvatarFallback className="bg-surface-elevated"><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{review.profiles?.username || "Utilisateur"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-accent/10 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-xs font-mono text-accent font-bold">{review.rating}/10</span>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">{t("review_empty")}</p>
        )}
      </div>
    </div>
  );
};
