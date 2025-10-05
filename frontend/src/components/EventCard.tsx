export default function EventCard({ event }: { event: any }) {
  return (
    <div className="border p-4 rounded shadow-md">
      <h3 className="font-bold">{event.title}</h3>
      <p>{event.description}</p>
      <p className="text-sm text-gray-500">{event.location} | {event.date}</p>
    </div>
  );
}
