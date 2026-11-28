import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { WorkflowsClient } from "./workflows-client";
export const metadata: Metadata = { title: "Workflows", description: "Guided multi-step creative workflows for NEXORA Studio." };
export default function WorkflowsPage(){return <><Navbar/><WorkflowsClient/><Footer/></>;}
