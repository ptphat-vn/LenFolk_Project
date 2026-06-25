import { lessonHasPractice, lessons as allLessons } from "@/constants/lessons";
import type { Course } from "@/types/courses.type";
import type { Lesson } from "@/types/lessons.type";

import type { LessonDetailViewModel } from "./types";

type BuildLessonDetailInput = {
  dbLesson?: Lesson;
  id?: string;
  lessonCourse?: Course;
};

const getCourseCategory = (course?: Course) => {
  if (!course) return "Cơ bản";
  if (course.level === "beginner") return "Cơ bản";
  if (course.level === "intermediate") return "Trung cấp";
  return "Nâng cao";
};

export const buildLessonDetail = ({
  dbLesson,
  id,
  lessonCourse,
}: BuildLessonDetailInput): LessonDetailViewModel | null => {
  if (!dbLesson) return null;

  const mockLesson = allLessons.find(
    (lesson) =>
      String(lesson.id) === id ||
      lesson.title === dbLesson.title ||
      dbLesson.title.includes(`Bài ${lesson.id}:`),
  );

  const minutes = Math.floor(dbLesson.duration / 60);
  const seconds = dbLesson.duration % 60;
  const duration = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const hasPractice = lessonHasPractice(mockLesson?.id);

  const objective = hasPractice
    ? dbLesson.description ||
      mockLesson?.objective ||
      "Nhận biết tư thế cầm sáo và vị trí đặt môi đúng."
    : mockLesson?.objective || dbLesson.description || "";
  const theory = hasPractice
    ? dbLesson.techniques?.length
      ? dbLesson.techniques
      : mockLesson?.theory || ["Thực hành đúng kỹ thuật", "Luyện hơi đều đặn"]
    : mockLesson?.theory?.length
      ? mockLesson.theory
      : dbLesson.techniques || [];

  return {
    id: dbLesson._id,
    lessonNumber: mockLesson?.id,
    title: dbLesson.title,
    category: getCourseCategory(lessonCourse),
    duration,
    hasPractice,
    objective,
    theory,
    targetNote: mockLesson?.targetNote || dbLesson.techniques?.[0] || "A",
    practiceTip: mockLesson?.practiceTip || "Giữ nốt ổn định trong 3 đến 5 giây.",
    videoUrl: dbLesson.videoUrl || null,
  };
};
