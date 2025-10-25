"use client";

import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function CommentsSection({
  postId,
  isEvent = false,
  open = false,
  setCommentsCount,
}: {
  postId: number;
  isEvent?: boolean;
  open?: boolean;
  setCommentsCount?: (n: number) => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const type = isEvent ? "event" : "post";

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${type}/${postId}`);
      setComments(res.data || []);
      setCommentsCount?.(res.data.length || 0);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [postId, open]);

  const addComment = async () => {
    const me = localStorage.getItem("user");
    if (!me) return alert("Login to comment");
    const uid = JSON.parse(me).id;
    if (!text.trim()) return;

    try {
      const res = await api.post("/comments", {
        userId: uid,
        content: text,
        [`${type}Id`]: postId,
      });
      setComments((c) => [...c, res.data]);
      setCommentsCount?.(comments.length + 1);
      setText("");
    } catch (err) {
      console.error("Failed to add comment", err);
      alert("Could not post comment");
    }
  };

  if (!open) return null;

  return (
    <div className="mt-2 bg-black p-3 rounded-xl border border-gray-700 shadow-lg max-h-64 overflow-y-auto">
      {/* Comments List */}
      <div className="space-y-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 bg-black p-2 rounded-xl hover:bg-gray-900 transition"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
              <img
                src={c.user?.profilePic || "/default-profile.png"}
                alt={c.user?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  {c.user?.name || "User"}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(c.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex items-center gap-2 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 rounded-full bg-black border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
        <button
          onClick={addComment}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-semibold hover:scale-105 transition-transform"
        >
          Send
        </button>
      </div>
    </div>
  );
}
