import { env } from 'cloudflare:workers';
import { handleRecognition } from '../../../server/deepseek.mjs';
export const dynamic = 'force-dynamic';
export const GET=(request:Request)=>handleRecognition(request,env);
export const POST=(request:Request)=>handleRecognition(request,env);
