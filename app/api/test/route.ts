import { environmentTest } from "@/backend/testing/environmentTest";
import { NextResponse } from "@/node_modules/next/server";

export async function GET() {
	try {
	  const result = environmentTest.testKey;
	  return NextResponse.json(result);
	} catch (error) {
	  return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
  }