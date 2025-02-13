import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/lib/models";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId } = await request.json();
    await connectToDatabase();

    const notebook = await Notebook.findOneAndUpdate(
      {
        _id: notebookId,
        "collaborators.email": session.user.email,
      },
      {
        $set: {
          "collaborators.$.status": "accepted",
          "collaborators.$.userId": session.user.id,
        },
      },
      { new: true },
    );

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Invitation accepted", notebook });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}
