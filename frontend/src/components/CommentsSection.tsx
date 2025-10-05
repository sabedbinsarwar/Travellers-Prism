import { useState } from "react";
import api from "../utils/axiosInstance";

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const res = await api.get(`/comments/post/${postId}`);
    setComments(res.data);
  };

  const addComment = async () => {
    await api.post("/comments", { postId, content: text, userId: 1 });
    setText("");
    fetchComments();
  };

  return (
    <div className="mt-2">
      <h4 className="font-bold">Comments</h4>
      {comments.map(c => (
        <p key={c.id}><strong>{c.user?.name}:</strong> {c.content}</p>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          className="border p-1 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={addComment} className="bg-blue-500 text-white px-2 rounded">Add</button>
      </div>
    </div>
  );
}
