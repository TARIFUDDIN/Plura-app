"use server";

import { db } from "@/lib/db";

import { currentUser } from "@clerk/nextjs/server";
import { type NotificationsWithUser } from "@/lib/types";

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subAccountId,
}: {
  agencyId?: string;
  subAccountId?: string;
  description: string;
}) => {
  const authUser = await currentUser();
  let userData;

  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subAccountId,
            },
          },
        },
      },
    });

    if (response) {
      userData = response;
    }
  } else {
    const response = await db.user.findUnique({
      where: {
        email: authUser.emailAddresses[0].emailAddress,
      },
    });

    if (response) {
      userData = response;
    }
  }

  if (!userData) {
    throw new Error("Could not find a user");
  }

  let foundAgencyId = agencyId;

  if (!foundAgencyId) {
    if (!subAccountId) {
      throw new Error(
        "You need to provide at least an agency id or subaccount id"
      );
    }

    const response = await db.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
    });

    if (response) {
      foundAgencyId = response.agencyId;
    }
  }

  if (subAccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subAccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

export const getNotification = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: {
        agencyId,
      },
      include: {
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return response as NotificationsWithUser;
  } catch (error) {
    console.log(error);
  }
};