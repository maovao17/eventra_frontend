export default function Button({
  variant = "default",
  children,
  className = "",
  ...props
}: {
  variant?: "default" | "secondary";
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = variant === "secondary" ? "btn-secondary" : "theme-button";
  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
