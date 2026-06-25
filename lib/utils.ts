import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { sql } from "drizzle-orm";
import { db } from "./db/db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeName(str: string) {
  const clean = str.replaceAll('-', ' ');
  return clean.replace(/\b\w/g, letter => letter.toUpperCase())
}

export async function withFirm<T>(
    firmId: string, 
    operation: (tx: typeof db) => Promise<T>
): Promise<T> {
    return await db.transaction(async (tx) => {
        await tx.execute(sql`set local app.current_firm_id = ${firmId}`);
        // @ts-expect-error since Drizzle transaction types can be overly strict here
        return await operation(tx); 
    });
}