"use client"

import { Button } from '@/components/ui/button'
import { Loader2Icon, Plus } from 'lucide-react'
import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {v4 as uuidv4} from 'uuid'
import { useRouter } from 'next/navigation'
import { UserDetailContext } from '@/context/UserDetailContext'


function CreateAgentSection() {

  const createAgentMutation =useMutation(api.agent.CreateAgent);
  const [agentName, setAgentName] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
 const router=useRouter();
 const [loader,setLoader]=useState(false);
 const {userDetail,setUserDetail}=useContext(UserDetailContext);

  const CreateAgent = async () => {
    setLoader(true);
    const agentId=uuidv4();
    const result=await createAgentMutation({
      agentId:agentId,
      name:agentName ?? '',
userId:userDetail?._id
    })
    setOpenDialog(false);
    setLoader(false);
    router.push('/agent-builder/'+agentId)
  };

  return (
    <div className="space-y-2 flex flex-col justify-center items-center mt-24">
      <h2 className="font-bold text-2xl">Create AI Agent</h2>
      <p className="text-lg">
        Build a AI Agent workflow with custom logic and tools.
      </p>
        
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Agent Name</DialogTitle>
            <DialogDescription>
              <Input
                placeholder="Agent Name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button onClick={()=>CreateAgent()} disabled={loader}>
              {loader && <Loader2Icon className='animate-spin'/>}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateAgentSection