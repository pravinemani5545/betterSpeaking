import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { QuestionCategoryEnum } from "@/lib/validators";

const BulkQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string().min(10).max(500),
        category: QuestionCategoryEnum,
      })
    )
    .min(1)
    .max(100),
});

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = BulkQuestionsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const rows = parsed.data.questions.map((q) => ({
    user_id: user.id,
    text: q.text,
    category: q.category,
    is_default: false,
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
