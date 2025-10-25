"use client";

import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../utils/axiosInstance";
import CommentsSection from "./CommentsSection";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onUpdate?: (updatedPost: any) => void;
  onDelete?: (postId: number) => void;
}

export default function PostCard({ post, currentUserId, onUpdate, onDelete }: PostCardProps) {
  const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);
  const [liked, setLiked] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || "");
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(post.comments?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = post.user || { name: "Unknown", profilePic: "/default-profile.png" };
  const isOwner = currentUserId && currentUserId === post.user?.id?.toString();

  useEffect(() => {
    const me = localStorage.getItem("user");
    if (me && post.likes) {
      const uid = JSON.parse(me).id;
      setLiked(post.likes.some((l: any) => l.user?.id === uid));
    }
  }, [post]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete && onDelete(post.id);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const getFileUrl = (file: string, type: "image" | "video") => {
    if (!file) return type === "image" ? "/default-image.png" : "";
    return file.startsWith("http") ? file : `http://localhost:5000/uploads/${file}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl relative">
      {/* Three-dot menu */}
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
                onClick={() => { setEditing(true); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 w-full text-white hover:bg-gray-800"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={handleDelete}
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
          <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
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
              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-sm"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap">{post.content}</p>

          {/* Images */}
          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="mt-3 grid gap-3">
              {post.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={getFileUrl(img, "image")}
                  className="w-full rounded max-h-96 object-contain"
                  alt={`Post image ${idx + 1}`}
                  onError={(e) => (e.currentTarget.src = "/default-image.png")}
                />
              ))}
            </div>
          )}

          {/* Videos */}
          {Array.isArray(post.videos) && post.videos.length > 0 && (
            <div className="mt-3 space-y-3">
              {post.videos.map((vid: string, idx: number) => (
                <video key={idx} controls className="w-full rounded max-h-[420px]">
                  <source src={getFileUrl(vid, "video")} />
                </video>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 border-t border-gray-700 pt-2">
        <div className="flex items-center gap-4">
          {/* Like Button */}
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

          {/* Comment Toggle Button */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1 p-2 rounded-full text-gray-300 hover:text-emerald-500 hover:scale-105 transition-transform"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-semibold">{commentsCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
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
  );
}
