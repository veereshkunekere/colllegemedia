// pages/home.jsx
import Chats from "../features/chat/Chats";
import TweetFeed from "../features/tweet/TweetFeed";

function Home() {
  return (
    <div className="flex h-full">
      {/* Main Feed */}
      <main className="flex-1 border-r border-gray-800 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <TweetFeed />
        </div>
      </main>

      {/* Right Sidebar - Chats */}
      <div className="w-80 border-l border-gray-800 hidden xl:block overflow-y-auto custom-scrollbar">
        <Chats />
      </div>
    </div>
  );
}

export default Home;