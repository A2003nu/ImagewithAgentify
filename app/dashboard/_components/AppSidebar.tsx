"use client";

import React, { useContext } from 'react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import Image from 'next/image'
import { Database, Gem, Headphones, LayoutDashboard, User2Icon, WalletCards } from 'lucide-react'
import { UserAvatar } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

const MenuOptions = [
  {
    title:'Dashboard',
    url:'/dashboard',
    icon:LayoutDashboard
  },
  {
    title:'AI Agents',
    url:'#',
    icon:Headphones
  },
  {
    title:'Data',
    url:'#',
    icon:Database
  },
  {
    title:'Pricing',
    url:'#',
    icon:WalletCards
  },
   {
    title:'Profile',
    url:'#',
    icon:User2Icon
  }
]

export default function AppSidebar() {
  const {open}=useSidebar();
const { userDetail, setUserDetail } = useContext(UserDetailContext);
const path=usePathname();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader> 
        <div className="flex gap-2 items-center">
          <Image src={'/logo.svg'} alt='logo' width={35} height={35}/>
         {open && <h2 className='font-bold'>Agentify</h2>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MenuOptions.map((menu,index)=>(
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild size={open?'lg':'default'} isActive={path==menu.url}>
                    <Link href={menu.url} className="flex items-center gap-2">
                      <menu.icon size={18}/>
                      <span>{menu.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='mb-10'>
        <div className="flex gap-2 items-center">
          <Gem/>
          {open && <h2>Remaining Credits:
            <span className="font-bold">{userDetail?.token}</span>
         </h2>}
        </div>
        {open && <Button>Upgrade to Unlimited</Button>}
      </SidebarFooter>
    </Sidebar>
  )
}