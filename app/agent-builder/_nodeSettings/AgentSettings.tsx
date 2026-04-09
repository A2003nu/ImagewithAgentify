import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { FileJson } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function AgentSettings({selectedNode,updateFormData}:any) {

 const [formData,setFormData]=useState({
    name:'',
    instructions:'',
    includeHistory:true,
    model:'grok',
    output:'text',
    schema:''
 })

 useEffect(() => {
  if (selectedNode?.data?.settings) {
    setFormData(selectedNode.data.settings)
  } else {
    setFormData({
      name: selectedNode?.data?.label || '',
      instructions: '',
      includeHistory: true,
      model: 'grok',
      output: 'text',
      schema: ''
    })
  }
}, [selectedNode])

 const handleChange=(key:string,value:any)=>{
    setFormData((prev)=>({
        ...prev,
        [key]:value
    }))
 }

 const onSave=()=>{
    console.log(formData);
    updateFormData(formData)
    toast.success("Settings Updated!!!")
 }
  return (
    <div>
        <h2 className="font-bold">Agent</h2>
        <p className="text-gray-500 mt-1">Call the AI model with your instruction</p>

        <div className="mt-3 space-y-1">
            <Label>Name</Label>
            <Input
  placeholder="Agent Name"
  value={formData?.name || ''}
  onChange={(event)=>handleChange('name',event.target.value)}
/>
        </div>
        <div className="mt-3 space-y-1">
            <Label>Instruction</Label>
           <Textarea
  placeholder="Instruction"
  value={formData?.instructions || ''}
  onChange={(event)=>handleChange('instructions',event.target.value)}
/>
            <h2 className='text-sm p-1 flex gap-2 items-center'>Add Context <FileJson className='h-3 w-3'/></h2>
        </div>
        <div className="mt-3 flex justify-between items-center">
            <Label>Include Chat History</Label>
            <Switch
  checked={formData?.includeHistory ?? true}
  onCheckedChange={(checked)=>handleChange('includeHistory',checked)}
/>
        </div>
        <div className='mt-3 flex justify-between items-center'> 
            <Label>Model</Label>
            <Select value={formData?.model} onValueChange={(value)=>handleChange('model',value)}>
                <SelectTrigger>
                    <SelectValue placeholder='gemini flash 1.5'></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='gemini-flash-1.5'>Gemini Flash 1.5</SelectItem>
                    <SelectItem value='gemini-Pro-1.5'>Gemini Pro 1.5</SelectItem>
                    <SelectItem value='gemini-Pro-2.5'>Gemini Pro 2.5</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className='mt-3 space-y-2'>
            <Label>Output Format</Label>
            <Tabs value={formData?.output} defaultValue='Text' className='w-[400px]' onValueChange={(value)=>handleChange('output',value)}>
                <TabsList>
                    <TabsTrigger value='Text'>Text</TabsTrigger>
                     <TabsTrigger value='Json'>Json</TabsTrigger>
                </TabsList>
                <TabsContent value='Text'>
                    <h2 className="text-sm text-gray-500">Output will be Text</h2></TabsContent>
                <TabsContent value='Json'>
                    <Label className='text-sm text-gray-500'>Enter Json Schema</Label>
                    <Textarea
  placeholder="{title:string}"
  value={formData?.schema || ''}
  onChange={(event)=>handleChange('schema',event.target.value)}
  className="max-w-[300px] mt-1"
/>
                </TabsContent>
            </Tabs>
        </div>
        <Button className='w-full mt-5' onClick={onSave}>Save</Button>
    </div>
  )
}

export default AgentSettings