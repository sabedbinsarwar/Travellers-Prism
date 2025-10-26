"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  Check,
  Clock,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

export default function EventCard({
  event,
  currentUserId,
  onUpdate,
  onDelete,
}: EventProps) {
  const [joined, setJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState<number>(
    event.participants?.length || 0
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    date: new Date(event.date),
  });

  useEffect(() => {
    if (!event.participants) return;
    try {
      const me =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const uid = me ? JSON.parse(me).id : null;
      setJoined(!!uid && event.participants.some((p) => p.id === uid));
    } catch {
      setJoined(false);
    }
    setParticipantCount(event.participants?.length || 0);
  }, [event]);

  const handleJoin = async () => {
    const me =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
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

  const confirmDelete = async () => {
    if (!onDelete) return;
    try {
      await api.delete(`/events/${event.id}?userId=${event.creator.id}`);
      onDelete(event.id);
      setMenuOpen(false);
      setShowDeleteConfirm(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event.");
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await api.put(
        `/events/${event.id}?userId=${event.creator.id}`,
        {
          ...formData,
          date: formData.date.toISOString(),
        }
      );
      onUpdate && onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
  };

  const eventDateText = event.date
    ? new Date(event.date).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBA";

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700 hover:border-emerald-600 transition relative overflow-hidden">
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
                    onClick={handleEditToggle}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-800 rounded-md transition"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-800 rounded-md transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editable or static content */}
        {isEditing ? (
          <div className="space-y-3 mt-2">
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Event Title"
            />
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Description"
            />
            <input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Location"
            />

            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={18} className="text-emerald-400" />
                <label className="text-gray-300 text-sm font-medium">
                  Select Date & Time
                </label>
              </div>
              <DatePicker
                selected={formData.date}
                onChange={(date: Date | null) => {
                  if (date) setFormData({ ...formData, date });
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Pick a date and time"
                className="w-full p-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                popperClassName="z-50"
              />
            </div>

            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
              >
                <Check size={16} /> Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-emerald-400 text-sm font-semibold mb-1">
              Scheduled for: {eventDateText}
            </div>

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

            {event.description && (
              <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">
                {event.description}
              </p>
            )}
          </>
        )}

        {!isEditing && (
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={handleJoin}
              disabled={joined}
              className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition ${
                joined
                  ? "bg-gray-600 cursor-not-allowed text-gray-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {joined ? "Joined ✅" : "Join Event"}
            </button>
            <CommentsSection postId={event.id} />
          </div>
        )}
      </div>

      {/* 🟢 Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 max-w-sm text-center">
            <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete this event?
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
