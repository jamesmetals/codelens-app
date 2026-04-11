import { getTechnologyImageStyles } from "./TechnologyImageUtils";

function getInitials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("");
}

export default function TechnologyArtwork({ technology, className = "" }) {
  const image = technology?.image;

  return (
    <div className={`relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#081423] ${className}`}>
      {image?.src ? (
        <>
          <img
            src={image.src}
            alt={technology?.name || "Tecnologia"}
            className="absolute select-none object-cover"
            draggable="false"
            style={getTechnologyImageStyles(image)}
          />
          <div className="technology-artwork-fade absolute inset-0" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(93,169,255,0.22),_transparent_58%),linear-gradient(180deg,_rgba(15,31,52,0.98),_rgba(7,17,31,0.96))]">
          <span className="font-['Space_Grotesk'] text-xl font-bold tracking-[0.2em] text-sky-100/85">
            {getInitials(technology?.name) || "TL"}
          </span>
        </div>
      )}
    </div>
  );
}
