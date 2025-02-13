import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Notebook } from "@/lib/models";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notebook = await Notebook.findOne({
      _id: params.id,
      $or: [
        { userId: session.user.id },
        { "collaborators.email": session.user.email },
      ],
    })
      .populate("userId", "username email")
      .populate("collaborators.userId", "username email");

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(notebook);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notebook" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();
    await connectToDatabase();

    // Check if user is owner or accepted collaborator with write permission
    const notebook = await Notebook.findOne({
      _id: params.id,
      $or: [
        { userId: session.user.id },
        {
          collaborators: {
            $elemMatch: {
              email: session.user.email,
              status: "accepted",
              permission: "write",
            },
          },
        },
      ],
    });

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    const updatedNotebook = await Notebook.findByIdAndUpdate(
      params.id,
      { content },
      { new: true },
    );

    return NextResponse.json(updatedNotebook);
  } catch (error) {
    console.error("Error updating notebook:", error);
    return NextResponse.json(
      { error: "Failed to update notebook" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const data = await request.json();
    const updateData: any = { updatedAt: new Date() };

    if (data.content) updateData.content = data.content;
    if (data.sketchData) {
      updateData.$push = {
        sketches: {
          data: data.sketchData,
          createdAt: new Date(),
        },
      };
    }

    // Check if user is owner or has write permission
    const notebook = await Notebook.findOneAndUpdate(
      {
        _id: params.id,
        $or: [
          { userId: session.user.id },
          {
            collaborators: {
              $elemMatch: {
                email: session.user.email,
                status: "accepted",
                permission: "write",
              },
            },
          },
        ],
      },
      updateData,
      { new: true },
    );

    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error("Error updating notebook:", error);
    return NextResponse.json(
      { error: "Failed to update notebook" },
      { status: 500 },
    );
  }
}
