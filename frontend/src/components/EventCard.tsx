"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, MoreVertical, Trash2, Edit2, X } from "lucide-react";
import api from "../utils/axiosInstance";
import CommentsSection from "./CommentsSection";

interface User {
  id: number;
  name: string;
  profilePic?: string;
}

interface EventProps {
  event: {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    creator: User;
    participants?: User[];
    images?: string[];
    createdAt?: string;
  };
  currentUserId?: number | null;
  onUpdate?: (updatedEvent: any) => void;
  onDelete?: (id: number) => void;
}

export default function EventCard({ event, currentUserId, onUpdate, onDelete }: EventProps) {
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(event.participants?.length || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  useEffect(() => {
    if (!event.participants) return;
    try {
      const me = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const uid = me ? JSON.parse(me).id : null;
      setJoined(!!uid && event.participants.some((p) => p.id === uid));
    } catch {
      setJoined(false);
    }
    setParticipantCount(event.participants?.length || 0);
  }, [event]);

  const handleJoin = async () => {
    const me = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!me) return alert("Please login to join events.");
    const uid = JSON.parse(me).id;

    try {
      const res = await api.post("/events/join", {
        eventId: event.id,
        userId: uid,
      });
      const updated = res.data;
      setJoined(true);
      setParticipantCount(updated.participants?.length ?? participantCount + 1);
      onUpdate && onUpdate(updated);
    } catch (err) {
      console.error("Failed to join event", err);
      alert("Failed to join event");
    }
  };

const handleDelete = async () => {
  if (!onDelete) return;
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    await api.delete(`/events/${event.id}?userId=${event.creator.id}`);
    onDelete(event.id); // update parent state
    setMenuOpen(false);
  } catch (err) {
    console.error("Failed to delete event", err);
    alert("Failed to delete event.");
  }
};


  const handleEdit = async () => {
    const newTitle = prompt("Edit Title", event.title);
    const newDescription = prompt("Edit Description", event.description);
    const newLocation = prompt("Edit Location", event.location);
    const newDate = prompt("Edit Date (YYYY-MM-DDTHH:MM)", event.date);

    if (!newTitle || !newDate) return;

    try {
      const res = await api.put(`/events/${event.id}?userId=${event.creator.id}`, {
        title: newTitle,
        description: newDescription,
        location: newLocation,
        date: newDate,
      });
      onUpdate && onUpdate(res.data);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
  };

  const eventDateText = event.date ? event.date.replace("T", " ") : "TBA";

  const maxAvatars = 5;
  const extraCount = event.participants ? event.participants.length - maxAvatars : 0;

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700 hover:border-emerald-600 transition relative">
        {/* Top Row: Creator + Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img
              src={event.creator?.profilePic || "/default-profile.png"}
              alt={event.creator?.name || "Creator"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-sm">
              <div className="font-semibold">{event.creator?.name || "Unknown"}</div>
              {event.createdAt && (
                <div className="text-gray-400 text-xs">
                  Posted: {new Date(event.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {currentUserId && currentUserId === event.creator?.id && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 hover:bg-gray-700 rounded-full transition"
              >
                <MoreVertical size={18} className="text-gray-300" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-800 rounded-md transition"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-800 rounded-md transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Event Date */}
        <div className="text-emerald-400 text-sm font-semibold mb-1">
          Scheduled for: {eventDateText}
        </div>

        {/* Title + Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
          <div className="flex flex-wrap gap-3 text-gray-300 text-sm items-center">
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} /> {participantCount} joined
            </span>
          </div>
        </div>

        {/* Participants avatars */}
        {event.participants && event.participants.length > 0 && (
         // Inside EventCard component, replace the avatars row with this:

<div className="flex items-center mt-2 gap-2">
  {event.participants?.slice(0, 5).map((p) => (
    <img
      key={p.id}
      src={p.profilePic || "/default-profile.png"}
      alt={p.name}
      className="w-8 h-8 rounded-full object-cover border-2 border-gray-700"
      title={p.name} // simple hover tooltip
    />
  ))}

  {event.participants && event.participants.length > 5 && (
    <div
      className="w-8 h-8 rounded-full bg-gray-700 text-xs flex items-center justify-center font-semibold cursor-pointer border-2 border-gray-700 relative"
      onClick={() => setShowParticipantsModal(true)}
    >
      +{event.participants.length - 5}
      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
        {event.participants.slice(5).map((p) => p.name).join(", ")}
      </div>
    </div>
  )}

  {event.participants?.length > 0 && (
    <button
      onClick={() => setShowParticipantsModal(true)}
      className="ml-2 text-gray-400 text-sm hover:underline"
    >
      View all
    </button>
  )}
</div>

        )}

        {/* Description */}
        {event.description && (
          <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{event.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={handleJoin}
            disabled={joined}
            className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition ${
              joined ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {joined ? "Joined ✅" : "Join Event"}
          </button>
          <CommentsSection postId={event.id} />
        </div>
      </div>

      {/* Participants Modal */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-5 rounded-xl w-80 max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowParticipantsModal(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded-full transition"
            >
              <X size={18} className="text-gray-300" />
            </button>
            <h3 className="text-white text-lg font-semibold mb-4">Participants</h3>
            <ul className="space-y-3">
              {event.participants?.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.profilePic || "/default-profile.png"} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-white text-sm">{p.name}</span>
                </li>
              ))}
                      </ul>
        </div>
      </div>
    )}
  </>
  );
}

