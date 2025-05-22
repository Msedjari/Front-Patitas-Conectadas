import React, { useState } from 'react';
import PostList from '../components/home/PostList';
import { Post } from '../types/post';
import { UserImagesCache } from '../types/userImagesCache';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userImagesCache, setUserImagesCache] = useState<UserImagesCache>({});
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handlePostDeleted = (deletedPostId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
  };

  const handleLoadMore = () => {
    setLoadingMorePosts(true);
    // Implement the logic to load more posts
  };

  const handleCommentSubmit = (commentData: CommentData) => {
    // Implement the logic to submit a comment
  };

  return (
    <div>
      <PostList 
        posts={posts} 
        userImagesCache={userImagesCache} 
        userId={user?.id || 0}
        loading={loadingMorePosts}
        onLoadMore={handleLoadMore}
        onCommentSubmit={handleCommentSubmit}
        onPostDeleted={handlePostDeleted}
      />
    </div>
  );
};

export default Home; 