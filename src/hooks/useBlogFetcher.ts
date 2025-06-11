// React hook for fetching, filtering, and infinite scrolling of blogs from the public API
import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { sendRequestToPublicAPI } from "@/lib/api-service";

const PAGE_SIZE = 10;

export type Blog = {
  title: string;
  slug: string;
  created_at: string;
  image?: string;
};

const useBlogFetcher = (title?: string) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [infiniteLoading, setInfiniteLoading] = useState(false);
  const pageRef = useRef(1);

  const getBlogs = useCallback(
    async (page = 1, append = false) => {
      if (infiniteLoading) return;
      setInfiniteLoading(true);
      const params: any = {
        page,
        page_size: PAGE_SIZE,
      };
      if (title) params.title = title;
      const response = await sendRequestToPublicAPI("POST", "/blog/list/", params);
      const newBlogs = response.results || [];
      setBlogs(prev => (append ? [...prev, ...newBlogs] : newBlogs));
      setTotalCount(response.count ?? null);
      const loadedCount = append ? blogs.length + newBlogs.length : newBlogs.length;
      setHasMore(response.count ? loadedCount < response.count : newBlogs.length === PAGE_SIZE);
      setInfiniteLoading(false);
    },
    [title, infiniteLoading, blogs.length]
  );

  useEffect(() => {
    pageRef.current = 1;
    getBlogs(1, false);
    // eslint-disable-next-line
  }, [title]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        infiniteLoading ||
        !hasMore ||
        window.innerHeight + window.scrollY < document.body.offsetHeight - 200
      )
        return;
      pageRef.current += 1;
      getBlogs(pageRef.current, true);
    }, 200);

    window.addEventListener("scroll", handleScroll);
    return () => {
      handleScroll.cancel();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [infiniteLoading, hasMore, getBlogs]);

  return { blogs, infiniteLoading, hasMore, totalCount };
};

export default useBlogFetcher;
