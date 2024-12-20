"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import { toast } from "react-hot-toast";
import { useState } from "react";

type GalleryItem = {
  prompt: string;
  imageBase64: string;
  createdAt: string;
};

export default function Gallery() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: gallery, isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const handleDelete = async (imageBase64: string) => {
    try {
      setDeletingId(imageBase64);

      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!res.ok) throw new Error(await res.text());

      await queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image removed from gallery");
    } catch (error) {
      toast.error("Failed to remove image");
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-5">
      <header className="mb-12 flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            className="gap-2 hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Featured Gallery</h1>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border bg-card p-4"
            >
              <div className="aspect-[4/3] w-full bg-muted" />
              <div className="mt-4 h-4 w-3/4 bg-muted" />
              <div className="mt-2 h-3 w-1/4 bg-muted" />
            </div>
          ))}
        </div>
      ) : !gallery?.length ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-6 text-center">
          <p className="max-w-md text-3xl font-semibold text-foreground md:text-4xl lg:text-5xl">
            No images in the gallery yet
          </p>
          <Link href="/">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate Some Images
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-border/60 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={`data:image/png;base64,${item.imageBase64}`}
                  alt={item.prompt}
                  width={1024}
                  height={768}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-card-foreground">{item.prompt}</p>
                <time className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </time>
              </div>
              <Button
                onClick={() => handleDelete(item.imageBase64)}
                disabled={deletingId === item.imageBase64}
                className="absolute right-2 top-2 opacity-0 transition-all duration-300 group-hover:opacity-100"
                size="icon"
                variant="destructive"
                title="Remove from gallery"
              >
                {deletingId === item.imageBase64 ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
