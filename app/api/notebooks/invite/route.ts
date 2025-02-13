// app/api/notebooks/invite/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook, User } from "@/lib/models";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notebookId, email } = await request.json();

    if (!notebookId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if the notebook exists and the current user is the owner
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

    // Check if the user is already a collaborator
    const existingCollaborator = notebook.collaborators?.find(
      (c: any) => c.email === email,
    );

    if (existingCollaborator) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 },
      );
    }

    // Find the invited user if they exist in the system
    const invitedUser = await User.findOne({ email });

    // Update the notebook with the new collaborator
    const updatedNotebook = await Notebook.findByIdAndUpdate(
      notebookId,
      {
        $push: {
          collaborators: {
            userId: invitedUser?._id || null,
            email,
            permission: "write",
            status: "pending",
          },
        },
      },
      { new: true },
    );

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
