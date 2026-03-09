export default function Input({
  placeholder,
}: {
  placeholder: string;
}) {
  return (
    <input
      placeholder={placeholder}
      className="border rounded-lg px-4 py-2 w-full"
    />
  );
}