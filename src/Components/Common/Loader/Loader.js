export default function Loader({ label = "Loading...", fullScreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-(--secondary-text) ${
        fullScreen ? "min-h-[60vh]" : "py-12"
      }`}
    >
      <span className="h-10 w-10 rounded-full border-2 border-(--border-color) border-t-(--btn-primary) animate-spin" />
      <p className="text-sm font-sans">{label}</p>
    </div>
  );
}
