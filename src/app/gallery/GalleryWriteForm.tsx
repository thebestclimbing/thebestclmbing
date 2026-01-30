"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/SubmitButton";

export default function GalleryWriteForm({ authorId }: { authorId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    const urls = imageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const supabase = createClient();
    const { error: err } = await supabase.from("photo_album_posts").insert({
      author_id: authorId,
      title: title.trim(),
      body: body.trim(),
      images: urls,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/gallery");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-6">
      <div className="mb-4">
        <label className="mb-1 block text-sm text-[var(--chalk-muted)]">제목 *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-base" />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm text-[var(--chalk-muted)]">본문</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="input-base min-h-[100px]" />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm text-[var(--chalk-muted)]">이미지 URL (한 줄에 하나씩)</label>
        <textarea value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={3} placeholder="https://..." className="input-base" />
      </div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <SubmitButton loading={loading} loadingLabel="등록 중..." className="btn-primary disabled:pointer-events-none">
          등록
        </SubmitButton>
        <Link href="/gallery" className="btn-outline inline-block px-4 py-3 text-center text-sm">
          취소
        </Link>
      </div>
    </form>
  );
}
