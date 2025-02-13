import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook, User } from "@/lib/models";
import { authOptions } from "../auth/[...nextauth]/auth.config";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get both owned and shared notebooks
    const notebooks = await Notebook.find({
      $or: [
        { userId: session.user.id },
        { "collaborators.email": session.user.email },
      ],
    })
      .populate("userId", "username email")
      .populate("collaborators.userId", "username email")
      .sort({ updatedAt: -1 });

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error("Error in GET /api/notebooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch notebooks" },
      { status: 500 },
    );
  }
}

// app/api/notebooks/invite/route.ts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId, email, permission = "read" } = await request.json();

    if (!notebookId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if notebook exists and user is owner
    const notebook = await Notebook.findOne({
      _id: notebookId,
      userId: session.user.id,
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = notebook.collaborators?.find(
      (c: any) => c.email === email,
    );

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 },
      );
    }

    // Find invited user if they exist
    const invitedUser = await User.findOne({ email });

    // Add collaborator
    const updatedNotebook = await Notebook.findByIdAndUpdate(
      notebookId,
      {
        $push: {
          collaborators: {
            userId: invitedUser?._id || null,
            email,
            permission,
            status: "pending",
            invitedAt: new Date(),
          },
        },
      },
      { new: true },
    )
      .populate("userId", "username email")
      .populate("collaborators.userId", "username email");

    return NextResponse.json({
      message: "Invitation sent successfully",
      notebook: updatedNotebook,
    });
  } catch (error) {
    console.error("Error in notebook invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 },
    );
  }
}
