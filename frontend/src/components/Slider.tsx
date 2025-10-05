import { useState } from "react";

export default function Slider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % images.length);
  const prev = () => setCurrent((current - 1 + images.length) % images.length);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <img src={images[current]} className="w-full h-64 object-cover rounded" />
      <button onClick={prev} className="absolute left-2 top-1/2 bg-white p-1 rounded">◀</button>
      <button onClick={next} className="absolute right-2 top-1/2 bg-white p-1 rounded">▶</button>
    </div>
  );
}
