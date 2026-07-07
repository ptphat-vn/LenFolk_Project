import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import type { ReferencePracticeTrack, ReferenceTrackId } from "./types";

export type ReferenceSheetPracticeProps = {
  analysisPending: boolean;
  isBasicTuneLesson: boolean;
  isCompactReferenceSheetLesson: boolean;
  isFingerPracticeLesson: boolean;
  isPreparingRecorder: boolean;
  isRecording: boolean;
  referencePracticeTracks: ReferencePracticeTrack[];
  referenceSheetCardHeight: number;
  referenceSheetCardImageWidth: number;
  referenceSheetCardWidth: number;
  selectedReferenceTrack: ReferencePracticeTrack;
  selectedReferenceTrackId: ReferenceTrackId;
  selectedReferenceTrackIsPlaying: boolean;
  onOpenSheetViewer: () => void;
  onPlayReferenceTrack: (track: ReferencePracticeTrack) => void;
  onSelectReferenceTrackPage: (trackId: ReferenceTrackId) => void;
};

export function ReferenceSheetPractice({
  analysisPending,
  isBasicTuneLesson,
  isCompactReferenceSheetLesson,
  isFingerPracticeLesson,
  isPreparingRecorder,
  isRecording,
  referencePracticeTracks,
  referenceSheetCardHeight,
  referenceSheetCardImageWidth,
  referenceSheetCardWidth,
  selectedReferenceTrack,
  selectedReferenceTrackId,
  selectedReferenceTrackIsPlaying,
  onOpenSheetViewer,
  onPlayReferenceTrack,
  onSelectReferenceTrackPage,
}: ReferenceSheetPracticeProps) {
  const isDisabled = isRecording || analysisPending || isPreparingRecorder;

  return (
    <View className="gap-4 rounded-[26px] bg-white p-5">
      <View>
        <Text className="text-xs font-bold uppercase tracking-wider text-[#8E9E6E]">
          Page luyện tập
        </Text>
        <Text className="mt-1 text-sm leading-5 text-[#777B70]">
          {isBasicTuneLesson
            ? "Chạm vào sheet để phóng to và luyện theo từng dòng."
            : `Chọn ${isFingerPracticeLesson ? "5.1 hoặc 5.2" : "4.1 hoặc 4.2"}, chạm vào sheet để nghe mẫu và thổi theo.`}
        </Text>
      </View>

      {referencePracticeTracks.length > 1 && (
        <View className="flex-row rounded-[18px] bg-[#F1F2EC] p-1">
          {referencePracticeTracks.map((track) => {
            const isSelected = selectedReferenceTrackId === track.id;

            return (
              <TouchableOpacity
                key={track.id}
                activeOpacity={0.85}
                disabled={isDisabled}
                onPress={() => onSelectReferenceTrackPage(track.id)}
                className={`flex-1 items-center rounded-[15px] px-4 py-3 ${
                  isSelected ? "bg-white" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isSelected ? "text-[#10120C]" : "text-[#687451]"
                  }`}
                >
                  {track.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View
        className={`overflow-hidden rounded-[22px] border ${
          selectedReferenceTrackIsPlaying
            ? "border-[#8E9E6E] bg-[#F7F8F3]"
            : "border-[#E5E7E1] bg-white"
        }`}
      >
        <View className="flex-row items-center gap-3 px-4 py-3">
          {selectedReferenceTrack.audio ? (
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isRecording || analysisPending}
              onPress={() => onPlayReferenceTrack(selectedReferenceTrack)}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                selectedReferenceTrackIsPlaying ? "bg-[#8E9E6E]" : "bg-[#F1F2EC]"
              }`}
            >
              <Ionicons
                name={selectedReferenceTrackIsPlaying ? "pause" : "play"}
                size={18}
                color={selectedReferenceTrackIsPlaying ? "white" : "#687451"}
              />
            </TouchableOpacity>
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F1F2EC]">
              <Ionicons name="expand-outline" size={18} color="#687451" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm font-bold text-[#10120C]">
              {selectedReferenceTrack.title}
            </Text>
            <Text className="mt-0.5 text-xs leading-4 text-[#777B70]">
              {selectedReferenceTrackIsPlaying
                ? "Đang phát audio mẫu"
                : "Chạm sheet để phóng to"}
            </Text>
          </View>
        </View>

        <View className="gap-3 px-3 pb-4">
          {selectedReferenceTrack.sheets.map((sheet, sheetIndex) => (
            <ScrollView
              key={`${selectedReferenceTrack.id}-sheet-${sheetIndex}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={!isCompactReferenceSheetLesson}
              contentContainerStyle={{
                alignItems: "center",
                justifyContent: "center",
                minWidth: referenceSheetCardWidth,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={onOpenSheetViewer}
                className="items-center justify-center rounded-[14px] bg-white"
                style={{
                  height: referenceSheetCardHeight,
                  width: referenceSheetCardWidth,
                  paddingHorizontal: isCompactReferenceSheetLesson ? 12 : 0,
                }}
              >
                <Image
                  source={sheet}
                  contentFit={isBasicTuneLesson ? "fill" : "contain"}
                  style={{
                    height: referenceSheetCardHeight,
                    width: referenceSheetCardImageWidth,
                  }}
                />
              </TouchableOpacity>
            </ScrollView>
          ))}
        </View>
      </View>

      {referencePracticeTracks.length > 1 && (
        <View className="flex-row gap-3">
          {referencePracticeTracks.map((track) => {
            const isSelected = selectedReferenceTrackId === track.id;

            return (
              <TouchableOpacity
                key={`${track.id}-page-button`}
                activeOpacity={0.85}
                disabled={isSelected || isDisabled}
                onPress={() => onSelectReferenceTrackPage(track.id)}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-[18px] px-4 py-3 ${
                  isSelected ? "bg-[#E2E8D3]" : "bg-[#10120C]"
                }`}
              >
                <Ionicons
                  name={track.id.endsWith(".1") ? "chevron-back" : "chevron-forward"}
                  size={16}
                  color={isSelected ? "#687451" : "white"}
                />
                <Text
                  className={`text-sm font-bold ${
                    isSelected ? "text-[#687451]" : "text-white"
                  }`}
                >
                  {track.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
