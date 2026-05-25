import FriendCard from "./FriendCard";

interface Friend {
  _id: string;
  username: string;
  streakCount: number;
  visionsCount: number;
}

interface FriendListProps {
  friends?: Friend[];
  onRemoveFriend?: (friendId: string) => Promise<void>;
  onChatFriend?: (friendId: string) => void;
}

const FriendList = ({
  friends = [],
  onRemoveFriend,
  onChatFriend,
}: FriendListProps) => {


  if (!friends || friends.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-4">
        No friends yet
      </div>
    );
  }

  const handleRemove = (friendId: string, username: string) => {
    if (confirm(`Remove ${username} from friends?`)) {
      onRemoveFriend?.(friendId);
    }
  };

  return (
    <div className="space-y-3">
      {friends.map((friend, i) => (
        <FriendCard
          key={friend._id}
          friendId={friend._id}
          username={friend.username}
          streakCount={friend.streakCount}
          visionsCount={friend.visionsCount}
          index={i}
          onRemove={() => handleRemove(friend._id, friend.username)}
          onChat={() => onChatFriend?.(friend._id)}
        />

      ))}
    </div>
  );
};

export default FriendList;
