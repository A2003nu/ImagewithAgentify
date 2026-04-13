"use client";

import React, { useContext, useState } from 'react'
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
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import UpgradeModal from '@/components/UpgradeModal';

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
  const [showUpgrade, setShowUpgrade] = useState(false)

  const userCredits = useQuery(api.users.getUserByClerkId, { 
    clerkId: userDetail?.clerkUserId || undefined 
  })
  const credits = userCredits?.credits ?? userDetail?.token ?? 0

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
        <div className="mt-auto p-4">
          {open && <div className="text-sm text-gray-400">Remaining Credits</div>}

          <div
            className={`text-lg font-semibold flex items-center gap-2 ${
              credits < 500
                ? "text-red-500"
                : credits < 1000
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            <Gem size={18} className={credits < 500 ? "text-red-500" : credits < 1000 ? "text-yellow-400" : "text-green-400"} />
            {open && <span>{credits.toLocaleString()}</span>}
          </div>

          {/* LOW CREDIT WARNING */}
          {credits < 200 && open && (
            <div className="text-xs text-red-400 mt-1">
              Low credits — upgrade soon
            </div>
          )}

          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-3 w-full bg-black hover:bg-purple-700 text-white py-2 rounded-lg transition text-sm"
          >
            {open ? "Upgrade to Unlimited " : ""}
          </button>
        </div>
      </SidebarFooter>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        clerkUserId={userDetail?.clerkUserId}
      />
    </Sidebar>
  )
}