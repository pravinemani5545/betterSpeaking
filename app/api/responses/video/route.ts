import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const video = formData.get("video") as File;
  const questionId = formData.get("question_id") as string;
  const transcript = formData.get("transcript") as string;
  const durationSeconds = parseInt(
    (formData.get("duration_seconds") as string) || "0"
  );

  if (!video || !questionId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check file size (100MB limit)
  if (video.size > 100 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Video too large. Maximum 100MB." },
      { status: 413 }
    );
  }

  // Upload video to Supabase Storage
  const fileName = `${user.id}/${Date.now()}-${video.name}`;
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, video, { contentType: video.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(fileName);

  // Insert response
  const { data, error } = await supabase
    .from("responses")
    .insert({
      user_id: user.id,
      question_id: questionId,
      response_type: "video",
      video_url: publicUrl,
      transcript: transcript || null,
      duration_seconds: durationSeconds || null,
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
