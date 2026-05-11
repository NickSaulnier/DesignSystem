import { forwardRef, useState, type HTMLAttributes } from "react";
import clsx from "clsx";

export type AvatarSize  = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?:      string;
  alt?:      string;
  name?:     string;
  size?:     AvatarSize;
  shape?:    AvatarShape;
}

function initialsFrom(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size = "md", shape = "circle", className, children, ...rest },
  ref,
) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = src && !imageFailed;

  return (
    <span
      ref={ref}
      className={clsx("ds-avatar", `ds-avatar--${size}`, `ds-avatar--${shape}`, className)}
      role="img"
      aria-label={alt ?? name ?? "Avatar"}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? ""}
          className="ds-avatar__image"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="ds-avatar__fallback" aria-hidden="true">
          {children ?? initialsFrom(name)}
        </span>
      )}
    </span>
  );
});
