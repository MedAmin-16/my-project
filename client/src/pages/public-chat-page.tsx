
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import PublicChat from '@/components/public-chat';

export default function PublicChatPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Public Chat
            </h1>
            <p className="text-gray-600">
              Connect with the CyberHunt community. Share insights, ask questions, and stay updated with announcements from companies.
            </p>
          </div>

          <div className="h-[600px]">
            <PublicChat 
              currentUser={user ? {
                id: user.id,
                username: user.username,
                userType: user.userType as 'hacker' | 'company'
              } : undefined}
            />
          </div>

          <div className="mt-6 bg-white rounded-lg p-6 border">
            <h2 className="text-lg font-semibold mb-3">Chat Guidelines</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Be respectful and professional in all interactions</li>
              <li>• No spam, advertising, or off-topic discussions</li>
              <li>• Companies can post announcements about new programs and updates</li>
              <li>• Researchers can share general insights and collaborate</li>
              <li>• Do not share specific vulnerability details in public chat</li>
              <li>• Report inappropriate behavior to administrators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
