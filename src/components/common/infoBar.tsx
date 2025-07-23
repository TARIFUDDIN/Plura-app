"use client";

import React from "react";
import { Role } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { twMerge } from "tailwind-merge";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "./ModeToggle";

import type { NotificationsWithUser } from "@/lib/types";

type Props = {
  notifications: NotificationsWithUser | []
  role?: Role
  className?: string
  subAccountId?: string
}

const InfoBar = ({ notifications, subAccountId, className, role }: Props) => {
  const [allNotifications, setAllNotifications] = React.useState(notifications)
  const [showAll, setShowAll] = React.useState(true)

  const handleClick = () => {
    if (!showAll) {
      setAllNotifications(notifications)
    } else {
      if (!!notifications?.length) {
        setAllNotifications(
          notifications?.filter((item) => item.subAccountId === subAccountId) ??
            []
        )
      }
    }
    setShowAll((prev) => !prev)
  }

  return (
    <>
      <div
        className={twMerge(
          'fixed z-[20] md:left-[300px] left-0 right-0 top-0 p-4 bg-background/80 backdrop-blur-md flex gap-4 items-center border-b-[1px] ',
          className
        )}
      >
        <div className="flex items-center gap-2 ml-auto">
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full w-8 h-8">
                <Bell aria-label="Notifications" className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="pr-4 flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {(role === 'AGENCY_ADMIN' || role === 'AGENCY_OWNER') && (
                    <Card className="flex items-center justify-between p-4">
                      <span>Current Subaccount</span>
                      <Switch onCheckedChange={handleClick} />
                    </Card>
                  )}
                </SheetDescription>
              </SheetHeader>
              
              {!!allNotifications?.length && (
                <div className="flex flex-col gap-4 overflow-y-auto">
                  {allNotifications?.map((notification) => (
                    <Card key={notification.id}>
                      <CardContent className="flex gap-4 p-4">
                        <Avatar>
                          <AvatarImage
                            src={notification.User.avatarUrl}
                            alt="Profile Picture"
                          />
                          <AvatarFallback className="bg-primary">
                            {notification.User.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                          <p className="leading-tight">
                            <span className="font-bold">
                              {notification.notification.split('|')[0]}
                            </span>
                            <span className="text-muted-foreground">
                              {notification.notification.split('|')[1]}
                            </span>
                            <span className="font-bold">
                              {notification.notification.split('|')[2]}
                            </span>
                          </p>
                          <small className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {!allNotifications?.length && (
                <div className="flex items-center justify-center mb-4 text-sm text-muted-foreground">
                  You have no notifications
                </div>
              )}
            </SheetContent>
          </Sheet>
          <ModeToggle />
        </div>
      </div>
    </>
  )
}

export default InfoBar