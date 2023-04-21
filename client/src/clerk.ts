import Clerk from "@clerk/clerk-js";
import { frFR } from "@clerk/localizations";

export const clerk = new Clerk(import.meta.env.VITE_CLERK_KEY);
await clerk.load({localization: frFR, appearance: {variables: {colorPrimary: '#0F5C7C'}}});