import React from "react";
import Image from "next/image";

type UserAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

export default function UserAvatar({
  name,
  imageUrl,
  size = 32,
  className,
}: UserAvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dimension = `${size}px`;

  return imageUrl ? (
    <Image
      src={imageUrl}
      alt={name ?? "User"}
      width={size}
      height={size}
      unoptimized
      className={
        "inline-block rounded-full border border-white/10 object-cover " +
        (className ?? "")
      }
      style={{ width: dimension, height: dimension }}
    />
  ) : (
    <div
      className={
        "inline-flex items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white " +
        (className ?? "")
      }
      style={{ width: dimension, height: dimension }}
      aria-label={name ?? "User"}
      role="img"
    >
      {initials}
    </div>
  );
}
