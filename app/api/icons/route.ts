import pool from "@/backend/testing/db";
import { NextResponse } from "@/node_modules/next/server";


export async function GET() {
	try {
	  const result = await pool.query('SELECT * FROM icons');
	  return NextResponse.json(result.rows);
	} catch (error) {
	  return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
  }
  
  export async function POST(request: Request) {
	try {
	  const { id, name, icon } = await request.json();
	  const result = await pool.query('INSERT INTO icons (id, name, icon) VALUES ($1, $2, $3) RETURNING *', [id, name, icon]);
	  return NextResponse.json(result.rows[0]);
	} catch (error) {
	  return NextResponse.json({ error: (error as Error).message }, { status: 500 });
	}
  }