const canvasBaseUrl = process.env.CANVAS_BASE_URL;
const canvasApiToken = process.env.CANVAS_API_TOKEN;

function requireCanvasEnv() {
  if (!canvasBaseUrl || !canvasApiToken) {
    throw new Error("Canvas environment variables are missing.");
  }
}

function canvasUrl(path: string) {
  requireCanvasEnv();
  const base = new URL(canvasBaseUrl!);
  return new URL(path, base).toString();
}

async function canvasFetch<T>(path: string): Promise<T> {
  const response = await fetch(canvasUrl(path), {
    headers: {
      Authorization: `Bearer ${canvasApiToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Canvas request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

type CanvasEnrollment = {
  computed_current_score: number | null;
  computed_final_score: number | null;
};

export type CanvasCourseResponse = {
  id: number;
  name: string;
  course_code?: string | null;
  enrollments?: CanvasEnrollment[];
};

export type CanvasAssignmentResponse = {
  id: number;
  course_id: number;
  name: string;
  due_at: string | null;
  html_url?: string | null;
  points_possible?: number | null;
  submission?: {
    workflow_state?: string | null;
    submission_type?: string | null;
    late?: boolean | null;
    missing?: boolean | null;
  } | null;
};

const excludedCoursePatterns = [
  /advisory/i,
  /college counseling/i,
  /investment club/i,
  /strength and conditioning/i,
  /summer/i,
  /upper school/i,
  /jwac/i,
];

export function isAcademicCanvasCourse(course: Pick<CanvasCourseResponse, "name" | "course_code">) {
  const haystack = `${course.name} ${course.course_code ?? ""}`;
  return !excludedCoursePatterns.some((pattern) => pattern.test(haystack));
}

export function getDisplayScore(course: Pick<CanvasEnrollment, "computed_current_score" | "computed_final_score">) {
  const current = course.computed_current_score;
  if (current != null) {
    return current;
  }
  return course.computed_final_score;
}

export function normalizeDisplayScore(score: number | null | undefined) {
  if (score == null) return null;
  if (score < 0) return null;
  return Math.min(score, 100);
}

export async function fetchCanvasCourses() {
  return canvasFetch<CanvasCourseResponse[]>(
    "/api/v1/courses?enrollment_state=active&per_page=100&include[]=total_scores"
  );
}

export async function fetchCanvasAssignments(courseId: number) {
  return canvasFetch<CanvasAssignmentResponse[]>(
    `/api/v1/courses/${courseId}/assignments?bucket=upcoming&order_by=due_at&per_page=50&include[]=submission`
  );
}
