import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function UserApproval({ selectedNode, updateFormData }: any) {

  const [formData, setFormData] = useState({
    name: '',
    message: ''
  })

  useEffect(() => {

    if (selectedNode?.data?.settings) {
      setFormData({
        name: selectedNode.data.settings.name || '',
        message: selectedNode.data.settings.message || ''
      })
    } else {
      setFormData({
        name: '',
        message: ''
      })
    }

  }, [selectedNode])

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const onSave = () => {
    updateFormData(formData)
    toast.success("Settings Updated!!!")
  }

  return (
    <div>

      <h2 className="font-bold">User Approval</h2>
      <p className="text-gray-500 mt-1">
        Pause for a human to approve or reject a step
      </p>

      <div className="mt-3 space-y-1">
        <Label>Name</Label>

        <Input
          placeholder="Name"
          value={formData.name}
          onChange={(event) =>
            handleChange('name', event.target.value)
          }
        />

      </div>

      <div className="mt-3 space-y-1">

        <Label>Message</Label>

        <Textarea
          placeholder="Describe the message to the user"
          value={formData.message}
          onChange={(event) =>
            handleChange('message', event.target.value)
          }
        />

      </div>

      <Button
        className="w-full mt-5"
        onClick={onSave}
      >
        Save
      </Button>

    </div>
  )
}

export default UserApproval