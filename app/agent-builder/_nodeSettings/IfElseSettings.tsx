import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function IfElseSettings({ selectedNode, updateFormData }: any) {

  const [formData, setFormData] = useState({ ifCondition: '' })

  useEffect(() => {
    if (selectedNode?.data?.settings) {
      setFormData(selectedNode.data.settings)
    } else {
      setFormData({ ifCondition: '' })
    }
  }, [selectedNode])

  return (
    <div>

      <h2 className="font-bold">If / Else</h2>
      <p className="text-gray-500 mt-1">
        Create conditions to branch your workflow
      </p>

      <div className="mt-3">
        <Label>If</Label>

        <Input
          placeholder="Enter condition e.g output == `any condition`"
          className="mt-2"
          value={formData?.ifCondition || ''}
          onChange={(e) =>
            setFormData({ ifCondition: e.target.value })
          }
        />

      </div>

      <Button
        className="w-full mt-5"
        onClick={() => {
          updateFormData(formData)
          toast.success("Updated")
        }}
      >
        Save
      </Button>

    </div>
  )
}

export default IfElseSettings