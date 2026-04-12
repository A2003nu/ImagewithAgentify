"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react'
import { api } from '@/convex/_generated/api'
import { GitBranchPlus, FileCode, Trash2 } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { toast } from 'sonner';

interface Template {
  _id: any;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt: number;
  userId: string;
  sourceAgentId?: string;
}

function Templates() {
const {userDetail}=useContext(UserDetailContext);
const [templateList, setTemplateList] = useState<Template[]>([]);
const [loading, setLoading] = useState(true);
const convex = useConvex();

useEffect(() => {
  if (userDetail?._id) {
    GetUserTemplates();
  }
}, [userDetail]);

const GetUserTemplates = async () => {
  try {
    const result = await convex.query(api.template.getUserTemplates, {
      userId: userDetail?._id
    });
    setTemplateList(result || []);
  } catch (error) {
    console.error("Error fetching templates:", error);
  } finally {
    setLoading(false);
  }
}

const handleDeleteTemplate = async (templateId: any, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  const confirmDelete = confirm("Delete this template?");
  if (!confirmDelete) return;

  try {
    await convex.mutation(api.template.deleteTemplate, { id: templateId });
    toast.success("Template deleted");
    GetUserTemplates();
  } catch (error) {
    console.error("Error deleting template:", error);
    toast.error("Failed to delete template");
  }
}

if (loading) {
  return (
    <div className="w-full mt-5 flex justify-center py-10">
      <div className="text-gray-500">Loading templates...</div>
    </div>
  )
}

  return (
    <div className="w-full mt-5">
      {templateList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FileCode className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No templates yet</h3>
          <p className="text-gray-500 mt-1">Publish a workflow to create a reusable template.</p>
          <Link href="/agent-builder" className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Create New Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {templateList.map((template, index) => (
            <div key={index} className='p-3 border rounded-2xl shadow mt-5 hover:shadow-lg transition-shadow relative group'>
              <Link href={`/agent-builder?templateId=${template._id}`} className="block">
                <div className="flex items-center justify-between">
                  <GitBranchPlus className='bg-purple-100 p-1 h-8 w-8 rounded-sm' />
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Template</span>
                </div>
                <h2 className="mt-3 font-medium">{template.name}</h2>
                {template.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                )}
                <h2 className='text-sm text-gray-400 mt-2'>{moment(template.createdAt).fromNow()}</h2>
              </Link>
              <button
                onClick={(e) => handleDeleteTemplate(template._id, e)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                title="Delete template"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Templates