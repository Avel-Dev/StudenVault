import React from 'react';
import { ShieldCheck, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const AdminPlaceholder = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-[#C0D5C3] flex items-center justify-center mx-auto text-[#2F3E4A] shadow-sm">
        <ShieldCheck className="w-8 h-8 text-[#2F3E4A]" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
        Faculty Admin <span className="text-[#8C966D]">Portal</span>
      </h1>
      <p className="text-sm text-[#2F3E4A]/80 max-w-lg mx-auto">
        Backend REST APIs for Admin CRUD (Subjects, Modules, Lectures, Notes, and Bulk Attendance) are actively connected.
        The full Admin UI dashboard is slated for Step 4.
      </p>
    </div>
  );
};
