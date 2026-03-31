"use client";

import { useState } from 'react';
import { MOCK_COURSES } from '@/lib/mock-data';
import { MoreVertical, Edit2, PlayCircle, Users, FileText, Activity } from 'lucide-react';
import Image from 'next/image';

export default function InstructorDashboard() {
  const [courses] = useState(MOCK_COURSES.filter(c => c.instructor.name === 'Sarah Drasner'));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-3 text-slate-500 font-medium mb-2">
              <Users className="w-5 h-5 text-blue-500" /> Active Students
           </div>
           <div className="text-4xl font-black text-slate-900">1,204</div>
           <div className="text-xs font-bold text-emerald-500 tracking-wider uppercase">+12% this month</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-3 text-slate-500 font-medium mb-2">
              <BookOpenIcon className="w-5 h-5 text-indigo-500" /> Active Courses
           </div>
           <div className="text-4xl font-black text-slate-900">{courses.length}</div>
           <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">2 draft</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2">
           <div className="flex items-center gap-3 text-slate-500 font-medium mb-2">
              <FileText className="w-5 h-5 text-orange-500" /> Pending Assignments
           </div>
           <div className="text-4xl font-black text-slate-900">34</div>
           <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Needs grading</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
           <div className="flex items-center gap-3 text-slate-400 font-medium mb-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Revenue
           </div>
           <div className="text-4xl font-black text-white">$42.5k</div>
           <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase">+5% this month</div>
         </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Series / Courses</h2>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-bold tracking-wider uppercase">Course Details</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase">Cohorts</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase">Price</th>
                <th className="px-6 py-4 font-bold tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden relative shadow-sm shrink-0">
                         <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 mb-1 leading-tight">{course.title}</div>
                        <div className="text-xs font-medium text-slate-500">Last updated 2 days ago</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-slate-600">
                    2 Active
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900">
                    ${course.price}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Upload/Assignment creation simulation card */}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 p-8 rounded-3xl flex items-center justify-between shadow-sm">
        <div>
           <h3 className="text-xl font-bold text-indigo-900 mb-2">Create a new Assignment</h3>
           <p className="text-indigo-700/70 font-medium">Assign new graded assessments to your active cohorts.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
           <FileText className="w-5 h-5" /> New Assignment
        </button>
      </div>
      
    </div>
  );
}

function BookOpenIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
