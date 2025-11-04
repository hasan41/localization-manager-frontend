import { NextResponse } from 'next/server';
import { ComponentDB } from '@/app/lib/database';

// GET /api/components - Get all components
export async function GET() {
  try {
    const componentDB = ComponentDB.getInstance();
    const components = await componentDB.getAll();
    return NextResponse.json({ success: true, components });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

// POST /api/components - Create a new component
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      );
    }

    const componentDB = ComponentDB.getInstance();
    const id = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await componentDB.create({
      id,
      name,
      code,
      description: description || ''
    });

    return NextResponse.json({
      success: true,
      message: 'Component created successfully',
      id
    });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create component' },
      { status: 500 }
    );
  }
}
