import type { Course } from "@/types/courses.type";
import type { Lesson } from "@/types/lessons.type";

type CourseAccessInfo = Pick<
  Course,
  "courseType" | "isFree" | "level" | "title"
>;

export const isTechniqueCourse = (course?: CourseAccessInfo | null) => {
  if (!course) return false;

  const courseType = course.courseType?.toLowerCase() || "";
  const title = course.title?.toLowerCase() || "";

  return (
    course.level === "intermediate" ||
    course.level === "advanced" ||
    courseType === "technique" ||
    title.includes("technique") ||
    title.includes("kỹ thuật")
  );
};

export const canAccessLesson = (
  lesson?: Pick<Lesson, "isFree"> | null,
  course?: CourseAccessInfo | null,
  hasPremiumAccess = false,
) => {
  if (!course) return true;
  if (isTechniqueCourse(course)) return hasPremiumAccess;
  if (course.level === "beginner") return true;

  return lesson?.isFree === true || course.isFree === true || hasPremiumAccess;
};

export const getUpgradeMessage = (title?: string) =>
  title
    ? `"${title}" thuộc gói Technique. Hãy mở gói để học bài này.`
    : "Nội dung này thuộc gói Technique. Hãy mở gói để tiếp tục học.";
