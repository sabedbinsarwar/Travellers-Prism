"use client";

import {
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../utils/axiosInstance";
import CommentsSection from "./CommentsSection";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onUpdate?: (updatedPost: any) => void;
  onDelete?: (postId: number) => void;
}

export default function PostCard({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}: PostCardProps) {
  const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);
  const [liked, setLiked] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || "");
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(
    post.comments?.length || 0
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);

  const user = post.user || {
    name: "Unknown",
    profilePic: "/default-profile.png",
  };
  const isOwner = currentUserId && currentUserId === post.user?.id?.toString();

  useEffect(() => {
    const me = localStorage.getItem("user");
    if (me && post.likes) {
      const uid = JSON.parse(me).id;
      setLiked(post.likes.some((l: any) => l.user?.id === uid));
    }
  }, [post]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLike = async () => {
    const me = localStorage.getItem("user");
    if (!me) return alert("Login to like");
    const uid = JSON.parse(me).id;
    try {
      const res = await api.post("/likes", { userId: uid, postId: post.id });
      setLiked(res.data.liked);
      setLikesCount((c) => (res.data.liked ? c + 1 : Math.max(0, c - 1)));
    } catch (err: any) {
      console.error(err);
      alert("Failed to like post");
    }
  };

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    try {
      const res = await api.put(`/posts/${post.id}`, { content: editedContent });
      onUpdate && onUpdate(res.data);
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update post");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/posts/${post.id}`);
      setIsDeleted(true);
      setShowDeleteConfirm(false);
      setTimeout(() => {
        onDelete && onDelete(post.id);
      }, 500);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const getFileUrl = (file: string, type: "image" | "video") => {
    if (!file) return type === "image" ? "/default-image.png" : "";
    return file.startsWith("http") ? file : `http://localhost:5000/uploads/${file}`;
  };

  const allMedia = [...(post.images || []), ...(post.videos || [])];

  const openModal = (index: number) => {
    setCurrentMediaIndex(index);
    setShowModal(true);
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const renderMedia = () => {
    if (allMedia.length === 0) return null;
    const display = allMedia.slice(0, 5);
    const extraCount = allMedia.length - 5;
    const gridClass =
      display.length === 1
        ? "grid-cols-1"
        : display.length === 2
        ? "grid-cols-2 gap-2"
        : display.length === 3
        ? "grid-cols-2 gap-2"
        : "grid-cols-2 gap-2";

    return (
      <div className={`mt-3 grid ${gridClass}`}>
        {display.map((item: string, idx: number) => {
          const isVideo = post.videos.includes(item);
          const isLastExtra = idx === 4 && extraCount > 0;

          return (
            <div key={idx} className="relative cursor-pointer" onClick={() => openModal(idx)}>
              {isVideo ? (
                <video
                  controls={false}
                  className={`w-full object-cover rounded ${
                    display.length === 1
                      ? "max-h-[500px]"
                      : display.length === 2
                      ? "max-h-[400px]"
                      : display.length >= 3 && idx === 0
                      ? "col-span-2 max-h-[400px]"
                      : "max-h-[200px]"
                  }`}
                >
                  <source src={getFileUrl(item, "video")} />
                </video>
              ) : (
             <img
  src={getFileUrl(item, "image")}
  className={`w-full rounded ${
    display.length === 1
      ? "max-h-[800px] object-contain"   // allow full portrait
      : display.length === 2
      ? "max-h-[600px] object-contain"
      : display.length >= 3 && idx === 0
      ? "col-span-2 max-h-[600px] object-contain"
      : "max-h-[400px] object-contain"
  }`}
  onError={(e) => (e.currentTarget.src = "/default-image.png")}
/>

              )}
              {isLastExtra && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold rounded">
                  +{extraCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div
        className={`bg-gray-800 p-4 rounded-xl relative border border-gray-700 hover:border-emerald-600 transition transform duration-300 ${
          isDeleted ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Menu */}
        {isOwner && !editing && (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-700 transition"
            >
              <MoreHorizontal size={20} className="text-gray-300" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-white hover:bg-gray-800"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-red-500 hover:bg-gray-800"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <img
            src={user.profilePic || "/default-profile.png"}
            className="w-10 h-10 rounded-full object-cover"
            alt={user.name}
          />
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <div className="space-y-2 mt-3">
            <textarea
              className="w-full p-2 rounded bg-gray-700 text-white resize-none"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 text-sm text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-emerald-600 rounded hover:bg-emerald-700 text-sm text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 whitespace-pre-wrap text-gray-200">
              {post.content}
            </p>
            {renderMedia()}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 border-t border-gray-700 pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 p-2 rounded-full transition-transform duration-150 ${
                liked
                  ? "text-red-500 scale-110"
                  : "text-gray-300 hover:text-red-500 hover:scale-105"
              }`}
            >
              <Heart fill={liked ? "currentColor" : "none"} size={20} />
              <span className="text-sm font-semibold">{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments((prev) => !prev)}
              className="flex items-center gap-1 p-2 rounded-full text-gray-300 hover:text-emerald-500 hover:scale-105 transition-transform"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-semibold">{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <CommentsSection
            postId={post.id}
            open={showComments}
            isEvent={false}
            key={post.id}
            {...{ setCommentsCount }}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-700 p-6 max-w-sm text-center">
            <Trash2 size={36} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete this post?
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

      {/* Media Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-5 right-5 text-white p-2 rounded-full hover:bg-gray-700 transition"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl w-full relative flex items-center justify-center">
            {allMedia[currentMediaIndex].endsWith(".mp4") ? (
              <video controls className="max-h-[80vh] w-auto max-w-full rounded">
                <source src={getFileUrl(allMedia[currentMediaIndex], "video")} />
              </video>
            ) : (
              <img
                src={getFileUrl(allMedia[currentMediaIndex], "image")}
                className="max-h-[80vh] w-auto max-w-full rounded"
              />
            )}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                >
                  ◀
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
      `}</style>
    </>
  );
}
