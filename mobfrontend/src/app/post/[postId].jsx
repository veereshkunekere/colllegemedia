import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import API from "../../services/api";
import PostCard from "../../styling/components/feed/PostCard"

export default function PostScreen() {
  const { tweetId } = useLocalSearchParams();

  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const response = await API.get(`/tweets/${tweetId}`);

        setTweet(response.data.tweet);
      } catch (error) {
        console.error("Error fetching tweet:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tweetId) {
      fetchTweet();
    }
  }, [tweetId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!tweet) {
    return <Text>Post not found</Text>;
  }

  return (
    <PostCard item={tweet}/>
  );
}