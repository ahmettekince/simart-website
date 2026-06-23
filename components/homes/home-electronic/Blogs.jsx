import BlogsClient from "./BlogsClient";

export default function Blogs({ blogs = [], lang = "tr" }) {
  if (!blogs || blogs.length === 0) return null;

  return <BlogsClient blogs={blogs} lang={lang} />;
}
