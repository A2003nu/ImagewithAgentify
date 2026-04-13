"use client"
import { UserDetailContext} from "@/context/UserDetailContext";
import { WorkflowContext } from "@/context/WorkflowContext";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Position, ReactFlowProvider } from "@xyflow/react";
import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";

function Provider({
    children,
}: Readonly<{
    children:React.ReactNode;
}>){

const {user}=useUser();
const createUser=useMutation(api.user.CreateNewUser);
const [userDetail,setUserDetail]=useState<any>();
const [selectedNode,setSelectedNode]=useState<any>();
const [addedNodes,setAddedNodes]=useState([{
    id:'Start',
    position:{x:250,y:100},
    data:{label:'Start'},
    type:'StartNode'
}])

const [nodeEdges,setNodeEdges]=useState([]);

 
useEffect(()=>{
    user&&createAndGetUser();
},[user])

  const createAndGetUser = async () => {
    if (!user) return;

    const result = await createUser({
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      clerkUserId: user.id,
    });

    setUserDetail(result);
  };


    return(
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
            <ReactFlowProvider>
        <WorkflowContext.Provider value={{addedNodes, setAddedNodes, nodeEdges, setNodeEdges, selectedNode, setSelectedNode} as any}>
        <div>{children}</div>
        </WorkflowContext.Provider>
        </ReactFlowProvider>
        </UserDetailContext.Provider>
    )
}

export default Provider