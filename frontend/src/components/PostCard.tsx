export default function PostCard({ post }: { post: any }) {
  return (
    <div className="border p-4 rounded shadow-md">
      <h3 className="font-bold">{post.user?.name}</h3>
      <p>{post.content}</p>
      {post.media && <img src={post.media} className="mt-2 rounded" />}
    </div>
  );
}
