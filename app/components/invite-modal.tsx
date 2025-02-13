
import { useState } from 'react';

interface InviteModalProps {
  notebookId: string;
  onClose: () => void;
}

export default function InviteModal({ notebookId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleInvite = async () => {
    try {
      const res = await fetch('/api/notebooks/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId, email }),
      });
      
      if (res.ok) {
        setStatus('Invitation sent!');
        setTimeout(onClose, 2000);
      } else {
        setStatus('Failed to send invitation');
      }
    } catch (error) {
      setStatus('Error sending invitation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Invite Collaborator</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Send Invite
          </button>
        </div>
        {status && <p className="mt-2 text-center">{status}</p>}
      </div>
    </div>
  );
}
