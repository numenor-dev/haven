'use client';

import Header from "@/components/dashboard/Header";
import SideBar from "@/components/dashboard/SideBar";

export default function DashboardPage() {

  return (
    <div className="chat-bg min-h-screen">
      <Header />
      <SideBar />
    </div>
  )
}