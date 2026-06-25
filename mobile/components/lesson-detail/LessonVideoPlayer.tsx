import { View } from "react-native";
import { VideoView } from "expo-video";
import YoutubePlayer, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from "react-native-youtube-iframe";

type Props = {
  onYoutubeStateChange: (state: PLAYER_STATES) => void;
  player: React.ComponentProps<typeof VideoView>["player"];
  videoUrl: string | null;
  youtubePlayerRef: React.RefObject<YoutubeIframeRef | null>;
  youtubeVideoId: string | null;
};

export function LessonVideoPlayer({
  onYoutubeStateChange,
  player,
  videoUrl,
  youtubePlayerRef,
  youtubeVideoId,
}: Props) {
  if (youtubeVideoId) {
    return (
      <View className="w-full overflow-hidden rounded-[28px] bg-black shadow-sm">
        <YoutubePlayer
          ref={youtubePlayerRef}
          height={200}
          play={false}
          videoId={youtubeVideoId}
          onChangeState={onYoutubeStateChange}
        />
      </View>
    );
  }

  if (!videoUrl) return null;

  return (
    <View className="aspect-[16/9] w-full overflow-hidden rounded-[28px] bg-black shadow-sm">
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}
