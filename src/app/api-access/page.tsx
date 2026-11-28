import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ApiAccessClient } from "./api-access-client";
export const metadata: Metadata = { title: "API Access", description: "Manage private NEXORA API credentials." };
export default function ApiAccessPage(){return <><Navbar/><ApiAccessClient/><Footer/></>;}
