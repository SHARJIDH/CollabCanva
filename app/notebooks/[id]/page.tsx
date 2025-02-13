"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import SketchPad from "@/app/components/sketch-pad";
import InviteModal from "@/app/components/invite-modal";
import { UserCircle, Share2, Crown } from "lucide-react";
import { DownloadButton } from "@/app/components/download-button";

interface Collaborator {
  userId: string;
  email: string;
  permission: "read" | "write";
  status: "pending" | "accepted";
}

interface Notebook {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    email: string;
    username: string;
  };
  collaborators: Collaborator[];
  sketches: Array<{ data: string }>;
}

export default function NotebookPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const socketRef = useRef<any>(null);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [content, setContent] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null);
  const [sketchCanvasRef, setSketchCanvasRef] =
    useState<React.RefObject<HTMLCanvasElement> | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/auth");
      return;
    }

    socketRef.current = io("/", {
      path: "/api/socket.io",
    });

    socketRef.current.emit("join-notebook", params.id);

    socketRef.current.on("note-updated", (data: any) => {
      setContent(data.content);
    });

    socketRef.current.on("sketch-updated", (data: any) => {
      setNotebook((prev: any) => ({
        ...prev,
        sketches: [...(prev.sketches || []), { data: data.data }],
      }));
    });

    fetchNotebook();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [session, params.id]);

  const fetchNotebook = async () => {
    const res = await fetch(`/api/notebooks/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setNotebook(data);
      setContent(data.content);
    }
  };

  const updateContent = async (newContent: string) => {
    setContent(newContent);
    socketRef.current?.emit("update-note", {
      notebookId: params.id,
      content: newContent,
    });

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notebooks/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newContent }),
        });

        if (!res.ok) {
          console.error("Failed to save:", await res.text());
        }
      } catch (error) {
        console.error("Error auto-saving:", error);
      }
    }, 1000);

    setAutoSaveTimeout(timeout);
  };

  const acceptInvitation = async () => {
    try {
      const res = await fetch("/api/notebooks/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId: params.id }),
      });

      if (res.ok) {
        await fetchNotebook();
        setInvitationStatus("accepted");
      } else {
        setInvitationStatus("error");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setInvitationStatus("error");
    }
  };

  const isOwner = notebook?.userId._id === session?.user?.id;
  const currentCollaborator = notebook?.collaborators?.find(
    (c) => c.email === session?.user?.email,
  );
  const isPendingInvitation = currentCollaborator?.status === "pending";
  const canEdit =
    isOwner ||
    (currentCollaborator?.status === "accepted" &&
      currentCollaborator?.permission === "write");

  if (!notebook) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{notebook.title}</h1>
          {isOwner && <Crown className="h-5 w-5 text-yellow-500" />}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCollaborators(!showCollaborators)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <UserCircle className="h-5 w-5" />
            {notebook.collaborators?.length || 0} Collaborators
          </button>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              <Share2 className="h-5 w-5" />
              Invite
            </button>
          )}
          <DownloadButton
            content={content}
            canvasRef={sketchCanvasRef}
            title={notebook?.title || "notebook"}
          />
        </div>
      </div>

      {isPendingInvitation && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You have been invited to collaborate on this notebook.
          </p>
          <button
            onClick={acceptInvitation}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Accept Invitation
          </button>
          {invitationStatus === "accepted" && (
            <p className="mt-2 text-green-600">
              Invitation accepted! You can now edit the notebook.
            </p>
          )}
          {invitationStatus === "error" && (
            <p className="mt-2 text-red-600">
              Error accepting invitation. Please try again.
            </p>
          )}
        </div>
      )}

      {showCollaborators && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Collaborators</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-4 w-4" />
              <span>{notebook.userId.email}</span>
              <span className="text-yellow-500">(Owner)</span>
            </div>
            {notebook.collaborators?.map((collaborator, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <UserCircle className="h-4 w-4" />
                <span>{collaborator.email}</span>
                <span className="text-gray-500">
                  ({collaborator.permission} • {collaborator.status})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInviteModal && (
        <InviteModal
          notebookId={params.id}
          onClose={() => {
            setShowInviteModal(false);
            fetchNotebook();
          }}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        <textarea
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          disabled={!canEdit}
          className={`w-full h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            !canEdit ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder={
            canEdit ? "Start writing..." : "You don't have permission to edit"
          }
        />
        <SketchPad
          notebookId={params.id}
          socketInstance={socketRef.current}
          initialData={notebook?.sketches?.[notebook.sketches.length - 1]?.data}
          onCanvasRefChange={setSketchCanvasRef}
        />
      </div>
    </div>
  );
}
