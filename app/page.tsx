"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, ImagePlus, Search, Share2, Sparkles, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Meme = {
  id: string;
  sender_name: string;
  image_url: string;
  file_path: string;
  created_at: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function getSafeFileName(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${randomPart}.${extension}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function Home() {
  const [senderName, setSenderName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [query, setQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredMemes = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return memes;
    }

    return memes.filter((meme) =>
      meme.sender_name.toLowerCase().includes(cleanQuery)
    );
  }, [memes, query]);

  useEffect(() => {
    loadMemes();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  async function loadMemes() {
    const { data, error } = await supabase
      .from("memes")
      .select("id, sender_name, image_url, file_path, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`Could not load memes: ${error.message}`);
      return;
    }

    setMemes(data ?? []);
  }

  function chooseFile(nextFile?: File | null) {
    if (!nextFile) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setStatus("Only PNG, JPG, WEBP, or GIF images are allowed.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setStatus("Image is too large. Maximum size is 10MB.");
      return;
    }

    setStatus("");
    setFile(nextFile);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = senderName.trim();

    if (!cleanName || !file) {
      setStatus("Add your creator name and image first.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading your meme...");

    const fileName = getSafeFileName(file);
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("memes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("memes").getPublicUrl(filePath);

    const { data, error: insertError } = await supabase
      .from("memes")
      .insert({
        sender_name: cleanName,
        image_url: publicUrl,
        file_path: filePath,
      })
      .select("id, sender_name, image_url, file_path, created_at")
      .single();

    if (insertError) {
      setStatus(`Image uploaded, but failed to add it to the gallery: ${insertError.message}`);
      setIsUploading(false);
      return;
    }

    setMemes((current) => (data ? [data, ...current] : current));
    setSenderName("");
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setStatus("Meme uploaded. The timeline is now hotter.");
    setIsUploading(false);
  }

  async function handleShare(meme: Meme) {
    const text = `Fresh $HOTEMIN meme by ${meme.sender_name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hotemin Meme Bank",
          text,
          url: meme.image_url,
        });
      } catch {
        return;
      }
    } else {
      await navigator.clipboard.writeText(`${text}: ${meme.image_url}`);
      setStatus("Share text copied.");
    }
  }

  function handleDownload(meme: Meme) {
    const link = document.createElement("a");
    link.href = meme.image_url;
    link.download = meme.file_path.split("/").pop() || "hotemin-meme.png";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF3D6] text-[#102033]">
      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[#FF7A1A]/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-20 h-96 w-96 rounded-full bg-[#1ECBE1]/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] left-1/3 h-96 w-96 rounded-full bg-[#FFE66D]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <nav className="mb-10 flex items-center justify-between rounded-3xl border border-white/70 bg-white/45 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FF7A1A] shadow-xl shadow-[#FF7A1A]/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FF4F5E]">
                  $HOTEMIN
                </p>
                <h1 className="text-lg font-black sm:text-xl">
                  Hotemin Meme Bank
                </h1>
              </div>
            </div>

            <a
              href="#upload"
              className="rounded-full bg-[#102033] px-5 py-2 text-sm font-black text-white shadow-lg shadow-[#102033]/20 transition hover:scale-[1.02]"
            >
              Upload
            </a>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-sm font-black shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#FF4F5E]" />
                Upload. Grab. Spread the Summer.
              </div>

              <div className="space-y-5">
                <h2 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
                  The meme bank for the hottest timeline raid.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-[#102033]/75">
                  Drop your $HOTEMIN meme with your creator name. No login. No
                  gate. Just summer-grade content ready to download and spread.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard value={memes.length.toString()} label="Memes stored" />
                <StatCard
                  value={new Set(memes.map((meme) => meme.sender_name.toLowerCase())).size.toString()}
                  label="Creators"
                />
                <StatCard value="Free" label="No login" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-summer backdrop-blur">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#FF7A1A] via-[#FF4F5E] to-[#1ECBE1] p-1">
                <div className="rounded-[1.25rem] bg-[#FFF3D6]/95 p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FF4F5E]">
                        Meme Dropzone
                      </p>
                      <h3 className="text-2xl font-black">Submit your heat</h3>
                    </div>
                    <ImagePlus className="h-9 w-9 text-[#FF7A1A]" />
                  </div>

                  <form id="upload" onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black">
                        Creator name
                      </span>
                      <input
                        value={senderName}
                        onChange={(event) => setSenderName(event.target.value)}
                        maxLength={60}
                        placeholder="Example: Gear"
                        className="w-full rounded-2xl border border-[#102033]/10 bg-white/85 px-4 py-3 font-semibold outline-none transition focus:border-[#FF7A1A] focus:ring-4 focus:ring-[#FF7A1A]/15"
                      />
                    </label>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => inputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          inputRef.current?.click();
                        }
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        chooseFile(event.dataTransfer.files?.[0]);
                      }}
                      className={`cursor-pointer rounded-3xl border-2 border-dashed p-5 text-center transition ${
                        isDragging
                          ? "border-[#FF4F5E] bg-[#FF4F5E]/10"
                          : "border-[#1ECBE1]/70 bg-white/60 hover:bg-white/90"
                      }`}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt="Selected meme preview"
                            className="mx-auto max-h-72 rounded-2xl object-contain shadow-lg"
                          />
                          <p className="break-all text-sm font-bold text-[#102033]/65">
                            {file?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="py-8">
                          <UploadCloud className="mx-auto mb-3 h-11 w-11 text-[#1ECBE1]" />
                          <p className="font-black">Click or drag your image here</p>
                          <p className="mt-1 text-sm font-semibold text-[#102033]/55">
                            PNG, JPG, WEBP, GIF. Max 10MB.
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading || !senderName.trim() || !file}
                      className="w-full rounded-2xl bg-[#FF7A1A] px-5 py-4 text-base font-black text-white shadow-xl shadow-[#FF7A1A]/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-[#102033]/25 disabled:shadow-none"
                    >
                      {isUploading ? "Uploading..." : "Submit Meme"}
                    </button>

                    {status ? (
                      <p className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-bold text-[#102033]/70">
                        {status}
                      </p>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#1ECBE1]">
              Gallery
            </p>
            <h2 className="text-3xl font-black">Community uploads</h2>
          </div>

          <label className="relative block w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#102033]/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creator name..."
              className="w-full rounded-2xl border border-[#102033]/10 bg-white/80 py-3 pl-12 pr-4 font-semibold outline-none transition focus:border-[#1ECBE1] focus:ring-4 focus:ring-[#1ECBE1]/15"
            />
          </label>
        </div>

        {memes.length === 0 ? (
          <EmptyState
            title="No memes uploaded yet."
            description="Upload the first meme and start filling the bank."
          />
        ) : filteredMemes.length === 0 ? (
          <EmptyState
            title="No results found."
            description="Try searching another creator name."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMemes.map((meme) => (
              <article
                key={meme.id}
                className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#102033]/10"
              >
                <a
                  href={meme.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square overflow-hidden bg-[#102033]/5"
                >
                  <img
                    src={meme.image_url}
                    alt={`$HOTEMIN meme by ${meme.sender_name}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </a>

                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF4F5E]">
                      Uploaded by
                    </p>
                    <h3 className="truncate text-xl font-black">
                      {meme.sender_name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#102033]/55">
                      {formatDate(meme.created_at)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(meme)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102033] px-3 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
                    >
                      <Download className="h-4 w-4" />
                      Grab
                    </button>

                    <button
                      onClick={() => handleShare(meme)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1ECBE1] px-3 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#102033]/60">{label}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/45 p-10 text-center shadow-sm backdrop-blur">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-[#FFE66D]">
        <ImagePlus className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-[#102033]/65">{description}</p>
    </div>
  );
}
