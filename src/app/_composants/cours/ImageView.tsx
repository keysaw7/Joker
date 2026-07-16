import Image from "next/image";

interface ImageViewProps {
  url: string;
  alt: string;
}

export function ImageView({ url, alt }: ImageViewProps) {
  const estDataUrl = url.startsWith("data:");

  if (estDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className="mx-auto max-h-80 w-full rounded-lg object-contain"
      />
    );
  }

  return (
    <div className="relative mx-auto aspect-video max-h-80 w-full">
      <Image
        src={url}
        alt={alt}
        fill
        className="rounded-lg object-contain"
        unoptimized
      />
    </div>
  );
}
