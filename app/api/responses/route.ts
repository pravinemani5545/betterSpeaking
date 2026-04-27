import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { TextResponseSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("responses")
    .select("*, question:questions(*), analysis:analyses(*)", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (category) {
    query = query.eq("question.category", category);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ responses: data, total: count ?? 0 });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = TextResponseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("responses")
    .insert({
      user_id: user.id,
      question_id: parsed.data.question_id,
      response_type: "text",
      text_content: parsed.data.text_content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark daily question as responded
  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("daily_questions")
    .update({ responded: true })
    .eq("user_id", user.id)
    .eq("served_date", today);

  return NextResponse.json(data, { status: 201 });
}
