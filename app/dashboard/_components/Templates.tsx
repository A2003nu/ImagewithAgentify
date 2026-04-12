"use client"
import { UserDetailContext } from '@/context/UserDetailContext'
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react'
import { api } from '@/convex/_generated/api'
import { Agent } from '@/types/AgentType';
import { GitBranchPlus, FileCode } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

function Templates() {
const {userDetail}=useContext(UserDetailContext);
const [agentList,setAgentList]=useState<Agent[]>([]);
const [loading,setLoading]=useState(true);
const convex=useConvex();

useEffect(()=>{
  userDetail&&GetUserAgents();
},[userDetail]);

const GetUserAgents=async()=>{
const result=await convex.query(api.agent.GetUserAgents,{
  userId:userDetail?._id
});
const publishedAgents = result.filter((agent: Agent) => agent.published === true);
setAgentList(publishedAgents);
setLoading(false);
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
      {agentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FileCode className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No templates yet</h3>
          <p className="text-gray-500 mt-1">Publish an agent to see it here as a template.</p>
          <Link href="/agent-builder" className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Create New Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {agentList.map((agent,index)=>(
            <Link href={'/agent-builder/'+agent.agentId} key={index} className='p-3 border rounded-2xl shadow mt-5 hover:shadow-lg transition-shadow'>
              <div className="flex items-center justify-between">
                <GitBranchPlus className='bg-purple-100 p-1 h-8 w-8 rounded-sm' />
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Template</span>
              </div>
              <h2 className="mt-3 font-medium">{agent.name}</h2>
              <h2 className='text-sm text-gray-400 mt-2'>{ moment(agent._creationTime).fromNow()}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Templates